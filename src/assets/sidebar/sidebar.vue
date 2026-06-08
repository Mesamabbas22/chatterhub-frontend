<script setup>
import { computed, reactive, ref } from 'vue'
import SidebarHeader from './sidebar-header.vue'
import SearchBox from './search-box.vue'
import NavigationTab from './navigation-tab.vue'
import mainChatArea from './tab-content.vue';
import { useChatStore } from '../../store/chatStore'

const chatStore = useChatStore()
const createType = ref(null)
const formError = ref('')
const formSubmitting = ref(false)
const searchQuery = ref('')
const hasSearchedUsers = ref(false)
const requestingUserId = ref(null)
const requestsPanelOpen = ref(false)
const requestActionId = ref(null)
const form = reactive({
    name: '',
    status: 'online',
    profilePicture: '',
    lastMessage: '',
    members: '',
    visibility: 'Public Community',
    icon: '',
    topic: '',
})

const createConfig = computed(() => {
    const configs = {
        chat: {
            title: 'New Chat',
            eyebrow: 'Find people',
            icon: 'bi-chat-left-text',
        },
        group: {
            title: 'New Group',
            eyebrow: 'Team space',
            icon: 'bi-people-fill',
            nameLabel: 'Group name',
            namePlaceholder: 'Product Team',
            messageLabel: 'Group description',
            messagePlaceholder: 'Invite members to start chatting',
            submitLabel: 'Create Group',
        },
        community: {
            title: 'New Community',
            eyebrow: 'Public or private hub',
            icon: 'bi-grid-3x3-gap-fill',
            nameLabel: 'Community name',
            namePlaceholder: 'Designers Hub',
            messageLabel: 'Topic',
            messagePlaceholder: 'Share what this community is about',
            submitLabel: 'Create Community',
        },
    }

    return configs[createType.value]
})

const resetForm = () => {
    form.name = ''
    form.status = 'online'
    form.profilePicture = ''
    form.lastMessage = ''
    form.members = ''
    form.visibility = 'Public Community'
    form.icon = ''
    form.topic = ''
    searchQuery.value = ''
    hasSearchedUsers.value = false
    requestingUserId.value = null
    chatStore.userSearchResults = []
    chatStore.userSearchError = ''
    formError.value = ''
}

const openCreateForm = (type) => {
    resetForm()
    requestsPanelOpen.value = false
    createType.value = type
}

const closeCreateForm = () => {
    createType.value = null
    resetForm()
}

const openRequestsPanel = () => {
    closeCreateForm()
    requestsPanelOpen.value = true
    chatStore.loadConversationRequests().catch(() => {})
}

const closeRequestsPanel = () => {
    requestsPanelOpen.value = false
    requestActionId.value = null
}

const submitCreateForm = async () => {
    formError.value = ''

    if (!form.name.trim()) {
        formError.value = 'Name is required.'
        return
    }

    formSubmitting.value = true

    try {
        if (createType.value === 'chat') {
            await chatStore.addNewChat({
                name: form.name,
                status: form.status,
                profilePicture: form.profilePicture,
                lastMessage: form.lastMessage,
            })
        }

        if (createType.value === 'group') {
            chatStore.addNewGroup({
                name: form.name,
                profilePicture: form.profilePicture,
                lastMessage: form.lastMessage,
                members: form.members,
            })
        }

        if (createType.value === 'community') {
            chatStore.addNewCommunity({
                name: form.name,
                visibility: form.visibility,
                icon: form.icon,
                topic: form.topic,
                members: form.members,
            })
        }

        closeCreateForm()
    } catch (error) {
        formError.value = chatStore.conversationsError || 'Unable to create this item.'
    } finally {
        formSubmitting.value = false
    }
}

const searchUsers = () => {
    formError.value = ''

    if (!searchQuery.value.trim()) return

    hasSearchedUsers.value = true
    chatStore.searchConversationUsers(searchQuery.value).catch(() => {})
}

const sendRequest = async (user) => {
    requestingUserId.value = user.id

    try {
        await chatStore.sendConversationRequest(user.id)
    } finally {
        requestingUserId.value = null
    }
}

const isRequestDisabled = (user) => {
    return Boolean(user.requestStatus) || requestingUserId.value === user.id
}

const approveRequest = async (request) => {
    requestActionId.value = request.id

    try {
        await chatStore.approveConversationRequest(request.id)
    } finally {
        requestActionId.value = null
    }
}

const rejectRequest = async (request) => {
    requestActionId.value = request.id

    try {
        await chatStore.rejectConversationRequest(request.id)
    } finally {
        requestActionId.value = null
    }
}

defineProps({
    msg: {
        type: String,
        required: true,
    },
})
</script>

<template>
    <div class="sidebar">
        <SidebarHeader />
        <NavigationTab />
        <div class="create-actions" aria-label="Create new items">
            <button class="create-action-btn" type="button" title="Add new chat" @click="openCreateForm('chat')">
                <i class="bi bi-chat-left-text"></i>
                <span>Chat</span>
            </button>
            <button class="create-action-btn" type="button" title="Add new group" @click="openCreateForm('group')">
                <i class="bi bi-people-fill"></i>
                <span>Group</span>
            </button>
            <button class="create-action-btn" type="button" title="Add new community" @click="openCreateForm('community')">
                <i class="bi bi-grid-3x3-gap-fill"></i>
                <span>Community</span>
            </button>
            <button class="create-action-btn" type="button" title="Conversation requests" @click="openRequestsPanel">
                <i class="bi bi-person-check"></i>
                <span>Requests</span>
            </button>
        </div>
        <SearchBox />
        <mainChatArea />

        <div class="create-panel-backdrop" v-if="createType" @click.self="closeCreateForm">
            <form class="create-panel" @submit.prevent="createType === 'chat' ? searchUsers() : submitCreateForm()">
                <div class="create-panel-header">
                    <div class="create-panel-icon">
                        <i :class="`bi ${createConfig.icon}`"></i>
                    </div>
                    <div>
                        <span>{{ createConfig.eyebrow }}</span>
                        <h3>{{ createConfig.title }}</h3>
                    </div>
                    <button class="create-close-btn" type="button" title="Close" @click="closeCreateForm">
                        <i class="bi bi-x-lg"></i>
                    </button>
                </div>

                <div class="user-search-panel" v-if="createType === 'chat'">
                    <div class="user-search-box">
                        <i class="bi bi-search"></i>
                        <input
                            type="search"
                            v-model="searchQuery"
                            placeholder="Search users by name or email"
                            @keyup.enter="searchUsers"
                        >
                        <button type="submit" :disabled="chatStore.userSearchLoading || !searchQuery.trim()">
                            <i :class="chatStore.userSearchLoading ? 'bi bi-arrow-clockwise spin-icon' : 'bi bi-arrow-right'"></i>
                        </button>
                    </div>

                    <div class="user-search-state" v-if="chatStore.userSearchLoading">
                        <i class="bi bi-arrow-clockwise spin-icon"></i>
                        Searching users...
                    </div>

                    <div class="user-search-state error" v-else-if="chatStore.userSearchError">
                        {{ chatStore.userSearchError }}
                    </div>

                    <div class="user-search-state" v-else-if="hasSearchedUsers && chatStore.userSearchResults.length === 0">
                        No users found.
                    </div>

                    <div class="user-result-list" v-else>
                        <div class="user-result" v-for="user in chatStore.userSearchResults" :key="user.id">
                            <div class="user-result-avatar">
                                {{ (user.name || user.email || 'U').slice(0, 1).toUpperCase() }}
                            </div>
                            <div class="user-result-info">
                                <strong>{{ user.name || user.email }}</strong>
                                <small>{{ user.email }}</small>
                            </div>
                            <button
                                class="request-btn"
                                type="button"
                                :class="{ sent: isRequestDisabled(user) }"
                                :disabled="isRequestDisabled(user)"
                                @click="sendRequest(user)"
                            >
                                <i v-if="requestingUserId === user.id" class="bi bi-arrow-clockwise spin-icon"></i>
                                <span v-else>{{ user.requestStatus || 'Request' }}</span>
                            </button>
                        </div>
                    </div>
                </div>

                <template v-else>
                <div class="create-preview">
                    <div class="create-preview-avatar">
                        <img v-if="form.profilePicture" :src="form.profilePicture" alt="">
                        <span v-else>{{ createType === 'community' ? (form.icon || 'CH') : (form.name.trim()[0] || '+') }}</span>
                    </div>
                    <div>
                        <strong>{{ form.name || createConfig.namePlaceholder }}</strong>
                        <small>{{ createType === 'community' ? form.visibility : (form.lastMessage || createConfig.messagePlaceholder) }}</small>
                    </div>
                </div>

                <label class="create-field">
                    <span>{{ createConfig.nameLabel }}</span>
                    <input type="text" v-model="form.name" :placeholder="createConfig.namePlaceholder">
                </label>

                <label class="create-field" v-if="createType !== 'community'">
                    <span>Avatar URL</span>
                    <input type="url" v-model="form.profilePicture" placeholder="https://example.com/avatar.jpg">
                </label>

                <label class="create-field" v-if="createType === 'community'">
                    <span>Visibility</span>
                    <select v-model="form.visibility">
                        <option>Public Community</option>
                        <option>Private Community</option>
                    </select>
                </label>

                <label class="create-field" v-if="createType === 'community'">
                    <span>Icon initials</span>
                    <input type="text" maxlength="3" v-model="form.icon" placeholder="DH">
                </label>

                <label class="create-field" v-if="createType === 'group' || createType === 'community'">
                    <span>{{ createType === 'group' ? 'Members' : 'Member count' }}</span>
                    <input type="text" v-model="form.members" :placeholder="createType === 'group' ? 'Ali, Sara, Ahmed' : '1 member'">
                </label>

                <label class="create-field">
                    <span>{{ createConfig.messageLabel }}</span>
                    <textarea
                        v-if="createType === 'community'"
                        v-model="form.topic"
                        :placeholder="createConfig.messagePlaceholder"
                        rows="3"
                    ></textarea>
                    <textarea
                        v-else
                        v-model="form.lastMessage"
                        :placeholder="createConfig.messagePlaceholder"
                        rows="3"
                    ></textarea>
                </label>

                <p class="create-error" v-if="formError">{{ formError }}</p>

                <div class="create-panel-actions">
                    <button class="create-secondary-btn" type="button" @click="closeCreateForm" :disabled="formSubmitting">Cancel</button>
                    <button class="create-primary-btn" type="submit" :disabled="formSubmitting">
                        <i :class="formSubmitting ? 'bi bi-arrow-clockwise spin-icon' : 'bi bi-plus-lg'"></i>
                        {{ formSubmitting ? 'Creating...' : createConfig.submitLabel }}
                    </button>
                </div>
                </template>
            </form>
        </div>

        <div class="create-panel-backdrop" v-if="requestsPanelOpen" @click.self="closeRequestsPanel">
            <section class="create-panel">
                <div class="create-panel-header">
                    <div class="create-panel-icon">
                        <i class="bi bi-person-check"></i>
                    </div>
                    <div>
                        <span>Pending invites</span>
                        <h3>Chat Requests</h3>
                    </div>
                    <button class="create-close-btn" type="button" title="Close" @click="closeRequestsPanel">
                        <i class="bi bi-x-lg"></i>
                    </button>
                </div>

                <div class="user-search-state" v-if="chatStore.conversationRequestsLoading">
                    <i class="bi bi-arrow-clockwise spin-icon"></i>
                    Loading requests...
                </div>

                <div class="user-search-state error" v-else-if="chatStore.conversationRequestsError">
                    {{ chatStore.conversationRequestsError }}
                </div>

                <div class="user-search-state" v-else-if="chatStore.conversationRequests.length === 0">
                    No pending requests.
                </div>

                <div class="user-result-list" v-else>
                    <div class="user-result request-result" v-for="request in chatStore.conversationRequests" :key="request.id">
                        <div class="user-result-avatar">
                            {{ (request.name || request.email || 'U').slice(0, 1).toUpperCase() }}
                        </div>
                        <div class="user-result-info">
                            <strong>{{ request.name || request.email }}</strong>
                            <small>{{ request.email }}</small>
                        </div>
                        <div class="request-action-group">
                            <button
                                class="approve-btn"
                                type="button"
                                :disabled="requestActionId === request.id"
                                @click="approveRequest(request)"
                            >
                                <i v-if="requestActionId === request.id" class="bi bi-arrow-clockwise spin-icon"></i>
                                <span v-else>Approve</span>
                            </button>
                            <button
                                class="reject-btn"
                                type="button"
                                :disabled="requestActionId === request.id"
                                @click="rejectRequest(request)"
                            >
                                Reject
                            </button>
                        </div>
                    </div>
                </div>
            </section>
        </div>
    </div>
</template>
