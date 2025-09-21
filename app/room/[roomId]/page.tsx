"use client"

import { useParams, useSearchParams } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Copy, CheckCircle, Home, Wifi, WifiOff } from "lucide-react"
import { useToast } from "@/hooks/use-toast"
import { ChatMessage } from "@/components/chat-message"
import { ChatInput } from "@/components/chat-input"
import { UserList } from "@/components/user-list"
import { useChat } from "@/hooks/use-chat"
import { useEffect, useRef, useState } from "react"
import Image from "next/image"

export default function RoomPage() {
  const params = useParams()
  const searchParams = useSearchParams()
  const { toast } = useToast()

  const roomId = params.roomId as string
  const nickname = searchParams.get("nickname") || ""

  const [copied, setCopied] = useState(false)
  const messagesEndRef = useRef<HTMLDivElement>(null)

  const { messages, users, isConnected, timeLeft, roomExpired, sendMessage, sendFile } = useChat({ roomId, nickname })

  // Auto-scroll to bottom when new messages arrive
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" })
  }, [messages])

  const copyRoomUrl = async () => {
    const url = window.location.href
    try {
      await navigator.clipboard.writeText(url)
      setCopied(true)
      toast({
        title: "URLをコピーしました",
        description: "他の人にこのURLを共有してください",
      })
      setTimeout(() => setCopied(false), 2000)
    } catch (err) {
      toast({
        title: "コピーに失敗しました",
        description: "URLを手動でコピーしてください",
        variant: "destructive",
      })
    }
  }

  if (!nickname) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-cyan-400 to-blue-500 flex items-center justify-center">
        <Card className="w-full max-w-md bg-white shadow-xl">
          <CardHeader>
            <CardTitle className="text-center">アクセスエラー</CardTitle>
          </CardHeader>
          <CardContent className="text-center">
            <p className="text-muted-foreground mb-4">ニックネームが設定されていません</p>
            <Button onClick={() => (window.location.href = "/")}>
              <Home className="w-4 h-4 mr-2" />
              ホームに戻る
            </Button>
          </CardContent>
        </Card>
      </div>
    )
  }

  if (roomExpired) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-cyan-400 to-blue-500 flex items-center justify-center">
        <Card className="w-full max-w-md bg-white shadow-xl">
          <CardHeader>
            <CardTitle className="text-center text-destructive">ルーム期限切れ</CardTitle>
          </CardHeader>
          <CardContent className="text-center">
            <p className="text-muted-foreground mb-4">このルームは24時間の制限時間に達したため削除されました</p>
            <Button onClick={() => (window.location.href = "/")}>
              <Home className="w-4 h-4 mr-2" />
              新しいルームを作成
            </Button>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-200 via-purple-300 to-purple-400 flex flex-col relative overflow-hidden">
      {/* 背景装飾 */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-20 left-4 w-16 h-16 bg-purple-300/10 rounded-full animate-pulse"></div>
        <div className="absolute top-40 right-8 w-12 h-12 bg-purple-300/10 rounded-full animate-bounce"></div>
        <div className="absolute bottom-40 left-8 w-20 h-20 bg-purple-300/10 rounded-full animate-pulse"></div>
        <div className="absolute bottom-20 right-4 w-14 h-14 bg-purple-300/10 rounded-full animate-bounce"></div>
      </div>

      {/* Header - Mobile First */}
      <div className="border-b border-purple-200/50 bg-white/95 backdrop-blur-sm shadow-lg relative z-10">
        <div className="px-4 py-3 sm:px-6 sm:py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2 sm:gap-3">
              <div className="w-8 h-8 sm:w-10 sm:h-10 bg-gradient-to-br from-purple-400 to-purple-600 rounded-full flex items-center justify-center shadow-md">
                <div className="w-4 h-4 sm:w-5 sm:h-5 bg-white/20 rounded-full flex items-center justify-center">
                  <div className="w-2 h-2 sm:w-2.5 sm:h-2.5 bg-white rounded-sm"></div>
                </div>
              </div>
              <div>
                <h1 className="text-lg sm:text-xl font-bold text-gray-800">Chatty</h1>
                <div className="flex items-center gap-1 sm:gap-2 text-xs sm:text-sm text-gray-600">
                  {isConnected ? (
                    <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                  ) : (
                    <div className="w-2 h-2 bg-red-500 rounded-full"></div>
                  )}
                  <span className="hidden sm:inline">{isConnected ? "接続中" : "接続を試行中..."}</span>
                  <span className="sm:hidden">{isConnected ? "接続中" : "接続中..."}</span>
                </div>
              </div>
            </div>

            <div className="flex items-center gap-1 sm:gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={copyRoomUrl}
                className="flex items-center gap-1 sm:gap-2 bg-purple-50 border-purple-200 text-purple-600 hover:bg-purple-100 text-xs sm:text-sm px-2 sm:px-3 rounded-xl"
              >
                {copied ? <CheckCircle className="w-3 h-3 sm:w-4 sm:h-4" /> : <Copy className="w-3 h-3 sm:w-4 sm:h-4" />}
                <span className="hidden sm:inline">{copied ? "コピー済み" : "URLをコピー"}</span>
                <span className="sm:hidden">{copied ? "✓" : "📋"}</span>
              </Button>

              <Button 
                variant="ghost" 
                size="sm" 
                onClick={() => (window.location.href = "/")}
                className="p-2 hover:bg-purple-50 rounded-xl"
              >
                <Home className="w-4 h-4 text-gray-600" />
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* Main Chat Area - Mobile First */}
      <div className="flex-1 flex flex-col lg:flex-row relative z-10">
        {/* Messages - Full width on mobile, flex-1 on desktop */}
        <div className="flex-1 flex flex-col">
          <div className="flex-1 bg-white/95 backdrop-blur-sm mx-2 my-2 sm:mx-4 sm:my-4 rounded-3xl shadow-lg border-0">
            <ScrollArea className="flex-1 p-3 sm:p-4">
              <div className="max-w-4xl mx-auto">
                {messages.length === 0 ? (
                  <div className="text-center py-8 sm:py-12">
                    <div className="w-16 h-16 sm:w-20 sm:h-20 bg-gradient-to-br from-purple-400 to-purple-600 rounded-full flex items-center justify-center mx-auto mb-4 shadow-lg">
                      <div className="w-6 h-6 sm:w-8 sm:h-8 bg-white/20 rounded-full flex items-center justify-center">
                        <div className="w-3 h-3 sm:w-4 sm:h-4 bg-white rounded-sm"></div>
                      </div>
                    </div>
                    <p className="text-gray-600 mb-2 sm:mb-4 text-sm sm:text-base font-medium">まだメッセージがありません</p>
                    <p className="text-xs sm:text-sm text-gray-500">最初のメッセージを送信してチャットを始めましょう</p>
                  </div>
                ) : (
                  messages.map((message) => (
                    <ChatMessage
                      key={message.id}
                      message={message}
                      currentUser={nickname}
                      isSystem={message.type === "system"}
                    />
                  ))
                )}
                <div ref={messagesEndRef} />
              </div>
            </ScrollArea>

            <div className="max-w-4xl mx-auto w-full p-3 sm:p-4">
              <ChatInput onSendMessage={sendMessage} onSendFile={sendFile} disabled={!isConnected || roomExpired} />
            </div>
          </div>
        </div>

        {/* Users Sidebar - Hidden on mobile, visible on desktop */}
        <div className="hidden lg:block bg-white/95 backdrop-blur-sm mr-4 my-4 rounded-3xl shadow-lg w-80 border-0">
          <UserList users={users} currentUser={nickname} roomTimeLeft={timeLeft} />
        </div>
      </div>

      {/* Mobile Users Panel - Bottom sheet style */}
      <div className="lg:hidden bg-white/95 backdrop-blur-sm border-t border-purple-200/50 relative z-10">
        <div className="px-4 py-4">
          <div className="flex items-center justify-between mb-3">
            <span className="text-sm font-medium text-gray-800">
              参加者
            </span>
            <span className="text-xs text-gray-500 bg-purple-100 px-2 py-1 rounded-full">
              {users.length}人
            </span>
          </div>
          <div className="flex gap-3 overflow-x-auto pb-2">
            {users.map((user) => (
              <div key={user.nickname} className="flex-shrink-0 flex flex-col items-center gap-2">
                <div className="w-10 h-10 bg-gradient-to-br from-purple-400 to-purple-600 rounded-full flex items-center justify-center shadow-md">
                  <span className="text-sm text-white font-medium">
                    {user.nickname.slice(0, 1)}
                  </span>
                </div>
                <span className="text-xs text-gray-600 font-medium text-center max-w-16 truncate">{user.nickname}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}
