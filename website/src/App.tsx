import { BrowserRouter as Router, Routes, Route, useLocation, Link } from 'react-router-dom'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { Theme } from '@radix-ui/themes'
import { Toaster } from 'react-hot-toast'
import { Sidebar } from './components/Sidebar'
import { Home } from './pages/Home'
import { AgentChat } from './pages/AgentChat'
import { AIStudio } from './pages/AIStudio'
import { CreateAgent } from './pages/CreateAgent'
import { AllAgents } from './pages/AllAgents'
import { ProfileRouter } from './components/ProfileRouter'
import { useState, useEffect } from 'react'
import { DocPage } from './pages/docs/DocPage'
import { mockUser } from './mocks/user'
import { User } from './types/user'
import { NewPage } from './pages/NewPage'
import { ThemeToggle } from './components/ThemeToggle'

function AppContent() {
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false)
  const [user, setUser] = useState<User | null>(null)
  const [isDarkMode, setIsDarkMode] = useState(false)
  const location = useLocation()

  // Check if sidebar should be collapsed when route changes
  useEffect(() => {
    const shouldCollapse = location.pathname.startsWith('/agent/') || location.pathname.startsWith('/docs/')
    setIsSidebarCollapsed(shouldCollapse)
  }, [location.pathname])

  // Check dark mode
  useEffect(() => {
    const isDark = document.documentElement.classList.contains('dark')
    setIsDarkMode(isDark)
  }, [])

  // Listen for dark mode changes
  useEffect(() => {
    const observer = new MutationObserver((mutations) => {
      mutations.forEach((mutation) => {
        if (mutation.attributeName === 'class') {
          setIsDarkMode(document.documentElement.classList.contains('dark'))
        }
      })
    })

    observer.observe(document.documentElement, {
      attributes: true,
      attributeFilter: ['class']
    })

    return () => observer.disconnect()
  }, [])

  const handleConnectWallet = () => {
    // TODO: Implement wallet connection
    console.log('Connect wallet clicked')
  }

  return (
    <div className="flex h-screen overflow-hidden bg-gray-50 dark:bg-gray-900">
      {/* Top Navigation Bar */}
      <div className="fixed top-0 right-0 left-0 h-16 bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 z-10">
        <div className="h-full flex items-center justify-between px-4">
          {/* Logo */}
          <Link to="/" className="flex items-center">
            <img 
              src={isDarkMode ? "/nuwa-logo-horizontal-dark.svg" : "/nuwa-logo-horizontal.svg"} 
              alt="Nuwa Logo" 
              className="h-8 w-auto" 
            />
          </Link>
          
          {/* Right side content */}
          <div className="flex items-center space-x-4">
            <Link
              to="/docs/intro"
              className="text-sm font-medium text-gray-600 dark:text-gray-400 hover:text-purple-600 dark:hover:text-purple-400 transition-colors"
            >
              Documentation
            </Link>
            <div className="p-1">
              <ThemeToggle />
            </div>
            {!user ? (
              <button
                onClick={handleConnectWallet}
                className="px-4 py-2 text-sm font-medium text-purple-600 dark:text-purple-400 hover:text-purple-700 dark:hover:text-purple-300 transition-colors"
              >
                Connect Wallet
              </button>
            ) : (
              <div className="flex items-center space-x-4">
                <span className="text-sm text-gray-600 dark:text-gray-300">
                  {user.rgasBalance.toLocaleString()} RGAS
                </span>
                <img
                  src={user.avatar}
                  alt={user.name}
                  className="w-8 h-8 rounded-full"
                />
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 pt-16">
        <Sidebar onCollapse={setIsSidebarCollapsed} isCollapsed={isSidebarCollapsed} />
        <div className={`flex-1 ${isSidebarCollapsed ? 'ml-16' : 'ml-64'} transition-all duration-300`}>
          <Routes>
            <Route path="/" element={<div className="p-8 h-screen overflow-auto"><Home /></div>} />
            <Route path="/new" element={<div className="p-8 h-screen overflow-auto"><NewPage /></div>} />
            <Route path="/studio" element={<div className="p-8 h-screen overflow-auto"><AIStudio /></div>} />
            <Route path="/studio/create" element={<div className="p-8 h-screen overflow-auto"><CreateAgent /></div>} />
            <Route path="/agent/:agentname" element={<AgentChat />} />
            <Route path="/profile/:username" element={<ProfileRouter />} />
            <Route path="/allagents" element={<div className="p-8 h-screen overflow-auto"><AllAgents /></div>} />
            <Route path="/about" element={<div className="p-8 h-screen overflow-auto">About Page</div>} />
            <Route path="/docs/:docId" element={<DocPage />} />
          </Routes>
        </div>
      </div>
    </div>
  )
}

function App() {
  return (
    <Router>
      <AppContent/>
      <Toaster position="bottom-right"/>
    </Router>
  )
}

export default App
