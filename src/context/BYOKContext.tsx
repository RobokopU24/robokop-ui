import React, { createContext, useContext, useState, useEffect, useRef, useCallback } from 'react'
import { byokWsURL } from '../API/routes'
import { BYOKConfig, streamWithProvider } from '../utils/byokProviders'

export type { BYOKConfig }

type WsStatus = 'disconnected' | 'connecting' | 'connected'

interface BYOKContextType {
  isActive: boolean
  config: BYOKConfig | null
  wsStatus: WsStatus
  sessionToken: string
  activate: (config: BYOKConfig) => void
  deactivate: () => void
}

const BYOKContext = createContext<BYOKContextType | null>(null)

const SESSION_STORAGE_KEY = 'byok_config'
const SESSION_TOKEN_KEY = 'byok_session_token'

function getOrCreateSessionToken(): string {
  let token = sessionStorage.getItem(SESSION_TOKEN_KEY)
  if (!token) {
    token = crypto.randomUUID()
    sessionStorage.setItem(SESSION_TOKEN_KEY, token)
  }
  return token
}

function loadSavedConfig(): BYOKConfig | null {
  try {
    const raw = sessionStorage.getItem(SESSION_STORAGE_KEY)
    return raw ? (JSON.parse(raw) as BYOKConfig) : null
  } catch {
    return null
  }
}

export function BYOKProvider({ children }: { children: React.ReactNode }) {
  const [config, setConfig] = useState<BYOKConfig | null>(loadSavedConfig)
  const [isActive, setIsActive] = useState<boolean>(() => loadSavedConfig() !== null)
  const [wsStatus, setWsStatus] = useState<WsStatus>('disconnected')
  const sessionToken = useRef<string>(getOrCreateSessionToken())
  const wsRef = useRef<WebSocket | null>(null)

  const connectWebSocket = useCallback((cfg: BYOKConfig) => {
    if (wsRef.current) {
      wsRef.current.close()
    }

    setWsStatus('connecting')
    const ws = new WebSocket(byokWsURL)
    wsRef.current = ws

    ws.onopen = () => {
      ws.send(JSON.stringify({ type: 'register', sessionToken: sessionToken.current }))
    }

    ws.onmessage = async (event) => {
      let msg: { type: string; requestId?: string; prompt?: string }
      try {
        msg = JSON.parse(event.data as string)
      } catch {
        return
      }

      if (msg.type === 'registered') {
        setWsStatus('connected')
        return
      }

      if (msg.type === 'llm-request' && msg.requestId && msg.prompt) {
        const { requestId, prompt } = msg
        try {
          await streamWithProvider(cfg, prompt, (chunk) => {
            if (ws.readyState === WebSocket.OPEN) {
              ws.send(JSON.stringify({ type: 'llm-chunk', requestId, chunk }))
            }
          })
          if (ws.readyState === WebSocket.OPEN) {
            ws.send(JSON.stringify({ type: 'llm-done', requestId }))
          }
        } catch (error) {
          if (ws.readyState === WebSocket.OPEN) {
            ws.send(JSON.stringify({ type: 'llm-error', requestId, error: String(error) }))
          }
        }
      }
    }

    ws.onclose = () => {
      setWsStatus('disconnected')
      wsRef.current = null
    }

    ws.onerror = () => {
      setWsStatus('disconnected')
    }
  }, [])

  // Reconnect if the page reloads with a saved config
  useEffect(() => {
    if (isActive && config && wsStatus === 'disconnected' && !wsRef.current) {
      connectWebSocket(config)
    }
  }, []) // eslint-disable-line react-hooks/exhaustive-deps

  const activate = useCallback(
    (newConfig: BYOKConfig) => {
      sessionStorage.setItem(SESSION_STORAGE_KEY, JSON.stringify(newConfig))
      setConfig(newConfig)
      setIsActive(true)
      connectWebSocket(newConfig)
    },
    [connectWebSocket],
  )

  const deactivate = useCallback(() => {
    sessionStorage.removeItem(SESSION_STORAGE_KEY)
    setConfig(null)
    setIsActive(false)
    setWsStatus('disconnected')
    if (wsRef.current) {
      wsRef.current.close()
      wsRef.current = null
    }
  }, [])

  return (
    <BYOKContext.Provider
      value={{
        isActive,
        config,
        wsStatus,
        sessionToken: sessionToken.current,
        activate,
        deactivate,
      }}
    >
      {children}
    </BYOKContext.Provider>
  )
}

export function useBYOK(): BYOKContextType {
  const ctx = useContext(BYOKContext)
  if (!ctx) throw new Error('useBYOK must be used within BYOKProvider')
  return ctx
}
