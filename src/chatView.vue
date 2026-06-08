<script setup>
import { onBeforeUnmount } from 'vue';
import sidebar from './assets/sidebar/sidebar.vue';
import mainChatArea from './assets/main-chat-area/main-chat-area.vue';
import rightPanal from './assets/right-penal/right-panal.vue';
import { useChatStore } from './store/chatStore';

const chatStore = useChatStore();

onBeforeUnmount(() => {
  chatStore.stopRealtimeMessages();
})
</script>

<template>
  <div class="main-container">
    <sidebar />
    <mainChatArea />
    <rightPanal />
  </div>
</template>

<style scoped>

</style>
