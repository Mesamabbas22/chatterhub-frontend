import { defineStore } from 'pinia'
import { api, clearStoredToken, getStoredToken, setStoredToken } from '../services/api'

const extractToken = (payload) => {
  if (!payload) return null

  return payload.token
    || payload.access_token
    || payload.accessToken
    || payload.jwt
    || payload.data?.token
    || payload.data?.access_token
    || payload.data?.accessToken
    || payload.data?.jwt
    || null
}

const extractUser = (payload) => {
  if (!payload) return null

  return payload.user || payload.data?.user || payload.data || null
}

const getErrorMessage = (error, fallback) => {
  const data = error.response?.data

  if (typeof data?.message === 'string') return data.message
  if (typeof data?.error === 'string') return data.error

  const firstValidationError = data?.errors && Object.values(data.errors).flat()[0]
  if (typeof firstValidationError === 'string') return firstValidationError

  return fallback
}

export const useAuthStore = defineStore('auth', {
  state: () => ({
    token: getStoredToken(),
    user: null,
    loading: false,
    error: '',
  }),

  getters: {
    isAuthenticated: (state) => Boolean(state.token),
  },

  actions: {
    async register(form) {
      this.loading = true
      this.error = ''

      try {
        const { data } = await api.post('/register', form)
        const token = extractToken(data)

        if (token) {
          this.token = token
          setStoredToken(token)
        }

        this.user = extractUser(data)
        return data
      } catch (error) {
        this.error = getErrorMessage(error, 'Unable to create your account.')
        throw error
      } finally {
        this.loading = false
      }
    },

    async login(credentials) {
      this.loading = true
      this.error = ''

      try {
        const { data } = await api.post('/login', credentials)
        const token = extractToken(data)

        if (!token) {
          throw new Error('Login response did not include a JWT token.')
        }

        this.token = token
        this.user = extractUser(data)
        setStoredToken(token)

        return data
      } catch (error) {
        this.error = error.message === 'Login response did not include a JWT token.'
          ? error.message
          : getErrorMessage(error, 'Invalid email or password.')
        throw error
      } finally {
        this.loading = false
      }
    },

    logout() {
      this.token = null
      this.user = null
      this.error = ''
      clearStoredToken()
    },
  },
})
