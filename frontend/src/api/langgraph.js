// frontend/src/api/langgraph.js

const BASE_URL = import.meta.env.VITE_LANGGRAPH_URL || 'http://localhost:2024'

export async function createThread() {
  const res = await fetch(`${BASE_URL}/threads`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ metadata: {} }),
  })
  if (!res.ok) throw new Error(`createThread failed: ${res.status}`)
  return res.json()
}

export async function searchThreads() {
  const res = await fetch(`${BASE_URL}/threads/search`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      limit: 50,
      offset: 0,
    }),
  })
  if (!res.ok) throw new Error(`searchThreads failed: ${res.status}`)
  return res.json()
}

export async function getThreadState(threadId) {
  const res = await fetch(`${BASE_URL}/threads/${threadId}/state`)
  if (!res.ok) throw new Error(`getThreadState failed: ${res.status}`)
  return res.json()
}

export async function cancelRun(threadId, runId) {
  const res = await fetch(`${BASE_URL}/threads/${threadId}/runs/${runId}/cancel`, {
    method: 'POST',
  })
  if (!res.ok) throw new Error(`cancelRun failed: ${res.status}`)
}

export function streamRun(threadId, message, onEvent) {
  const abortController = new AbortController()

  const body = {
    input: {
      messages: [{ role: 'user', content: message }],
    },
    config: {
      configurable: {
        subagent_enabled: true,
      },
    },
    stream_mode: ['values', 'messages-tuple', 'custom'],
  }

  const promise = fetch(`${BASE_URL}/threads/${threadId}/runs/stream`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
    signal: abortController.signal,
  }).then(async (res) => {
    if (!res.ok) {
      throw new Error(`streamRun failed: ${res.status}`)
    }

    const reader = res.body.getReader()
    const decoder = new TextDecoder()
    let buffer = ''
    let currentEvent = ''

    while (true) {
      const { done, value } = await reader.read()
      if (done) break

      buffer += decoder.decode(value, { stream: true })
      const lines = buffer.split('\n')
      buffer = lines.pop()

      for (const line of lines) {
        if (line.startsWith('event: ')) {
          currentEvent = line.slice(7).trim()
        } else if (line.startsWith('data: ')) {
          const jsonStr = line.slice(6)
          try {
            const data = JSON.parse(jsonStr)
            onEvent(currentEvent, data)
          } catch {
            // skip malformed JSON lines
          }
        }
        // blank lines reset event type per SSE spec
        if (line === '') {
          currentEvent = ''
        }
      }
    }
  })

  return {
    promise,
    close: () => abortController.abort(),
    getAbortController: () => abortController,
  }
}
