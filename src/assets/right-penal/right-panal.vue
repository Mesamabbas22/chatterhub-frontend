<script setup>
defineProps({
    msg: {
        type: String,
        required: true,
    },
})
</script>

<template>
    <div class="right-panel" id="rightPanel">
        <div class="profile-header">
            <img class="profile-avatar" id="profileAvatar" src="https://i.pravatar.cc/150?img=5" alt="Profile">
            <div class="profile-name" id="profileName">Sarah Johnson</div>
            <div class="profile-status" id="profileStatus">Active now</div>
        </div>

        <div class="profile-section">
            <div class="section-title">About</div>
            <p style="font-size: 14px; color: var(--text-secondary);">
                Creative designer passionate about building beautiful user experiences 🎨
            </p>
        </div>

        <div class="profile-section">
            <div class="section-title">Shared Media</div>
            <div class="media-grid">
                <div class="media-item">
                    <img src="https://picsum.photos/200/200?random=1" alt="Media">
                </div>
                <div class="media-item">
                    <img src="https://picsum.photos/200/200?random=2" alt="Media">
                </div>
                <div class="media-item">
                    <img src="https://picsum.photos/200/200?random=3" alt="Media">
                </div>
                <div class="media-item">
                    <img src="https://picsum.photos/200/200?random=4" alt="Media">
                </div>
                <div class="media-item">
                    <img src="https://picsum.photos/200/200?random=5" alt="Media">
                </div>
                <div class="media-item">
                    <img src="https://picsum.photos/200/200?random=6" alt="Media">
                </div>
            </div>
        </div>

        <div class="profile-section">
            <div class="section-title">Actions</div>
            <div class="d-grid gap-2">
                <button class="btn btn-outline-danger btn-sm">
                    <i class="bi bi-trash"></i> Clear Chat
                </button>
                <button class="btn btn-outline-warning btn-sm">
                    <i class="bi bi-bell-slash"></i> Mute Notifications
                </button>
                <button class="btn btn-outline-secondary btn-sm">
                    <i class="bi bi-ban"></i> Block User
                </button>
            </div>
        </div>
    </div>
</template>

<style scoped></style>
