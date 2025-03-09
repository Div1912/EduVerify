"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { zodResolver } from "@hookform/resolvers/zod"
import { useForm } from "react-hook-form"
import { z } from "zod"
import { Button } from "@/components/ui/button"
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { useToast } from "@/hooks/use-toast"
import { useWeb3 } from "@/hooks/use-web3"
import { useAuth } from "@/hooks/use-auth"
import { AlertCircle, FileUp, AlertTriangle } from "lucide-react"

const formSchema = z.object({
  recipientAddress: z.string().min(42, {
    message: "Please enter a valid Ethereum address.",
  }),
  studentName: z
    .string()
    .min(2, {
      message: "Student name must be at least 2 characters.",
    })
    .max(50, {
      message: "Student name must not exceed 50 characters.",
    }),
  degree: z.string().min(2, {
    message: "Degree must be at least 2 characters.",
  }),
  university: z.string().min(2, {
    message: "University name must be at least 2 characters.",
  }),
  certificateURI: z.string().min(5, {
    message: "Certificate URI must be at least 5 characters.",
  }),
})

export default function IssuePage() {
  const { toast } = useToast()
  const router = useRouter()
  const { contract, address, isCorrectNetwork, switchNetwork, chainId, networkName } = useWeb3()
  const { user } = useAuth()
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [txHash, setTxHash] = useState<string | null>(null)

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      recipientAddress: "",
      studentName: "",
      degree: "",
      university: user?.accountType === "institution" ? user.name : "",
      certificateURI: "ipfs://",
    },
  })

  async function onSubmit(values: z.infer<typeof formSchema>) {
    if (user?.accountType !== "institution") {
      toast({
        title: "Permission denied",
        description: "Only institutions can issue credentials.",
        variant: "destructive",
      })
      return
    }

    if (!contract) {
      toast({
        title: "Contract not connected",
        description: "Please connect your wallet to issue credentials.",
        variant: "destructive",
      })
      return
    }

    if (!isCorrectNetwork) {
      toast({
        title: "Wrong network",
        description: "Please switch to the correct network to issue credentials.",
        variant: "destructive",
      })
      return
    }

    try {
      setIsSubmitting(true)
      setTxHash(null)

      // Call the contract's mintCertificate function
      const tx = await contract.mintCertificate(
        values.recipientAddress,
        values.studentName,
        values.degree,
        values.university,
        values.certificateURI,
      )

      // Set the transaction hash
      setTxHash(tx.hash)

      // Wait for the transaction to be mined
      await tx.wait()

      toast({
        title: "Credential issued!",
        description: "The academic credential has been successfully issued on the blockchain.",
      })

      router.push("/dashboard/credentials")
    } catch (error: any) {
      console.error("Error issuing credential:", error)

      // Handle specific error messages
      let errorMessage = "There was an error issuing the credential. Please try again."

      if (error.reason) {
        errorMessage = error.reason
      } else if (error.message) {
        // Clean up the error message
        errorMessage = error.message.split("(")[0].trim()
      }

      toast({
        title: "Failed to issue credential",
        description: errorMessage,
        variant: "destructive",
      })
    } finally {
      setIsSubmitting(false)
    }
  }

  if (user?.accountType !== "institution") {
    return (
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Issue Credential</h1>
          <p className="text-muted-foreground">Issue a new academic credential on the blockchain</p>
        </div>
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertTitle>Access Denied</AlertTitle>
          <AlertDescription>
            Only institutions can issue credentials. Please contact your institution if you need a credential issued.
          </AlertDescription>
        </Alert>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Issue Credential</h1>
        <p className="text-muted-foreground">Issue a new academic credential on the blockchain</p>
      </div>

      {!address && (
        <Alert>
          <AlertCircle className="h-4 w-4" />
          <AlertTitle>Wallet Required</AlertTitle>
          <AlertDescription>You need to connect your wallet to issue credentials.</AlertDescription>
        </Alert>
      )}

      {address && !isCorrectNetwork && chainId && (
        <Alert variant="warning">
          <AlertTriangle className="h-4 w-4" />
          <AlertTitle>Wrong Network</AlertTitle>
          <AlertDescription className="flex flex-col gap-2">
            <p>
              You are connected to {networkName || "an unsupported network"}. Please switch to the required network to
              issue credentials.
            </p>
            <Button onClick={switchNetwork} variant="outline" size="sm" className="w-fit">
              Switch Network
            </Button>
          </AlertDescription>
        </Alert>
      )}

      {txHash && (
        <Alert>
          <FileUp className="h-4 w-4" />
          <AlertTitle>Transaction Submitted</AlertTitle>
          <AlertDescription className="flex flex-col gap-2">
            <p>Your transaction has been submitted to the blockchain.</p>
            <p className="text-xs font-mono break-all">{txHash}</p>
          </AlertDescription>
        </Alert>
      )}

      <div className="rounded-lg border p-6">
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            <FormField
              control={form.control}
              name="recipientAddress"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Recipient Wallet Address</FormLabel>
                  <FormControl>
                    <Input placeholder="0x..." {...field} />
                  </FormControl>
                  <FormDescription>The Ethereum address of the student receiving the credential</FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="studentName"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Student Name</FormLabel>
                  <FormControl>
                    <Input placeholder="Enter student name" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="grid gap-6 md:grid-cols-2">
              <FormField
                control={form.control}
                name="degree"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Degree/Certificate</FormLabel>
                    <FormControl>
                      <Input placeholder="Enter degree or certificate name" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="university"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Issuing Institution</FormLabel>
                    <FormControl>
                      <Input placeholder="Enter institution name" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <FormField
              control={form.control}
              name="certificateURI"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Certificate URI (IPFS)</FormLabel>
                  <FormControl>
                    <Textarea placeholder="ipfs://..." {...field} />
                  </FormControl>
                  <FormDescription>The IPFS URI where the certificate data is stored</FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="flex justify-end">
              <Button type="submit" disabled={isSubmitting || !address || !isCorrectNetwork} className="gap-2">
                {isSubmitting ? (
                  <>
                    <div className="h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent"></div>
                    <span>Issuing...</span>
                  </>
                ) : (
                  <>
                    <FileUp className="h-4 w-4" />
                    <span>Issue Credential</span>
                  </>
                )}
              </Button>
            </div>
          </form>
        </Form>
      </div>
    </div>
  )
}

