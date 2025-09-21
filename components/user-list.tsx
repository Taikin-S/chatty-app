import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Users, Clock } from "lucide-react"

interface User {
  nickname: string
  joinedAt: Date
}

interface UserListProps {
  users: User[]
  currentUser: string
  roomTimeLeft: number
}

export function UserList({ users, currentUser, roomTimeLeft }: UserListProps) {
  const formatTime = (seconds: number) => {
    const hours = Math.floor(seconds / 3600)
    const minutes = Math.floor((seconds % 3600) / 60)
    const secs = seconds % 60
    return `${hours.toString().padStart(2, "0")}:${minutes.toString().padStart(2, "0")}:${secs.toString().padStart(2, "0")}`
  }

  const getTimeColor = (seconds: number) => {
    return "text-black" // 常に黒色
  }

  return (
    <div className="w-80 bg-white/95 backdrop-blur-sm flex flex-col h-full">
      {/* Room Info */}
      <div className="p-6 border-b border-purple-200/50">
        <div className="text-center mb-6">
          <div className="flex items-center justify-center gap-2 mb-3">
            <Clock className="w-5 h-5 text-gray-600" />
            <span className="text-sm font-medium text-gray-700">残り時間</span>
          </div>
          <div className={`text-2xl font-mono font-bold ${getTimeColor(roomTimeLeft)}`}>{formatTime(roomTimeLeft)}</div>
          <p className="text-xs text-gray-500 mt-2">自動削除まで</p>
        </div>

        <div className="flex items-center gap-2 text-sm text-gray-600">
          <Users className="w-4 h-4" />
          <span>{users.length}人参加中</span>
        </div>
      </div>

      {/* Users List - Zoom Style */}
      <div className="flex-1 p-6">
        <h3 className="font-semibold text-gray-800 mb-4 text-lg">参加者</h3>
        <ScrollArea className="h-full">
          <div className="space-y-4">
            {users.map((user) => (
              <div key={user.nickname} className="flex items-center gap-4 p-3 rounded-xl hover:bg-purple-50 transition-colors">
                <div className="w-12 h-12 bg-gradient-to-br from-purple-400 to-purple-600 rounded-full flex items-center justify-center shadow-md">
                  <span className="text-white font-medium text-sm">
                    {user.nickname.slice(0, 1)}
                  </span>
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <span className="text-sm text-gray-800 font-medium truncate">{user.nickname}</span>
                    {user.nickname === currentUser && (
                      <Badge variant="secondary" className="text-xs bg-purple-100 text-purple-700 border-purple-200">
                        あなた
                      </Badge>
                    )}
                  </div>
                  <p className="text-xs text-gray-500 mt-1">
                    {new Date(user.joinedAt).toLocaleTimeString("ja-JP", {
                      hour: "2-digit",
                      minute: "2-digit",
                    })}
                    に参加
                  </p>
                </div>
              </div>
            ))}
          </div>
        </ScrollArea>
      </div>
    </div>
  )
}
