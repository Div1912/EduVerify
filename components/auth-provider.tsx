"use client"

import { createContext, useState, useEffect, type ReactNode } from "react"
import { useWeb3 } from "@/hooks/use-web3"
import { useToast } from "@/hooks/use-toast"

interface User {
  id: string
  name: string
  email?: string
  accountType: "student" | "institution"
  walletAddress?: string
}

interface AuthContextType {
  user: User | null
  isLoading: boolean
  login: (email: string, password: string) => Promise<void>
  register: (userData: any) => Promise<void>
  logout: () => Promise<void>
  linkWallet: (address: string) => Promise<void>
  disconnectWallet: () => Promise<void>
  updateAccountType: (accountType: "student" | "institution") => Promise<void>
}

export const AuthContext = createContext<AuthContextType>({
  user: null,
  isLoading: true,
  login: async () => {},
  register: async () => {},
  logout: async () => {},
  linkWallet: async () => {},
  disconnectWallet: async () => {},
  updateAccountType: async () => {},
})

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const { address, connectWallet, disconnectWallet: disconnectWeb3Wallet } = useWeb3()
  const { toast } = useToast()

  // Check for existing user session on load
  useEffect(() => {
    const checkSession = async () => {
      try {
        // Check if user is stored in localStorage
        const storedUser = localStorage.getItem("eduverify_user")
        if (storedUser) {
          const parsedUser = JSON.parse(storedUser)
          setUser(parsedUser)
        }
      } catch (error) {
        console.error("Error checking session:", error)
      } finally {
        setIsLoading(false)
      }
    }

    checkSession()
  }, [])

  // Handle wallet connection
  useEffect(() => {
    const handleWalletConnection = async () => {
      if (address && !isLoading) {
        // Check if there's already a user with this wallet
        const storedUser = localStorage.getItem("eduverify_user")

        if (storedUser) {
          const parsedUser = JSON.parse(storedUser)

          // If the user doesn't have a wallet or has a different wallet, update it
          if (!parsedUser.walletAddress || parsedUser.walletAddress !== address) {
            await linkWallet(address)
          }
        } else {
          // No user found, create a new one based on wallet
          try {
            // In a real app, you would make an API call to check if this wallet is registered
            // For now, we'll create a new user with default values
            const newUser: User = {
              id: `wallet-${address}`,
              name: `User ${address.slice(0, 6)}`,
              accountType: "student", // Default to student for wallet connections
              walletAddress: address,
            }

            setUser(newUser)
            localStorage.setItem("eduverify_user", JSON.stringify(newUser))

            toast({
              title: "Wallet account created",
              description:
                "A new account has been created with your wallet. You can update your account type in settings.",
            })
          } catch (error) {
            console.error("Error creating wallet user:", error)
            toast({
              title: "Account creation failed",
              description: "Could not create an account with your wallet.",
              variant: "destructive",
            })
          }
        }
      }
    }

    handleWalletConnection()
  }, [address, isLoading, toast])

  const login = async (email: string, password: string) => {
    try {
      setIsLoading(true)

      // In a real implementation, you would make an API call to authenticate
      // For demo purposes, we'll simulate a successful login

      // Check if this is an institution email (contains "institution")
      const isInstitution = email.includes("institution")

      const user: User = {
        id: Math.random().toString(36).substring(2, 9),
        name: isInstitution ? email.split("@")[0] + " University" : email.split("@")[0],
        email,
        accountType: isInstitution ? "institution" : "student",
      }

      // If wallet is connected, link it to this account
      if (address) {
        user.walletAddress = address
      }

      setUser(user)
      localStorage.setItem("eduverify_user", JSON.stringify(user))

      toast({
        title: "Login successful",
        description: `Welcome back, ${user.name}!`,
      })
    } catch (error) {
      console.error("Login error:", error)
      toast({
        title: "Login failed",
        description: "Invalid email or password.",
        variant: "destructive",
      })
      throw error
    } finally {
      setIsLoading(false)
    }
  }

  const register = async (userData: any) => {
    try {
      setIsLoading(true)

      // In a real implementation, you would make an API call to register
      // For demo purposes, we'll simulate a successful registration

      const user: User = {
        id: Math.random().toString(36).substring(2, 9),
        name: userData.name,
        email: userData.email,
        accountType: userData.accountType,
      }

      // If wallet is connected, link it to this account
      if (address) {
        user.walletAddress = address
      }

      setUser(user)
      localStorage.setItem("eduverify_user", JSON.stringify(user))

      toast({
        title: "Registration successful",
        description: `Welcome, ${user.name}!`,
      })
    } catch (error) {
      console.error("Registration error:", error)
      toast({
        title: "Registration failed",
        description: "Could not create your account.",
        variant: "destructive",
      })
      throw error
    } finally {
      setIsLoading(false)
    }
  }

  const linkWallet = async (walletAddress: string) => {
    try {
      if (!user) {
        throw new Error("No user logged in")
      }

      // Update the user with the wallet address
      const updatedUser = {
        ...user,
        walletAddress,
      }

      setUser(updatedUser)
      localStorage.setItem("eduverify_user", JSON.stringify(updatedUser))

      toast({
        title: "Wallet linked",
        description: "Your wallet has been linked to your account.",
      })
    } catch (error) {
      console.error("Error linking wallet:", error)
      toast({
        title: "Wallet linking failed",
        description: "Could not link your wallet to your account.",
        variant: "destructive",
      })
      throw error
    }
  }

  const disconnectWallet = async () => {
    try {
      if (!user) return

      // Disconnect from Web3 provider
      await disconnectWeb3Wallet()

      // Update user without wallet address
      const updatedUser = {
        ...user,
        walletAddress: undefined,
      }

      setUser(updatedUser)
      localStorage.setItem("eduverify_user", JSON.stringify(updatedUser))

      toast({
        title: "Wallet disconnected",
        description: "Your wallet has been disconnected from your account.",
      })
    } catch (error) {
      console.error("Error disconnecting wallet:", error)
      toast({
        title: "Wallet disconnection failed",
        description: "Could not disconnect your wallet.",
        variant: "destructive",
      })
    }
  }

  const updateAccountType = async (accountType: "student" | "institution") => {
    try {
      if (!user) {
        throw new Error("No user logged in")
      }

      // Update the user's account type
      const updatedUser = {
        ...user,
        accountType,
      }

      setUser(updatedUser)
      localStorage.setItem("eduverify_user", JSON.stringify(updatedUser))

      toast({
        title: "Account type updated",
        description: `Your account type has been updated to ${accountType}.`,
      })
    } catch (error) {
      console.error("Error updating account type:", error)
      toast({
        title: "Update failed",
        description: "Could not update your account type.",
        variant: "destructive",
      })
      throw error
    }
  }

  const logout = async () => {
    try {
      // If user has a wallet connected, disconnect it
      if (user?.walletAddress) {
        await disconnectWeb3Wallet()
      }

      // Clear user data
      setUser(null)
      localStorage.removeItem("eduverify_user")

      toast({
        title: "Logged out",
        description: "You have been logged out successfully.",
      })
    } catch (error) {
      console.error("Error during logout:", error)
      toast({
        title: "Logout error",
        description: "There was an issue during logout. Please try again.",
        variant: "destructive",
      })
    }
  }

  return (
    <AuthContext.Provider
      value={{
        user,
        isLoading,
        login,
        register,
        logout,
        linkWallet,
        disconnectWallet,
        updateAccountType,
      }}
    >
      {children}
    </AuthContext.Provider>
  )
}

