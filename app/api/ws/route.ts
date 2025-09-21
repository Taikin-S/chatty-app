import { NextRequest } from "next/server"
import { WebSocketServer } from "ws"
import { IncomingMessage } from "http"
import { RoomManager } from "@/lib/websocket"

// WebSocketサーバーのインスタンスを保持
let wss: WebSocketServer | null = null

export async function GET(request: NextRequest) {
  if (!wss) {
    // WebSocketサーバーを初期化
    wss = new WebSocketServer({ port: 8080 })
    
    wss.on("connection", (ws, req: IncomingMessage) => {
      console.log("New WebSocket connection established")
      
      // URLからroomIdとnicknameを取得
      const url = new URL(req.url!, `http://${req.headers.host}`)
      const roomId = url.searchParams.get("roomId")
      const nickname = url.searchParams.get("nickname")
      
      if (!roomId || !nickname) {
        ws.close(1008, "Missing roomId or nickname")
        return
      }
      
      // ルームに参加
      const user = { nickname, joinedAt: new Date() }
      const joined = RoomManager.addUserToRoom(roomId, user)
      
      if (!joined) {
        // ルームが存在しない場合は作成
        RoomManager.createRoom(roomId)
        RoomManager.addUserToRoom(roomId, user)
      }
      
      // 参加メッセージを送信
      ws.send(JSON.stringify({
        type: "user_joined",
        user,
        roomId
      }))
      
      // メッセージ受信時の処理
      ws.on("message", (data) => {
        try {
          const message = JSON.parse(data.toString())
          
          if (message.type === "message") {
            // メッセージをルームに追加
            const success = RoomManager.addMessageToRoom(roomId, message.message)
            
            if (success) {
              // 全クライアントにメッセージをブロードキャスト
              wss!.clients.forEach((client) => {
                if (client !== ws && client.readyState === client.OPEN) {
                  client.send(JSON.stringify({
                    type: "message",
                    message: message.message,
                    roomId
                  }))
                }
              })
            }
          }
        } catch (error) {
          console.error("Error processing message:", error)
        }
      })
      
      // 接続切断時の処理
      ws.on("close", () => {
        console.log(`User ${nickname} disconnected from room ${roomId}`)
        
        // ユーザーをルームから削除
        RoomManager.removeUserFromRoom(roomId, nickname)
        
        // 退出メッセージを送信
        wss!.clients.forEach((client) => {
          if (client !== ws && client.readyState === client.OPEN) {
            client.send(JSON.stringify({
              type: "user_left",
              nickname,
              roomId
            }))
          }
        })
      })
      
      // エラー処理
      ws.on("error", (error) => {
        console.error("WebSocket error:", error)
      })
    })
  }
  
  return new Response("WebSocket server is running", { status: 200 })
}
