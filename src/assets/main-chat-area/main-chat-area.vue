<script setup>
import { ref } from 'vue';
import { useChatStore } from '../../store/chatStore';
const chatStore = useChatStore();
const messageText = ref('');

const submitMessage = async () => {
    const content = messageText.value.trim();

    if (!content || chatStore.sendingMessage) return;

    await chatStore.sendMessage(content);
    messageText.value = '';
}
</script>

<template>
    <div class="chat-area">
        <div id="welcomeScreen" :class="{hidden: chatStore.currentChat}" class="welcome-screen">
            <div class="welcome-icon">
                <i class="bi bi-chat-heart-fill"></i>
            </div>
            <h2>Welcome to ChatterHub</h2>
            <p>Select a conversation from the sidebar to start chatting, or join a community to connect with people who
                share your interests!</p>
        </div>

        <div id="chatScreen" :class="{hidden: !chatStore.currentChat}" style="display: flex; flex-direction: column; height: 100%;">
            <div class="chat-header">
                <div class="chat-header-info">
                    <div class="avatar" style="margin-right: 15px;">
                        <img id="chatAvatar" :src="chatStore.conversations.filter(c => c.id === chatStore.currentChat?.conversationsId)[0]?.profilePicture" alt="Avatar">
                        <div id="chatStatus" class="status-indicator" :class="chatStore.currentChat?.status"></div>
                    </div>
                    <div>
                        <h6 id="chatName" class="mb-0">{{ chatStore.currentChat?.name }}</h6>
                        <small id="chatStatusText" class="text-success">{{ chatStore.currentChat?.statusText }}</small>
                    </div>
                </div>
                <div class="chat-header-actions">
                    <button onclick="startCall()"><i class="bi bi-telephone"></i></button>
                    <button onclick="startVideoCall()"><i class="bi bi-camera-video"></i></button>
                    <button onclick="toggleRightPanel()"><i class="bi bi-info-circle"></i></button>
                </div>
            </div>

            <div class="messages-container" id="messagesContainer">
                <div class="message-state" v-if="chatStore.messagesLoading">
                    <i class="bi bi-arrow-clockwise spin-icon"></i>
                    Loading messages...
                </div>

                <div class="message-state error" v-else-if="chatStore.messagesError">
                    {{ chatStore.messagesError }}
                </div>

                <div class="message-state" v-else-if="chatStore.getCurrentChatMessages?.length === 0">
                    No messages yet.
                </div>

                <div v-for="message in chatStore.getCurrentChatMessages" :key="message.id" class="message" :class="{sent: message.type === 'sent'}">
                    <img class="message-avatar" :src="chatStore.conversations.filter(c => c.id === chatStore.currentChat?.conversationsId)[0]?.profilePicture" alt="Avatar">
                    <div class="message-content">
                        <div class="message-bubble">
                            {{ message.content }}
                        </div>
                        <div class="message-time">{{ message.time }}</div>
                    </div>
                </div>

                <!-- <div class="message sent">
                    <img class="message-avatar" src="https://i.pravatar.cc/150?img=1" alt="Avatar">
                    <div class="message-content">
                        <div class="message-bubble">
                            I'm doing great! Thanks for asking. How about you?
                        </div>
                        <div class="message-time">10:31 AM</div>
                    </div>
                </div>

                <div class="message">
                    <img class="message-avatar" src="https://i.pravatar.cc/150?img=5" alt="Avatar">
                    <div class="message-content">
                        <div class="message-bubble">
                            I'm good too! I wanted to talk about the project we discussed last week.
                        </div>
                        <div class="message-time">10:32 AM</div>
                    </div>
                </div>

                <div class="message sent">
                    <img class="message-avatar" src="https://i.pravatar.cc/150?img=1" alt="Avatar">
                    <div class="message-content">
                        <div class="message-bubble">
                            Sure! I've been working on it. Let me share the updates with you.
                        </div>
                        <div class="message-time">10:33 AM</div>
                    </div>
                </div>

                <div class="message">
                    <img class="message-avatar" src="https://i.pravatar.cc/150?img=5" alt="Avatar">
                    <div class="message-content">
                        <div class="message-bubble">
                            That sounds great! Let's do it 🎉
                        </div>
                        <div class="message-time">10:35 AM</div>
                    </div>
                </div> -->
            </div>

            <div class="typing-indicator hidden" id="typingIndicator">
                <img class="message-avatar" src="https://i.pravatar.cc/150?img=5" alt="Avatar">
                <span>Sarah is typing</span>
                <div class="typing-dots">
                    <span></span>
                    <span></span>
                    <span></span>
                </div>
            </div>

            <div class="message-input-area">
                <form class="message-input-wrapper" @submit.prevent="submitMessage">
                    <button class="input-action-btn" type="button"><i class="bi bi-emoji-smile"></i></button>
                    <button class="input-action-btn" type="button"><i class="bi bi-paperclip"></i></button>
                    <input type="text" id="messageInput" placeholder="Type a message..."
                        v-model="messageText"
                        :disabled="chatStore.sendingMessage || !chatStore.currentChat">
                    <button class="send-btn" type="submit" :disabled="chatStore.sendingMessage || !messageText.trim()">
                        <i class="bi" :class="chatStore.sendingMessage ? 'bi-arrow-clockwise spin-icon' : 'bi-send-fill'"></i>
                    </button>
                </form>
            </div>
        </div>
    </div>
</template>
