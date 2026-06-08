import Echo from 'laravel-echo'
import Pusher from 'pusher-js'
import { getStoredToken } from '../services/api'

window.Pusher = Pusher

const getAuthHeaders = () => {
  const token = getStoredToken()

  return token
    ? { Authorization: `Bearer ${token}` }
    : {}
}

const authEndpoint = import.meta.env.VITE_BROADCAST_AUTH_ENDPOINT || 'http://127.0.0.1:8000/broadcasting/auth'
const reverbScheme = import.meta.env.VITE_REVERB_SCHEME || 'http'
const forceTLS = reverbScheme === 'https'

const echo = new Echo({
  broadcaster: 'reverb',
  key: import.meta.env.VITE_REVERB_APP_KEY,
  wsHost: import.meta.env.VITE_REVERB_HOST,
  wsPort: import.meta.env.VITE_REVERB_PORT ?? 8080,
  wssPort: import.meta.env.VITE_REVERB_PORT ?? 8080,
  forceTLS,
  enabledTransports: forceTLS ? ['wss'] : ['ws'],

  authEndpoint,
  auth: {
    headers: getAuthHeaders(),
  },
})

export const refreshEchoAuthHeaders = () => {
  echo.options.auth.headers = getAuthHeaders()

  if (echo.connector?.pusher?.config?.auth?.headers) {
    echo.connector.pusher.config.auth.headers = getAuthHeaders()
  }
}

window.Echo = echo

export default echo
