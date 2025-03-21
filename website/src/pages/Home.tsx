import { useMemo } from 'react'
import { Link } from 'react-router-dom'
import { AICard } from '../components/AICard'
import { Hero } from '../components/Hero'
import { CreateAISection } from '../components/CreateAISection'
import { Footer } from '../components/Footer'
import { mockAgents } from '../mocks/agent'

export function Home() {
  const trendingAgents = useMemo(() => mockAgents.filter(ai => ai.isTrending), [])
  const featuredAgents = useMemo(() => mockAgents.filter(ai => ai.isFeatured), [])

  return (
    <div className="min-h-screen flex flex-col">
      <div className="flex-1">
        <Hero />
        <div className="container mx-auto px-4 py-8">
          <div className="mb-12">
            <div className="flex items-end mb-6">
              <h2 className="text-4xl font-bold text-gray-900 dark:text-white">Explore Agents</h2>
              <Link
                to="/allagents"
                className="mx-4 text-sm text-purple-600 dark:text-purple-400 hover:text-purple-700 dark:hover:text-purple-300 transition-colors mb-1"
              >
                View All Agents
              </Link>
            </div>

            {/* Trending Agents */}
            <div className="mb-12">
              <h3 className="text-xl font-semibold mb-4 text-gray-600 dark:text-gray-400">Trending Agents</h3>
              <div className="grid grid-cols-1 md:grid-cols-1 lg:grid-cols-4 gap-6">
                {trendingAgents.slice(0, 4).map(ai => (
                  <AICard key={ai.address} ai={ai} />
                ))}
              </div>
            </div>

            {/* Featured Agents */}
            <div className="mb-12">
              <h3 className="text-xl font-semibold mb-4 text-gray-600 dark:text-gray-400">Featured Agents</h3>
              <div className="grid grid-cols-1 md:grid-cols-1 lg:grid-cols-4 gap-6">
                {featuredAgents.slice(0, 4).map(ai => (
                  <AICard key={ai.address} ai={ai} />
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Create AI Section */}
        <CreateAISection />
      </div>

      {/* Footer */}
      <Footer />
    </div>
  )
} 