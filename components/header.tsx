"use client"

import { Menu, Cloud, CloudOff, Download, Loader2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { useState, useEffect } from "react"
import { authService } from "@/lib/auth-service"
import type { User } from "@/lib/users-service"
import ProfileModal from "./profile-modal"
import { useOfflineLoad } from "@/hooks/use-offline-load"
import { toast } from "sonner"

interface HeaderProps {
  onMenuClick: () => void
  onLogout?: () => void
}

export default function Header({ onMenuClick }: HeaderProps) {
  const [user, setUser] = useState<User | null>(null)
  const [isProfileOpen, setIsProfileOpen] = useState(false)
  const [isOnline, setIsOnline] = useState(true)
  const { realizarCargaOffline, isLoading } = useOfflineLoad()

  useEffect(() => {
    const currentUser = authService.getCurrentUser()
    setUser(currentUser)

    // Verificar status da conexão
    setIsOnline(navigator.onLine)

    const handleOnline = () => setIsOnline(true)
    const handleOffline = () => {
      setIsOnline(false)
      toast.warning("Você está offline. Os dados serão salvos localmente.")
    }

    window.addEventListener('online', handleOnline)
    window.addEventListener('offline', handleOffline)

    return () => {
      window.removeEventListener('online', handleOnline)
      window.removeEventListener('offline', handleOffline)
    }
  }, [])

  const handleProfileUpdate = (updatedUser: User) => {
    setUser(updatedUser)
  }

  // Dados padrão enquanto carrega
  const displayUser = user || {
    id: 0,
    name: "Carregando...",
    email: "",
    role: "Vendedor" as any,
    avatar: "",
    status: "ativo" as any
  }

  const initials = displayUser.name
    ? displayUser.name
        .split(" ")
        .map((n) => n[0])
        .join("")
        .toUpperCase()
        .slice(0, 2)
    : "U"

  return (
    <>
      <header className="border-b border-sidebar-border px-6 py-4 flex items-center justify-between" style={{ backgroundColor: '#23374f' }}>
        <div className="flex items-center gap-4">
          <Button
            variant="ghost"
            size="icon"
            onClick={onMenuClick}
            className="lg:hidden text-white hover:bg-white/10"
          >
            <Menu className="w-5 h-5" />
          </Button>
        </div>

        {/* Logo móvel centralizado */}
        <div className="absolute left-1/2 -translate-x-1/2 lg:hidden">
          <img 
            src="/logo_mobile.png" 
            alt="Sankhya Logo" 
            className="h-10 w-auto"
          />
        </div>

        <div className="flex items-center gap-3">
          {/* Status Online/Offline */}
          <div className={`flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-medium ${
            isOnline 
              ? 'bg-green-500/20 text-green-300 border border-green-500/30' 
              : 'bg-orange-500/20 text-orange-300 border border-orange-500/30'
          }`}>
            {isOnline ? (
              <>
                <Cloud className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">Online</span>
              </>
            ) : (
              <>
                <CloudOff className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">Offline</span>
              </>
            )}
          </div>

          {/* Botão de Carga Offline - Apenas Desktop */}
          <Button
            onClick={realizarCargaOffline}
            disabled={!isOnline || isLoading}
            size="sm"
            variant="outline"
            className="text-white border-white/20 hover:bg-white/10 hidden md:flex"
          >
            {isLoading ? (
              <>
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                Sincronizando...
              </>
            ) : (
              <>
                <Download className="w-4 h-4 mr-2" />
                Carga Offline
              </>
            )}
          </Button>

          <button
            onClick={() => setIsProfileOpen(true)}
            className="flex items-center gap-3 hover:opacity-80 transition-opacity"
            disabled={!user}
          >
            <div className="text-right hidden md:block">
              <p className="text-sm font-medium text-white">{displayUser.name}</p>
              <p className="text-xs text-white/70">{displayUser.email}</p>
            </div>
            <Avatar className="w-10 h-10 border-2 border-primary">
              <AvatarImage src={displayUser.avatar || "/placeholder-user.png"} alt={displayUser.name} />
              <AvatarFallback className="bg-primary text-primary-foreground font-semibold">{initials}</AvatarFallback>
            </Avatar>
          </button>
        </div>
      </header>

      {user && (
        <ProfileModal
          isOpen={isProfileOpen}
          onClose={() => setIsProfileOpen(false)}
          user={user}
          onUpdate={handleProfileUpdate}
        />
      )}
    </>
  )
}