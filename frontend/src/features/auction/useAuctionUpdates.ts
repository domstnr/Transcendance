import { useEffect, useRef, useState } from 'react'
import { io } from 'socket.io-client'
import type { BidUpdatedEvent } from './types'

const SOCKET_URL = import.meta.env.VITE_API_URL ?? 'http://localhost:3000'

type JoinAuctionResponse = {
  status: string
  room: string
}

export function useAuctionUpdates(
  auctionId: string | null,
  onUpdate: (update: BidUpdatedEvent) => void,
) {
  const [isConnected, setIsConnected] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const onUpdateRef = useRef(onUpdate)

  useEffect(() => {
    onUpdateRef.current = onUpdate
  }, [onUpdate])

  useEffect(() => {
    if (!auctionId) {
      setIsConnected(false)
      return
    }

    const socket = io(`${SOCKET_URL}/auctions`, {
      withCredentials: true,
    })

    function handleConnect() {
      setIsConnected(true)
      setError(null)

      socket.emit(
        'joinAuction',
        { auctionId },
        (response: JoinAuctionResponse) => {
          if (response.status !== 'joined') {
            setError('Could not join the auction live updates.')
          }
        },
      )
    }

    function handleDisconnect() {
      setIsConnected(false)
    }

    function handleConnectError() {
      setIsConnected(false)
      setError('Live auction updates are temporarily unavailable.')
    }

    function handleBidUpdated(update: BidUpdatedEvent) {
      onUpdateRef.current(update)
    }

    socket.on('connect', handleConnect)
    socket.on('disconnect', handleDisconnect)
    socket.on('connect_error', handleConnectError)
    socket.on('bidUpdated', handleBidUpdated)

    return () => {
      if (socket.connected) {
        socket.emit('leaveAuction', { auctionId })
      }

      socket.off('connect', handleConnect)
      socket.off('disconnect', handleDisconnect)
      socket.off('connect_error', handleConnectError)
      socket.off('bidUpdated', handleBidUpdated)
      socket.disconnect()
    }
  }, [auctionId])

  return { isConnected, error }
}
