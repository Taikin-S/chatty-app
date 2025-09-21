export interface Message {
  id: string
  nickname: string
  content: string
  timestamp: Date
  type: "text" | "image" | "video" | "system"
  fileUrl?: string
  fileName?: string
}

export interface User {
  nickname: string
  joinedAt: Date
}

export interface RoomData {
  messages: Message[]
  users: User[]
  createdAt: Date
  expiresAt: Date
}

export type WebSocketMessage =
  | { type: "join"; nickname: string; roomId: string }
  | { type: "leave"; nickname: string; roomId: string }
  | { type: "message"; message: Message; roomId: string }
  | { type: "user_joined"; user: User; roomId: string }
  | { type: "user_left"; nickname: string; roomId: string }
  | { type: "room_data"; data: RoomData; roomId: string }
  | { type: "room_expired"; roomId: string }
  | { type: "error"; error: string }

// WebSocket client for real-time chat
export class ChatWebSocket {
  private ws: WebSocket | null = null
  private roomId: string
  private nickname: string
  private onMessage: (message: WebSocketMessage) => void
  private reconnectAttempts = 0
  private maxReconnectAttempts = 5
  private reconnectDelay = 1000

  constructor(roomId: string, nickname: string, onMessage: (message: WebSocketMessage) => void) {
    this.roomId = roomId
    this.nickname = nickname
    this.onMessage = onMessage
  }

  connect() {
    try {
      // 既に接続中の場合はスキップ
      if (this.ws && this.ws.readyState === WebSocket.OPEN) {
        console.log(`Already connected to WebSocket server for room ${this.roomId}`)
        return
      }

      // WebSocketサーバーに接続
      const wsUrl = `ws://localhost:8080?roomId=${encodeURIComponent(this.roomId)}&nickname=${encodeURIComponent(this.nickname)}`
      this.ws = new WebSocket(wsUrl)

      this.ws.onopen = () => {
        console.log(`Connected to WebSocket server for room ${this.roomId}`)
        this.reconnectAttempts = 0
      }

      this.ws.onmessage = (event) => {
        try {
          const message = JSON.parse(event.data)
          this.onMessage(message)
        } catch (error) {
          console.error("Error parsing WebSocket message:", error)
        }
      }

      this.ws.onclose = (event) => {
        console.log("WebSocket connection closed:", event.code, event.reason)
        this.ws = null
        
        // 自動再接続を試行
        if (event.code !== 1000) { // 正常終了でない場合
          this.handleReconnect()
        }
      }

      this.ws.onerror = (error) => {
        console.error("WebSocket error:", error)
        this.handleReconnect()
      }
    } catch (error) {
      console.error("WebSocket connection failed:", error)
      this.handleReconnect()
    }
  }

  sendMessage(message: Message) {
    console.log("ChatWebSocket.sendMessage called with:", message)
    console.log("WebSocket state:", this.ws?.readyState)
    
    if (!this.ws) {
      console.error("WebSocket instance is null")
      return
    }
    
    if (this.ws.readyState !== WebSocket.OPEN) {
      console.error("WebSocket is not open, state:", this.ws.readyState)
      return
    }
    
    const payload = {
      type: "message",
      message,
      roomId: this.roomId
    }
    
    console.log("Sending WebSocket message:", payload)
    this.ws.send(JSON.stringify(payload))
  }

  private handleReconnect() {
    if (this.reconnectAttempts < this.maxReconnectAttempts) {
      this.reconnectAttempts++
      console.log(`Attempting to reconnect... (${this.reconnectAttempts}/${this.maxReconnectAttempts})`)

      setTimeout(() => {
        this.connect()
      }, this.reconnectDelay * this.reconnectAttempts)
    } else {
      this.onMessage({
        type: "error",
        error: "WebSocket接続に失敗しました。ページを再読み込みしてください。",
      })
    }
  }

  disconnect() {
    if (this.ws) {
      this.ws.close()
      this.ws = null
    }
  }
}

// Room management utilities
export class RoomManager {
  private static rooms = new Map<string, RoomData>()

  static createRoom(roomId: string): RoomData {
    const now = new Date()
    // 24時間の期限を設定
    const expiresAt = new Date(now.getTime() + 24 * 60 * 60 * 1000) // 24 hours

    const roomData: RoomData = {
      messages: [],
      users: [],
      createdAt: now,
      expiresAt,
    }

    console.log(`Creating room ${roomId}:`)
    console.log(`  Created at: ${now.toISOString()}`)
    console.log(`  Expires at: ${expiresAt.toISOString()}`)
    console.log(`  Time until expiry: ${Math.floor((expiresAt.getTime() - now.getTime()) / 1000)} seconds`)

    this.rooms.set(roomId, roomData)
    return roomData
  }

  static getRoom(roomId: string): RoomData | null {
    const room = this.rooms.get(roomId)
    if (!room) {
      console.log(`Room ${roomId} not found`)
      return null
    }

    const now = new Date()
    console.log(`Checking room ${roomId}:`)
    console.log(`  Current time: ${now.toISOString()}`)
    console.log(`  Expires at: ${room.expiresAt.toISOString()}`)
    console.log(`  Is expired: ${now > room.expiresAt}`)

    // 期限チェック
    if (now > room.expiresAt) {
      console.log(`Room ${roomId} has expired, deleting...`)
      this.rooms.delete(roomId)
      return null
    }

    return room
  }

  static addUserToRoom(roomId: string, user: User): boolean {
    const room = this.getRoom(roomId)
    if (!room) return false

    // Remove existing user with same nickname
    room.users = room.users.filter((u) => u.nickname !== user.nickname)
    room.users.push(user)

    return true
  }

  static removeUserFromRoom(roomId: string, nickname: string): boolean {
    const room = this.getRoom(roomId)
    if (!room) return false

    room.users = room.users.filter((u) => u.nickname !== nickname)
    return true
  }

  static addMessageToRoom(roomId: string, message: Message): boolean {
    const room = this.getRoom(roomId)
    if (!room) return false

    room.messages.push(message)
    return true
  }

  static getRoomTimeLeft(roomId: string): number {
    const room = this.getRoom(roomId)
    if (!room) return 0

    const now = new Date()
    const timeLeft = Math.max(0, Math.floor((room.expiresAt.getTime() - now.getTime()) / 1000))
    return timeLeft
  }
}
