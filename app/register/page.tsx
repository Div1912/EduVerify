"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { zodResolver } from "@hookform/resolvers/zod"
import { useForm } from "react-hook-form"
import { z } from "zod"
import { GraduationCap, Wallet, AlertTriangle } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { useToast } from "@/hooks/use-toast"
import { useAuth } from "@/hooks/use-auth"
import { useWeb3 } from "@/hooks/use-web3"

const formSchema = z.object({
  name: z.string().min(2, {
    message: "Name must be at least 2 characters.",
  }),
  email: z.string().email({
    message: "Please enter a valid email address.",
  }),
  password: z.string().min(8, {
    message: "Password must be at least 8 characters.",
  }),
  accountType: z.enum(["student", "institution"]),
})

const walletFormSchema = z.object({
  name: z.string().min(2, {
    message: "Name must be at least 2 characters.",
  }),
  accountType: z.enum(["student", "institution"]),
})

export default function Register() {
  const router = useRouter()
  const { toast } = useToast()
  const { register, updateAccountType } = useAuth()
  const { connectWallet, address, isCorrectNetwork, chainId, networkName, switchNetwork } = useWeb3()
  const [isConnecting, setIsConnecting] = useState(false)
  const [walletError, setWalletError] = useState<string | null>(null)
  const [walletConnected, setWalletConnected] = useState(false)

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: "",
      email: "",
      password: "",
      accountType: "student",
    },
  })

  const walletForm = useForm<z.infer<typeof walletFormSchema>>({
    resolver: zodResolver(walletFormSchema),
    defaultValues: {
      name: "",
      accountType: "student",
    },
  })

  // Redirect to dashboard if already connected with wallet and completed registration
  useEffect(() => {
    if (address && isCorrectNetwork && walletConnected) {
      router.push("/dashboard")
    }
  }, [address, isCorrectNetwork, walletConnected, router])

  async function onSubmit(values: z.infer<typeof formSchema>) {
    try {
      await register(values)
      toast({
        title: "Account created!",
        description: "You have successfully registered.",
      })
      router.push("/dashboard")
    } catch (error) {
      toast({
        title: "Registration failed",
        description: "There was an error creating your account.",
        variant: "destructive",
      })
    }
  }

  async function onWalletSubmit(values: z.infer<typeof walletFormSchema>) {
    if (!address) {
      toast({
        title: "Wallet not connected",
        description: "Please connect your wallet first.",
        variant: "destructive",
      })
      return
    }

    try {
      // Register with wallet
      await register({
        name: values.name,
        accountType: values.accountType,
        walletAddress: address,
      })

      // Update account type if needed
      await updateAccountType(values.accountType)

      toast({
        title: "Account created!",
        description: `You have successfully registered as a ${values.accountType}.`,
      })

      setWalletConnected(true)
      router.push("/dashboard")
    } catch (error) {
      toast({
        title: "Registration failed",
        description: "There was an error creating your account.",
        variant: "destructive",
      })
    }
  }

  async function handleWalletConnect() {
    try {
      setIsConnecting(true)
      setWalletError(null)
      await connectWallet()

      // Don't redirect yet, wait for user to complete the form
    } catch (error: any) {
      console.error("Connection error:", error)
      setWalletError(error.message || "Failed to connect wallet")
      toast({
        title: "Connection failed",
        description: "There was an error connecting your wallet.",
        variant: "destructive",
      })
    } finally {
      setIsConnecting(false)
    }
  }

  return (
    <div className="container flex h-screen w-screen flex-col items-center justify-center">
      <Link href="/" className="absolute left-4 top-4 md:left-8 md:top-8 flex items-center gap-2 font-bold">
        <GraduationCap className="h-6 w-6" />
        <span>EDUVERIFY</span>
      </Link>
      <div className="mx-auto flex w-full flex-col justify-center space-y-6 sm:w-[350px]">
        <div className="flex flex-col space-y-2 text-center">
          <h1 className="text-2xl font-semibold tracking-tight">Create an account</h1>
          <p className="text-sm text-muted-foreground">Choose how you want to register</p>
        </div>
        <Tabs defaultValue="email" className="w-full">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="email">Email</TabsTrigger>
            <TabsTrigger value="wallet">Wallet</TabsTrigger>
          </TabsList>
          <TabsContent value="email">
            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                <FormField
                  control={form.control}
                  name="name"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Name</FormLabel>
                      <FormControl>
                        <Input placeholder="Enter your name" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="email"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Email</FormLabel>
                      <FormControl>
                        <Input placeholder="Enter your email" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="password"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Password</FormLabel>
                      <FormControl>
                        <Input type="password" placeholder="Create a password" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="accountType"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Account Type</FormLabel>
                      <Select onValueChange={field.onChange} defaultValue={field.value}>
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Select account type" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="student">Student</SelectItem>
                          <SelectItem value="institution">Institution</SelectItem>
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <Button type="submit" className="w-full">
                  Register
                </Button>
              </form>
            </Form>
          </TabsContent>
          <TabsContent value="wallet">
            <div className="space-y-4">
              {walletError && (
                <Alert variant="destructive">
                  <AlertTriangle className="h-4 w-4" />
                  <AlertTitle>Connection Error</AlertTitle>
                  <AlertDescription>{walletError}</AlertDescription>
                </Alert>
              )}

              {address && !isCorrectNetwork && chainId && (
                <Alert variant="warning">
                  <AlertTriangle className="h-4 w-4" />
                  <AlertTitle>Wrong Network</AlertTitle>
                  <AlertDescription className="flex flex-col gap-2">
                    <p>
                      You are connected to {networkName || "an unsupported network"}. Please switch to the required
                      network.
                    </p>
                    <Button onClick={switchNetwork} variant="outline" size="sm" className="w-fit">
                      Switch Network
                    </Button>
                  </AlertDescription>
                </Alert>
              )}

              {!address ? (
                <>
                  <div className="rounded-lg border p-4">
                    <div className="flex flex-col space-y-3 text-center">
                      <Wallet className="mx-auto h-6 w-6 text-muted-foreground" />
                      <div className="space-y-1">
                        <h3 className="text-sm font-medium leading-none">Connect your wallet</h3>
                        <p className="text-xs text-muted-foreground">Connect your crypto wallet to create an account</p>
                      </div>
                    </div>
                  </div>
                  <Button onClick={handleWalletConnect} disabled={isConnecting} className="w-full">
                    {isConnecting ? "Connecting..." : "Connect Wallet"}
                  </Button>
                </>
              ) : (
                <Form {...walletForm}>
                  <form onSubmit={walletForm.handleSubmit(onWalletSubmit)} className="space-y-4">
                    <div className="rounded-lg border p-4 mb-4">
                      <div className="flex flex-col space-y-1">
                        <p className="text-sm font-medium">Wallet Connected</p>
                        <p className="text-xs text-muted-foreground">
                          {address.slice(0, 6)}...{address.slice(-4)}
                        </p>
                      </div>
                    </div>

                    <FormField
                      control={walletForm.control}
                      name="name"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Name</FormLabel>
                          <FormControl>
                            <Input placeholder="Enter your name" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={walletForm.control}
                      name="accountType"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Account Type</FormLabel>
                          <Select onValueChange={field.onChange} defaultValue={field.value}>
                            <FormControl>
                              <SelectTrigger>
                                <SelectValue placeholder="Select account type" />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              <SelectItem value="student">Student</SelectItem>
                              <SelectItem value="institution">Institution</SelectItem>
                            </SelectContent>
                          </Select>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <Button type="submit" className="w-full" disabled={!isCorrectNetwork}>
                      Complete Registration
                    </Button>
                  </form>
                </Form>
              )}
            </div>
          </TabsContent>
        </Tabs>
        <p className="px-8 text-center text-sm text-muted-foreground">
          Already have an account?{" "}
          <Link href="/login" className="underline underline-offset-4 hover:text-primary">
            Login
          </Link>
        </p>
      </div>
    </div>
  )
}

