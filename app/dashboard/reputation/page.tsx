"use client"

import { useEffect, useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { useAuth } from "@/hooks/use-auth"
import { useWeb3 } from "@/hooks/use-web3"
import { Award, FileCheck, GraduationCap, AlertTriangle, Download, Loader2 } from "lucide-react"
import { Progress } from "@/components/ui/progress"

interface Credential {
  id: number
  studentName: string
  degree: string
  university: string
  ipfsHash: string
}

export default function ReputationPage() {
  const { user } = useAuth()
  const { address, contract, isCorrectNetwork, switchNetwork, chainId, networkName } = useWeb3()
  const [credentials, setCredentials] = useState<Credential[]>([])
  const [reputationScore, setReputationScore] = useState(0)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [isGeneratingResume, setIsGeneratingResume] = useState(false)

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
          setReputationScore(0)
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

        // Calculate reputation score based on credentials
        // In a real app, you might have a more complex algorithm
        const baseScore = count * 10
        const universityBonus = credentialsList.reduce((acc, cred) => {
          // Premium universities give more points
          if (cred.university.toLowerCase().includes("university")) {
            return acc + 5
          }
          return acc
        }, 0)

        const degreeBonus = credentialsList.reduce((acc, cred) => {
          // Higher degrees give more points
          if (cred.degree.toLowerCase().includes("master") || cred.degree.toLowerCase().includes("phd")) {
            return acc + 10
          } else if (cred.degree.toLowerCase().includes("bachelor")) {
            return acc + 5
          }
          return acc
        }, 0)

        const totalScore = baseScore + universityBonus + degreeBonus
        setReputationScore(totalScore)
      } catch (err) {
        console.error("Error fetching credentials:", err)
        setError("Failed to fetch credential data. Please try again.")
      } finally {
        setIsLoading(false)
      }
    }

    fetchCredentials()
  }, [contract, address, isCorrectNetwork])

  const handleGenerateResume = async () => {
    try {
      setIsGeneratingResume(true)

      // In a real implementation, this would call the AI resume generation API
      // For now, we'll simulate a delay
      await new Promise((resolve) => setTimeout(resolve, 2000))

      // Simulate a PDF download
      const link = document.createElement("a")
      link.href = "#"
      link.download = "resume.pdf"
      document.body.appendChild(link)
      link.click()
      document.body.removeChild(link)
    } catch (error) {
      console.error("Error generating resume:", error)
    } finally {
      setIsGeneratingResume(false)
    }
  }

  if (!address) {
    return (
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Reputation</h1>
          <p className="text-muted-foreground">View and manage your academic reputation.</p>
        </div>
        <div className="flex flex-col items-center justify-center rounded-lg border border-dashed p-8 text-center">
          <GraduationCap className="h-12 w-12 text-muted-foreground" />
          <h2 className="mt-4 text-xl font-semibold">Connect Your Wallet</h2>
          <p className="mt-2 text-sm text-muted-foreground">You need to connect your wallet to view your reputation</p>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Reputation</h1>
        <p className="text-muted-foreground">View and manage your academic reputation.</p>
      </div>

      {!isCorrectNetwork && chainId && (
        <Alert variant="warning">
          <AlertTriangle className="h-4 w-4" />
          <AlertTitle>Wrong Network</AlertTitle>
          <AlertDescription className="flex flex-col gap-2">
            <p>
              You are connected to {networkName || "an unsupported network"}. Please switch to the required network to
              view your reputation.
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

      <div className="grid gap-6 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Reputation Score</CardTitle>
            <CardDescription>Your academic reputation based on verified credentials</CardDescription>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <div className="flex items-center justify-center py-8">
                <div className="h-8 w-8 animate-spin rounded-full border-2 border-primary border-t-transparent"></div>
              </div>
            ) : (
              <div className="space-y-6">
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
                </div>

                <div className="space-y-4">
                  <div>
                    <div className="flex justify-between mb-1">
                      <span className="text-sm font-medium">Credentials</span>
                      <span className="text-sm font-medium">{credentials.length}</span>
                    </div>
                    <Progress value={Math.min(credentials.length * 10, 100)} className="h-2" />
                  </div>

                  <div>
                    <div className="flex justify-between mb-1">
                      <span className="text-sm font-medium">University Prestige</span>
                      <span className="text-sm font-medium">
                        {credentials.filter((c) => c.university.toLowerCase().includes("university")).length} /{" "}
                        {credentials.length}
                      </span>
                    </div>
                    <Progress
                      value={
                        credentials.length > 0
                          ? (credentials.filter((c) => c.university.toLowerCase().includes("university")).length /
                              credentials.length) *
                            100
                          : 0
                      }
                      className="h-2"
                    />
                  </div>

                  <div>
                    <div className="flex justify-between mb-1">
                      <span className="text-sm font-medium">Degree Level</span>
                      <span className="text-sm font-medium">
                        {
                          credentials.filter(
                            (c) =>
                              c.degree.toLowerCase().includes("master") ||
                              c.degree.toLowerCase().includes("phd") ||
                              c.degree.toLowerCase().includes("bachelor"),
                          ).length
                        }{" "}
                        / {credentials.length}
                      </span>
                    </div>
                    <Progress
                      value={
                        credentials.length > 0
                          ? (credentials.filter(
                              (c) =>
                                c.degree.toLowerCase().includes("master") ||
                                c.degree.toLowerCase().includes("phd") ||
                                c.degree.toLowerCase().includes("bachelor"),
                            ).length /
                              credentials.length) *
                            100
                          : 0
                      }
                      className="h-2"
                    />
                  </div>
                </div>
              </div>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Resume Generator</CardTitle>
            <CardDescription>Generate a professional resume based on your verified credentials</CardDescription>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <div className="flex items-center justify-center py-8">
                <div className="h-8 w-8 animate-spin rounded-full border-2 border-primary border-t-transparent"></div>
              </div>
            ) : credentials.length > 0 ? (
              <div className="space-y-6">
                <div className="rounded-lg border p-4">
                  <div className="flex items-center gap-4">
                    <Award className="h-10 w-10 text-primary" />
                    <div>
                      <h3 className="font-medium">AI-Powered Resume</h3>
                      <p className="text-sm text-muted-foreground">
                        Generate a professional resume using your verified blockchain credentials
                      </p>
                    </div>
                  </div>
                </div>

                <div className="space-y-2">
                  <p className="text-sm">Your resume will include:</p>
                  <ul className="list-disc pl-5 text-sm space-y-1">
                    <li>Personal information from your profile</li>
                    <li>{credentials.length} verified academic credentials</li>
                    <li>Professional summary based on your qualifications</li>
                    <li>Skills derived from your academic background</li>
                  </ul>
                </div>

                <Button onClick={handleGenerateResume} disabled={isGeneratingResume} className="w-full">
                  {isGeneratingResume ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Generating Resume...
                    </>
                  ) : (
                    <>
                      <Download className="mr-2 h-4 w-4" />
                      Generate Resume
                    </>
                  )}
                </Button>
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center py-8 text-center">
                <FileCheck className="h-12 w-12 text-muted-foreground" />
                <h3 className="mt-4 text-lg font-medium">No Credentials Found</h3>
                <p className="mt-2 text-sm text-muted-foreground">
                  You need at least one verified credential to generate a resume.
                </p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Credential Breakdown</CardTitle>
          <CardDescription>Details of your verified academic credentials</CardDescription>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="flex items-center justify-center py-8">
              <div className="h-8 w-8 animate-spin rounded-full border-2 border-primary border-t-transparent"></div>
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
                    <p className="text-sm text-muted-foreground">Issued by {credential.university}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-sm font-medium">ID #{credential.id}</p>
                    <p className="text-xs text-muted-foreground">Verified on Blockchain</p>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center py-8 text-center">
              <GraduationCap className="h-12 w-12 text-muted-foreground" />
              <h3 className="mt-4 text-lg font-medium">No Credentials Found</h3>
              <p className="mt-2 text-sm text-muted-foreground">
                You don't have any credentials yet. They will appear here once issued.
              </p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}

