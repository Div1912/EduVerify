"use client"

import { useEffect, useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { useWeb3 } from "@/hooks/use-web3"
import { useAuth } from "@/hooks/use-auth"
import { FileCheck, GraduationCap, ExternalLink, AlertTriangle } from "lucide-react"

interface Credential {
  id: number
  studentName: string
  degree: string
  university: string
  ipfsHash: string
}

export default function Credentials() {
  const { address, contract, isCorrectNetwork, switchNetwork, chainId, networkName } = useWeb3()
  const { user } = useAuth()
  const [credentials, setCredentials] = useState<Credential[]>([])
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

        if (count === 0) {
          setCredentials([])
          return
        }

        const credentialsList: Credential[] = []

        // Fetch each token owned by the address
        for (let i = 0; i < count; i++) {
          try {
            // Get the token ID at the given index
            const tokenId = await contract.tokenOfOwnerByIndex(address, i)

            // Get the certificate details for this token
            const details = await contract.verifyCertificate(tokenId)

            credentialsList.push({
              id: Number(tokenId),
              studentName: details[0],
              degree: details[1],
              university: details[2],
              ipfsHash: details[3],
            })
          } catch (err) {
            console.error(`Error fetching token at index ${i}:`, err)
          }
        }

        setCredentials(credentialsList)
      } catch (err) {
        console.error("Error fetching credentials:", err)
        setError("Failed to fetch credential data. Please try again.")
      } finally {
        setIsLoading(false)
      }
    }

    fetchCredentials()
  }, [contract, address, isCorrectNetwork])

  if (!address) {
    return (
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">My Credentials</h1>
          <p className="text-muted-foreground">View and manage your academic credentials</p>
        </div>
        <div className="flex flex-col items-center justify-center rounded-lg border border-dashed p-8 text-center">
          <GraduationCap className="h-12 w-12 text-muted-foreground" />
          <h2 className="mt-4 text-xl font-semibold">Connect Your Wallet</h2>
          <p className="mt-2 text-sm text-muted-foreground">You need to connect your wallet to view your credentials</p>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">My Credentials</h1>
        <p className="text-muted-foreground">View and manage your academic credentials</p>
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

      {isLoading ? (
        <div className="flex items-center justify-center py-12">
          <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent"></div>
        </div>
      ) : credentials.length > 0 ? (
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {credentials.map((credential) => (
            <Card key={credential.id} className="overflow-hidden">
              <CardHeader className="bg-primary/5 pb-4">
                <div className="flex items-center gap-2">
                  <FileCheck className="h-5 w-5 text-primary" />
                  <CardTitle className="text-lg">{credential.degree}</CardTitle>
                </div>
                <CardDescription>Issued by {credential.university}</CardDescription>
              </CardHeader>
              <CardContent className="pt-6">
                <div className="space-y-4">
                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div className="space-y-1">
                      <p className="text-muted-foreground">Student Name</p>
                      <p className="font-medium">{credential.studentName}</p>
                    </div>
                    <div className="space-y-1">
                      <p className="text-muted-foreground">Credential ID</p>
                      <p className="font-medium">#{credential.id}</p>
                    </div>
                    <div className="space-y-1">
                      <p className="text-muted-foreground">Issuer</p>
                      <p className="font-medium">{credential.university}</p>
                    </div>
                    <div className="space-y-1">
                      <p className="text-muted-foreground">Status</p>
                      <p className="font-medium text-green-600">Verified</p>
                    </div>
                  </div>
                </div>
              </CardContent>
              <CardFooter className="border-t bg-muted/50 px-6 py-3">
                <div className="flex w-full items-center justify-between">
                  <p className="text-xs text-muted-foreground">Issued on Blockchain</p>
                  <Button
                    variant="ghost"
                    size="sm"
                    className="h-8 gap-1"
                    onClick={() =>
                      window.open(`https://ipfs.io/ipfs/${credential.ipfsHash.replace("ipfs://", "")}`, "_blank")
                    }
                  >
                    <ExternalLink className="h-3.5 w-3.5" />
                    <span>View on IPFS</span>
                  </Button>
                </div>
              </CardFooter>
            </Card>
          ))}
        </div>
      ) : (
        <div className="flex flex-col items-center justify-center rounded-lg border border-dashed p-8 text-center">
          <GraduationCap className="h-12 w-12 text-muted-foreground" />
          <h2 className="mt-4 text-xl font-semibold">No Credentials Found</h2>
          <p className="mt-2 text-sm text-muted-foreground">
            {!isCorrectNetwork
              ? "Please switch to the correct network to view your credentials"
              : "You don't have any credentials yet. They will appear here once issued."}
          </p>
        </div>
      )}
    </div>
  )
}

