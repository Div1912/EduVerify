"use client"

import type React from "react"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { cn } from "@/lib/utils"
import { useAuth } from "@/hooks/use-auth"
import { Award, FileCheck, Home, FileUp, Search, Settings, FileText, Building } from "lucide-react"

interface NavItem {
  title: string
  href: string
  icon: React.ComponentType<{ className?: string }>
  roles?: Array<"student" | "institution">
}

export function DashboardNav() {
  const pathname = usePathname()
  const { user } = useAuth()

  const navItems: NavItem[] = [
    {
      title: "Dashboard",
      href: "/dashboard",
      icon: Home,
    },
    {
      title: "My Credentials",
      href: "/dashboard/credentials",
      icon: FileCheck,
      roles: ["student"],
    },
    {
      title: "Issue Credential",
      href: "/dashboard/issue",
      icon: FileUp,
      roles: ["institution"],
    },
    {
      title: "Issued Credentials",
      href: "/dashboard/issued",
      icon: Building,
      roles: ["institution"],
    },
    {
      title: "Verify Credential",
      href: "/verify",
      icon: Search,
    },
    {
      title: "Reputation",
      href: "/dashboard/reputation",
      icon: Award,
      roles: ["student"],
    },
    {
      title: "AI Resume",
      href: "/dashboard/reputation/resume",
      icon: FileText,
      roles: ["student"],
    },
    {
      title: "Settings",
      href: "/dashboard/settings",
      icon: Settings,
    },
  ]

  return (
    <nav className="grid items-start gap-2 px-2 py-4">
      {navItems.map((item) => {
        // Skip items that are role-restricted and user doesn't have the role
        if (item.roles && user?.accountType && !item.roles.includes(user.accountType)) {
          return null
        }

        return (
          <Link
            key={item.href}
            href={item.href}
            className={cn(
              "group flex items-center rounded-md px-3 py-2 text-sm font-medium hover:bg-accent hover:text-accent-foreground",
              pathname === item.href ? "bg-accent text-accent-foreground" : "transparent",
            )}
          >
            <item.icon className="mr-2 h-4 w-4" />
            <span>{item.title}</span>
          </Link>
        )
      })}
    </nav>
  )
}

