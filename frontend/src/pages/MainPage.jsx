import { useState } from 'react'
import Sidebar from '../components/Sidebar/Sidebar.jsx'
import Chat from '../components/Chat/Chat.jsx'
import AgentPanel from '../components/AgentPanel/AgentPanel.jsx'
import ResultPanel from '../components/ResultPanel/ResultPanel.jsx'
import './MainPage.css'

// main page layout - sidebar on the left, chat + right panel in the middle
// session goes through 3 phases: chat -> executing -> result
const MOCK_SESSIONS = [
  { id: '1', title: 'Golden Week Tokyo Trip', date: '2025-05-01', phase: 'result' },
  { id: '2', title: 'Bangkok Weekend Getaway', date: '2025-04-20', phase: 'result' },
]

const MOCK_FAVORITES = [
  { id: 'f1', type: 'flight', title: 'Spring Airlines SHA→TYO', price: '¥1,200/person' },
  { id: 'f2', type: 'hotel', title: 'Shinjuku Gracery Hotel', price: '¥400/night' },
]

const MOCK_AGENTS = [
  {
    id: 'flight',
    name: 'Flight Search',
    icon: '✈️',
    sprite: '/assets/pixel/agent_1.png',
    status: 'working',
    summary: 'Searching Trip.com...',
    steps: [
      { text: 'Opened Google Flights', status: 'done' },
      { text: 'Searched SHA→TYO 4/30-5/4', status: 'done' },
      { text: 'Found 12 flight results', status: 'done' },
      { text: 'Opening Trip.com...', status: 'working' },
      { text: 'Search Trip.com flights', status: 'pending' },
      { text: 'Compare prices & pick best options', status: 'pending' },
    ],
  },
  {
    id: 'hotel',
    name: 'Hotel Search',
    icon: '🏨',
    sprite: '/assets/pixel/agent_2.png',
    status: 'working',
    summary: 'Browsing Booking.com...',
    steps: [
      { text: 'Opened Booking.com', status: 'done' },
      { text: 'Searching Shinjuku area hotels', status: 'working' },
      { text: 'Filter by rating & price', status: 'pending' },
    ],
  },
  {
    id: 'itinerary',
    name: 'Itinerary Planner',
    icon: '📋',
    sprite: '/assets/pixel/agent_3.png',
    status: 'idle',
    summary: 'Waiting for search results...',
    steps: [],
  },
  {
    id: 'tips',
    name: 'Travel Tips',
    icon: '🔍',
    sprite: '/assets/pixel/agent_4.png',
    status: 'idle',
    summary: 'Standby',
    steps: [],
  },
]

const MOCK_RESULTS = {
  flights: [
    {
      id: 'r1',
      airline: 'Spring Airlines 9C8515',
      route: 'Shanghai Pudong → Tokyo Narita',
      date: '4/30 08:30 - 12:30',
      price: '¥1,200/person',
      link: '#',
    },
    {
      id: 'r2',
      airline: 'China Eastern MU5101',
      route: 'Shanghai Pudong → Tokyo Haneda',
      date: '4/30 10:00 - 14:00',
      price: '¥1,850/person',
      link: '#',
    },
  ],
  hotels: [
    {
      id: 'r3',
      name: 'Shinjuku Gracery Hotel',
      location: 'Shinjuku, 5 min walk to station',
      price: '¥400/night',
      link: '#',
    },
  ],
  itinerary: [
    { day: 1, plan: 'Senso-ji → Tokyo Skytree → Sumida River walk' },
    { day: 2, plan: 'Akihabara → Ueno Park → Ameyoko' },
    { day: 3, plan: 'Shinjuku Gyoen → Shibuya → Harajuku Takeshita St.' },
    { day: 4, plan: 'Kamakura day trip (Great Buddha, Enoden, Shonan Coast)' },
    { day: 5, plan: 'Ginza shopping → Tokyo Station → departure' },
  ],
  tips: [
    'Visa: Apply for Japan tourist visa in advance',
    'Transit card: Get a Suica or Pasmo for convenience',
    'Weather: Tokyo in May averages 18-24°C, bring a light jacket',
    'Connectivity: Rent a pocket WiFi or buy a SIM card',
  ],
}

// manages session state and switches between chat/executing/result views
function MainPage({ onLogout }) {
  const [sessions, setSessions] = useState(MOCK_SESSIONS)
  const [favorites, setFavorites] = useState(MOCK_FAVORITES)
  const [currentSessionId, setCurrentSessionId] = useState(null)
  const [phase, setPhase] = useState('chat') // 'chat' | 'executing' | 'result'
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false)

  const handleNewSession = () => {
    setCurrentSessionId('new')
    setPhase('chat')
  }

  const handleSelectSession = (sessionId) => {
    setCurrentSessionId(sessionId)
    const session = sessions.find(s => s.id === sessionId)
    setPhase(session?.phase || 'chat')
  }

  const handleSelectFavorite = (favoriteId) => {
    // TODO: Show favorite detail
    setCurrentSessionId(`fav-${favoriteId}`)
    setPhase('result')
  }

  const handleStartAgents = () => {
    setPhase('executing')
    // TODO: Simulate agent completion after delay
    setTimeout(() => setPhase('result'), 8000)
  }

  const handleStopAgents = () => {
    setPhase('chat')
  }

  // add or remove item from favorites list
  const handleToggleFavorite = (item) => {
    const exists = favorites.find(f => f.id === item.id)
    if (exists) {
      setFavorites(favorites.filter(f => f.id !== item.id))
    } else {
      setFavorites([...favorites, item])
    }
  }

  const isExecuting = phase === 'executing'
  const isResult = phase === 'result'
  const showRightPanel = isExecuting || isResult

  return (
    <div className="app-layout">
      <Sidebar
        collapsed={sidebarCollapsed}
        onToggle={() => setSidebarCollapsed(!sidebarCollapsed)}
        sessions={sessions}
        favorites={favorites}
        currentSessionId={currentSessionId}
        onNewSession={handleNewSession}
        onSelectSession={handleSelectSession}
        onSelectFavorite={handleSelectFavorite}
        onLogout={onLogout}
      />
      <div className="main-content">
        <div
          className={`chat-area ${showRightPanel ? 'compressed' : 'full'}`}
        >
          <Chat
            phase={phase}
            onStartAgents={handleStartAgents}
            onStopAgents={handleStopAgents}
            compressed={showRightPanel}
          />
        </div>
        {showRightPanel && (
          <div className="right-panel">
            {isExecuting && (
              <AgentPanel agents={MOCK_AGENTS} />
            )}
            {isResult && (
              <ResultPanel
                results={MOCK_RESULTS}
                favorites={favorites}
                onToggleFavorite={handleToggleFavorite}
              />
            )}
          </div>
        )}
      </div>
    </div>
  )
}

export default MainPage
