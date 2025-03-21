import { useParams } from 'react-router-dom'
import { ArrowLeftIcon, ClipboardIcon, PencilIcon, CheckIcon, XMarkIcon, PhotoIcon, ArrowPathIcon } from '@heroicons/react/24/outline'
import { useState, useRef, useEffect } from 'react'
import { User } from '../types/user'
import { mockUser } from '../mocks/user'
import { useNavigate } from 'react-router-dom'
import useRgasBalance from "../hooks/use-rgas-balance.tsx";
import {useCurrentAddress} from "@roochnetwork/rooch-sdk-kit";
import useAllBalance from "../hooks/use-all-balance.tsx";
import {normalizeCoinIconUrl} from "../utils/icon.ts";

export function UserProfile() {
  const navigate = useNavigate()
  const fileInputRef = useRef<HTMLInputElement>(null)
  const {rGas} = useRgasBalance()
  const {balance} = useAllBalance()
  const address = useCurrentAddress()

  // Use unified mock data
  const [user, setUser] = useState<User>({
    ...mockUser,
    // If there's an address parameter in URL, use it
    name: mockUser.name
  })

  const [isEditingName, setIsEditingName] = useState(false)
  const [editForm, setEditForm] = useState({
    name: user.name,
    avatar: user.avatar
  })
  const [previewAvatar, setPreviewAvatar] = useState<string | null>(null)

  const handleCopy = (text: string) => {
    navigator.clipboard.writeText(text)
  }

  const handleEditName = () => {
    if (isEditingName) {
      // Save changes
      setUser(prev => ({
        ...prev,
        name: editForm.name
      }))
    } else {
      // Start editing
      setEditForm(prev => ({
        ...prev,
        name: user.name
      }))
    }
    setIsEditingName(!isEditingName)
  }

  const handleCancelName = () => {
    setEditForm(prev => ({
      ...prev,
      name: user.name
    }))
    setIsEditingName(false)
  }

  const handleEditAvatar = () => {
    fileInputRef.current?.click()
  }

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (file) {
      const reader = new FileReader()
      reader.onloadend = () => {
        const result = reader.result as string
        setPreviewAvatar(null) // Clear preview and update directly
        setUser(prev => ({
          ...prev,
          avatar: result
        }))
      }
      reader.readAsDataURL(file)
    }
  }

  useEffect(() => {
    setUser({
      ...mockUser,
      rgasBalance: rGas?.fixedBalance || 0,
      address: address?.toStr() || ''
    })
  }, [rGas, address]);

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <div className="max-w-4xl mx-auto px-4 py-8">
        {/* Back Button */}
        <div className="mb-6">
          <button
            onClick={() => navigate(-1)}
            className="flex items-center text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-100"
          >
            <ArrowLeftIcon className="w-5 h-5 mr-2" />
            <span>Back</span>
          </button>
        </div>

        {/* Profile Card */}
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm overflow-hidden">
          {/* Cover Image */}
          <div className="h-32 bg-gradient-to-r from-purple-600 to-pink-600"></div>

          {/* Profile Info */}
          <div className="px-6 pb-6">
            {/* Avatar */}
            <div className="relative -mt-16 mb-4 group w-32 h-32">
              <button
                onClick={handleEditAvatar}
                className="w-full h-full relative rounded-full overflow-hidden"
                title="Upload Avatar"
              >
                <img
                  src={previewAvatar || user.avatar}
                  alt={user.name}
                  className="w-full h-full rounded-full border-0 border-white dark:border-gray-800 bg-white dark:bg-gray-800 object-cover"
                />
                <div className="absolute inset-0 flex items-center justify-center bg-black opacity-0 group-hover:opacity-50 transition-opacity">
                  <PhotoIcon className="w-5 h-5 text-white" />
                </div>
              </button>
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                onChange={handleFileChange}
                className="hidden"
              />
            </div>

            {/* Name and Edit Button */}
            <div className="mb-4">
              <div className="flex items-center space-x-2">
                {isEditingName ? (
                  <div className="flex-1 flex items-center space-x-2">
                    <input
                      type="text"
                      value={editForm.name}
                      onChange={e => setEditForm(prev => ({ ...prev, name: e.target.value }))}
                      className="block flex-1 text-2xl font-bold bg-transparent border-b border-gray-300 dark:border-gray-600 focus:border-purple-500 dark:focus:border-purple-400 focus:outline-none"
                      placeholder="Enter display name"
                    />
                    <button
                      onClick={handleEditName}
                      className="text-gray-700 dark:text-gray-200 hover:text-purple-600 dark:hover:text-purple-400"
                      title="Save"
                    >
                      <CheckIcon className="w-5 h-5" />
                    </button>
                    <button
                      onClick={handleCancelName}
                      className="text-gray-700 dark:text-gray-200 hover:text-purple-600 dark:hover:text-purple-400"
                      title="Cancel"
                    >
                      <XMarkIcon className="w-5 h-5" />
                    </button>
                  </div>
                ) : (
                  <div className="flex items-center space-x-2">
                    <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100">
                      {user.name}
                    </h1>
                    <button
                      onClick={handleEditName}
                      className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
                      title="Edit Display Name"
                    >
                      <PencilIcon className="w-4 h-4" />
                    </button>
                  </div>
                )}
              </div>
              <div className="mt-1 flex flex-col space-y-2">
                <div className="text-gray-500 dark:text-gray-400">
                  @{user.username}
                </div>
                <div className="flex items-center space-x-2">
                  <code className="text-sm text-gray-500 dark:text-gray-400 font-mono">
                    {user.address.slice(0, 6)}...{user.address.slice(-4)}
                  </code>
                  <button
                    onClick={() => handleCopy(user.address)}
                    className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
                    title="Copy Address"
                  >
                    <ClipboardIcon className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* RGAS Balance */}
              <div>
                <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400 mb-1">
                  RGAS Balance
                </h3>
                <p className="text-2xl font-bold text-gray-900 dark:text-gray-100">
                  {user.rgasBalance.toLocaleString()} RGAS
                </p>
              </div>
            </div>

            {/* Portfolio Section */}
            <div className="mt-8">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-xl font-bold text-gray-900 dark:text-gray-100">
                  Portfolio
                </h2>
                <button
                  className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
                  title="Refresh"
                >
                  <ArrowPathIcon className="w-5 h-5" />
                </button>
              </div>
              <div className="space-y-4">
                {balance?.data.map((token) => (
                  <div
                    key={token.coin_type}
                    className="flex items-center justify-between p-4 bg-white dark:bg-gray-800 rounded-lg shadow-sm"
                  >
                    <div className="flex items-center space-x-3">
                      <img
                        src={token.icon_url ? normalizeCoinIconUrl(token.icon_url) : ''}
                        alt={token.name}
                        className="w-8 h-8 rounded-full"
                      />
                      <div>
                        <h3 className="font-medium text-gray-900 dark:text-gray-100">
                          {token.name}
                        </h3>
                        <p className="text-sm text-gray-500 dark:text-gray-400">
                          {token.symbol}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center space-x-4">
                      <div className="text-right">
                        <p className="font-medium text-gray-900 dark:text-gray-100">
                          {token.fixedBalance}
                        </p>
                        <p className="text-sm text-gray-500 dark:text-gray-400">
                          {token.symbol}
                        </p>
                      </div>
                      <button
                        className="px-3 py-1 text-sm font-medium text-purple-600 dark:text-purple-400 hover:text-purple-700 dark:hover:text-purple-300 border border-purple-600 dark:border-purple-400 rounded-md hover:bg-purple-50 dark:hover:bg-purple-900/20 transition-colors"
                      >
                        Transfer
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
} 