import axios from 'axios'

type RetryableRequestConfig = {
  _retry?: boolean
  headers?: Record<string, string>
  url?: string
}

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL ?? 'http://localhost:3000',
  withCredentials: true,
  headers: {
    'Content-Type': 'application/json',
  },
})

api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config as RetryableRequestConfig | undefined

    if (!originalRequest || error.response?.status !== 401) {
      return Promise.reject(error)
    }

    if (originalRequest._retry || originalRequest.url?.includes('/auth/refresh')) {
      window.dispatchEvent(new Event('auth:logout'))
      return Promise.reject(error)
    }

    originalRequest._retry = true

    try {
      await api.post('/auth/refresh')
      return api(originalRequest)
    } catch (refreshError) {
      window.dispatchEvent(new Event('auth:logout'))
      return Promise.reject(refreshError)
    }
  }
)

export default api
