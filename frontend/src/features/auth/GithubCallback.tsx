import { useEffect, useRef } from 'react'
import { useSearchParams } from 'react-router-dom'
import type { GitHubCodeRequest } from './types'
import { handleGitHubCallback } from './authService'
import { useAuth } from './AuthContext'

function CallbackPage() {
    const [searchParams] = useSearchParams()
    const processGitHubCallback = async () => {
        const code = searchParams.get('code')
        const error = searchParams.get('error')
        if (error) {
            console.error('GitHub auth error:', error)
            return
        }
        try {
            const response = await handleGitHubCallback({ code });
            console.log('Response:', response);
            window.location.href = '/profile'
        } 
        catch (error) {
            console.error(error.message);
            window.location.href = '/login'
        }
    }
    const hasExecuted = useRef(false);
    useEffect(() => {
        if (hasExecuted.current)
            return;
        hasExecuted.current = true;
        processGitHubCallback()
    }, [searchParams])
    return <div>Processing GitHub login...</div>
}
export default CallbackPage
