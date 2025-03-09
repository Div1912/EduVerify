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
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { useToast } from "@/hooks/use-toast"
import { useAuth } from "@/hooks/use-auth"
import { useWeb3 } from "@/hooks/use-web3"

const formSchema = z.object({
  email: z.string().email({
    message: "Please enter a valid email address.",
  }),
  password: z.string().min(1, {
    message: "Password is required.",
  }),
})

export default function Login() {
  const router = useRouter()
  const { toast } = useToast()
  const { login } = useAuth()
  const { connectWallet, address, isCorrectNetwork, chainId, networkName, switchNetwork } = useWeb3()
  const [isConnecting, setIsConnecting] = useState(false)
  const [walletError, setWalletError] = useState<string | null>(null)

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      email: "",
      password: "",
    },
  })

  // Redirect to dashboard if already connected with wallet
  useEffect(() => {
    if (address && isCorrectNetwork) {
      router.push("/dashboard")
    }
  }, [address, isCorrectNetwork, router])

  async function onSubmit(values: z.infer<typeof formSchema>) {
    try {
      await login(values.email, values.password)
      toast({
        title: "Login successful!",
        description: "You have been logged in.",
      })
      router.push("/dashboard")
    } catch (error) {
      toast({
        title: "Login failed",
        description: "Invalid email or password.",
        variant: "destructive",
      })
    }
  }

  async function handleWalletConnect() {
    try {
      setIsConnecting(true)
      setWalletError(null)
      await connectWallet()

      // The redirect will happen automatically via the useEffect
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
          <h1 className="text-2xl font-semibold tracking-tight">Login to your account</h1>
          <p className="text-sm text-muted-foreground">Choose how you want to login</p>
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
                        <Input type="password" placeholder="Enter your password" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <Button type="submit" className="w-full">
                  Login
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

              <div className="rounded-lg border p-4">
                <div className="flex flex-col space-y-3 text-center">
                  <Wallet className="mx-auto h-6 w-6 text-muted-foreground" />
                  <div className="space-y-1">
                    <h3 className="text-sm font-medium leading-none">Connect your wallet</h3>
                    <p className="text-xs text-muted-foreground">Login with your crypto wallet</p>
                  </div>
                </div>
              </div>
              <Button onClick={handleWalletConnect} disabled={isConnecting} className="w-full">
                {isConnecting ? "Connecting..." : "Connect Wallet"}
              </Button>
              {address && (
                <p className="text-xs text-center text-muted-foreground">
                  Connected: {address.slice(0, 6)}...{address.slice(-4)}
                </p>
              )}
            </div>
          </TabsContent>
        </Tabs>
        <p className="px-8 text-center text-sm text-muted-foreground">
          Don&apos;t have an account?{" "}
          <Link href="/register" className="underline underline-offset-4 hover:text-primary">
            Register
          </Link>
        </p>
      </div>
    </div>
  )
}

