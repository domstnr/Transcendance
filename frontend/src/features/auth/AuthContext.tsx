import {
    createContext,
    useContext,
    useEffect,
    useState,
    type ReactNode,
} from 'react'
import api from '../../shared/api/api'
import type { AuthUser, LoginResponse } from './types'

type AuthContextValue = {
    user: AuthUser | null
    token: string | null
    refreshToken: string | null
    isAuthenticated: boolean
    isLoading: boolean
    login: (data: LoginResponse) => void
    logout: () => void
}

const AuthContext = createContext<AuthContextValue | undefined>(undefined)

type AuthProviderProps = {
    children: ReactNode
}

export function AuthProvider({ children }: AuthProviderProps) {
    const [user, setUser] = useState<AuthUser | null>(null)
    const [token, setToken] = useState<string | null>(null)
    const [refreshToken, setRefreshToken] = useState<string | null>(null)
    const [isLoading, setIsLoading] = useState(true)

    useEffect(() => {
        async function loadAuth() {
            const storedToken = localStorage.getItem('token')
            const storedRefreshToken = localStorage.getItem('refreshToken')

            if (!storedToken) {
                setIsLoading(false)
                return
            }

            try {
                setToken(storedToken)
                setRefreshToken(storedRefreshToken)

                const response = await api.get('/auth/profile')

                setUser(response.data.user)
                localStorage.setItem('user', JSON.stringify(response.data.user))
            } catch {
                localStorage.removeItem('token')
                localStorage.removeItem('refreshToken')
                localStorage.removeItem('user')

                setToken(null)
                setRefreshToken(null)
                setUser(null)
            } finally {
                setIsLoading(false)
        }
    }

    void loadAuth()

        // const storedToken = localStorage.getItem('token')
        // const storedRefreshToken = localStorage.getItem('refreshToken')
        // const storedUser = localStorage.getItem('user')
        //
        // if (storedToken) {
        // setToken(storedToken)
        // }
        //
        // if (storedRefreshToken) {
        // setRefreshToken(storedRefreshToken)
        // }
        //
        // if (storedUser) {
        // try {
        //     setUser(JSON.parse(storedUser) as AuthUser)
        // } catch {
        //     localStorage.removeItem('user')
        // }
        // }
        //
        // setIsLoading(false)
    }, [])

    function login(data: LoginResponse) {
        localStorage.setItem('token', data.tokens.accessToken)
        localStorage.setItem('refreshToken', data.tokens.refreshToken)
        localStorage.setItem('user', JSON.stringify(data.user))

        setToken(data.tokens.accessToken)
        setRefreshToken(data.tokens.refreshToken)
        setUser(data.user)
    }

    function logout() {
        localStorage.removeItem('token')
        localStorage.removeItem('refreshToken')
        localStorage.removeItem('user')

        setToken(null)
        setRefreshToken(null)
        setUser(null)
    }

    const value: AuthContextValue = {
        user,
        token,
        refreshToken,
        isAuthenticated: Boolean(token),
        isLoading,
        login,
        logout,
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

