"use client"

import { useEffect, useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { useWeb3 } from "@/hooks/use-web3"
import { useAuth } from "@/hooks/use-auth"
import { FileCheck, GraduationCap, ExternalLink, AlertTriangle, Loader2 } from "lucide-react"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { useRouter } from "next/navigation"

interface Credential {
  id: number
  studentName: string
  degree: string
  university: string
  ipfsHash: string
  recipientAddress: string
}

export default function IssuedCredentialsPage() {
  const { user } = useAuth()
  const { address, contract, isCorrectNetwork, switchNetwork, chainId, networkName } = useWeb3()
  const [credentials, setCredentials] = useState<Credential[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const router = useRouter()

  useEffect(() => {
    const fetchIssuedCredentials = async () => {
      if (!address) return
      if (!isCorrectNetwork) return
      if (!contract) return
      if (user?.accountType !== "institution") return

      try {
        setIsLoading(true)
        setError(null)

        // Get the issued credentials for the current address
        // In a real implementation, we would call a function like getIssuedCertificates
        // For now, we'll simulate this by getting all tokens and filtering
        const issuedTokenIds = await contract.getIssuedCertificates(address)

        if (issuedTokenIds.length === 0) {
          setCredentials([])
          return
        }

        const credentialsList: Credential[] = []

        // Fetch details for each issued token
        for (let i = 0; i < issuedTokenIds.length; i++) {
          try {
            const tokenId = issuedTokenIds[i]

            // Get the certificate details for this token
            const details = await contract.verifyCertificate(tokenId)
            const owner = await contract.ownerOf(tokenId)

            credentialsList.push({
              id: Number(tokenId),
              studentName: details[0],
              degree: details[1],
              university: details[2],
              ipfsHash: details[3],
              recipientAddress: owner,
            })
          } catch (err) {
            console.error(`Error fetching token details for ID ${issuedTokenIds[i]}:`, err)
          }
        }

        setCredentials(credentialsList)
      } catch (err) {
        console.error("Error fetching issued credentials:", err)
        setError("Failed to fetch issued credential data. Please try again.")
      } finally {
        setIsLoading(false)
      }
    }

    fetchIssuedCredentials()
  }, [contract, address, isCorrectNetwork, user?.accountType, router])

  if (user?.accountType !== "institution") {
    return (
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Issued Credentials</h1>
          <p className="text-muted-foreground">View credentials you have issued.</p>
        </div>
        <Alert variant="destructive">
          <AlertTriangle className="h-4 w-4" />
          <AlertTitle>Access Denied</AlertTitle>
          <AlertDescription>
            Only institutions can access this page. Please switch to an institution account.
          </AlertDescription>
        </Alert>
      </div>
    )
  }

  if (!address) {
    return (
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Issued Credentials</h1>
          <p className="text-muted-foreground">View credentials you have issued.</p>
        </div>
        <div className="flex flex-col items-center justify-center rounded-lg border border-dashed p-8 text-center">
          <GraduationCap className="h-12 w-12 text-muted-foreground" />
          <h2 className="mt-4 text-xl font-semibold">Connect Your Wallet</h2>
          <p className="mt-2 text-sm text-muted-foreground">
            You need to connect your wallet to view issued credentials
          </p>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Issued Credentials</h1>
        <p className="text-muted-foreground">View and manage credentials you have issued.</p>
      </div>

      {!isCorrectNetwork && chainId && (
        <Alert variant="warning">
          <AlertTriangle className="h-4 w-4" />
          <AlertTitle>Wrong Network</AlertTitle>
          <AlertDescription className="flex flex-col gap-2">
            <p>
              You are connected to {networkName || "an unsupported network"}. Please switch to the required network to
              view your issued credentials.
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

      <Tabs defaultValue="grid" className="w-full">
        <div className="flex justify-between items-center mb-4">
          <div>
            <h2 className="text-xl font-semibold">Credentials Issued: {credentials.length}</h2>
            <p className="text-sm text-muted-foreground">
              {credentials.length === 0
                ? "You haven't issued any credentials yet."
                : "All credentials issued by your institution."}
            </p>
          </div>
          <TabsList>
            <TabsTrigger value="grid">Grid</TabsTrigger>
            <TabsTrigger value="list">List</TabsTrigger>
          </TabsList>
        </div>

        <TabsContent value="grid">
          {isLoading ? (
            <div className="flex items-center justify-center py-12">
              <Loader2 className="h-8 w-8 animate-spin text-primary" />
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
                    <CardDescription>Issued to {credential.studentName}</CardDescription>
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
                      <p className="text-xs text-muted-foreground">
                        Recipient: {credential.recipientAddress.slice(0, 6)}...{credential.recipientAddress.slice(-4)}
                      </p>
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
              <h3 className="mt-4 text-xl font-semibold">No Credentials Issued</h3>
              <p className="mt-2 text-sm text-muted-foreground">
                You haven't issued any credentials yet. Go to the "Issue Credential" page to get started.
              </p>
              <Button onClick={() => router.push("/dashboard/issue")} className="mt-4">
                Issue New Credential
              </Button>
            </div>
          )}
        </TabsContent>

        <TabsContent value="list">
          {isLoading ? (
            <div className="flex items-center justify-center py-12">
              <Loader2 className="h-8 w-8 animate-spin text-primary" />
            </div>
          ) : credentials.length > 0 ? (
            <div className="space-y-4">
              {credentials.map((credential) => (
                <div key={credential.id} className="flex items-center gap-4 rounded-lg border p-4">
                  <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary/10">
                    <FileCheck className="h-5 w-5 text-primary" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <h4 className="font-medium">{credential.degree}</h4>
                    <p className="text-sm text-muted-foreground">Issued to {credential.studentName}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-sm font-medium">ID #{credential.id}</p>
                    <p className="text-xs text-muted-foreground">
                      Recipient: {credential.recipientAddress.slice(0, 6)}...{credential.recipientAddress.slice(-4)}
                    </p>
                  </div>
                  <Button
                    variant="ghost"
                    size="sm"
                    className="h-8 gap-1"
                    onClick={() =>
                      window.open(`https://ipfs.io/ipfs/${credential.ipfsHash.replace("ipfs://", "")}`, "_blank")
                    }
                  >
                    <ExternalLink className="h-3.5 w-3.5" />
                    <span>View</span>
                  </Button>
                </div>
              ))}
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center rounded-lg border border-dashed p-8 text-center">
              <GraduationCap className="h-12 w-12 text-muted-foreground" />
              <h3 className="mt-4 text-xl font-semibold">No Credentials Issued</h3>
              <p className="mt-2 text-sm text-muted-foreground">
                You haven't issued any credentials yet. Go to the "Issue Credential" page to get started.
              </p>
              <Button onClick={() => router.push("/dashboard/issue")} className="mt-4">
                Issue New Credential
              </Button>
            </div>
          )}
        </TabsContent>
      </Tabs>
    </div>
  )
}

