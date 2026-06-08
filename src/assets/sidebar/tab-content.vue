<script setup>
import { onMounted } from 'vue'
import { useChatStore } from '../../store/chatStore'

const chatStore = useChatStore()

onMounted(() => {
    chatStore.loadConversations().catch(() => {})
})
</script>

<template>
    <div class="tab-content flex-grow-1">
        <div class="tab-pane fade show active chat-list" id="chats">
            <div class="chat-state" v-if="chatStore.conversationsLoading">
                <i class="bi bi-arrow-clockwise spin-icon"></i>
                Loading conversations...
            </div>

            <div class="chat-state error" v-else-if="chatStore.conversationsError">
                {{ chatStore.conversationsError }}
            </div>

            <div class="chat-state" v-else-if="chatStore.conversations.length === 0">
                No conversations yet.
            </div>

            <div
                v-for="chat in chatStore.conversations"
                :key="chat.id"
                class="chat-item"
                :class="{ active: chat.name === chatStore.currentChat?.name }"
                @click="chatStore.openChat(chat.name, chat.status, chat.id)"
            >
                <div class="avatar">
                    <img :src="chat.profilePicture" alt="Avatar">
                    <div class="status-indicator" :class="chat.status"></div>
                </div>
                <div class="chat-info">
                    <div class="chat-name">
                        <span>{{ chat.name }}</span>
                        <span class="chat-time">{{ chat.time }}</span>
                    </div>
                    <div class="chat-preview">{{ chat.lastMessage }}</div>
                </div>
                <span class="unread-badge" :style="{ display: chat.unread > 0 ? 'block' : 'none' }">{{ chat.unread }}</span>
            </div>
        </div>

        <div class="tab-pane fade chat-list" id="groups">
            <div v-for="group in chatStore.groups" :key="group.id" class="chat-item">
                <div class="avatar">
                    <img :src="group.profilePicture" alt="Avatar">
                </div>
                <div class="chat-info">
                    <div class="chat-name">
                        <span>{{ group.name }}</span>
                        <span class="chat-time">{{ group.time }}</span>
                    </div>
                    <div class="chat-preview">{{ group.lastMessage }}</div>
                </div>
                <span class="unread-badge" :style="{ display: group.unread > 0 ? 'block' : 'none' }">{{ group.unread }}</span>
            </div>
        </div>

        <div class="tab-pane fade chat-list" id="community">
            <div v-for="community in chatStore.communities" :key="community.id" class="community-card">
                <div class="community-header">
                    <div class="community-icon">{{ community.icon }}</div>
                    <div class="community-info">
                        <h6>{{ community.name }}</h6>
                        <small>{{ community.visibility }}</small>
                    </div>
                </div>
                <div class="community-stats">
                    <span><i class="bi bi-people"></i> {{ community.members }}</span>
                    <span><i class="bi bi-chat"></i> {{ community.online }}</span>
                </div>
            </div>
        </div>
    </div>
</template>
