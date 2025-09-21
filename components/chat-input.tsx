"use client"

import type React from "react"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { Send, Paperclip, X } from "lucide-react"
import { useToast } from "@/hooks/use-toast"
import { FileUploadZone } from "./file-upload-zone"
import { FilePreview } from "./file-preview"

interface ChatInputProps {
  onSendMessage: (content: string) => void
  onSendFile: (file: File) => void
  disabled?: boolean
}

export function ChatInput({ onSendMessage, onSendFile, disabled = false }: ChatInputProps) {
  const [message, setMessage] = useState("")
  const [selectedFile, setSelectedFile] = useState<File | null>(null)
  const [previewUrl, setPreviewUrl] = useState<string | null>(null)
  const [showUploadZone, setShowUploadZone] = useState(false)
  const { toast } = useToast()

  const handleSend = () => {
    if (selectedFile) {
      onSendFile(selectedFile)
      clearFile()
    } else if (message.trim()) {
      onSendMessage(message.trim())
      setMessage("")
    }
  }

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault()
      handleSend()
    }
  }

  const handleFileSelect = (file: File) => {
    setSelectedFile(file)
    const url = URL.createObjectURL(file)
    setPreviewUrl(url)
    setShowUploadZone(false)
  }

  const clearFile = () => {
    setSelectedFile(null)
    if (previewUrl) {
      URL.revokeObjectURL(previewUrl)
      setPreviewUrl(null)
    }
    setShowUploadZone(false)
  }

  const downloadFile = () => {
    if (selectedFile && previewUrl) {
      const link = document.createElement("a")
      link.href = previewUrl
      link.download = selectedFile.name
      document.body.appendChild(link)
      link.click()
      document.body.removeChild(link)
    }
  }

  const canSend = (message.trim() || selectedFile) && !disabled

  return (
    <div className="border-t border-purple-200/50 bg-white/95 backdrop-blur-sm">
      {/* Upload Zone */}
      {showUploadZone && !selectedFile && (
        <div className="p-3 sm:p-4 border-b border-purple-200/50">
          <div className="flex items-center justify-between mb-2 sm:mb-3">
            <h3 className="text-sm font-medium text-gray-700">
              ファイルをアップロード
            </h3>
            <Button variant="ghost" size="sm" onClick={() => setShowUploadZone(false)} className="hover:bg-purple-50">
              <X className="w-4 h-4" />
            </Button>
          </div>
          <FileUploadZone onFileSelect={handleFileSelect} disabled={disabled} />
        </div>
      )}

      {/* File Preview */}
      {selectedFile && previewUrl && (
        <div className="p-3 sm:p-4 border-b border-purple-200/50">
          <div className="flex items-start gap-2 sm:gap-3">
            <div className="flex-1">
              <FilePreview
                file={selectedFile}
                fileUrl={previewUrl}
                onRemove={clearFile}
                onDownload={downloadFile}
                compact={true}
              />
            </div>
          </div>
        </div>
      )}

      {/* Input Area */}
      <div className="p-3 sm:p-4">
        <div className="flex gap-2">
          <Button
            variant="outline"
            size="icon"
            onClick={() => setShowUploadZone(!showUploadZone)}
            disabled={disabled || !!selectedFile}
            className={`flex-shrink-0 w-8 h-8 sm:w-10 sm:h-10 rounded-xl border-purple-200 hover:bg-purple-50 ${
              showUploadZone ? "bg-purple-100 text-purple-600 border-purple-300" : "text-gray-600"
            }`}
          >
            <Paperclip className="w-4 h-4" />
          </Button>

          {selectedFile ? (
            <div className="flex-1 flex items-center px-3 py-2 bg-gradient-to-r from-purple-50 to-purple-100 rounded-xl border border-purple-200">
              <span className="text-xs sm:text-sm text-gray-600">
                ファイルを送信する準備ができました
              </span>
            </div>
          ) : (
            <Textarea
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              onKeyPress={handleKeyPress}
              placeholder="メッセージを入力..."
              className="flex-1 min-h-[36px] sm:min-h-[40px] max-h-24 sm:max-h-32 resize-none text-sm border-purple-200 focus:border-purple-400 focus:ring-purple-400 rounded-xl"
              disabled={disabled}
              maxLength={1000}
            />
          )}

          <Button 
            onClick={handleSend} 
            disabled={!canSend} 
            className="flex-shrink-0 w-8 h-8 sm:w-10 sm:h-10 bg-gradient-to-r from-purple-500 to-purple-600 hover:from-purple-600 hover:to-purple-700 text-white border-0 rounded-xl shadow-md transform hover:scale-105 transition-all duration-200"
          >
            <Send className="w-4 h-4" />
          </Button>
        </div>

        <div className="flex justify-between items-center mt-2 text-xs text-gray-500">
          <span className="hidden sm:inline">
            画像・動画ファイル対応 (最大50MB)
          </span>
          <span className="sm:hidden">
            ファイル対応
          </span>
          {!selectedFile && <span>{message.length}/1000</span>}
        </div>
      </div>
    </div>
  )
}
