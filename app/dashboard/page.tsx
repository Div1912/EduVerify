"use client"

import { useEffect, useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { useAuth } from "@/hooks/use-auth"
import { useWeb3 } from "@/hooks/use-web3"
import { Award, FileCheck, GraduationCap, School, AlertTriangle } from "lucide-react"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"

export default function Dashboard() {
  const { user } = useAuth()
  const { address, contract, isCorrectNetwork, switchNetwork, chainId, networkName } = useWeb3()
  const [credentialCount, setCredentialCount] = useState<number | null>(null)
  const [reputationScore, setReputationScore] = useState(0)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const fetchCredentials = async () => {
      if (!address) return
      if (!isCorrectNetwork) return
      if (!contract) return

      try {
        setIsLoading(true)
        setError(null)

        // Get the balance of NFTs for the current address
        const balance = await contract.balanceOf(address)
        const count = Number(balance)
        setCredentialCount(count)

        // Calculate reputation score based on credentials
        // In a real app, you might have a more complex algorithm
        setReputationScore(count * 10)
      } catch (err) {
        console.error("Error fetching credentials:", err)
        setError("Failed to fetch credential data. Please try again.")
        setCredentialCount(null)
      } finally {
        setIsLoading(false)
      }
    }

    fetchCredentials()
  }, [contract, address, isCorrectNetwork])

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Dashboard</h1>
        <p className="text-muted-foreground">Welcome back, {user?.name || "User"}!</p>
      </div>

      {!isCorrectNetwork && chainId && (
        <Alert variant="warning">
          <AlertTriangle className="h-4 w-4" />
          <AlertTitle>Wrong Network</AlertTitle>
          <AlertDescription className="flex flex-col gap-2">
            <p>
              You are connected to {networkName || "an unsupported network"}. Please switch to the required network to
              view your credentials.
            </p>
            <Button onClick={switchNetwork} variant="outline" size="sm" className="w-fit">
              Switch Network
            </Button>
          </AlertDescription>
        </Alert>
      )}

      {error && (
        <Alert variant="destructive">
          <AlertTriangle className="h-4 w-4" />
          <AlertTitle>Error</AlertTitle>
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Credentials</CardTitle>
            <FileCheck className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <div className="h-8 w-8 animate-spin rounded-full border-2 border-primary border-t-transparent"></div>
            ) : (
              <>
                <div className="text-2xl font-bold">{credentialCount !== null ? credentialCount : "N/A"}</div>
                <p className="text-xs text-muted-foreground">
                  {credentialCount !== null
                    ? "Verified academic credentials"
                    : address
                      ? "Connect to the correct network"
                      : "Connect your wallet to view"}
                </p>
              </>
            )}
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Reputation Score</CardTitle>
            <Award className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <div className="h-8 w-8 animate-spin rounded-full border-2 border-primary border-t-transparent"></div>
            ) : (
              <>
                <div className="text-2xl font-bold">{credentialCount !== null ? reputationScore : "N/A"}</div>
                <p className="text-xs text-muted-foreground">Based on your verified credentials</p>
              </>
            )}
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Wallet Status</CardTitle>
            <School className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{address ? "Connected" : "Not Connected"}</div>
            <p className="text-xs text-muted-foreground">
              {address ? `${address.slice(0, 6)}...${address.slice(-4)}` : "Connect your wallet to view credentials"}
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Account Type</CardTitle>
            <GraduationCap className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold capitalize">{user?.accountType || "Student"}</div>
            <p className="text-xs text-muted-foreground">
              {user?.accountType === "institution" ? "You can issue credentials" : "You can view your credentials"}
            </p>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-7">
        <Card className="col-span-4">
          <CardHeader>
            <CardTitle>Recent Activity</CardTitle>
            <CardDescription>Your recent credential activity</CardDescription>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <div className="flex items-center justify-center py-8">
                <div className="h-8 w-8 animate-spin rounded-full border-2 border-primary border-t-transparent"></div>
              </div>
            ) : credentialCount && credentialCount > 0 ? (
              <div className="space-y-4">
                <div className="flex items-center gap-4 rounded-lg border p-4">
                  <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary/10">
                    <FileCheck className="h-5 w-5 text-primary" />
                  </div>
                  <div>
                    <h4 className="font-medium">Credential #{credentialCount}</h4>
                    <p className="text-sm text-muted-foreground">View details in the Credentials section</p>
                  </div>
                </div>
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center py-8 text-center">
                <GraduationCap className="h-12 w-12 text-muted-foreground" />
                <h3 className="mt-4 text-lg font-medium">No credentials yet</h3>
                <p className="mt-2 text-sm text-muted-foreground">
                  {!address
                    ? "Connect your wallet to view your credentials"
                    : !isCorrectNetwork
                      ? "Switch to the correct network to view your credentials"
                      : "You don't have any credentials yet. They will appear here once issued."}
                </p>
              </div>
            )}
          </CardContent>
        </Card>
        <Card className="col-span-3">
          <CardHeader>
            <CardTitle>Reputation Overview</CardTitle>
            <CardDescription>Your academic reputation score</CardDescription>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <div className="flex items-center justify-center py-8">
                <div className="h-8 w-8 animate-spin rounded-full border-2 border-primary border-t-transparent"></div>
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center space-y-4 py-4">
                <div className="relative h-40 w-40">
                  <div className="absolute inset-0 flex items-center justify-center">
                    <div className="text-center">
                      <div className="text-5xl font-bold">{reputationScore}</div>
                      <div className="text-sm text-muted-foreground">Reputation Score</div>
                    </div>
                  </div>
                  <svg className="h-full w-full" viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg">
                    <circle
                      cx="50"
                      cy="50"
                      r="45"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="10"
                      strokeOpacity="0.1"
                    />
                    <circle
                      cx="50"
                      cy="50"
                      r="45"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="10"
                      strokeDasharray={`${(reputationScore / 100) * 283} 283`}
                      strokeDashoffset="0"
                      strokeLinecap="round"
                      transform="rotate(-90 50 50)"
                      className="text-primary"
                    />
                  </svg>
                </div>
                <div className="text-center">
                  <p className="text-sm text-muted-foreground">
                    Your reputation is based on your verified credentials and their importance.
                  </p>
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  )
}

