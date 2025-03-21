import { useState } from 'react'
import { createPortal } from 'react-dom'

interface UsernameModalProps {
    isOpen: boolean
    onClose: () => void
    onSubmit: (username: string) => void
}

export function UsernameModal({ isOpen, onClose, onSubmit }: UsernameModalProps) {
    const [username, setUsername] = useState('')
    const [error, setError] = useState('')

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault()
        if (!username.trim()) {
            setError('Username can not be empty')
            return
        }
        setError('')
        onSubmit(username.trim())
        setUsername('')
    }

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setUsername(e.target.value)
        if (error) {
            setError('')
        }
    }

    const handleBackdropClick = (e: React.MouseEvent) => {
        if (e.target === e.currentTarget) {
            onClose()
        }
    }

    if (!isOpen) return null

    return createPortal(
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-[9999]" onClick={handleBackdropClick}>
            <div className="bg-white dark:bg-gray-800 rounded-lg p-6 w-96">
                <h2 className="text-xl font-semibold mb-4 text-gray-900 dark:text-gray-100">
                    Set Username
                </h2>
                <form onSubmit={handleSubmit}>
                    <div className="mb-4">
                        <input
                            type="text"
                            value={username}
                            onChange={handleInputChange}
                            placeholder="Please enter your username"
                            className={`w-full px-4 py-2 rounded-lg border ${error ? 'border-red-500' : 'border-gray-200 dark:border-gray-700'} bg-gray-50 dark:bg-gray-900 focus:outline-none focus:ring-2 ${error ? 'focus:ring-red-500' : 'focus:ring-purple-500'}`}
                            required
                        />
                        {error && (
                            <p className="mt-1 text-sm text-red-500">
                                {error}
                            </p>
                        )}
                    </div>
                    <div className="flex justify-end">
                        <button
                            type="submit"
                            className="w-full px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                            disabled={!username.trim()}
                        >
                            Confirm
                        </button>
                    </div>
                </form>
            </div>
        </div>,
        document.body
    )
} 