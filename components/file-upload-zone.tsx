"use client"

import type React from "react"

import { useCallback, useState } from "react"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Progress } from "@/components/ui/progress"
import { Upload, FileImage, FileVideo } from "lucide-react"
import { useToast } from "@/hooks/use-toast"

interface FileUploadZoneProps {
  onFileSelect: (file: File) => void
  maxSize?: number // in MB
  acceptedTypes?: string[]
  disabled?: boolean
}

export function FileUploadZone({
  onFileSelect,
  maxSize = 50,
  acceptedTypes = ["image/*", "video/*"],
  disabled = false,
}: FileUploadZoneProps) {
  const [isDragOver, setIsDragOver] = useState(false)
  const [uploadProgress, setUploadProgress] = useState(0)
  const [isUploading, setIsUploading] = useState(false)
  const { toast } = useToast()

  const validateFile = (file: File): boolean => {
    // Check file size
    if (file.size > maxSize * 1024 * 1024) {
      toast({
        title: "ファイルサイズエラー",
        description: `ファイルサイズは${maxSize}MB以下にしてください`,
        variant: "destructive",
      })
      return false
    }

    // Check file type
    const isValidType = acceptedTypes.some((type) => {
      if (type.endsWith("/*")) {
        return file.type.startsWith(type.replace("/*", "/"))
      }
      return file.type === type
    })

    if (!isValidType) {
      toast({
        title: "ファイル形式エラー",
        description: "画像または動画ファイルのみアップロード可能です",
        variant: "destructive",
      })
      return false
    }

    return true
  }

  const handleFileSelect = useCallback(
    (file: File) => {
      if (!validateFile(file)) return

      // Simulate upload progress
      setIsUploading(true)
      setUploadProgress(0)

      const interval = setInterval(() => {
        setUploadProgress((prev) => {
          if (prev >= 100) {
            clearInterval(interval)
            setIsUploading(false)
            onFileSelect(file)
            return 100
          }
          return prev + 10
        })
      }, 100)
    },
    [onFileSelect, maxSize, acceptedTypes],
  )

  const handleDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault()
      setIsDragOver(false)

      if (disabled || isUploading) return

      const files = Array.from(e.dataTransfer.files)
      if (files.length > 0) {
        handleFileSelect(files[0])
      }
    },
    [handleFileSelect, disabled, isUploading],
  )

  const handleDragOver = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault()
      if (!disabled && !isUploading) {
        setIsDragOver(true)
      }
    },
    [disabled, isUploading],
  )

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    setIsDragOver(false)
  }, [])

  const handleFileInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files
    if (files && files.length > 0) {
      handleFileSelect(files[0])
    }
    // Reset input
    e.target.value = ""
  }

  const formatFileSize = (bytes: number): string => {
    if (bytes === 0) return "0 Bytes"
    const k = 1024
    const sizes = ["Bytes", "KB", "MB", "GB"]
    const i = Math.floor(Math.log(bytes) / Math.log(k))
    return Number.parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + " " + sizes[i]
  }

  return (
    <Card
      className={`relative border-2 border-dashed transition-colors ${
        isDragOver
          ? "border-primary bg-primary/5"
          : disabled
            ? "border-muted bg-muted/20"
            : "border-border hover:border-primary/50"
      }`}
      onDrop={handleDrop}
      onDragOver={handleDragOver}
      onDragLeave={handleDragLeave}
    >
      <div className="p-6 text-center">
        {isUploading ? (
          <div className="space-y-4">
            <div className="flex justify-center">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
            </div>
            <div>
              <p className="text-sm font-medium mb-2">アップロード中...</p>
              <Progress value={uploadProgress} className="w-full" />
              <p className="text-xs text-muted-foreground mt-1">{uploadProgress}%</p>
            </div>
          </div>
        ) : (
          <div className="space-y-4">
            <div className="flex justify-center">
              <Upload className="h-10 w-10 text-muted-foreground" />
            </div>

            <div>
              <p className="text-sm font-medium mb-1">ファイルをドラッグ&ドロップ</p>
              <p className="text-xs text-muted-foreground mb-4">または下のボタンをクリック</p>

              <input
                type="file"
                accept={acceptedTypes.join(",")}
                onChange={handleFileInput}
                disabled={disabled}
                className="hidden"
                id="file-upload"
              />

              <Button
                variant="outline"
                size="sm"
                disabled={disabled}
                onClick={() => document.getElementById("file-upload")?.click()}
              >
                ファイルを選択
              </Button>
            </div>

            <div className="flex justify-center gap-4 text-xs text-muted-foreground">
              <div className="flex items-center gap-1">
                <FileImage className="w-3 h-3" />
                <span>画像</span>
              </div>
              <div className="flex items-center gap-1">
                <FileVideo className="w-3 h-3" />
                <span>動画</span>
              </div>
            </div>

            <p className="text-xs text-muted-foreground">最大 {maxSize}MB まで</p>
          </div>
        )}
      </div>
    </Card>
  )
}
