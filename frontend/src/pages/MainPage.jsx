import { useEffect, useRef, useState } from 'react'
import Sidebar from '../components/Sidebar/Sidebar.jsx'
import Chat from '../components/Chat/Chat.jsx'
import AgentPanel from '../components/AgentPanel/AgentPanel.jsx'
import ResultPanel from '../components/ResultPanel/ResultPanel.jsx'
import './MainPage.css'

const PHASE = {
  CHAT: 'chat',
  EXECUTING: 'executing',
  RESULT: 'result',
}

const PHASE_TRANSITIONS = {
  [PHASE.CHAT]: {
    START_EXECUTION: PHASE.EXECUTING,
  },
  [PHASE.EXECUTING]: {
    STOP_EXECUTION: PHASE.CHAT,
    EXECUTION_DONE: PHASE.RESULT,
    EXECUTION_ERROR: PHASE.CHAT,
  },
  [PHASE.RESULT]: {
    NEW_CHAT: PHASE.CHAT,
    START_EXECUTION: PHASE.EXECUTING,
  },
}

const INITIAL_MESSAGES = [
  {
    id: 'welcome-1',
    role: 'agent',
    text: 'Hi there! Tell me about your trip — where to, when, and how many people?',
  },
]

// compute next phase using explicit state-machine transition table
function getNextPhase(currentPhase, eventType) {
  return PHASE_TRANSITIONS[currentPhase]?.[eventType] || currentPhase
}

// build a clean idle agent list used before execution starts
function buildIdleAgents() {
  return MOCK_AGENTS.map((agent) => ({
    ...agent,
    status: 'idle',
    summary: 'Standby',
    steps: agent.steps.map((step) => ({ ...step, status: 'pending' })),
  }))
}

// update a single agent entry while keeping other agents unchanged
function patchAgent(agents, agentId, patch) {
  return agents.map((agent) => (agent.id === agentId ? { ...agent, ...patch } : agent))
}

// generate timeline snapshots so UI animation is driven by state transitions
function buildExecutionStages() {
  const stage0 = patchAgent(
    patchAgent(buildIdleAgents(), 'flight', {
      status: 'working',
      summary: 'Searching flights...',
      steps: [
        { text: 'Opened Google Flights', status: 'working' },
        { text: 'Searching route and dates', status: 'pending' },
        { text: 'Comparing top options', status: 'pending' },
      ],
    }),
    'hotel',
    {
      status: 'working',
      summary: 'Scanning hotels...',
      steps: [
        { text: 'Opened Booking.com', status: 'working' },
        { text: 'Filtering by budget', status: 'pending' },
        { text: 'Picking best trade-off', status: 'pending' },
      ],
    }
  )

  const stage1 = patchAgent(
    patchAgent(stage0, 'flight', {
      status: 'done',
      summary: 'Flights ready',
      steps: [
        { text: 'Opened Google Flights', status: 'done' },
        { text: 'Searching route and dates', status: 'done' },
        { text: 'Comparing top options', status: 'done' },
      ],
    }),
    'itinerary',
    {
      status: 'working',
      summary: 'Drafting day plan...',
      steps: [
        { text: 'Collecting city highlights', status: 'working' },
        { text: 'Balancing pace per day', status: 'pending' },
      ],
    }
  )

  const stage2 = patchAgent(
    patchAgent(stage1, 'hotel', {
      status: 'done',
      summary: 'Hotels ready',
      steps: [
        { text: 'Opened Booking.com', status: 'done' },
        { text: 'Filtering by budget', status: 'done' },
        { text: 'Picking best trade-off', status: 'done' },
      ],
    }),
    'tips',
    {
      status: 'working',
      summary: 'Preparing travel notes...',
      steps: [
        { text: 'Checking visa/weather/transit', status: 'working' },
      ],
    }
  )

  const stage3 = stage2.map((agent) => ({
    ...agent,
    status: 'done',
    summary: 'Completed',
    steps: agent.steps.map((step) => ({ ...step, status: 'done' })),
  }))

  return [stage0, stage1, stage2, stage3]
}

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
  const [sessions] = useState(MOCK_SESSIONS)
  const [favorites, setFavorites] = useState([])
  const [currentSessionId, setCurrentSessionId] = useState(null)
  const [phase, setPhase] = useState(PHASE.CHAT)
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false)
  const [messages, setMessages] = useState(INITIAL_MESSAGES)
  const [isSending, setIsSending] = useState(false)
  const [agents, setAgents] = useState(buildIdleAgents)

  const executionTimersRef = useRef([])

  // clear scheduled execution timers to avoid stale updates after phase switch
  const clearExecutionTimers = () => {
    executionTimersRef.current.forEach((timerId) => clearTimeout(timerId))
    executionTimersRef.current = []
  }

  // move between phases through state-machine events
  const transitionPhase = (eventType) => {
    setPhase((current) => getNextPhase(current, eventType))
  }

  // append one chat message in a single helper to keep shape consistent
  const appendMessage = (role, text) => {
    setMessages((prev) => [...prev, { id: `${Date.now()}-${Math.random()}`, role, text }])
  }

  // simulate backend execution progress by publishing staged agent snapshots
  const runExecutionTimeline = () => {
    clearExecutionTimers()
    const stages = buildExecutionStages()

    setAgents(stages[0])
    executionTimersRef.current.push(setTimeout(() => setAgents(stages[1]), 1300))
    executionTimersRef.current.push(setTimeout(() => setAgents(stages[2]), 2600))
    executionTimersRef.current.push(setTimeout(() => setAgents(stages[3]), 3900))
    executionTimersRef.current.push(
      setTimeout(() => {
        transitionPhase('EXECUTION_DONE')
      }, 4300)
    )
  }

  // start execution phase and hand over visual updates to timeline engine
  const startExecution = () => {
    transitionPhase('START_EXECUTION')
    runExecutionTimeline()
  }

  // mock request for assistant reply; this is the future LangGraph API seam
  const requestAssistantReply = async (text) => {
    return new Promise((resolve) => {
      setTimeout(() => {
        const shouldStartSearch = /(start search|开始搜索|开始查|go search|run it)/i.test(text)
        if (shouldStartSearch) {
          resolve({
            replyText: 'Got it. I have enough information and will start searching now.',
            shouldStartSearch: true,
          })
          return
        }

        resolve({
          replyText: `Got it: "${text}". Please share destination, dates, and traveler count.`,
          shouldStartSearch: false,
        })
      }, 900)
    })
  }

  // process one user input through data flow: user message -> assistant reply -> optional phase event
  const handleChatSend = async (text) => {
    appendMessage('user', text)
    setIsSending(true)

    try {
      const { replyText, shouldStartSearch } = await requestAssistantReply(text)
      appendMessage('agent', replyText)

      if (shouldStartSearch) {
        startExecution()
      }
    } catch {
      appendMessage('agent', 'Sorry, request failed. Please try again.')
      transitionPhase('EXECUTION_ERROR')
    } finally {
      setIsSending(false)
    }
  }

  useEffect(() => {
    const fetchFavorites = async () => {
      const token = localStorage.getItem('nomie_token')
      if (!token) return
      try {
        const res = await fetch('http://localhost:8080/api/favorites', {
          headers: { 'Authorization': `Bearer ${token}` }
        })
        if (res.ok) {
          const data = await res.json()
          setFavorites(data.favorites.map(d => ({
            id: d.cardId,
            dbId: d._id,
            type: d.cardType,
            title: d.cardData.title,
            price: d.cardData.price
          })))
        }
      } catch (e) {
        console.error('Failed to fetch favorites', e)
      }
    }
    fetchFavorites()

    return () => {
      clearExecutionTimers()
    }
  }, [])

  const handleNewSession = () => {
    setCurrentSessionId('new')
    transitionPhase('NEW_CHAT')
    setMessages(INITIAL_MESSAGES)
    setAgents(buildIdleAgents())
    setIsSending(false)
    clearExecutionTimers()
  }

  const handleSelectSession = (sessionId) => {
    setCurrentSessionId(sessionId)
    const session = sessions.find(s => s.id === sessionId)
    setPhase(session?.phase || PHASE.CHAT)
  }

  const handleSelectFavorite = (favoriteId) => {
    // TODO: Show favorite detail
    setCurrentSessionId(`fav-${favoriteId}`)
    setPhase(PHASE.RESULT)
  }

  const handleStopAgents = () => {
    clearExecutionTimers()
    transitionPhase('STOP_EXECUTION')
    setAgents(buildIdleAgents())
  }

  // add or remove item from favorites list
  const handleToggleFavorite = async (item) => {
    const token = localStorage.getItem('nomie_token')
    if (!token) return

    const exists = favorites.find(f => f.id === item.id)
    if (exists) {
      // Optimistic delete
      setFavorites(favorites.filter(f => f.id !== item.id))
      try {
        await fetch(`http://localhost:8080/api/favorites/${exists.dbId}`, {
          method: 'DELETE',
          headers: { 'Authorization': `Bearer ${token}` }
        })
      } catch (e) { console.error(e) }
    } else {
      try {
        const res = await fetch('http://localhost:8080/api/favorites', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
          },
          body: JSON.stringify({
            cardId: item.id,
            cardType: item.type,
            cardData: { title: item.title, price: item.price }
          })
        })
        if (!res.ok) {
          const errData = await res.json()
          console.error('Save failed:', errData)
          if (res.status === 409) {
            // Already saved, silent fail UI
            setFavorites([...favorites, { ...item, dbId: 'fake-conflict' }])
          }
          return
        }
        const data = await res.json()
        setFavorites([...favorites, {
          id: item.id,
          dbId: data.favorite?._id || data._id,
          type: item.type,
          title: item.title,
          price: item.price
        }])
      } catch (e) { console.error(e) }
    }
  }

  const isExecuting = phase === PHASE.EXECUTING
  const isResult = phase === PHASE.RESULT
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
            onStopAgents={handleStopAgents}
            compressed={showRightPanel}
            messages={messages}
            isSending={isSending}
            onSendMessage={handleChatSend}
          />
        </div>
        {showRightPanel && (
          <div className="right-panel">
            {isExecuting && (
              <AgentPanel agents={agents} />
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
