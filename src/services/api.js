import axios from 'axios'

const API_BASE_URL = 'http://127.0.0.1:8000/api'
const TOKEN_KEY = 'chatterhub_token'

export const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    Accept: 'application/json',
    'Content-Type': 'application/json',
  },
})

export const getStoredToken = () => localStorage.getItem(TOKEN_KEY)

export const setStoredToken = (token) => {
  if (!token) return

  localStorage.setItem(TOKEN_KEY, token)
  api.defaults.headers.common.Authorization = `Bearer ${token}`
}

export const clearStoredToken = () => {
  localStorage.removeItem(TOKEN_KEY)
  delete api.defaults.headers.common.Authorization
}

const existingToken = getStoredToken()
if (existingToken) {
  api.defaults.headers.common.Authorization = `Bearer ${existingToken}`
}

export const TOKEN_STORAGE_KEY = TOKEN_KEY
