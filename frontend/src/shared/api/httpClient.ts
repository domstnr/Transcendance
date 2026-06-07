import axios from 'axios'

type RetryableRequestConfig = {
  _retry?: boolean
  headers?: Record<string, string>
  url?: string
}

const NON_REFRESHABLE_AUTH_PATHS = ['/auth/login', '/auth/register', '/auth/refresh'] as const
const API_ORIGIN = import.meta.env.VITE_API_URL?.replace(/\/$/, '')

const httpClient = axios.create({
  baseURL: API_ORIGIN ? `${API_ORIGIN}/api` : '/api',
  withCredentials: true,
})

httpClient.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config as RetryableRequestConfig | undefined

    if (!originalRequest || error.response?.status !== 401) {
      return Promise.reject(error)
    }

    if (isNonRefreshableAuthRequest(originalRequest.url)) {
      return Promise.reject(error)
    }

    if (originalRequest._retry) {
      window.dispatchEvent(new Event('auth:logout'))
      return Promise.reject(error)
    }

    originalRequest._retry = true

    try {
      await httpClient.post('/auth/refresh')
      return httpClient(originalRequest)
    } catch (refreshError) {
      window.dispatchEvent(new Event('auth:logout'))
      return Promise.reject(refreshError)
    }
  }
)

function isNonRefreshableAuthRequest(url?: string): boolean {
  if (!url) {
    return false
  }

  return NON_REFRESHABLE_AUTH_PATHS.some((path) => url.includes(path))
}

export function extractHttpErrorMessage(error: unknown): string | null {
  if (!axios.isAxiosError(error)) {
    return null
  }

  const message = error.response?.data?.message

  if (Array.isArray(message)) {
    return message.join(' ')
  }

  if (typeof message === 'string') {
    return message
  }

  return null
}

export default httpClient
