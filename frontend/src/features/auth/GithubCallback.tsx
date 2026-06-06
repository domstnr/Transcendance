import { useEffect } from 'react'
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
        } 
        catch (error) {
            console.error(error.message);
        }
    }
    useEffect(() => {
        processGitHubCallback()
    }, [searchParams])
    return <div>Processing GitHub login...</div>
}
export default CallbackPage
