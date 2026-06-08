import { defineStore } from 'pinia'
import { api, getStoredToken } from '../services/api'
import Echo, { refreshEchoAuthHeaders } from './echo'

const fallbackAvatar = (id = 1) => `https://i.pravatar.cc/150?img=${(Number(id) % 70) + 1}`
const chatWebSocketUrl = import.meta.env.VITE_CHAT_WS_URL || ''
const realtimePollInterval = 2000
let realtimeSocket = null
let realtimePollTimer = null
let realtimeReconnectTimer = null
let realtimeStoppedManually = false
let realtimeEchoChannel = null
let realtimeEchoChannelName = ''

const timeFormatter = new Intl.DateTimeFormat(undefined, {
    hour: 'numeric',
    minute: '2-digit',
})

const dateFormatter = new Intl.DateTimeFormat(undefined, {
    month: 'short',
    day: 'numeric',
})

const dateWithYearFormatter = new Intl.DateTimeFormat(undefined, {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
})

const dateTimeFormatter = new Intl.DateTimeFormat(undefined, {
    month: 'short',
    day: 'numeric',
    hour: 'numeric',
    minute: '2-digit',
})

const parseTimestamp = (value) => {
    if (!value || typeof value !== 'string') return null

    const normalizedValue = value.replace(/\.(\d{3})\d*(?=Z|[+-]\d{2}:?\d{2}|$)/, '.$1')
    const date = new Date(normalizedValue)

    return Number.isNaN(date.getTime()) ? null : date
}

const isSameDate = (date, comparisonDate) => (
    date.getFullYear() === comparisonDate.getFullYear()
    && date.getMonth() === comparisonDate.getMonth()
    && date.getDate() === comparisonDate.getDate()
)

const formatReadableTime = (value, options = {}) => {
    const date = parseTimestamp(value)

    if (!date) return value || 'Just now'

    const now = new Date()
    const yesterday = new Date(now)
    yesterday.setDate(now.getDate() - 1)

    if (isSameDate(date, now)) return timeFormatter.format(date)
    if (isSameDate(date, yesterday)) return options.includeTime ? `Yesterday, ${timeFormatter.format(date)}` : 'Yesterday'
    if (options.includeTime) return dateTimeFormatter.format(date)
    if (date.getFullYear() === now.getFullYear()) return dateFormatter.format(date)

    return dateWithYearFormatter.format(date)
}

const getResponseData = (payload) => {
    if (Array.isArray(payload)) return payload
    if (Array.isArray(payload?.data)) return payload.data
    if (Array.isArray(payload?.data?.data)) return payload.data.data
    if (Array.isArray(payload?.conversations)) return payload.conversations
    if (Array.isArray(payload?.data?.conversations)) return payload.data.conversations

    return []
}

const getSingleResponseData = (payload) => payload?.data || payload?.message?.data || payload

const safeJsonParse = (value) => {
    if (typeof value !== 'string') return value

    try {
        return JSON.parse(value)
    } catch {
        return value
    }
}

const getRealtimeMessagePayload = (payload) => {
    const parsedPayload = safeJsonParse(payload)
    const parsedData = safeJsonParse(parsedPayload?.data)

    if (hasMessageContent(parsedPayload)) return parsedPayload
    if (hasMessageContent(parsedData)) return parsedData

    return parsedPayload?.message?.data
        || parsedPayload?.message
        || parsedData?.message
        || parsedData?.data?.message
        || parsedData?.data
        || parsedData
        || parsedPayload
}

const hasMessageContent = (message) => Boolean(
    message
    && typeof message === 'object'
    && (message.content || message.message || message.body)
)

const buildWebSocketUrl = (conversationsId) => {
    if (!chatWebSocketUrl || !conversationsId) return ''

    try {
        const url = new URL(chatWebSocketUrl)
        const token = getStoredToken()

        url.searchParams.set('conversation_id', conversationsId)
        if (token) url.searchParams.set('token', token)

        return url.toString()
    } catch {
        return ''
    }
}

const getCurrentUserId = () => {
    const token = getStoredToken()
    const tokenPayload = token?.split('.')[1]

    if (!tokenPayload) return null

    try {
        const normalizedPayload = tokenPayload.replace(/-/g, '+').replace(/_/g, '/')
        const paddedPayload = normalizedPayload.padEnd(normalizedPayload.length + ((4 - normalizedPayload.length % 4) % 4), '=')
        const decodedPayload = JSON.parse(atob(paddedPayload))

        return decodedPayload.sub || null
    } catch {
        return null
    }
}

const getConversationUser = (conversation) => {
    if (conversation.user || conversation.participant || conversation.contact || conversation.receiver) {
        return conversation.user || conversation.participant || conversation.contact || conversation.receiver
    }

    if (!Array.isArray(conversation.users)) return {}

    const currentUserId = conversation.pivot?.user_id || getCurrentUserId()
    return conversation.users.find((user) => user.id !== currentUserId) || conversation.users[0] || {}
}

const getLastMessage = (conversation) => {
    const messages = Array.isArray(conversation.messages) ? conversation.messages : []

    return conversation.lastMessage
        || conversation.last_message
        || conversation.latest_message
        || conversation.message
        || messages[messages.length - 1]
        || {}
}

const getConversationName = (conversation, user, index) => {
    if (conversation.name || conversation.title) return conversation.name || conversation.title

    if (conversation.type === 'private') {
        return user.name
            || user.username
            || `${user.firstName || user.first_name || ''} ${user.lastName || user.last_name || ''}`.trim()
            || user.email
            || `Conversation ${index + 1}`
    }

    if (conversation.community?.name) return conversation.community.name

    return `Conversation ${index + 1}`
}

const normalizeConversation = (conversation, index = 0) => {
    const user = getConversationUser(conversation)
    const lastMessage = getLastMessage(conversation)
    const lastMessageText = typeof lastMessage === 'string'
        ? lastMessage
        : lastMessage.content || lastMessage.message || lastMessage.body

    return {
        id: conversation.id || conversation._id || conversation.conversationId || Date.now() + index,
        type: conversation.type || 'private',
        name: getConversationName(conversation, user, index),
        status: conversation.status || user.status || 'online',
        lastMessage: lastMessageText || 'No messages yet',
        time: formatReadableTime(conversation.time || conversation.last_message_at || conversation.updated_at || conversation.updatedAt || conversation.created_at || 'Just now'),
        unread: Number(conversation.unread || conversation.unread_count || conversation.unreadCount || 0),
        profilePicture: conversation.profilePicture || conversation.profile_picture || user.profilePicture || user.profile_picture || fallbackAvatar(user.id || conversation.id || index + 1),
    }
}

const normalizeMessages = (conversation) => {
    if (!Array.isArray(conversation.messages)) return []

    const currentUserId = conversation.pivot?.user_id

    return conversation.messages.map((message, index) => normalizeMessage(message, conversation.id, currentUserId, index))
}

const normalizeMessage = (message, conversationId, currentUserId = null, index = 0) => {
    const senderId = message.sender_id || message.user_id || message.sender?.id || message.user?.id
    const isSent = message.type === 'sent'
        || message.is_sent
        || message.sender === 'You'
        || (currentUserId !== null && Number(senderId) === Number(currentUserId))

    return {
        id: message.id || Date.now() + index,
        conversationsId: message.conversation_id || message.conversationsId || conversationId,
        sender: isSent ? 'You' : (message.user?.name || message.sender?.name || message.sender || 'User'),
        content: message.content || message.message || message.body || '',
        time: formatReadableTime(message.created_at || message.createdAt || message.updated_at || 'Just now', { includeTime: true }),
        type: isSent ? 'sent' : 'received',
        seen: Boolean(message.seen || message.is_read || message.read_at),
    }
}

const getErrorMessage = (error, fallback) => {
    const data = error.response?.data

    return data?.message || data?.error || fallback
}

export const useChatStore = defineStore('chat', {
    state: () => ({
        currentChat: null,
        conversationsLoading: false,
        conversationsError: '',
        userSearchLoading: false,
        userSearchError: '',
        userSearchResults: [],
        conversationRequestsLoading: false,
        conversationRequestsError: '',
        conversationRequests: [],
        messagesLoading: false,
        messagesError: '',
        sendingMessage: false,
        realtimeStatus: 'disconnected',
        conversations: [],
        groups: [],
        communities: [],
        messages: [],
    }),

    getters: {
        getCurrentChatMessages(state) {
            if (!state.messages || !state.currentChat) return null

            return state.messages.filter((msg) => msg.conversationsId === state.currentChat.conversationsId) || null
        },

        activeUser(state) {
            if (!state.currentChat) return null

            return state.conversations.find((conv) => conv.id === state.currentChat.conversationsId) || null
        },
    },

    actions: {
        openChat(name, status, conversationsId) {
            this.currentChat = { name, status, conversationsId }
            this.markasSeen(conversationsId)
            this.loadMessages(conversationsId).catch(() => {})
            this.startRealtimeMessages(conversationsId)
        },

        markasSeen(conversationsId) {
            this.conversations
                .filter((conv) => conv.id === conversationsId)
                .forEach((conv) => {
                    conv.unread = 0
                })
        },

        async loadConversations() {
            this.conversationsLoading = true
            this.conversationsError = ''

            try {
                const { data } = await api.get('/conversations')
                const rawConversations = getResponseData(data)
                const conversations = rawConversations.map(normalizeConversation)

                this.conversations = conversations
                this.messages = rawConversations.flatMap(normalizeMessages)
                return conversations
            } catch (error) {
                this.conversationsError = getErrorMessage(error, 'Unable to load conversations.')
                throw error
            } finally {
                this.conversationsLoading = false
            }
        },

        async loadMessages(conversationsId, options = {}) {
            if (!conversationsId) return []

            if (!options.silent) this.messagesLoading = true
            this.messagesError = ''

            try {
                const { data } = await api.get(`/conversations/${conversationsId}/messages`)
                const currentUserId = getCurrentUserId()
                const messages = getResponseData(data).map((message, index) => normalizeMessage(message, conversationsId, currentUserId, index))

                this.replaceConversationMessages(conversationsId, messages)

                return messages
            } catch (error) {
                if (!options.silent) this.messagesError = getErrorMessage(error, 'Unable to load messages.')
                throw error
            } finally {
                if (!options.silent) this.messagesLoading = false
            }
        },

        replaceConversationMessages(conversationsId, messages) {
            this.messages = [
                ...this.messages.filter((message) => message.conversationsId !== conversationsId),
                ...messages,
            ]

            const lastMessage = messages[messages.length - 1]
            if (lastMessage) this.updateConversationPreview(lastMessage)
        },

        upsertMessage(rawMessage, conversationsId) {
            if (!hasMessageContent(rawMessage)) return null

            const currentUserId = getCurrentUserId()
            const message = normalizeMessage(rawMessage, conversationsId, currentUserId)
            const existingMessageIndex = this.messages.findIndex((existingMessage) => (
                existingMessage.id && message.id && existingMessage.id === message.id
            ))

            if (existingMessageIndex >= 0) {
                this.messages.splice(existingMessageIndex, 1, message)
            } else {
                this.messages.push(message)
            }

            this.updateConversationPreview(message)
            this.markIncomingUnread(message)

            return message
        },

        updateConversationPreview(message) {
            const conversation = this.conversations.find((conv) => conv.id === message.conversationsId)

            if (!conversation) return

            conversation.lastMessage = message.content
            conversation.time = message.time
        },

        markIncomingUnread(message) {
            const activeConversationId = this.currentChat?.conversationsId

            if (message.type === 'sent' || message.conversationsId === activeConversationId) return

            const conversation = this.conversations.find((conv) => conv.id === message.conversationsId)
            if (conversation) conversation.unread += 1
        },

        startRealtimeMessages(conversationsId) {
            this.stopRealtimeMessages()
            realtimeStoppedManually = false

            if (Echo) {
                this.connectEchoMessages(conversationsId)
                return
            }

            const websocketUrl = buildWebSocketUrl(conversationsId)

            if (websocketUrl && typeof WebSocket !== 'undefined') {
                this.connectWebSocketMessages(conversationsId, websocketUrl)
                return
            }

            this.startMessagePolling(conversationsId)
        },

        connectEchoMessages(conversationsId) {
            refreshEchoAuthHeaders()
            realtimeEchoChannelName = `conversation.${conversationsId}`
            this.realtimeStatus = 'connecting'

            try {
                realtimeEchoChannel = Echo.private(realtimeEchoChannelName)
            } catch (error) {
                console.warn('Unable to start Echo private channel.', error)
                this.startMessagePolling(conversationsId)
                return
            }

            const handleMessage = (payload) => {
                const message = getRealtimeMessagePayload(payload)
                const messageConversationId = message?.conversation_id || message?.conversationsId || conversationsId

                if (Number(messageConversationId) !== Number(conversationsId)) return

                this.upsertMessage(message, conversationsId)
            }

            realtimeEchoChannel
                .listen('MessageSent', handleMessage)
                .listen('.MessageSent', handleMessage)
                .listen('MessageCreated', handleMessage)
                .listen('.MessageCreated', handleMessage)

            realtimeEchoChannel.subscribed?.(() => {
                this.realtimeStatus = 'connected'
            })

            realtimeEchoChannel.error?.((error) => {
                console.warn('Echo private channel auth failed.', error)
                this.startMessagePolling(conversationsId)
            })
        },

        connectWebSocketMessages(conversationsId, websocketUrl) {
            this.realtimeStatus = 'connecting'
            realtimeSocket = new WebSocket(websocketUrl)

            realtimeSocket.addEventListener('open', () => {
                this.realtimeStatus = 'connected'
                realtimeSocket?.send(JSON.stringify({
                    type: 'subscribe',
                    conversation_id: conversationsId,
                }))
            })

            realtimeSocket.addEventListener('message', (event) => {
                const payload = getRealtimeMessagePayload(event.data)
                const messageConversationId = payload?.conversation_id || payload?.conversationsId || conversationsId

                if (Number(messageConversationId) !== Number(conversationsId)) return

                this.upsertMessage(payload, conversationsId)
            })

            realtimeSocket.addEventListener('close', () => {
                if (realtimeStoppedManually || this.currentChat?.conversationsId !== conversationsId) return

                this.realtimeStatus = 'reconnecting'
                realtimeReconnectTimer = window.setTimeout(() => {
                    this.startRealtimeMessages(conversationsId)
                }, realtimePollInterval)
            })

            realtimeSocket.addEventListener('error', () => {
                this.realtimeStatus = 'polling'
                realtimeStoppedManually = true
                realtimeSocket?.close()
                this.startMessagePolling(conversationsId)
            })
        },

        startMessagePolling(conversationsId) {
            this.realtimeStatus = 'polling'
            realtimePollTimer = window.setInterval(() => {
                if (this.currentChat?.conversationsId !== conversationsId) {
                    this.stopRealtimeMessages()
                    return
                }

                this.loadMessages(conversationsId, { silent: true }).catch(() => {})
            }, realtimePollInterval)
        },

        stopRealtimeMessages() {
            realtimeStoppedManually = true

            if (realtimeEchoChannel && realtimeEchoChannelName) {
                Echo.leave(`private-${realtimeEchoChannelName}`)
                Echo.leave(realtimeEchoChannelName)
                realtimeEchoChannel = null
                realtimeEchoChannelName = ''
            }

            if (realtimePollTimer) {
                window.clearInterval(realtimePollTimer)
                realtimePollTimer = null
            }

            if (realtimeReconnectTimer) {
                window.clearTimeout(realtimeReconnectTimer)
                realtimeReconnectTimer = null
            }

            if (realtimeSocket) {
                realtimeSocket.close()
                realtimeSocket = null
            }

            this.realtimeStatus = 'disconnected'
        },

        async addNewChat(chat = {}) {
            const chatNumber = this.conversations.length + 1
            const payload = {
                name: chat.name?.trim() || `New Chat ${chatNumber}`,
                status: chat.status || 'online',
                profilePicture: chat.profilePicture?.trim() || '',
                lastMessage: chat.lastMessage?.trim() || '',
            }

            this.conversationsError = ''

            try {
                const { data } = await api.post('/conversations', payload)
                const conversationPayload = data?.conversation || data?.data?.conversation || data?.data || data
                const conversation = normalizeConversation({
                    ...payload,
                    ...conversationPayload,
                    profilePicture: conversationPayload?.profilePicture || conversationPayload?.profile_picture || payload.profilePicture || fallbackAvatar(chatNumber),
                    lastMessage: conversationPayload?.lastMessage || conversationPayload?.last_message || payload.lastMessage || 'Start a new conversation',
                })

                this.conversations.unshift(conversation)
                this.openChat(conversation.name, conversation.status, conversation.id)

                return conversation
            } catch (error) {
                this.conversationsError = getErrorMessage(error, 'Unable to create conversation.')
                throw error
            }
        },

        async searchConversationUsers(search) {
            const query = search?.trim()

            if (!query) {
                this.userSearchResults = []
                this.userSearchError = ''
                return []
            }

            this.userSearchLoading = true
            this.userSearchError = ''

            try {
                const { data } = await api.get('/conversation-users/search', {
                    params: { query },
                })
                const users = getResponseData(data).map((user) => ({
                    id: user.id,
                    name: user.name || user.email,
                    email: user.email,
                    requestStatus: user.request_status,
                }))

                this.userSearchResults = users
                return users
            } catch (error) {
                this.userSearchError = getErrorMessage(error, 'Unable to search users.')
                throw error
            } finally {
                this.userSearchLoading = false
            }
        },

        async sendConversationRequest(userId) {
            this.userSearchError = ''

            try {
                const { data } = await api.post('/conversation-requests', {
                    receiver_id: userId,
                })
                const request = data?.data || data

                this.userSearchResults = this.userSearchResults.map((user) => {
                    if (user.id !== userId) return user

                    return {
                        ...user,
                        requestStatus: request.status || 'pending',
                    }
                })

                return request
            } catch (error) {
                this.userSearchError = getErrorMessage(error, 'Unable to send conversation request.')
                throw error
            }
        },

        async loadConversationRequests() {
            this.conversationRequestsLoading = true
            this.conversationRequestsError = ''

            try {
                const { data } = await api.get('/conversation-requests/received')
                const requests = getResponseData(data).map((request) => {
                    const user = request.sender || request.user || request.requester || request.receiver || {}

                    return {
                        id: request.id,
                        status: request.status || 'pending',
                        userId: user.id,
                        name: user.name || user.email || 'Unknown user',
                        email: user.email || '',
                    }
                })

                this.conversationRequests = requests
                return requests
            } catch (error) {
                this.conversationRequestsError = getErrorMessage(error, 'Unable to load conversation requests.')
                throw error
            } finally {
                this.conversationRequestsLoading = false
            }
        },

        async approveConversationRequest(requestId) {
            this.conversationRequestsError = ''

            try {
                const { data } = await api.post(`/conversation-requests/${requestId}/approve`)

                this.conversationRequests = this.conversationRequests.filter((request) => request.id !== requestId)
                await this.loadConversations()

                return data?.data || data
            } catch (error) {
                this.conversationRequestsError = getErrorMessage(error, 'Unable to approve request.')
                throw error
            }
        },

        async rejectConversationRequest(requestId) {
            this.conversationRequestsError = ''

            try {
                const { data } = await api.post(`/conversation-requests/${requestId}/reject`)

                this.conversationRequests = this.conversationRequests.filter((request) => request.id !== requestId)

                return data?.data || data
            } catch (error) {
                this.conversationRequestsError = getErrorMessage(error, 'Unable to reject request.')
                throw error
            }
        },

        addNewGroup(group = {}) {
            const groupNumber = this.groups.length + 1

            this.groups.unshift({
                id: Date.now(),
                name: group.name?.trim() || `New Group ${groupNumber}`,
                lastMessage: group.lastMessage?.trim() || 'Invite members to start chatting',
                time: 'Just now',
                unread: 0,
                members: group.members?.trim() || '',
                profilePicture: group.profilePicture?.trim() || `https://i.pravatar.cc/150?img=${((groupNumber + 20) % 70) + 1}`,
            })
        },

        addNewCommunity(community = {}) {
            const communityNumber = this.communities.length + 1
            const name = community.name?.trim() || `New Community ${communityNumber}`

            this.communities.unshift({
                id: Date.now(),
                name,
                visibility: community.visibility || 'Public Community',
                icon: community.icon?.trim() || name.split(' ').map((word) => word[0]).join('').slice(0, 2).toUpperCase(),
                topic: community.topic?.trim() || '',
                members: community.members?.trim() || '1 member',
                online: '1 online',
            })
        },

        async sendMessage(content) {
            if (!this.currentChat) {
                console.warn('No chat selected!')
                return null
            }

            const message = content?.trim()

            if (!message) return null

            this.sendingMessage = true
            this.messagesError = ''

            try {
                const { data } = await api.post(`/conversations/${this.currentChat.conversationsId}/messages`, {
                    message,
                    message_type: 'text',
                })
                const newMessage = normalizeMessage(getSingleResponseData(data), this.currentChat.conversationsId, getCurrentUserId())

                this.upsertMessage(newMessage, this.currentChat.conversationsId)

                return newMessage
            } catch (error) {
                this.messagesError = getErrorMessage(error, 'Unable to send message.')
                throw error
            } finally {
                this.sendingMessage = false
            }
        },
    },
})
