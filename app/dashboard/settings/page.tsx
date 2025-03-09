"use client"

import { useState } from "react"
import { zodResolver } from "@hookform/resolvers/zod"
import { useForm } from "react-hook-form"
import { z } from "zod"
import { Button } from "@/components/ui/button"
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { useToast } from "@/hooks/use-toast"
import { useAuth } from "@/hooks/use-auth"
import { useWeb3 } from "@/hooks/use-web3"
import { AlertTriangle, Wallet, Check, Loader2 } from "lucide-react"

const profileFormSchema = z.object({
  name: z.string().min(2, {
    message: "Name must be at least 2 characters.",
  }),
  email: z
    .string()
    .email({
      message: "Please enter a valid email address.",
    })
    .optional(),
  accountType: z.enum(["student", "institution"]),
})

export default function SettingsPage() {
  const { toast } = useToast()
  const { user, updateAccountType, linkWallet, disconnectWallet } = useAuth()
  const { address, connectWallet, isConnecting } = useWeb3()
  const [isUpdating, setIsUpdating] = useState(false)
  const [isDisconnecting, setIsDisconnecting] = useState(false)

  const form = useForm<z.infer<typeof profileFormSchema>>({
    resolver: zodResolver(profileFormSchema),
    defaultValues: {
      name: user?.name || "",
      email: user?.email || "",
      accountType: user?.accountType || "student",
    },
  })

  async function onSubmit(values: z.infer<typeof profileFormSchema>) {
    try {
      setIsUpdating(true)

      // Update account type if changed
      if (values.accountType !== user?.accountType) {
        await updateAccountType(values.accountType)
      }

      // In a real app, you would update other profile details here

      toast({
        title: "Settings updated",
        description: "Your profile settings have been updated successfully.",
      })
    } catch (error) {
      console.error("Settings update error:", error)
      toast({
        title: "Update failed",
        description: "There was an error updating your settings.",
        variant: "destructive",
      })
    } finally {
      setIsUpdating(false)
    }
  }

  async function handleConnectWallet() {
    try {
      const walletAddress = await connectWallet()
      if (walletAddress && user) {
        await linkWallet(walletAddress)
      }
    } catch (error) {
      console.error("Connect wallet error:", error)
      toast({
        title: "Connection failed",
        description: "There was an error connecting your wallet.",
        variant: "destructive",
      })
    }
  }

  async function handleDisconnectWallet() {
    try {
      setIsDisconnecting(true)
      await disconnectWallet()
    } catch (error) {
      console.error("Disconnect wallet error:", error)
      toast({
        title: "Disconnection failed",
        description: "There was an error disconnecting your wallet.",
        variant: "destructive",
      })
    } finally {
      setIsDisconnecting(false)
    }
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Settings</h1>
        <p className="text-muted-foreground">Manage your account settings and preferences.</p>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Profile</CardTitle>
            <CardDescription>Update your profile information.</CardDescription>
          </CardHeader>
          <CardContent>
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

                {user?.email && (
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
                )}

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
                      <FormDescription>
                        This determines what features you can access. Institutions can issue credentials.
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <Button type="submit" disabled={isUpdating}>
                  {isUpdating ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Updating...
                    </>
                  ) : (
                    "Update Profile"
                  )}
                </Button>
              </form>
            </Form>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Wallet Connection</CardTitle>
            <CardDescription>Manage your blockchain wallet connection.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {user?.walletAddress ? (
              <div className="space-y-4">
                <div className="rounded-lg border p-4">
                  <div className="flex items-center gap-2">
                    <Check className="h-5 w-5 text-green-500" />
                    <div>
                      <p className="font-medium">Wallet Connected</p>
                      <p className="text-sm text-muted-foreground">
                        {user.walletAddress.slice(0, 6)}...{user.walletAddress.slice(-4)}
                      </p>
                    </div>
                  </div>
                </div>
                <Button variant="destructive" onClick={handleDisconnectWallet} disabled={isDisconnecting}>
                  {isDisconnecting ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Disconnecting...
                    </>
                  ) : (
                    "Disconnect Wallet"
                  )}
                </Button>
              </div>
            ) : (
              <div className="space-y-4">
                <Alert>
                  <AlertTriangle className="h-4 w-4" />
                  <AlertTitle>No Wallet Connected</AlertTitle>
                  <AlertDescription>
                    Connect your wallet to access blockchain features like viewing and issuing credentials.
                  </AlertDescription>
                </Alert>
                <Button onClick={handleConnectWallet} disabled={isConnecting} className="w-full">
                  {isConnecting ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Connecting...
                    </>
                  ) : (
                    <>
                      <Wallet className="mr-2 h-4 w-4" />
                      Connect Wallet
                    </>
                  )}
                </Button>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  )
}

