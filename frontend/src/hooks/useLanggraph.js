// frontend/src/hooks/useLanggraph.js

import { useCallback, useRef, useState } from 'react'
import { createThread, searchThreads, getThreadState, streamRun, cancelRun } from '../api/langgraph.js'

const INITIAL_MESSAGES = [
  {
    id: 'welcome-1',
    role: 'agent',
    text: "Hi! I've got your travel personality profile ready. Tell me where you'd like to go, or just say \"suggest something\" and I'll recommend destinations that match your style!",
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

export function useLanggraph(profile) {
  const [messages, setMessages] = useState(INITIAL_MESSAGES)
  const [agents, setAgents] = useState(buildIdleAgents)
  const [results, setResults] = useState(null)
  const [sessions, setSessions] = useState([])
  const [currentThreadId, setCurrentThreadId] = useState(null)
  const [isSending, setIsSending] = useState(false)
  const [executionStarted, setExecutionStarted] = useState(false)

  // refs for values that change during streaming but shouldn't trigger re-renders
  const streamHandleRef = useRef(null)
  const currentRunIdRef = useRef(null)
  const insideThinkingRef = useRef(false) // true while suppressing <thinking>...</thinking>

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
      if (toolName === 'duffel_flight_search') {
        return `Searching Duffel: ${args.origin || ''} → ${args.destination || ''}`
      }
      if (toolName === 'liteapi_hotel_search') {
        return `Searching LiteAPI: ${args.city_code || ''}`
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
      // LangGraph sends [messageChunk, metadata] array
      // messageChunk has .type, .content, .tool_calls etc.
      if (Array.isArray(data) && data.length >= 1) {
        const msgChunk = data[0]
        const meta = data[1] || {}
        // Only render messages from the main agent node — filter out
        // TitleMiddleware and other middleware LLM calls that leak into the stream
        const node = meta?.metadata?.langgraph_node
        if (node && node !== 'agent') return
        handleMessageChunk(msgChunk)
      } else if (data && data.type) {
        handleMessageChunk(data)
      }
    } else if (eventType === 'custom') {
      handleCustomEvent(data)
    } else if (eventType === 'values') {
      handleValuesEvent(data)
    } else if (eventType === 'metadata') {
      // extract run_id from metadata event
      if (data && data.run_id) {
        currentRunIdRef.current = data.run_id
      }
    }
  }

  function handleMessageChunk(msg) {
    const msgType = msg.type

    // ask_clarification ToolMessage — display formatted question in chat,
    // replacing the incomplete intro text the agent may have streamed before calling the tool
    if (msgType === 'tool' && msg.name === 'ask_clarification') {
      const content = typeof msg.content === 'string' ? msg.content : ''
      if (!content) return
      setMessages((prev) => {
        // finalize any in-progress streaming bubble, then add clarification as a new bubble
        const finalized = prev.map((m) =>
          m.isStreaming ? { ...m, isStreaming: false } : m
        )
        return [...finalized, { id: `clarify-${Date.now()}`, role: 'agent', text: content, isStreaming: false }]
      })
      return
    }

    // skip non-AI messages (human, tool results)
    if (msgType !== 'AIMessageChunk' && msgType !== 'ai') return

    // skip tool call messages (task dispatch) — don't show in chat
    if (msg.tool_calls && msg.tool_calls.length > 0) return
    // skip tool_call_chunks (partial tool calls during streaming)
    if (msg.tool_call_chunks && msg.tool_call_chunks.length > 0) return

    // AI text content — stream into chat
    const content = typeof msg.content === 'string'
      ? msg.content
      : Array.isArray(msg.content)
        ? msg.content.map((b) => (typeof b === 'string' ? b : b.text || '')).join('')
        : ''

    if (!content) return

    // Filter out Claude's <thinking>...</thinking> blocks (streamed across multiple chunks)
    let visibleContent = content

    if (visibleContent.includes('<thinking>')) {
      insideThinkingRef.current = true
    }

    if (insideThinkingRef.current) {
      if (visibleContent.includes('</thinking>')) {
        insideThinkingRef.current = false
        // Keep only text AFTER </thinking> — no trim, preserve leading newlines
        visibleContent = visibleContent.split('</thinking>').pop()
      } else {
        return // entirely inside thinking block, suppress
      }
    }

    // Strip any leftover <thinking> or </thinking> fragments, but preserve whitespace/newlines
    visibleContent = visibleContent.replace(/<\/?thinking>/g, '')

    if (!visibleContent) return

    setMessages((prev) => {
      const last = prev[prev.length - 1]
      // if last message is a streaming agent message, append to it
      if (last && last.role === 'agent' && last.isStreaming) {
        return [
          ...prev.slice(0, -1),
          { ...last, text: last.text + visibleContent },
        ]
      }
      // otherwise start a new streaming message
      return [
        ...prev,
        { id: `msg-${Date.now()}`, role: 'agent', text: visibleContent, isStreaming: true },
      ]
    })
  }

  function handleCustomEvent(data) {
    if (!data || !data.type) return

    // Use subagent_type from SSE event to map to panel
    const panelId = data.subagent_type ? SUBAGENT_TO_PANEL_ID[data.subagent_type] : null
    if (!panelId) return

    if (data.type === 'task_started') {
      didDispatchRef.current = true
      setExecutionStarted(true)
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
      // Parse structured result and render card immediately
      let parsed = null
      try {
        let raw = typeof data.result === 'string' ? data.result : JSON.stringify(data.result)
        // Strategy 1: Strip markdown code block wrappers (```json ... ```)
        const codeBlockMatch = raw.match(/```(?:json)?\s*\n?([\s\S]*?)```/)
        if (codeBlockMatch) raw = codeBlockMatch[1].trim()
        try {
          parsed = JSON.parse(raw)
        } catch {
          // Strategy 2: Extract JSON object from text (sub-agent may add text before/after JSON)
          const braceStart = raw.indexOf('{')
          const braceEnd = raw.lastIndexOf('}')
          if (braceStart !== -1 && braceEnd > braceStart) {
            parsed = JSON.parse(raw.slice(braceStart, braceEnd + 1))
          }
        }
      } catch {
        // JSON parse failed — card won't render for this agent
      }

      if (parsed) {
        setResults((prev) => {
          const base = prev || {}
          if (panelId === 'flight') return { ...base, flights: parsed.flights || [] }
          if (panelId === 'hotel') return { ...base, hotels: parsed.hotels || [] }
          if (panelId === 'itinerary') {
            // Normalize itinerary: agent returns { days: [{ day, theme, morning, afternoon, evening, transport_notes }] }
            const rawDays = parsed.days || parsed.itinerary || []
            const normalized = rawDays.map((d, idx) => {
              // If agent returns morning/afternoon/evening format (no stops array)
              if (d.morning || d.afternoon || d.evening) {
                const stops = []
                if (d.morning) stops.push({ time: 'Morning', name: d.theme ? `${d.theme} — Morning` : 'Morning', description: d.morning, transport: '', location: d.morning_location || '' })
                if (d.afternoon) stops.push({ time: 'Afternoon', name: 'Afternoon', description: d.afternoon, transport: '', location: d.afternoon_location || '' })
                if (d.evening) stops.push({ time: 'Evening', name: 'Evening', description: d.evening, transport: d.transport_notes || '', location: d.evening_location || '' })
                return { day: d.day || idx + 1, theme: d.theme || '', stops }
              }
              // If agent returns stops/activities/places array format
              return {
                day: d.day || d.day_number || idx + 1,
                stops: (d.stops || d.activities || d.places || []).map((s) => ({
                  time: s.time || s.start_time || '',
                  name: s.name || s.activity || s.place || s.title || '',
                  description: s.description || s.details || s.notes || '',
                  transport: s.transport || s.transportation || s.travel_mode || '',
                })),
              }
            })
            return { ...base, itinerary: normalized }
          }
          if (panelId === 'tips') return { ...base, tips: parsed.categories || parsed.tips || [] }
          return base
        })
      }

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

  const sendMessage = useCallback(async (text) => {
    setIsSending(true)
    setExecutionStarted(false)
    didDispatchRef.current = false

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

      // start SSE stream — DO NOT await, let events drive UI in real-time
      const profileConfigurable = profile
        ? {
            profile: {
              mbtiType: profile.mbtiType,
              mbtiTitle: profile.mbtiTitle,
              mbtiSubtitle: profile.mbtiSubtitle,
              dimensions: profile.dimensions,
              quickPick: profile.quickPick,
            },
          }
        : {}
      const handle = streamRun(threadId, text, handleSSEEvent, profileConfigurable)
      streamHandleRef.current = handle

      // handle stream completion in background
      handle.promise.then(async () => {
        // finalize: mark last streaming message as complete
        setMessages((prev) => {
          const last = prev[prev.length - 1]
          if (last && last.isStreaming) {
            return [...prev.slice(0, -1), { ...last, isStreaming: false }]
          }
          return prev
        })

        // No need to getThreadState — results are already rendered via task_completed events
        setIsSending(false)
        streamHandleRef.current = null
      }).catch((err) => {
        if (err.name !== 'AbortError') {
          setMessages((prev) => [
            ...prev,
            { id: `err-${Date.now()}`, role: 'agent', text: 'Sorry, something went wrong. Please try again.', isStreaming: false },
          ])
        }
        setIsSending(false)
        streamHandleRef.current = null
      })

    } catch (err) {
      // thread creation failed
      setMessages((prev) => [
        ...prev,
        { id: `err-${Date.now()}`, role: 'agent', text: 'Sorry, could not connect. Please try again.', isStreaming: false },
      ])
      setIsSending(false)
    }
  }, [currentThreadId, profile])

  const stopExecution = useCallback(() => {
    // abort the SSE fetch
    if (streamHandleRef.current) {
      streamHandleRef.current.close()
      streamHandleRef.current = null
    }
    // reset execution state so useEffect doesn't re-trigger EXECUTING phase
    setExecutionStarted(false)
    setIsSending(false)
    didDispatchRef.current = false
    // try to cancel the run on the server (best effort, don't await)
    if (currentThreadId && currentRunIdRef.current) {
      cancelRun(currentThreadId, currentRunIdRef.current).catch(() => {})
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
    setExecutionStarted(false)
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
    executionStarted,
    sendMessage,
    stopExecution,
    newSession,
    selectSession,
    loadSessions,
  }
}
