"use client"

import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { Button } from "@/components/ui/button"
import { Download, Play, Pause } from "lucide-react"
import { useState, useRef } from "react"

interface Message {
  id: string
  nickname: string
  content: string
  timestamp: Date
  type: "text" | "image" | "video"
  fileUrl?: string
  fileName?: string
}

interface ChatMessageProps {
  message: Message
  currentUser: string
  isSystem?: boolean
}

export function ChatMessage({ message, currentUser, isSystem = false }: ChatMessageProps) {
  const [isPlaying, setIsPlaying] = useState(false)
  const videoRef = useRef<HTMLVideoElement>(null)

  const isOwn = message.nickname === currentUser
  const isSystemMessage = message.nickname === "システム" || isSystem

  const handleVideoPlay = () => {
    if (videoRef.current) {
      if (isPlaying) {
        videoRef.current.pause()
      } else {
        videoRef.current.play()
      }
      setIsPlaying(!isPlaying)
    }
  }

  const downloadFile = () => {
    if (message.fileUrl && message.fileName) {
      const link = document.createElement("a")
      link.href = message.fileUrl
      link.download = message.fileName
      document.body.appendChild(link)
      link.click()
      document.body.removeChild(link)
    }
  }

  if (isSystemMessage) {
    return (
      <div className="flex justify-center my-4">
        <div className="bg-gradient-to-r from-purple-100 to-purple-200 text-gray-600 px-4 py-2 rounded-full text-sm italic border border-purple-200 shadow-sm">
          {message.content}
        </div>
      </div>
    )
  }

  return (
    <div className={`flex gap-2 sm:gap-3 mb-3 sm:mb-4 ${isOwn ? "justify-end" : "justify-start"}`}>
      {!isOwn && (
        <div className="w-6 h-6 sm:w-8 sm:h-8 bg-gradient-to-br from-purple-400 to-purple-500 rounded-full flex items-center justify-center flex-shrink-0 shadow-md">
          <span className="text-white text-xs font-bold">
            {message.nickname.slice(0, 1)}
          </span>
        </div>
      )}

      <div className={`max-w-[75%] sm:max-w-xs lg:max-w-md ${isOwn ? "order-first" : ""}`}>
        {!isOwn && (
          <div className="flex items-center gap-1 sm:gap-2 mb-1">
            <span className="text-xs font-medium text-gray-600">{message.nickname}</span>
            <span className="text-xs text-gray-500">
              {new Date(message.timestamp).toLocaleTimeString("ja-JP", {
                hour: "2-digit",
                minute: "2-digit",
              })}
            </span>
          </div>
        )}

        <div
          className={`px-3 py-2 sm:px-4 sm:py-2 rounded-2xl shadow-sm ${
            isOwn 
              ? "bg-gradient-to-r from-purple-500 to-purple-600 text-white" 
              : "bg-white text-gray-800 border border-purple-200"
          }`}
        >
          <p className="text-sm whitespace-pre-wrap break-words">{message.content}</p>

          {/* Image Display */}
          {message.fileUrl && message.type === "image" && (
            <div className="mt-2 relative group">
              <img
                src={message.fileUrl || "/placeholder.svg"}
                alt={message.fileName || "Shared image"}
                className="max-w-full rounded-xl cursor-pointer hover:opacity-90 transition-opacity shadow-md"
                onClick={() => window.open(message.fileUrl, "_blank")}
              />
              <Button
                variant="secondary"
                size="sm"
                className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity hidden sm:flex bg-white/90 hover:bg-white"
                onClick={downloadFile}
              >
                <Download className="w-3 h-3" />
              </Button>
            </div>
          )}

          {/* Video Display */}
          {message.fileUrl && message.type === "video" && (
            <div className="mt-2 relative group">
              <video
                ref={videoRef}
                src={message.fileUrl}
                className="max-w-full rounded-xl shadow-md"
                onPlay={() => setIsPlaying(true)}
                onPause={() => setIsPlaying(false)}
                onEnded={() => setIsPlaying(false)}
              />
              <div className="flex gap-2 mt-2">
                <Button variant="secondary" size="sm" onClick={handleVideoPlay} className="flex items-center gap-1 text-xs bg-purple-100 hover:bg-purple-200 text-purple-700">
                  {isPlaying ? <Pause className="w-3 h-3" /> : <Play className="w-3 h-3" />}
                  <span className="hidden sm:inline">{isPlaying ? "一時停止" : "再生"}</span>
                </Button>
                <Button variant="secondary" size="sm" onClick={downloadFile} className="flex items-center gap-1 text-xs bg-purple-100 hover:bg-purple-200 text-purple-700">
                  <Download className="w-3 h-3" />
                  <span className="hidden sm:inline">ダウンロード</span>
                </Button>
              </div>
            </div>
          )}
        </div>

        {isOwn && (
          <div className="text-right mt-1">
            <span className="text-xs text-gray-500">
              {new Date(message.timestamp).toLocaleTimeString("ja-JP", {
                hour: "2-digit",
                minute: "2-digit",
              })}
            </span>
          </div>
        )}
      </div>

      {isOwn && (
        <div className="w-6 h-6 sm:w-8 sm:h-8 bg-gradient-to-br from-purple-500 to-purple-600 rounded-full flex items-center justify-center flex-shrink-0 shadow-md">
          <span className="text-white text-xs font-bold">
            {message.nickname.slice(0, 1)}
          </span>
        </div>
      )}
    </div>
  )
}
