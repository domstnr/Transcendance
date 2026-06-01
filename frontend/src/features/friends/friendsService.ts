import api from '../../shared/api/httpClient'
import type { Friend, FriendRequest, SentRequest, UserSearchResult } from './types'

export const getFriends = () =>
    api.get<Friend[]>('/friends').then(r => r.data)

export const getPendingRequests = () =>
    api.get<FriendRequest[]>('/friends/requests/received').then(r => r.data)

export const getSentRequests = () =>
    api.get<SentRequest[]>('/friends/requests/sent').then(r => r.data)

export const sendFriendRequest = (userId: string) =>
    api.post(`/friends/request/${userId}`).then(r => r.data)

export const acceptFriendRequest = (userId: string) =>
    api.patch(`/friends/accept/${userId}`).then(r => r.data)

export const declineFriendRequest = (userId: string) =>
    api.patch(`/friends/decline/${userId}`).then(r => r.data)

export const removeFriend = (userId: string) =>
    api.delete(`/friends/${userId}`).then(r => r.data)

export const searchUsers = (q: string) =>
    api.get<UserSearchResult[]>(`/user/search?q=${encodeURIComponent(q)}`).then(r => r.data)
