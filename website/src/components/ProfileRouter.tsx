import { useParams, Navigate } from 'react-router-dom'
import { AgentProfile } from '../pages/AgentProfile'
import { UserProfile } from '../pages/UserProfile'

export function ProfileRouter() {
    const { id } = useParams<{ id: string }>()

    if (!id?.startsWith('0x')) {
        return <UserProfile />
    }

    if (id) {
        return <div className="h-screen overflow-auto"><AgentProfile /></div>
    }

    return <Navigate to="/" />
} 