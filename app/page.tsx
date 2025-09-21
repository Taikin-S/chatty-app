"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import Image from "next/image"

export default function HomePage() {
  const [nickname, setNickname] = useState("")
  const [roomId, setRoomId] = useState("")

  const createRoom = () => {
    // Generate random room ID
    const newRoomId = Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15)
    window.location.href = `/room/${newRoomId}?nickname=${encodeURIComponent(nickname)}`
  }

  const joinRoom = () => {
    if (roomId && nickname) {
      window.location.href = `/room/${roomId}?nickname=${encodeURIComponent(nickname)}`
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-200 via-purple-300 to-purple-400 relative overflow-hidden">
      {/* 可愛い背景装飾 */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute top-10 left-10 w-20 h-20 bg-purple-200/30 rounded-full animate-pulse"></div>
        <div className="absolute top-32 right-16 w-16 h-16 bg-purple-200/30 rounded-full animate-bounce"></div>
        <div className="absolute bottom-20 left-20 w-24 h-24 bg-purple-200/30 rounded-full animate-pulse"></div>
        <div className="absolute bottom-32 right-10 w-12 h-12 bg-purple-200/30 rounded-full animate-bounce"></div>
      </div>
      
      <div className="container mx-auto px-4 py-8 sm:py-16 relative z-10">
        <div className="max-w-md mx-auto">
          <div className="text-center mb-6 sm:mb-8">
            <div className="flex items-center justify-center mb-3 sm:mb-4">
              <div className="w-20 h-20 sm:w-32 sm:h-32 bg-gradient-to-br from-purple-400 to-purple-600 rounded-full flex items-center justify-center shadow-lg">
                <div className="w-8 h-8 sm:w-12 sm:h-12 bg-white/20 rounded-full flex items-center justify-center">
                  <div className="w-4 h-4 sm:w-6 sm:h-6 bg-white rounded-sm"></div>
                </div>
              </div>
            </div>
            <h1 className="text-2xl sm:text-3xl font-bold text-white mb-2">Chatty</h1>
            <p className="text-white/90 text-sm sm:text-base">シンプルで美しいチャットアプリ</p>
          </div>

          <Card className="bg-white/95 backdrop-blur-sm shadow-2xl border-0 rounded-3xl">
            <CardHeader className="pb-4 sm:pb-6 text-center">
              <CardTitle className="text-center text-lg sm:text-xl text-gray-800">
                チャットを始める
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4 px-4 sm:px-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  ニックネーム
                </label>
                <Input
                  type="text"
                  placeholder="例: 田中太郎"
                  value={nickname}
                  onChange={(e) => setNickname(e.target.value)}
                  className="w-full border-purple-200 focus:border-purple-400 focus:ring-purple-400 rounded-xl"
                />
              </div>

              <Button 
                onClick={createRoom} 
                disabled={!nickname.trim()} 
                className="w-full bg-gradient-to-r from-purple-500 to-purple-600 hover:from-purple-600 hover:to-purple-700 text-white border-0 rounded-xl shadow-lg transform hover:scale-105 transition-all duration-200" 
                size="lg"
              >
                新しいルームを作成
              </Button>

              <div className="relative">
                <div className="absolute inset-0 flex items-center">
                  <span className="w-full border-t border-purple-200" />
                </div>
                <div className="relative flex justify-center text-xs">
                  <span className="bg-white px-3 text-purple-400 font-medium">または</span>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  ルームID
                </label>
                <Input
                  type="text"
                  placeholder="例: abc123def456"
                  value={roomId}
                  onChange={(e) => setRoomId(e.target.value)}
                  className="w-full border-purple-200 focus:border-purple-400 focus:ring-purple-400 rounded-xl"
                />
              </div>

              <Button
                onClick={joinRoom}
                disabled={!nickname.trim() || !roomId.trim()}
                className="w-full bg-gradient-to-r from-purple-400 to-purple-500 hover:from-purple-500 hover:to-purple-600 text-white border-0 rounded-xl shadow-lg transform hover:scale-105 transition-all duration-200"
                size="lg"
              >
                ルームに参加
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
