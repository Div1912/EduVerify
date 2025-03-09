import Link from "next/link"
import { Button } from "@/components/ui/button"
import { GraduationCap, Shield, Award, ArrowRight } from "lucide-react"

export default function Home() {
  return (
    <div className="flex min-h-screen flex-col">
      <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="container flex h-16 items-center justify-between">
          <div className="flex items-center gap-2 font-bold text-xl">
            <GraduationCap className="h-6 w-6" />
            <span>EDUVERIFY</span>
          </div>
          <nav className="flex items-center gap-6">
            <Link href="/login" className="text-sm font-medium">
              Login
            </Link>
            <Link href="/register">
              <Button>Get Started</Button>
            </Link>
          </nav>
        </div>
      </header>
      <main className="flex-1">
        <section className="w-full py-12 md:py-24 lg:py-32">
          <div className="container px-4 md:px-6">
            <div className="grid gap-6 lg:grid-cols-2 lg:gap-12 xl:grid-cols-2">
              <div className="flex flex-col justify-center space-y-4">
                <div className="space-y-2">
                  <h1 className="text-3xl font-bold tracking-tighter sm:text-4xl md:text-5xl lg:text-6xl">
                    Secure Academic Credentials on the Blockchain
                  </h1>
                  <p className="max-w-[600px] text-gray-500 md:text-xl dark:text-gray-400">
                    EDUVERIFY provides immutable, verifiable academic credentials using blockchain technology. Issue,
                    verify, and manage educational certificates with confidence.
                  </p>
                </div>
                <div className="flex flex-col gap-2 min-[400px]:flex-row">
                  <Link href="/register">
                    <Button size="lg" className="gap-1">
                      Get Started <ArrowRight className="h-4 w-4" />
                    </Button>
                  </Link>
                  <Link href="/verify">
                    <Button size="lg" variant="outline">
                      Verify a Credential
                    </Button>
                  </Link>
                </div>
              </div>
              <div className="flex items-center justify-center">
                <div className="relative h-[350px] w-[350px] rounded-full bg-gradient-to-r from-blue-500 to-purple-500 p-1">
                  <div className="absolute inset-0 rounded-full bg-background p-6">
                    <div className="flex h-full flex-col items-center justify-center space-y-4 text-center">
                      <GraduationCap className="h-20 w-20 text-primary" />
                      <h2 className="text-2xl font-bold">Academic Credentials</h2>
                      <p className="text-gray-500 dark:text-gray-400">
                        Secure, verifiable, and tamper-proof certificates
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>
        <section className="w-full py-12 md:py-24 lg:py-32 bg-muted">
          <div className="container px-4 md:px-6">
            <div className="flex flex-col items-center justify-center space-y-4 text-center">
              <div className="space-y-2">
                <h2 className="text-3xl font-bold tracking-tighter sm:text-4xl md:text-5xl">Key Features</h2>
                <p className="max-w-[900px] text-gray-500 md:text-xl/relaxed lg:text-base/relaxed xl:text-xl/relaxed dark:text-gray-400">
                  EDUVERIFY combines blockchain technology with user-friendly interfaces to revolutionize academic
                  credential management.
                </p>
              </div>
            </div>
            <div className="mx-auto grid max-w-5xl grid-cols-1 gap-6 py-12 md:grid-cols-3 lg:gap-12">
              <div className="flex flex-col items-center space-y-4 text-center">
                <div className="flex h-16 w-16 items-center justify-center rounded-full bg-primary">
                  <Shield className="h-8 w-8 text-primary-foreground" />
                </div>
                <h3 className="text-xl font-bold">Secure Issuance</h3>
                <p className="text-gray-500 dark:text-gray-400">
                  Institutions can securely issue tamper-proof credentials on the blockchain
                </p>
              </div>
              <div className="flex flex-col items-center space-y-4 text-center">
                <div className="flex h-16 w-16 items-center justify-center rounded-full bg-primary">
                  <GraduationCap className="h-8 w-8 text-primary-foreground" />
                </div>
                <h3 className="text-xl font-bold">Instant Verification</h3>
                <p className="text-gray-500 dark:text-gray-400">
                  Verify the authenticity of any credential in real-time
                </p>
              </div>
              <div className="flex flex-col items-center space-y-4 text-center">
                <div className="flex h-16 w-16 items-center justify-center rounded-full bg-primary">
                  <Award className="h-8 w-8 text-primary-foreground" />
                </div>
                <h3 className="text-xl font-bold">Reputation System</h3>
                <p className="text-gray-500 dark:text-gray-400">
                  Build a digital reputation based on your verified credentials
                </p>
              </div>
            </div>
          </div>
        </section>
      </main>
      <footer className="w-full border-t py-6">
        <div className="container flex flex-col items-center justify-center gap-4 md:flex-row md:justify-between">
          <div className="flex items-center gap-2 font-semibold">
            <GraduationCap className="h-5 w-5" />
            <span>EDUVERIFY</span>
          </div>
          <p className="text-sm text-gray-500 dark:text-gray-400">© 2025 EDUVERIFY. All rights reserved.</p>
        </div>
      </footer>
    </div>
  )
}

