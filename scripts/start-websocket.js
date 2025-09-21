const { WebSocketServer } = require('ws')
const http = require('http')
const url = require('url')

// RoomManagerの簡易実装（CommonJS用）
class RoomManager {
  static rooms = new Map()

  static createRoom(roomId) {
    const now = new Date()
    // 24時間の期限を設定
    const expiresAt = new Date(now.getTime() + 24 * 60 * 60 * 1000) // 24 hours

    const roomData = {
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

  static getRoom(roomId) {
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

  static addUserToRoom(roomId, user) {
    const room = this.getRoom(roomId)
    if (!room) return false

    // Remove existing user with same nickname
    room.users = room.users.filter((u) => u.nickname !== user.nickname)
    room.users.push(user)

    return true
  }

  static removeUserFromRoom(roomId, nickname) {
    const room = this.getRoom(roomId)
    if (!room) return false

    room.users = room.users.filter((u) => u.nickname !== nickname)
    return true
  }

  static addMessageToRoom(roomId, message) {
    const room = this.getRoom(roomId)
    if (!room) return false

    room.messages.push(message)
    return true
  }
}

// HTTPサーバーを作成
const server = http.createServer((req, res) => {
  const parsedUrl = url.parse(req.url, true)
  
  if (req.method === 'GET' && parsedUrl.pathname.startsWith('/api/room/')) {
    const roomId = parsedUrl.pathname.split('/')[3]
    
    if (roomId) {
      const room = RoomManager.getRoom(roomId)
      
      if (!room) {
        res.writeHead(404, { 'Content-Type': 'application/json' })
        res.end(JSON.stringify({ error: 'Room not found or expired' }))
        return
      }
      
      const now = new Date()
      const timeLeft = Math.max(0, Math.floor((room.expiresAt.getTime() - now.getTime()) / 1000))
      
      res.writeHead(200, { 'Content-Type': 'application/json' })
      res.end(JSON.stringify({
        roomId,
        timeLeft,
        userCount: room.users.length,
        messageCount: room.messages.length,
        createdAt: room.createdAt.toISOString(),
        expiresAt: room.expiresAt.toISOString(),
      }))
      return
    }
  }
  
  res.writeHead(404, { 'Content-Type': 'application/json' })
  res.end(JSON.stringify({ error: 'Not found' }))
})

// WebSocketサーバーを起動
const wss = new WebSocketServer({ server })

const PORT = process.env.PORT || 8080
server.listen(PORT, () => {
  console.log(`WebSocket server started on port ${PORT}`)
})

// ユーザーごとの接続を追跡
const userConnections = new Map()
const lastConnectionTime = new Map()

wss.on('connection', (ws, req) => {
  console.log('New WebSocket connection established')
  
  // URLからroomIdとnicknameを取得
  const url = new URL(req.url, `http://${req.headers.host}`)
  const roomId = url.searchParams.get('roomId')
  const nickname = url.searchParams.get('nickname')
  
  if (!roomId || !nickname) {
    ws.close(1008, 'Missing roomId or nickname')
    return
  }
  
  // 同じユーザーの既存接続をチェックして切断
  const userKey = `${roomId}:${nickname}`
  const now = Date.now()
  const lastTime = lastConnectionTime.get(userKey) || 0
  
  // 1秒以内の連続接続を防ぐ
  if (now - lastTime < 1000) {
    console.log(`Rejecting rapid reconnection for user ${nickname} in room ${roomId}`)
    ws.close(1000, 'Too frequent reconnections')
    return
  }
  
  lastConnectionTime.set(userKey, now)
  
  if (userConnections.has(userKey)) {
    const existingWs = userConnections.get(userKey)
    if (existingWs && existingWs.readyState === existingWs.OPEN) {
      console.log(`Closing existing connection for user ${nickname} in room ${roomId}`)
      existingWs.close(1000, 'Replaced by new connection')
      // 少し待ってから新しい接続を記録
      setTimeout(() => {
        userConnections.set(userKey, ws)
      }, 200)
    } else {
      // 既存接続が無効な場合は即座に新しい接続を記録
      userConnections.set(userKey, ws)
    }
  } else {
    // 新しい接続を記録
    userConnections.set(userKey, ws)
  }
  
  // ルームに参加
  const user = { nickname, joinedAt: new Date() }
  let joined = RoomManager.addUserToRoom(roomId, user)
  
  if (!joined) {
    // ルームが存在しない場合は作成
    RoomManager.createRoom(roomId)
    joined = RoomManager.addUserToRoom(roomId, user)
  }
  
  // 参加メッセージを送信
  ws.send(JSON.stringify({
    type: 'user_joined',
    user: {
      ...user,
      joinedAt: user.joinedAt.toISOString()
    },
    roomId
  }))
  
  // メッセージ受信時の処理
  ws.on('message', (data) => {
    try {
      const message = JSON.parse(data.toString())
      console.log(`Received message from ${nickname} in room ${roomId}:`, message)
      
      if (message.type === 'message') {
        // メッセージをルームに追加
        const success = RoomManager.addMessageToRoom(roomId, message.message)
        console.log(`Message added to room: ${success}`)
        
        if (success) {
          // 全クライアントにメッセージをブロードキャスト（送信者を含む）
          const broadcastMessage = {
            type: 'message',
            message: {
              ...message.message,
              timestamp: new Date(message.message.timestamp).toISOString()
            },
            roomId
          }
          
          let clientCount = 0
          wss.clients.forEach((client) => {
            if (client.readyState === client.OPEN) {
              client.send(JSON.stringify(broadcastMessage))
              clientCount++
            }
          })
          
          console.log(`Broadcasted message to ${clientCount} clients`)
        }
      }
    } catch (error) {
      console.error('Error processing message:', error)
    }
  })
  
  // 接続切断時の処理
  ws.on('close', () => {
    console.log(`User ${nickname} disconnected from room ${roomId}`)
    
    // ユーザー接続マップから削除
    const userKey = `${roomId}:${nickname}`
    if (userConnections.get(userKey) === ws) {
      userConnections.delete(userKey)
      lastConnectionTime.delete(userKey)
    }
    
    // ユーザーをルームから削除
    RoomManager.removeUserFromRoom(roomId, nickname)
    
    // 退出メッセージを送信
    wss.clients.forEach((client) => {
      if (client !== ws && client.readyState === client.OPEN) {
        client.send(JSON.stringify({
          type: 'user_left',
          nickname,
          roomId
        }))
      }
    })
  })
  
  // エラー処理
  ws.on('error', (error) => {
    console.error('WebSocket error:', error)
  })
})

// プロセス終了時のクリーンアップ
process.on('SIGINT', () => {
  console.log('Shutting down WebSocket server...')
  wss.close()
  process.exit(0)
})
