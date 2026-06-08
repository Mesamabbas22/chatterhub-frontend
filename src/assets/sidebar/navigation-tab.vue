<script setup>
defineProps({
    msg: {
        type: String,
        required: true,
    },
})
</script>

<template>
    <ul class="nav nav-tabs" role="tablist">
        <li class="nav-item" role="presentation">
            <button class="nav-link active" id="chats-tab" data-bs-toggle="tab" data-bs-target="#chats" type="button">
                <i class="bi bi-chat-dots"></i> Chats
            </button>
        </li>
        <li class="nav-item" role="presentation">
            <button class="nav-link" id="groups-tab" data-bs-toggle="tab" data-bs-target="#groups" type="button">
                <i class="bi bi-people"></i> Groups
            </button>
        </li>
        <li class="nav-item" role="presentation">
            <button class="nav-link" id="community-tab" data-bs-toggle="tab" data-bs-target="#community" type="button">
                <i class="bi bi-grid"></i> Community
            </button>
        </li>
    </ul>
</template>
