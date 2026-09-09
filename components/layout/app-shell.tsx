"use client"

import { SidebarNav } from "@/components/layout/sidebar-nav"
import { Header } from "@/components/layout/header"
import { BottomNav } from "@/components/layout/bottom-nav"
import { RoleGate } from "@/components/role-gate"

export function AppShell({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex min-h-dvh bg-[#f6f7f5] print:bg-white">
      <SidebarNav />
      <div className="flex min-w-0 flex-1 flex-col">
        <Header />
        <main className="mx-auto w-full max-w-6xl flex-1 px-4 py-6 pb-24 lg:px-8 lg:pb-10 print:max-w-none print:p-0">
          <RoleGate>{children}</RoleGate>
        </main>
      </div>
      <BottomNav />
    </div>
  )
}
