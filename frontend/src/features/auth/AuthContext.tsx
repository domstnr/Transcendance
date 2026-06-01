import {
    createContext,
    useContext,
    useEffect,
    useState,
    type ReactNode,
} from 'react'
import httpClient from '../../shared/api/httpClient'
import type { AuthUser } from './types'

type AuthContextValue = {
    user: AuthUser | null
    isAuthenticated: boolean
    isLoading: boolean
    login: (user: AuthUser) => void
    logout: () => Promise<void>
    refreshUser: () => Promise<void>
}

const AuthContext = createContext<AuthContextValue | undefined>(undefined)

type AuthProviderProps = {
    children: ReactNode
}

export function AuthProvider({ children }: AuthProviderProps) {
    const [user, setUser] = useState<AuthUser | null>(null)
    const [isLoading, setIsLoading] = useState(true)

    useEffect(() => {
        async function loadAuth() {
            try {
                const response = await httpClient.get('/user/me')
                setUser(response.data.user)
            } catch {
                setUser(null)
            } finally {
                setIsLoading(false)
            }
        }

        function handleForcedLogout() {
            setUser(null)
        }

        void loadAuth()

        window.addEventListener('auth:logout', handleForcedLogout)
        return () => window.removeEventListener('auth:logout', handleForcedLogout)
    }, [])

    function login(user: AuthUser) {
        setUser(user)
    }

    async function logout() {
        try {
            await httpClient.post('/auth/logout')
        } finally {
            setUser(null)
        }
    }

    async function refreshUser() {
        const response = await httpClient.get('/user/me')
        setUser(response.data.user)
    }

    const value: AuthContextValue = {
        user,
        isAuthenticated: Boolean(user),
        isLoading,
        login,
        logout,
        refreshUser,
    }

    return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

export function useAuth() {
    const context = useContext(AuthContext)

    if (!context) {
        throw new Error('useAuth must be used within an AuthProvider')
    }

    return context
}
