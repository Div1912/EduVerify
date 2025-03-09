"use client"

import { useEffect, useState, useRef } from "react"
import { useRouter } from "next/navigation"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { useAuth } from "@/hooks/use-auth"
import { useWeb3 } from "@/hooks/use-web3"
import { Award, FileCheck, GraduationCap, AlertTriangle, Download, Loader2, Copy, Check } from "lucide-react"
import { jsPDF } from "jspdf"
import html2canvas from "html2canvas"

interface Credential {
  id: number
  studentName: string
  degree: string
  university: string
  ipfsHash: string
}

export default function ResumePage() {
  const router = useRouter()
  const { user } = useAuth()
  const { address, contract, isCorrectNetwork } = useWeb3()
  const [credentials, setCredentials] = useState<Credential[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [isGenerating, setIsGenerating] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [resume, setResume] = useState<string | null>(null)
  const [copied, setCopied] = useState(false)
  const resumeRef = useRef<HTMLDivElement>(null)

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

  const generateResume = async () => {
    if (credentials.length === 0 || !user) return

    try {
      setIsGenerating(true)
      setError(null)

      const response = await fetch("/api/generate-resume", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          credentials,
          user,
        }),
      })

      if (!response.ok) {
        throw new Error("Failed to generate resume")
      }

      const data = await response.json()
      setResume(data.resume)
    } catch (err) {
      console.error("Error generating resume:", err)
      setError("Failed to generate resume. Please try again.")
    } finally {
      setIsGenerating(false)
    }
  }

  const downloadAsPDF = async () => {
    if (!resumeRef.current) return

    try {
      const canvas = await html2canvas(resumeRef.current)
      const imgData = canvas.toDataURL("image/png")
      const pdf = new jsPDF({
        orientation: "portrait",
        unit: "px",
        format: [canvas.width, canvas.height],
      })

      pdf.addImage(imgData, "PNG", 0, 0, canvas.width, canvas.height)
      pdf.save(`${user?.name || "User"}_Resume.pdf`)
    } catch (err) {
      console.error("Error downloading PDF:", err)
      setError("Failed to download resume as PDF. Please try again.")
    }
  }

  const copyToClipboard = () => {
    if (!resume) return

    navigator.clipboard
      .writeText(resume)
      .then(() => {
        setCopied(true)
        setTimeout(() => setCopied(false), 2000)
      })
      .catch((err) => {
        console.error("Error copying to clipboard:", err)
        setError("Failed to copy resume to clipboard. Please try again.")
      })
  }

  if (!address) {
    return (
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">AI Resume Generator</h1>
          <p className="text-muted-foreground">Generate a professional resume based on your verified credentials.</p>
        </div>
        <div className="flex flex-col items-center justify-center rounded-lg border border-dashed p-8 text-center">
          <GraduationCap className="h-12 w-12 text-muted-foreground" />
          <h2 className="mt-4 text-xl font-semibold">Connect Your Wallet</h2>
          <p className="mt-2 text-sm text-muted-foreground">You need to connect your wallet to access this feature</p>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">AI Resume Generator</h1>
        <p className="text-muted-foreground">Generate a professional resume based on your verified credentials.</p>
      </div>

      {error && (
        <Alert variant="destructive">
          <AlertTriangle className="h-4 w-4" />
          <AlertTitle>Error</AlertTitle>
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      <div className="grid gap-6 md:grid-cols-3">
        <Card className="md:col-span-1">
          <CardHeader>
            <CardTitle>Your Credentials</CardTitle>
            <CardDescription>Verified academic credentials used for your resume</CardDescription>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <div className="flex items-center justify-center py-8">
                <Loader2 className="h-8 w-8 animate-spin text-primary" />
              </div>
            ) : credentials.length > 0 ? (
              <div className="space-y-4">
                {credentials.map((credential) => (
                  <div key={credential.id} className="flex items-center gap-4 rounded-lg border p-4">
                    <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary/10">
                      <FileCheck className="h-5 w-5 text-primary" />
                    </div>
                    <div>
                      <h4 className="font-medium">{credential.degree}</h4>
                      <p className="text-sm text-muted-foreground">{credential.university}</p>
                    </div>
                  </div>
                ))}

                <Button
                  onClick={generateResume}
                  disabled={isGenerating || credentials.length === 0}
                  className="w-full mt-4"
                >
                  {isGenerating ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Generating...
                    </>
                  ) : (
                    <>
                      <Award className="mr-2 h-4 w-4" />
                      Generate Resume
                    </>
                  )}
                </Button>
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center py-8 text-center">
                <GraduationCap className="h-12 w-12 text-muted-foreground" />
                <h3 className="mt-4 text-lg font-medium">No Credentials Found</h3>
                <p className="mt-2 text-sm text-muted-foreground">
                  You need at least one verified credential to generate a resume.
                </p>
              </div>
            )}
          </CardContent>
        </Card>

        <Card className="md:col-span-2">
          <CardHeader>
            <div className="flex justify-between items-center">
              <div>
                <CardTitle>Your Resume</CardTitle>
                <CardDescription>AI-generated resume based on your blockchain credentials</CardDescription>
              </div>
              {resume && (
                <div className="flex gap-2">
                  <Button variant="outline" size="sm" onClick={copyToClipboard}>
                    {copied ? (
                      <>
                        <Check className="mr-2 h-4 w-4" />
                        Copied
                      </>
                    ) : (
                      <>
                        <Copy className="mr-2 h-4 w-4" />
                        Copy
                      </>
                    )}
                  </Button>
                  <Button variant="outline" size="sm" onClick={downloadAsPDF}>
                    <Download className="mr-2 h-4 w-4" />
                    Download PDF
                  </Button>
                </div>
              )}
            </div>
          </CardHeader>
          <CardContent>
            {isGenerating ? (
              <div className="flex flex-col items-center justify-center py-12">
                <Loader2 className="h-12 w-12 animate-spin text-primary" />
                <p className="mt-4 text-center text-sm text-muted-foreground">
                  Generating your professional resume based on your verified blockchain credentials...
                </p>
              </div>
            ) : resume ? (
              <div ref={resumeRef} className="prose prose-sm max-w-none p-6 border rounded-lg whitespace-pre-wrap">
                {resume}
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center py-12 text-center">
                <Award className="h-12 w-12 text-muted-foreground" />
                <h3 className="mt-4 text-lg font-medium">No Resume Generated Yet</h3>
                <p className="mt-2 text-sm text-muted-foreground">
                  Click the "Generate Resume" button to create a professional resume based on your verified credentials.
                </p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  )
}

