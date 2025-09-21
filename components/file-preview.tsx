"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { X, Download, Play, Pause, Volume2, VolumeX, Maximize, FileImage, FileVideo } from "lucide-react"

interface FilePreviewProps {
  file: File
  fileUrl: string
  onRemove?: () => void
  onDownload?: () => void
  showControls?: boolean
  compact?: boolean
}

export function FilePreview({
  file,
  fileUrl,
  onRemove,
  onDownload,
  showControls = true,
  compact = false,
}: FilePreviewProps) {
  const [isPlaying, setIsPlaying] = useState(false)
  const [isMuted, setIsMuted] = useState(false)
  const [showFullscreen, setShowFullscreen] = useState(false)

  const isImage = file.type.startsWith("image/")
  const isVideo = file.type.startsWith("video/")

  const formatFileSize = (bytes: number): string => {
    if (bytes === 0) return "0 Bytes"
    const k = 1024
    const sizes = ["Bytes", "KB", "MB", "GB"]
    const i = Math.floor(Math.log(bytes) / Math.log(k))
    return Number.parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + " " + sizes[i]
  }

  const handleVideoToggle = (video: HTMLVideoElement) => {
    if (isPlaying) {
      video.pause()
    } else {
      video.play()
    }
    setIsPlaying(!isPlaying)
  }

  const handleMuteToggle = (video: HTMLVideoElement) => {
    video.muted = !video.muted
    setIsMuted(video.muted)
  }

  const openFullscreen = () => {
    setShowFullscreen(true)
  }

  if (compact) {
    return (
      <div className="flex items-center gap-2 p-2 bg-muted rounded-lg">
        <div className="flex-shrink-0">
          {isImage ? <FileImage className="w-4 h-4 text-primary" /> : <FileVideo className="w-4 h-4 text-primary" />}
        </div>
        <div className="flex-1 min-w-0">
          <p className="text-sm font-medium truncate">{file.name}</p>
          <p className="text-xs text-muted-foreground">{formatFileSize(file.size)}</p>
        </div>
        {onRemove && (
          <Button variant="ghost" size="sm" onClick={onRemove} className="flex-shrink-0 h-6 w-6 p-0">
            <X className="w-3 h-3" />
          </Button>
        )}
      </div>
    )
  }

  return (
    <>
      <Card className="overflow-hidden">
        <div className="relative group">
          {/* File Content */}
          {isImage && (
            <div className="relative">
              <img
                src={fileUrl || "/placeholder.svg"}
                alt={file.name}
                className="w-full max-h-64 object-cover cursor-pointer"
                onClick={openFullscreen}
              />
              {showControls && (
                <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-colors flex items-center justify-center">
                  <Button
                    variant="secondary"
                    size="sm"
                    className="opacity-0 group-hover:opacity-100 transition-opacity"
                    onClick={openFullscreen}
                  >
                    <Maximize className="w-4 h-4" />
                  </Button>
                </div>
              )}
            </div>
          )}

          {isVideo && (
            <div className="relative">
              <video
                src={fileUrl}
                className="w-full max-h-64 object-cover"
                onPlay={() => setIsPlaying(true)}
                onPause={() => setIsPlaying(false)}
                onEnded={() => setIsPlaying(false)}
                muted={isMuted}
              />
              {showControls && (
                <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-colors flex items-center justify-center">
                  <div className="flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                    <Button
                      variant="secondary"
                      size="sm"
                      onClick={(e) => {
                        const video = e.currentTarget.closest("div")?.querySelector("video")
                        if (video) handleVideoToggle(video)
                      }}
                    >
                      {isPlaying ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4" />}
                    </Button>
                    <Button
                      variant="secondary"
                      size="sm"
                      onClick={(e) => {
                        const video = e.currentTarget.closest("div")?.querySelector("video")
                        if (video) handleMuteToggle(video)
                      }}
                    >
                      {isMuted ? <VolumeX className="w-4 h-4" /> : <Volume2 className="w-4 h-4" />}
                    </Button>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Remove Button */}
          {onRemove && (
            <Button
              variant="destructive"
              size="sm"
              className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity"
              onClick={onRemove}
            >
              <X className="w-3 h-3" />
            </Button>
          )}
        </div>

        {/* File Info */}
        <div className="p-3">
          <div className="flex items-center justify-between">
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium truncate">{file.name}</p>
              <div className="flex items-center gap-2 mt-1">
                <Badge variant="secondary" className="text-xs">
                  {isImage ? "画像" : "動画"}
                </Badge>
                <span className="text-xs text-muted-foreground">{formatFileSize(file.size)}</span>
              </div>
            </div>

            {onDownload && (
              <Button variant="outline" size="sm" onClick={onDownload} className="ml-2 bg-transparent">
                <Download className="w-3 h-3" />
              </Button>
            )}
          </div>
        </div>
      </Card>

      {/* Fullscreen Modal */}
      {showFullscreen && isImage && (
        <div
          className="fixed inset-0 bg-black/90 z-50 flex items-center justify-center p-4"
          onClick={() => setShowFullscreen(false)}
        >
          <div className="relative max-w-full max-h-full">
            <img src={fileUrl || "/placeholder.svg"} alt={file.name} className="max-w-full max-h-full object-contain" />
            <Button
              variant="secondary"
              size="sm"
              className="absolute top-4 right-4"
              onClick={() => setShowFullscreen(false)}
            >
              <X className="w-4 h-4" />
            </Button>
          </div>
        </div>
      )}
    </>
  )
}
