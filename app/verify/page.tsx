"use client"

import { useState } from "react"
import Link from "next/link"
import { zodResolver } from "@hookform/resolvers/zod"
import { useForm } from "react-hook-form"
import { z } from "zod"
import { Button } from "@/components/ui/button"
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { useToast } from "@/hooks/use-toast"
import { useWeb3 } from "@/hooks/use-web3"
import { CheckCircle, GraduationCap, Search, XCircle, AlertTriangle, ExternalLink } from "lucide-react"

const formSchema = z.object({
  tokenId: z.string().min(1, {
    message: "Please enter a token ID.",
  }),
})

interface VerificationResult {
  isVerified: boolean
  studentName: string
  degree: string
  university: string
  ipfsHash: string
}

export default function VerifyPage() {
  const { toast } = useToast()
  const { contract, isCorrectNetwork, switchNetwork, chainId, networkName } = useWeb3()
  const [isVerifying, setIsVerifying] = useState(false)
  const [result, setResult] = useState<VerificationResult | null>(null)
  const [error, setError] = useState<string | null>(null)

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      tokenId: "",
    },
  })

  async function onSubmit(values: z.infer<typeof formSchema>) {
    if (!contract) {
      toast({
        title: "Contract not connected",
        description: "Please connect your wallet to verify credentials.",
        variant: "destructive",
      })
      return
    }

    if (!isCorrectNetwork) {
      toast({
        title: "Wrong network",
        description: "Please switch to the correct network to verify credentials.",
        variant: "destructive",
      })
      return
    }

    try {
      setIsVerifying(true)
      setResult(null)
      setError(null)

      // Call the contract's verifyCertificate function
      const tokenId = Number.parseInt(values.tokenId)
      const certificateDetails = await contract.verifyCertificate(tokenId)

      setResult({
        isVerified: true,
        studentName: certificateDetails[0],
        degree: certificateDetails[1],
        university: certificateDetails[2],
        ipfsHash: certificateDetails[3],
      })

      toast({
        title: "Verification successful",
        description: "The credential has been verified on the blockchain.",
      })
    } catch (error: any) {
      console.error("Error verifying credential:", error)

      // Handle specific error messages
      let errorMessage = "The credential could not be verified. It may not exist or there was an error."

      if (error.reason) {
        errorMessage = error.reason
      } else if (error.message) {
        // Clean up the error message
        errorMessage = error.message.split("(")[0].trim()
      }

      setError(errorMessage)
      setResult({
        isVerified: false,
        studentName: "",
        degree: "",
        university: "",
        ipfsHash: "",
      })

      toast({
        title: "Verification failed",
        description: errorMessage,
        variant: "destructive",
      })
    } finally {
      setIsVerifying(false)
    }
  }

  return (
    <div className="container mx-auto flex min-h-screen flex-col items-center justify-center py-12">
      <Link href="/" className="absolute left-4 top-4 md:left-8 md:top-8 flex items-center gap-2 font-bold">
        <GraduationCap className="h-6 w-6" />
        <span>EDUVERIFY</span>
      </Link>

      <div className="mx-auto w-full max-w-md space-y-8">
        <div className="text-center">
          <h1 className="text-3xl font-bold">Verify Credential</h1>
          <p className="mt-2 text-muted-foreground">
            Enter a credential token ID to verify its authenticity on the blockchain
          </p>
        </div>

        {!isCorrectNetwork && chainId && (
          <Alert variant="warning">
            <AlertTriangle className="h-4 w-4" />
            <AlertTitle>Wrong Network</AlertTitle>
            <AlertDescription className="flex flex-col gap-2">
              <p>
                You are connected to {networkName || "an unsupported network"}. Please switch to the required network to
                verify credentials.
              </p>
              <Button onClick={switchNetwork} variant="outline" size="sm" className="w-fit">
                Switch Network
              </Button>
            </AlertDescription>
          </Alert>
        )}

        <Card>
          <CardHeader>
            <CardTitle>Credential Verification</CardTitle>
            <CardDescription>Enter the token ID of the credential you want to verify</CardDescription>
          </CardHeader>
          <CardContent>
            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                <FormField
                  control={form.control}
                  name="tokenId"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Token ID</FormLabel>
                      <FormControl>
                        <Input placeholder="Enter token ID" {...field} />
                      </FormControl>
                      <FormDescription>The unique identifier of the credential on the blockchain</FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <Button type="submit" disabled={isVerifying || !contract || !isCorrectNetwork} className="w-full gap-2">
                  {isVerifying ? (
                    <>
                      <div className="h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent"></div>
                      <span>Verifying...</span>
                    </>
                  ) : (
                    <>
                      <Search className="h-4 w-4" />
                      <span>Verify Credential</span>
                    </>
                  )}
                </Button>
              </form>
            </Form>

            {error && (
              <div className="mt-6">
                <Alert variant="destructive">
                  <AlertTriangle className="h-4 w-4" />
                  <AlertTitle>Verification Error</AlertTitle>
                  <AlertDescription>{error}</AlertDescription>
                </Alert>
              </div>
            )}

            {result && (
              <div className="mt-6 rounded-lg border p-4">
                {result.isVerified ? (
                  <div className="space-y-4">
                    <div className="flex items-center gap-2 text-green-600">
                      <CheckCircle className="h-5 w-5" />
                      <span className="font-medium">Credential Verified</span>
                    </div>
                    <div className="space-y-2">
                      <div className="grid grid-cols-2 gap-2 text-sm">
                        <p className="text-muted-foreground">Student Name:</p>
                        <p className="font-medium">{result.studentName}</p>
                      </div>
                      <div className="grid grid-cols-2 gap-2 text-sm">
                        <p className="text-muted-foreground">Degree:</p>
                        <p className="font-medium">{result.degree}</p>
                      </div>
                      <div className="grid grid-cols-2 gap-2 text-sm">
                        <p className="text-muted-foreground">Institution:</p>
                        <p className="font-medium">{result.university}</p>
                      </div>
                      <div className="grid grid-cols-2 gap-2 text-sm">
                        <p className="text-muted-foreground">IPFS Hash:</p>
                        <p className="font-medium truncate">{result.ipfsHash}</p>
                      </div>
                    </div>
                    <div className="pt-2">
                      <Button
                        variant="outline"
                        size="sm"
                        className="w-full gap-1"
                        onClick={() =>
                          window.open(`https://ipfs.io/ipfs/${result.ipfsHash.replace("ipfs://", "")}`, "_blank")
                        }
                      >
                        <ExternalLink className="h-3.5 w-3.5" />
                        <span>View Certificate on IPFS</span>
                      </Button>
                    </div>
                  </div>
                ) : (
                  <div className="flex items-center gap-2 text-red-600">
                    <XCircle className="h-5 w-5" />
                    <span className="font-medium">Credential Not Found or Invalid</span>
                  </div>
                )}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  )
}

