import { type NextRequest, NextResponse } from "next/server"

export async function GET(request: NextRequest, { params }: { params: { roomId: string } }) {
  const roomId = params.roomId

  try {
    // WebSocketサーバーに直接問い合わせ
    const wsHost = process.env.WEBSOCKET_SERVER_URL || 'http://localhost:8080'
    const response = await fetch(`${wsHost}/api/room/${roomId}`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
    })

    if (!response.ok) {
      return NextResponse.json({ error: "Room not found or expired" }, { status: 404 })
    }

    const data = await response.json()
    return NextResponse.json({
      room: data
    })
  } catch (error) {
    console.error('Failed to fetch room from WebSocket server:', error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}

export async function POST(request: NextRequest, { params }: { params: { roomId: string } }) {
  const roomId = params.roomId

  try {
    // Create room if it doesn't exist
    let room = RoomManager.getRoom(roomId)
    if (!room) {
      room = RoomManager.createRoom(roomId)
    }

    return NextResponse.json({
      roomId,
      timeLeft: RoomManager.getRoomTimeLeft(roomId),
      created: true,
    })
  } catch (error) {
    return NextResponse.json({ error: "Failed to create room" }, { status: 500 })
  }
}
