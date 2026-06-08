import { createRouter, createWebHistory } from 'vue-router'
import ChatView from '../chatView.vue'
import SignupView from '../auth/signup.vue'
import LoginView from '../auth/login.vue'
import { getStoredToken } from '../services/api'

const routes = [
  {
    path: '/',
    redirect: '/chat'
  },
  {
    path: '/chat',
    name: 'chat',
    component: ChatView,
    meta: { requiresAuth: true }
  },

  {
    path: '/signup',
    name: 'signup',
    component: SignupView
  },
  {
    path: '/login',
    name: 'login',
    component: LoginView
  }
]

const router = createRouter({
  history: createWebHistory(),
  routes
})

router.beforeEach((to) => {
  const isAuthenticated = Boolean(getStoredToken())

  if (to.meta.requiresAuth && !isAuthenticated) {
    return '/login'
  }

  if ((to.name === 'login' || to.name === 'signup') && isAuthenticated) {
    return '/chat'
  }
})

export default router
