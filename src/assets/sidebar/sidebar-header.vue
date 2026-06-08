<script setup>
defineProps({
    msg: {
        type: String,
        required: true,
    },
})
</script>

<template>
    <div class="sidebar-header">
        <div class="logo">
            <i class="bi bi-chat-heart-fill"></i> ChatterHub
        </div>
        <button class="btn btn-sm btn-light" onclick="showUserProfile()">
            <i class="bi bi-person-circle"></i>
        </button>
    </div>
</template>
