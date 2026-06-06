import { useEffect } from 'react'
import { useSearchParams } from 'react-router-dom'

function CallbackPage() {
  const [searchParams] = useSearchParams()

  useEffect(() => {
    const code = searchParams.get('code')
    const error = searchParams.get('error')

    if (error) {
      console.error('GitHub auth error:', error)
      return
    }

    if (code) {
      console.log('GitHub authorization code:', code)
      // Later: send this to your backend
    }
  }, [searchParams])

  return <div>Processing GitHub login...</div>
}

export default CallbackPage
