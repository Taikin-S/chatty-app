"use client"

import { useState, useEffect, useCallback, useRef } from "react"
import { ChatWebSocket, type Message, type User, RoomManager } from "@/lib/websocket"
import { useToast } from "@/hooks/use-toast"

interface UseChatProps {
  roomId: string
  nickname: string
}

export function useChat({ roomId, nickname }: UseChatProps) {
  const [messages, setMessages] = useState<Message[]>([])
  const [users, setUsers] = useState<User[]>([])
  const [isConnected, setIsConnected] = useState(false)
  const [timeLeft, setTimeLeft] = useState(24 * 60 * 60)
  const [roomExpired, setRoomExpired] = useState(false)

  const wsRef = useRef<ChatWebSocket | null>(null)
  const isConnectingRef = useRef(false)
  const connectionTimeoutRef = useRef<NodeJS.Timeout | null>(null)
  const { toast } = useToast()

  // Initialize WebSocket connection
  useEffect(() => {
    if (!roomId || !nickname) return

    // 接続タイムアウトをクリア
    if (connectionTimeoutRef.current) {
      clearTimeout(connectionTimeoutRef.current)
      connectionTimeoutRef.current = null
    }

    // 既に接続中または接続処理中の場合はスキップ
    if (isConnectingRef.current || (wsRef.current && wsRef.current.ws && wsRef.current.ws.readyState === WebSocket.OPEN)) {
      return
    }

    // 接続を遅延実行（デバウンス）
    connectionTimeoutRef.current = setTimeout(() => {
      if (isConnectingRef.current || (wsRef.current && wsRef.current.ws && wsRef.current.ws.readyState === WebSocket.OPEN)) {
        return
      }

      isConnectingRef.current = true

      // 既存の接続をクリーンアップ
      if (wsRef.current) {
        wsRef.current.disconnect()
        wsRef.current = null
      }

    const handleMessage = (wsMessage: any) => {
      switch (wsMessage.type) {
        case "user_joined":
          setUsers((prev) => {
            const filtered = prev.filter((u) => u.nickname !== wsMessage.user.nickname)
            return [...filtered, {
              ...wsMessage.user,
              joinedAt: new Date(wsMessage.user.joinedAt)
            }]
          })

          // Add system message
          const joinMessage: Message = {
            id: Date.now().toString(),
            nickname: "システム",
            content: `${wsMessage.user.nickname}さんが参加しました`,
            timestamp: new Date(),
            type: "system",
          }
          setMessages((prev) => [...prev, joinMessage])
          break

        case "user_left":
          setUsers((prev) => prev.filter((u) => u.nickname !== wsMessage.nickname))

          // Add system message
          const leaveMessage: Message = {
            id: Date.now().toString(),
            nickname: "システム",
            content: `${wsMessage.nickname}さんが退出しました`,
            timestamp: new Date(),
            type: "system",
          }
          setMessages((prev) => [...prev, leaveMessage])
          break

        case "message":
          setMessages((prev) => [...prev, {
            ...wsMessage.message,
            timestamp: new Date(wsMessage.message.timestamp)
          }])
          break

        case "room_expired":
          setRoomExpired(true)
          break

        case "error":
          toast({
            title: "接続エラー",
            description: wsMessage.error,
            variant: "destructive",
          })
          break
      }
    }

      const ws = new ChatWebSocket(roomId, nickname, handleMessage)
      wsRef.current = ws
      
      // 接続成功時にフラグをリセット
      const originalConnect = ws.connect.bind(ws)
      ws.connect = () => {
        originalConnect()
        // WebSocketのonopenイベントで接続状態を更新
        const originalOnOpen = ws.ws?.onopen
        if (ws.ws) {
          ws.ws.onopen = (event) => {
            console.log("WebSocket connection opened")
            isConnectingRef.current = false
            setIsConnected(true)
            if (originalOnOpen) originalOnOpen(event)
          }
        }
      }
      
      ws.connect()
    }, 500) // 500msのデバウンス

    return () => {
      // 接続タイムアウトをクリア
      if (connectionTimeoutRef.current) {
        clearTimeout(connectionTimeoutRef.current)
        connectionTimeoutRef.current = null
      }
      
      isConnectingRef.current = false
      if (wsRef.current) {
        wsRef.current.disconnect()
        wsRef.current = null
      }
      setIsConnected(false)
    }
  }, [roomId, nickname]) // toastを依存配列から除外

  // Room expiry countdown - サーバーから取得するように変更
  useEffect(() => {
    const timer = setInterval(() => {
      // サーバーからルーム情報を取得
      fetch(`/api/rooms/${roomId}`)
        .then(response => response.json())
        .then(data => {
          if (data.room) {
            const now = new Date()
            const expiresAt = new Date(data.room.expiresAt)
            const remaining = Math.max(0, Math.floor((expiresAt.getTime() - now.getTime()) / 1000))
            setTimeLeft(remaining)
            
            if (remaining <= 0) {
              setRoomExpired(true)
            }
          } else {
            setRoomExpired(true)
          }
        })
        .catch(error => {
          console.error('Failed to fetch room info:', error)
        })
    }, 1000)

    return () => clearInterval(timer)
  }, [roomId])

  const sendMessage = useCallback(
    (content: string) => {
      if (!content.trim()) {
        console.log("Empty message content")
        return
      }

      if (!wsRef.current) {
        console.log("WebSocket not connected")
        toast({
          title: "接続エラー",
          description: "WebSocketに接続されていません",
          variant: "destructive",
        })
        return
      }

      if (!wsRef.current.ws || wsRef.current.ws.readyState !== WebSocket.OPEN) {
        console.log("WebSocket not ready, state:", wsRef.current.ws?.readyState)
        toast({
          title: "接続エラー",
          description: "WebSocket接続が確立されていません",
          variant: "destructive",
        })
        return
      }

      const message: Message = {
        id: Date.now().toString(),
        nickname,
        content: content.trim(),
        timestamp: new Date(),
        type: "text",
      }

      console.log("Sending message:", message)
      wsRef.current.sendMessage({
        ...message,
        timestamp: message.timestamp.toISOString()
      })
    },
    [nickname, toast],
  )

  const sendFile = useCallback(
    (file: File) => {
      if (!wsRef.current) return

      const fileUrl = URL.createObjectURL(file)
      const message: Message = {
        id: Date.now().toString(),
        nickname,
        content: `ファイルを共有しました: ${file.name}`,
        timestamp: new Date(),
        type: file.type.startsWith("image/") ? "image" : file.type.startsWith("video/") ? "video" : "text",
        fileUrl,
        fileName: file.name,
      }

      wsRef.current.sendMessage({
        ...message,
        timestamp: message.timestamp.toISOString()
      })
    },
    [nickname],
  )

  return {
    messages,
    users,
    isConnected,
    timeLeft,
    roomExpired,
    sendMessage,
    sendFile,
  }
}
