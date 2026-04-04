// frontend/src/hooks/useLanggraph.js

import { useCallback, useRef, useState } from 'react'
import { createThread, searchThreads, getThreadState, streamRun, cancelRun } from '../api/langgraph.js'

const INITIAL_MESSAGES = [
  {
    id: 'welcome-1',
    role: 'agent',
    text: 'Hi there! Tell me about your trip — where to, when, and how many people?',
    isStreaming: false,
  },
]

const AGENT_TYPES = [
  { id: 'flight', name: 'Flight Search', icon: '✈️', sprite: '/assets/pixel/agent_1.png', subagentType: 'flight-search' },
  { id: 'hotel', name: 'Hotel Search', icon: '🏨', sprite: '/assets/pixel/agent_2.png', subagentType: 'hotel-search' },
  { id: 'itinerary', name: 'Itinerary Planner', icon: '📋', sprite: '/assets/pixel/agent_3.png', subagentType: 'itinerary-planner' },
  { id: 'tips', name: 'Travel Tips', icon: '🔍', sprite: '/assets/pixel/agent_4.png', subagentType: 'travel-tips' },
]

function buildIdleAgents() {
  return AGENT_TYPES.map((a) => ({
    ...a,
    status: 'idle',
    summary: 'Standby',
    steps: [],
  }))
}

// map subagent_type string to agent panel id
const SUBAGENT_TO_PANEL_ID = {
  'flight-search': 'flight',
  'hotel-search': 'hotel',
  'itinerary-planner': 'itinerary',
  'travel-tips': 'tips',
}

export function useLanggraph() {
  const [messages, setMessages] = useState(INITIAL_MESSAGES)
  const [agents, setAgents] = useState(buildIdleAgents)
  const [results, setResults] = useState(null)
  const [sessions, setSessions] = useState([])
  const [currentThreadId, setCurrentThreadId] = useState(null)
  const [isSending, setIsSending] = useState(false)

  // refs for values that change during streaming but shouldn't trigger re-renders
  const streamHandleRef = useRef(null)
  const currentRunIdRef = useRef(null)
  const taskMapRef = useRef({}) // tool_call_id -> panel agent id

  // extract a short label from an AIMessage dict for the agent steps list
  function extractStepText(message) {
    // if the message has tool_calls, show the tool name
    if (message.tool_calls && message.tool_calls.length > 0) {
      const toolName = message.tool_calls[0].name
      const args = message.tool_calls[0].args || {}
      if (toolName === 'web_search') {
        const query = args.query || ''
        return query ? `Searching: ${query.slice(0, 60)}` : 'Searching the web...'
      }
      if (toolName === 'web_fetch') {
        const url = args.url || ''
        return url ? `Fetching: ${url.slice(0, 60)}` : 'Fetching a page...'
      }
      return `Using ${toolName}...`
    }
    // if the message has text content, truncate it
    const content = typeof message.content === 'string'
      ? message.content
      : Array.isArray(message.content)
        ? message.content.map((b) => (typeof b === 'string' ? b : b.text || '')).join('')
        : ''
    if (content) {
      return content.length > 80 ? content.slice(0, 77) + '...' : content
    }
    return 'Processing...'
  }

  // mutable flag set when Lead Agent calls task() — signals execution phase
  const didDispatchRef = useRef(false)

  function handleSSEEvent(eventType, data) {
    if (eventType === 'messages-tuple' || eventType === 'messages') {
      // messages-tuple carries individual message updates
      if (Array.isArray(data)) {
        // LangGraph sends [messageType, messageData] tuple format
        const [msgType, msgData] = data
        handleMessageTuple(msgType, msgData)
      } else if (data && data.type) {
        handleMessageTuple(data.type, data)
      }
    } else if (eventType === 'custom') {
      handleCustomEvent(data)
    } else if (eventType === 'values') {
      handleValuesEvent(data)
    }
  }

  function handleMessageTuple(msgType, msgData) {
    if (msgType === 'ai' || msgData.type === 'ai') {
      // check for tool calls to task() — this tells us execution is starting
      if (msgData.tool_calls && msgData.tool_calls.length > 0) {
        for (const tc of msgData.tool_calls) {
          if (tc.name === 'task') {
            didDispatchRef.current = true
            // build task_id -> panel agent id mapping
            const subagentType = tc.args?.subagent_type
            if (subagentType && tc.id) {
              taskMapRef.current[tc.id] = SUBAGENT_TO_PANEL_ID[subagentType] || subagentType
            }
          }
        }
        return // don't show tool call messages in chat
      }

      // AI text content — stream into chat
      const content = typeof msgData.content === 'string'
        ? msgData.content
        : Array.isArray(msgData.content)
          ? msgData.content.map((b) => (typeof b === 'string' ? b : b.text || '')).join('')
          : ''

      if (!content) return

      setMessages((prev) => {
        const last = prev[prev.length - 1]
        // if last message is a streaming agent message, append to it
        if (last && last.role === 'agent' && last.isStreaming) {
          return [
            ...prev.slice(0, -1),
            { ...last, text: last.text + content },
          ]
        }
        // otherwise start a new streaming message
        return [
          ...prev,
          { id: `msg-${Date.now()}`, role: 'agent', text: content, isStreaming: true },
        ]
      })
    }
    // tool result messages are ignored in the chat UI
  }

  function handleCustomEvent(data) {
    if (!data || !data.type) return
    const taskId = data.task_id
    const panelId = taskMapRef.current[taskId]
    if (!panelId) return

    if (data.type === 'task_started') {
      setAgents((prev) =>
        prev.map((a) =>
          a.id === panelId
            ? { ...a, status: 'working', summary: data.description || 'Starting...' }
            : a
        )
      )
    } else if (data.type === 'task_running') {
      const stepText = extractStepText(data.message || {})
      setAgents((prev) =>
        prev.map((a) => {
          if (a.id !== panelId) return a
          // flip previous working steps to done, add new working step
          const updatedSteps = a.steps.map((s) =>
            s.status === 'working' ? { ...s, status: 'done' } : s
          )
          return {
            ...a,
            summary: stepText,
            steps: [...updatedSteps, { text: stepText, status: 'working' }],
          }
        })
      )
    } else if (data.type === 'task_completed') {
      setAgents((prev) =>
        prev.map((a) =>
          a.id === panelId
            ? {
                ...a,
                status: 'done',
                summary: 'Completed',
                steps: a.steps.map((s) => ({ ...s, status: 'done' })),
              }
            : a
        )
      )
    } else if (data.type === 'task_failed' || data.type === 'task_timed_out') {
      setAgents((prev) =>
        prev.map((a) =>
          a.id === panelId
            ? { ...a, status: 'error', summary: data.error || 'Failed' }
            : a
        )
      )
    }
  }

  function handleValuesEvent(data) {
    // extract run_id for cancel support
    if (data.run_id) {
      currentRunIdRef.current = data.run_id
    }
  }

  function tryParseResults(text) {
    // try to find a JSON code block first
    const jsonBlockMatch = text.match(/```(?:json)?\s*\n?([\s\S]*?)```/)
    if (jsonBlockMatch) {
      try {
        return JSON.parse(jsonBlockMatch[1].trim())
      } catch {
        // fall through
      }
    }
    // try to find a raw JSON object
    const braceStart = text.indexOf('{')
    const braceEnd = text.lastIndexOf('}')
    if (braceStart !== -1 && braceEnd > braceStart) {
      try {
        return JSON.parse(text.slice(braceStart, braceEnd + 1))
      } catch {
        // fall through
      }
    }
    return null
  }

  const sendMessage = useCallback(async (text) => {
    setIsSending(true)
    didDispatchRef.current = false
    taskMapRef.current = {}

    // add user message to chat
    setMessages((prev) => [
      ...prev,
      { id: `user-${Date.now()}`, role: 'user', text, isStreaming: false },
    ])

    try {
      // create thread if this is the first message
      let threadId = currentThreadId
      if (!threadId) {
        const thread = await createThread()
        threadId = thread.thread_id
        setCurrentThreadId(threadId)
      }

      // start SSE stream
      const handle = streamRun(threadId, text, handleSSEEvent)
      streamHandleRef.current = handle

      // wait for stream to complete
      await handle.promise

      // finalize: mark last streaming message as complete
      setMessages((prev) => {
        const last = prev[prev.length - 1]
        if (last && last.isStreaming) {
          return [...prev.slice(0, -1), { ...last, isStreaming: false }]
        }
        return prev
      })

      // if agents were dispatched, check if they all completed and try to parse results
      if (didDispatchRef.current) {
        // get final thread state for the Lead Agent's summary message
        const state = await getThreadState(threadId)
        const allMessages = state?.values?.messages || []
        // find the last AI message (Lead Agent's summary)
        const lastAi = [...allMessages].reverse().find((m) => m.type === 'ai')
        if (lastAi) {
          const content = typeof lastAi.content === 'string'
            ? lastAi.content
            : Array.isArray(lastAi.content)
              ? lastAi.content.map((b) => (typeof b === 'string' ? b : b.text || '')).join('')
              : ''
          const parsed = tryParseResults(content)
          if (parsed) {
            setResults(parsed)
          } else {
            // fallback: store raw text so ResultPanel can render it
            setResults({ rawText: content })
          }
        }
      }

      return { shouldStartSearch: didDispatchRef.current }
    } catch (err) {
      // if aborted by user (stop button), don't show error
      if (err.name === 'AbortError') {
        return { shouldStartSearch: false }
      }
      setMessages((prev) => [
        ...prev,
        { id: `err-${Date.now()}`, role: 'agent', text: 'Sorry, something went wrong. Please try again.', isStreaming: false },
      ])
      return { shouldStartSearch: false }
    } finally {
      setIsSending(false)
      streamHandleRef.current = null
    }
  }, [currentThreadId])

  const stopExecution = useCallback(async () => {
    // abort the SSE fetch
    if (streamHandleRef.current) {
      streamHandleRef.current.close()
      streamHandleRef.current = null
    }
    // try to cancel the run on the server
    if (currentThreadId && currentRunIdRef.current) {
      try {
        await cancelRun(currentThreadId, currentRunIdRef.current)
      } catch {
        // best effort — server may have already finished
      }
      currentRunIdRef.current = null
    }
    setAgents(buildIdleAgents())
  }, [currentThreadId])

  const newSession = useCallback(() => {
    setCurrentThreadId(null)
    setMessages(INITIAL_MESSAGES)
    setAgents(buildIdleAgents())
    setResults(null)
    setIsSending(false)
    taskMapRef.current = {}
    didDispatchRef.current = false
    if (streamHandleRef.current) {
      streamHandleRef.current.close()
      streamHandleRef.current = null
    }
  }, [])

  const selectSession = useCallback(async (threadId) => {
    setCurrentThreadId(threadId)
    setResults(null)
    setAgents(buildIdleAgents())
    setIsSending(false)

    try {
      const state = await getThreadState(threadId)
      const rawMessages = state?.values?.messages || []
      const chatMessages = rawMessages
        .filter((m) => m.type === 'human' || m.type === 'ai')
        .map((m, i) => ({
          id: m.id || `hist-${i}`,
          role: m.type === 'human' ? 'user' : 'agent',
          text: typeof m.content === 'string'
            ? m.content
            : Array.isArray(m.content)
              ? m.content.map((b) => (typeof b === 'string' ? b : b.text || '')).join('')
              : String(m.content),
          isStreaming: false,
        }))
      setMessages(chatMessages.length > 0 ? chatMessages : INITIAL_MESSAGES)
    } catch {
      setMessages(INITIAL_MESSAGES)
    }
  }, [])

  const loadSessions = useCallback(async () => {
    try {
      const threads = await searchThreads()
      // threads is an array of thread objects
      const sessionList = threads
        .filter((t) => t.values && t.values.title)
        .map((t) => ({
          id: t.thread_id,
          title: t.values.title || 'Untitled',
          date: t.created_at ? t.created_at.split('T')[0] : '',
        }))
      setSessions(sessionList)
    } catch {
      setSessions([])
    }
  }, [])

  return {
    messages,
    agents,
    results,
    sessions,
    currentThreadId,
    isSending,
    sendMessage,
    stopExecution,
    newSession,
    selectSession,
    loadSessions,
  }
}
