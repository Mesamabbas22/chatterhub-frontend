<script setup>
import { computed, onBeforeUnmount, onMounted, watch } from 'vue'
import { RouterView } from 'vue-router'
import { useAuthStore } from './store/authStore'
import { useChatStore } from './store/chatStore'

const authStore = useAuthStore()
const chatStore = useChatStore()
const isAuthenticated = computed(() => authStore.isAuthenticated)

const markOnline = () => {
  if (!authStore.isAuthenticated) return

  authStore.markOnline().catch(() => {})
  chatStore.startUserStatusUpdates()
}

const markOffline = (options = {}) => {
  if (!authStore.isAuthenticated) return

  authStore.markOffline(options).catch(() => {})
}

const handleVisibilityChange = () => {
  if (document.visibilityState === 'visible') {
    markOnline()
    return
  }

  markOffline({ keepalive: true })
}

const handlePageExit = () => {
  markOffline({ keepalive: true })
}

onMounted(() => {
  markOnline()
  document.addEventListener('visibilitychange', handleVisibilityChange)
  window.addEventListener('pagehide', handlePageExit)
  window.addEventListener('beforeunload', handlePageExit)
})

onBeforeUnmount(() => {
  document.removeEventListener('visibilitychange', handleVisibilityChange)
  window.removeEventListener('pagehide', handlePageExit)
  window.removeEventListener('beforeunload', handlePageExit)
})

watch(isAuthenticated, (authenticated) => {
  if (authenticated) {
    markOnline()
    return
  }

  chatStore.stopUserStatusUpdates()
})
</script>

<template>
    <RouterView />
</template>

<style scoped>

</style>
