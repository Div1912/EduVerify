"use client"

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { useAuth } from "@/hooks/use-auth"
import { useWeb3 } from "@/hooks/use-web3"
import { useRouter } from "next/navigation"
import { useState } from "react"
import { Loader2 } from "lucide-react"

export function UserNav() {
  const { user, logout, disconnectWallet } = useAuth()
  const { address } = useWeb3()
  const router = useRouter()
  const [isLoggingOut, setIsLoggingOut] = useState(false)
  const [isDisconnecting, setIsDisconnecting] = useState(false)

  const handleLogout = async () => {
    try {
      setIsLoggingOut(true)
      await logout()
      router.push("/")
    } catch (error) {
      console.error("Logout error:", error)
    } finally {
      setIsLoggingOut(false)
    }
  }

  const handleDisconnectWallet = async () => {
    try {
      setIsDisconnecting(true)
      await disconnectWallet()
    } catch (error) {
      console.error("Disconnect wallet error:", error)
    } finally {
      setIsDisconnecting(false)
    }
  }

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" className="relative h-8 w-8 rounded-full">
          <Avatar className="h-8 w-8">
            <AvatarImage src="/placeholder.svg" alt={user?.name || "User"} />
            <AvatarFallback>{user?.name?.charAt(0) || "U"}</AvatarFallback>
          </Avatar>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent className="w-56" align="end" forceMount>
        <DropdownMenuLabel className="font-normal">
          <div className="flex flex-col space-y-1">
            <p className="text-sm font-medium leading-none">{user?.name}</p>
            <p className="text-xs leading-none text-muted-foreground">
              {user?.email || user?.walletAddress?.slice(0, 6) + "..." + user?.walletAddress?.slice(-4)}
            </p>
            <p className="text-xs leading-none text-muted-foreground mt-1 capitalize">
              {user?.accountType || "Student"}
            </p>
          </div>
        </DropdownMenuLabel>
        <DropdownMenuSeparator />
        <DropdownMenuGroup>
          <DropdownMenuItem onClick={() => router.push("/dashboard")}>Dashboard</DropdownMenuItem>
          <DropdownMenuItem onClick={() => router.push("/dashboard/credentials")}>My Credentials</DropdownMenuItem>
          <DropdownMenuItem onClick={() => router.push("/dashboard/settings")}>Settings</DropdownMenuItem>
          {user?.accountType === "student" && (
            <DropdownMenuItem onClick={() => router.push("/dashboard/reputation")}>Reputation</DropdownMenuItem>
          )}
          {user?.accountType === "institution" && (
            <DropdownMenuItem onClick={() => router.push("/dashboard/issued")}>Issued Credentials</DropdownMenuItem>
          )}
        </DropdownMenuGroup>
        <DropdownMenuSeparator />
        {address && (
          <DropdownMenuItem disabled={isDisconnecting} onClick={handleDisconnectWallet}>
            {isDisconnecting ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Disconnecting...
              </>
            ) : (
              "Disconnect Wallet"
            )}
          </DropdownMenuItem>
        )}
        <DropdownMenuItem disabled={isLoggingOut} onClick={handleLogout}>
          {isLoggingOut ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Logging out...
            </>
          ) : (
            "Log out"
          )}
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}

