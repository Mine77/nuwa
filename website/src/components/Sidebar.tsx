import { useState, useRef, useEffect } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { Logo } from './Logo'
import { MagnifyingGlassIcon, Cog6ToothIcon, ArrowRightOnRectangleIcon } from '@heroicons/react/24/outline'
import { mockUser } from '../mocks/user'
import { mockAgents } from '../mocks/agent'
import { User } from '../types/user'
import { UsernameModal } from './UsernameModal'
import { ThemeToggle } from './ThemeToggle'

interface SidebarProps {
  onCollapse: (isCollapsed: boolean) => void
  isCollapsed?: boolean
}

export function Sidebar({onCollapse, isCollapsed: propIsCollapsed}: SidebarProps) {
  const address = useCurrentAddress()
  const [localIsCollapsed, setLocalIsCollapsed] = useState(false)
  const [searchQuery, setSearchQuery] = useState('')
  const [user, setUser] = useState<User | null>(null)
  const [isDropdownOpen, setIsDropdownOpen] = useState(false)
  const [isUsernameModalOpen, setIsUsernameModalOpen] = useState(false)
  const dropdownRef = useRef<HTMLDivElement>(null)
  const navigate = useNavigate()
  const connectionStatus = useConnectionStatus()
  const {rGas, refetchBalance} = useRgasBalance()
  const subscribeOnRequest = useSubscribeOnRequest()
  const {agents} = useAllAgents()

  // Use prop value or local state
  const isCollapsed = propIsCollapsed ?? localIsCollapsed

  // Use unified mock data
  // const agentNames = mockAgents

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsDropdownOpen(false)
      }
    }

    // Add event listener
    document.addEventListener('mousedown', handleClickOutside)

    // Cleanup function
    return () => {
      document.removeEventListener('mousedown', handleClickOutside)
    }
  }, []) // Empty dependency array, only add event listener when component mounts

  const handleCollapse = () => {
    const newCollapsedState = !isCollapsed
    setLocalIsCollapsed(newCollapsedState)
    onCollapse(newCollapsedState)
    // Close dropdown when sidebar is collapsed
    setIsDropdownOpen(false)
  }

  const handleConnectWallet = () => {
    setIsUsernameModalOpen(true)
  }

  const handleUsernameSubmit = (username: string) => {
    // 使用提供的用户名创建用户
    const newUser = {
      ...mockUser,
      username,
      name: username
    }
    setUser(newUser)
    setIsUsernameModalOpen(false)
  }

  const handleLogout = () => {
    setUser(null)
    const prefix = 'rooch-sdk-kit'

    Object.keys(localStorage).forEach((key) => {
      if (key.startsWith(prefix)) {
        localStorage.removeItem(key)
      }
    })
    window.location.reload()
    setIsDropdownOpen(false)
  }

  const handleSettings = () => {
    navigate(`/profile/${user?.username}`)
    setIsDropdownOpen(false)
  }

  const toggleDropdown = () => {
    setIsDropdownOpen(!isDropdownOpen)
  }

  useEffect(() => {
    const unsubscribe = subscribeOnRequest((status) => {
      switch (status) {
        case 'success':
          refetchBalance()
          break
      }
    })

    return () => {
      unsubscribe()
    }
  }, [subscribeOnRequest, address, refetchBalance])

  useEffect(() => {
    if (connectionStatus === 'connected') {
      setUser({
        ...mockUser,
        rgasBalance: rGas?.fixedBalance || 0
      })
    }
  }, [rGas]);

  return (
    <div
      className={`fixed left-0 top-16 h-[calc(100vh-4rem)] dark:bg-gray-900 border-gray-200 dark:border-gray-800 transition-all duration-300 ease-in-out z-50 ${isCollapsed ? 'w-16' : 'w-64 bg-white'
        }`}
    >
      <div className="flex flex-col h-full">
        {/* Collapse Button */}
        <div className="absolute right-0 top-[52px] transform translate-x-full">
          <button
            onClick={handleCollapse}
            className="p-2 bg-white dark:bg-gray-800 shadow-md hover:bg-gray-100 dark:hover:bg-gray-700 focus:outline-none focus:ring-0 focus:ring-offset-0 transition-colors duration-200 rounded-r-lg border border-gray-200 dark:border-gray-700 -ml-[1px] text-gray-600 dark:text-gray-300"
          >
            <div className="relative w-5 h-5">
              <svg
                className={`absolute inset-0 transition-all duration-300 ease-in-out ${isCollapsed ? 'opacity-100 rotate-0' : 'opacity-0 -rotate-180'}`}
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
                strokeWidth={1.5}
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M4 6h16M4 12h16M4 18h16"
                />
              </svg>
              <svg
                className={`absolute inset-0 transition-all duration-300 ease-in-out ${isCollapsed ? 'opacity-0 rotate-180' : 'opacity-100 rotate-0'}`}
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
                strokeWidth={1.5}
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M11 19l-7-7 7-7m8 14l-7-7 7-7"
                />
              </svg>
            </div>
          </button>
        </div>
        {/* Navigation  */}
        <div
          className={`transition-all duration-300 ease-in-out ${isCollapsed ? 'opacity-0 h-0 overflow-hidden' : 'opacity-100 h-auto'}`}>
          <div className="px-4 pt-2">
            <button
              onClick={() => navigate('/studio')}
              className="w-full bg-gradient-to-r from-purple-600 to-pink-600 text-white rounded-lg px-4 py-2 font-medium hover:opacity-90 transition-opacity focus:outline-none focus:ring-0 focus:ring-offset-0"
            >
              AI Studio
            </button>
          </div>
        </div>

        {/* Main Content Area */}
        <div className="flex-1 flex flex-col overflow-hidden">
          {/* Discover Section */}
          <div
            className={`transition-all duration-300 ease-in-out ${isCollapsed ? 'opacity-0 h-0 overflow-hidden' : 'opacity-100 h-auto'}`}>
            <div className="px-4 pt-2">
              <div className="relative mb-4">
                <MagnifyingGlassIcon
                  className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400"/>
                <input
                  type="text"
                  placeholder="Discover..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 rounded-lg border border-gray-200 dark:border-gray-800 bg-gray-50 dark:bg-gray-800 focus:outline-none focus:ring-2 focus:ring-purple-500"
                />
              </div>

              {/* AI Characters List */}
              <div
                className="space-y-3 h-[calc(100vh-20rem)] overflow-y-auto pr-2 scrollbar-thin scrollbar-thumb-gray-300 dark:scrollbar-thumb-gray-600 scrollbar-track-transparent">
                {agents?.map((agent) => (
                  <div
                    key={agent.username}
                    className="flex items-start space-x-3 p-2 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors cursor-pointer"
                    onClick={() => navigate(`/agent/${agent.username}`)}
                  >
                    <img
                      src={agent.avatar}
                      alt={agent.name}
                      className="w-10 h-10 rounded-full flex-shrink-0"
                    />
                    <div className="flex-1 min-w-0">
                      <h3 className="text-sm font-medium text-gray-900 dark:text-gray-100 truncate">
                        {agent.name}
                      </h3>
                      <p className="text-xs text-gray-500 dark:text-gray-400 line-clamp-2">
                        @{agent.username}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Bottom Section */}
        <div className="mt-auto">
          {/* User Profile */}
          <div className={`transition-all duration-300 ease-in-out ${isCollapsed ? 'opacity-0 h-0 overflow-hidden' : 'opacity-100 h-auto'}`}>
            <div className="p-4">
              {user && (
                <div className="relative" ref={dropdownRef}>
                  <button
                    onClick={toggleDropdown}
                    className="w-full flex items-center space-x-3 hover:bg-gray-50 dark:hover:bg-gray-800 rounded-lg p-2 transition-colors focus:outline-none focus:ring-0 focus:ring-offset-0"
                  >
                    <img
                      src={user.avatar}
                      alt={user.name}
                      className="w-8 h-8 rounded-full"
                    />
                    <div className="flex-1 text-left">
                      <span className="text-sm font-medium text-gray-700 dark:text-gray-300 block">
                        {user.name}
                      </span>
                      <span className="text-xs text-gray-500 dark:text-gray-400">
                        {user.rgasBalance.toLocaleString()} RGAS
                      </span>
                    </div>
                  </button>

                  {/* Dropdown Menu */}
                  {isDropdownOpen && (
                    <div
                      className="absolute bottom-full left-0 mb-2 w-full bg-white dark:bg-gray-800 rounded-lg shadow-lg border border-gray-200 dark:border-gray-700 py-1 transition-all duration-200 ease-in-out">
                      <button
                        onClick={handleSettings}
                        className="w-full flex items-center space-x-2 px-4 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 focus:outline-none focus:ring-0 focus:ring-offset-0"
                      >
                        <Cog6ToothIcon className="w-4 h-4"/>
                        <span>Settings</span>
                      </button>
                      <button
                        onClick={handleLogout}
                        className="w-full flex items-center space-x-2 px-4 py-2 text-sm text-red-600 hover:bg-gray-50 dark:hover:bg-gray-700 focus:outline-none focus:ring-0 focus:ring-offset-0"
                      >
                        <ArrowRightOnRectangleIcon className="w-4 h-4"/>
                        <span>Logout</span>
                      </button>
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Collapsed User Avatar with Dropdown */}
        {isCollapsed && user && (
          <div className="absolute bottom-4 left-0 right-0 flex justify-center transition-all duration-300 ease-in-out"
               ref={dropdownRef}>
            <button
              onClick={toggleDropdown}
              className="focus:outline-none focus:ring-0 focus:ring-offset-0 p-0"
            >
              <img
                src={user.avatar}
                alt={user.name}
                className="w-8 h-8 rounded-full"
              />
            </button>

            {/* Collapsed Dropdown Menu */}
            {isDropdownOpen && (
              <div
                className="absolute bottom-full left-[calc(160%)] transform -translate-x-1/2 mb-2 w-48 bg-white dark:bg-gray-800 rounded-lg shadow-lg border border-gray-200 dark:border-gray-700 py-1 transition-all duration-200 ease-in-out">
                <button
                  onClick={handleSettings}
                  className="w-full flex items-center space-x-2 px-4 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 focus:outline-none focus:ring-0 focus:ring-offset-0"
                >
                  <Cog6ToothIcon className="w-4 h-4"/>
                  <span>Settings</span>
                </button>
                <button
                  onClick={handleLogout}
                  className="w-full flex items-center space-x-2 px-4 py-2 text-sm text-red-600 hover:bg-gray-50 dark:hover:bg-gray-700 focus:outline-none focus:ring-0 focus:ring-offset-0"
                >
                  <ArrowRightOnRectangleIcon className="w-4 h-4"/>
                  <span>Logout</span>
                </button>
              </div>
            )}
          </div>
        )}
      </div>

      {/* <UsernameModal
        isOpen={isUsernameModalOpen}
        onClose={() => setIsUsernameModalOpen(false)}
        onSubmit={handleUsernameSubmit}
      /> */}
    </div>
  )
} 