import React, { useState, useRef } from 'react'
import { useNavigate } from 'react-router-dom'
import { PhotoIcon } from '@heroicons/react/24/outline'
import { useCreateAgent } from '../hooks/use-agent-create'
import { SessionKeyGuard } from '@roochnetwork/rooch-sdk-kit'
import toast from 'react-hot-toast'

interface CreateAgentForm {
    agentname: string
    name: string
    avatar: string | null
    description: string
    prompt: string
    isPaid: boolean
}

export function CreateAgent() {
    const navigate = useNavigate()
    const fileInputRef = useRef<HTMLInputElement>(null)
    const [form, setForm] = useState<CreateAgentForm>({
        agentname: '',
        name: '',
        avatar: 'https://api.dicebear.com/7.x/bottts/svg?seed=default',
        description: '',
        prompt: '',
        isPaid: false
    })
    const {mutate, isPending} = useCreateAgent()
    const [errors, setErrors] = useState<Partial<CreateAgentForm>>({})
    const [previewAvatar, setPreviewAvatar] = useState<string | null>('https://api.dicebear.com/7.x/bottts/svg?seed=default')

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
        const { name, value, type, checked } = e.target as HTMLInputElement
        setForm(prev => ({
            ...prev,
            [name]: type === 'checkbox' ? checked : value
        }))
        // Clear error when user types
        if (errors[name as keyof CreateAgentForm]) {
            setErrors(prev => ({
                ...prev,
                [name]: undefined
            }))
        }
    }

    const handleAvatarChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        const file = event.target.files?.[0];
        if (!file) return;
    
        const validImageTypes = ["image/png", "image/jpeg", "image/svg+xml"];
        if (!validImageTypes.includes(file.type)) {
            alert("Invalid file type. Please upload a PNG, JPEG, or SVG file.");
            return;
        }
    
        const reader = new FileReader();
    
        if (file.type === "image/svg+xml") {
            reader.onload = () => {
                const svgContent = reader.result as string;
                setPreviewAvatar(`data:image/svg+xml;utf8,${encodeURIComponent(svgContent || '')}`); 
                setForm((prev) => ({
                    ...prev,
                    avatar: svgContent, 
                }));
            };
            reader.readAsText(file); 
        } else {
            reader.onload = () => {
                const base64Image = reader.result as string;
                setPreviewAvatar(base64Image); 
                setForm((prev) => ({
                    ...prev,
                    avatar: base64Image, 
                }));
            };
            reader.readAsDataURL(file); 
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()

        // Validate form
        const newErrors: Partial<CreateAgentForm> = {}
        if (!form.agentname.trim()) {
            newErrors.agentname = 'Username is required'
        }
        if (!form.name.trim()) {
            newErrors.name = 'Display name is required'
        }

        if (Object.keys(newErrors).length > 0) {
            setErrors(newErrors)
            return
        }

        mutate({
            name: form.name,
            username: form.agentname,  
            avatar: form.avatar!,
            description: form.description,
            instructions: form.prompt
        }, {
            onSuccess: () => {
                navigate(-1)
            },
            onError: (error) => {
                toast.error(error.message)
            }
        })
    }

    return (
        <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
            <div className="max-w-3xl mx-auto px-4 py-8">
                <form onSubmit={handleSubmit} className="space-y-8">
                    <div className="bg-white dark:bg-gray-800 shadow rounded-lg p-6">
                        <h1 className="text-2xl font-bold mb-6 text-gray-900 dark:text-gray-100">Create Agent</h1>

                        {/* Username */}
                        <div className="mb-6">
                            <label htmlFor="agentname" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                                Username *
                            </label>
                            <input
                                type="text"
                                id="agentname"
                                name="agentname"
                                value={form.agentname}
                                onChange={handleInputChange}
                                className={`block w-full rounded-lg border ${errors.agentname ? 'border-red-500' : 'border-gray-300 dark:border-gray-600'} bg-white dark:bg-gray-800 px-4 py-2 text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-purple-500`}
                                placeholder="Enter globally unique username"
                            />
                            {errors.agentname && (
                                <p className="mt-1 text-sm text-red-500">{errors.agentname}</p>
                            )}
                        </div>

                        {/* Display Name */}
                        <div className="mb-6">
                            <label htmlFor="name" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                                Display Name *
                            </label>
                            <input
                                type="text"
                                id="name"
                                name="name"
                                value={form.name}
                                onChange={handleInputChange}
                                className={`block w-full rounded-lg border ${errors.name ? 'border-red-500' : 'border-gray-300 dark:border-gray-600'} bg-white dark:bg-gray-800 px-4 py-2 text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-purple-500`}
                                placeholder="Enter display name"
                            />
                            {errors.name && (
                                <p className="mt-1 text-sm text-red-500">{errors.name}</p>
                            )}
                        </div>

                                                <div className="mb-6">
                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                                Avatar
                            </label>
                            <div className="flex items-center space-x-4">
                                {/* Upload Button */}
                                <button
                                    type="button"
                                    onClick={() => fileInputRef.current?.click()}
                                    className="relative w-24 h-24 rounded-full overflow-hidden flex items-center justify-center border-2 border-dashed border-gray-300 dark:border-gray-600 hover:border-purple-500 dark:hover:border-purple-400 transition-colors"
                                >
                                    {previewAvatar ? (
                                        <img
                                            src={previewAvatar}
                                            alt="Avatar preview"
                                            className="w-full h-full object-cover"
                                        />
                                    ) : (
                                        <PhotoIcon className="w-8 h-8 text-gray-400" />
                                    )}
                                </button>
                                <input
                                    ref={fileInputRef}
                                    type="file"
                                    accept="image/*"
                                    onChange={handleAvatarChange}
                                    className="hidden"
                                />
                        
                                {/* URL Input */}
                                <div className="flex-1">
                                    <label htmlFor="avatarUrl" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                                        Or enter a URL
                                    </label>
                                    <input
                                        type="url"
                                        id="avatarUrl"
                                        name="avatarUrl"
                                        placeholder="https://example.com/avatar.png"
                                        className="block w-full rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 px-4 py-2 text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-purple-500"
                                        onChange={(e) => {
                                            const url = e.target.value.trim()
                                            setPreviewAvatar(url)
                                            setForm(prev => ({
                                                ...prev,
                                                avatar: url
                                            }))
                                        }}
                                    />
                                </div>
                            </div>
                        </div>

                        {/* Description */}
                        <div className="mb-6">
                            <label htmlFor="description" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                                Description
                            </label>
                            <textarea
                                id="description"
                                name="description"
                                value={form.description}
                                onChange={handleInputChange}
                                rows={3}
                                className="block w-full rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 px-4 py-2 text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-purple-500"
                                placeholder="Enter agent description"
                            />
                        </div>

                        {/* Prompt */}
                        <div className="mb-6">
                            <label htmlFor="prompt" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                                Prompt
                            </label>
                            <textarea
                                id="prompt"
                                name="prompt"
                                value={form.prompt}
                                onChange={handleInputChange}
                                rows={5}
                                className="block w-full rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 px-4 py-2 text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-purple-500 font-mono text-sm"
                                placeholder="Enter agent prompt"
                            />
                        </div>

                        {/* Paid Option */}
                        <div className="mb-6">
                            <div className="flex items-center">
                                <input
                                    type="checkbox"
                                    id="isPaid"
                                    name="isPaid"
                                    checked={form.isPaid}
                                    onChange={handleInputChange}
                                    className="h-4 w-4 text-purple-600 focus:ring-purple-500 border-gray-300 rounded"
                                />
                                <label htmlFor="isPaid" className="ml-2 block text-sm text-gray-700 dark:text-gray-300">
                                    It takes 100 RGAS to create an agent. It will be charged to the agent's account.
                                </label>
                            </div>
                        </div>

                        {/* Submit Button */}
                        <div className="flex justify-end space-x-4">
                            <button
                                type="button"
                                onClick={() => navigate(-1)}
                                className="px-4 py-2 text-sm font-medium text-gray-700 dark:text-gray-200 bg-gray-100 dark:bg-gray-700 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-500"
                            >
                                Cancel
                            </button>
                            <SessionKeyGuard onClick={() => {}}>
    <button
        type="submit"
        disabled={isPending} // Disable button when loading
        className={`px-4 py-2 text-sm font-medium text-white rounded-lg focus:outline-none focus:ring-2 focus:ring-offset-2 ${
            isPending
                ? "bg-purple-400 cursor-not-allowed"
                : "bg-purple-600 hover:bg-purple-700 focus:ring-purple-500"
        }`}
    >
        {isPending ? (
            <svg
                className="w-5 h-5 animate-spin mx-auto text-white" // Center spinner
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
            >
                <circle
                    className="opacity-25"
                    cx="12"
                    cy="12"
                    r="10"
                    stroke="currentColor"
                    strokeWidth="4"
                ></circle>
                <path
                    className="opacity-75"
                    fill="currentColor"
                    d="M4 12a8 8 0 018-8v8H4z"
                ></path>
            </svg>
        ) : (
            "Create"
        )}
    </button>
                            </SessionKeyGuard>
                        </div>
                    </div>
                </form>
            </div>
        </div>
    )
} 