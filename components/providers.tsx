"use client"

import type { ReactNode } from "react"
import { ThemeProvider } from "next-themes"
import { TooltipProvider } from "@/components/ui/tooltip"
import { Toaster } from "@/components/ui/sonner"
import { HrProvider } from "@/lib/hr-store"

export function Providers({ children }: { children: ReactNode }) {
  return (
    <ThemeProvider attribute="class" defaultTheme="light" enableSystem={false}>
      <HrProvider>
        <TooltipProvider>
          {children}
          <Toaster />
        </TooltipProvider>
      </HrProvider>
    </ThemeProvider>
  )
}
