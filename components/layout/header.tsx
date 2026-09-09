"use client"

import { BrandWordmark } from "@/components/brand"
import { RoleSwitcher } from "@/components/layout/role-switcher"
import { periodLabel } from "@/lib/format"
import { useHr } from "@/lib/hr-store"

export function Header() {
  const { period } = useHr()

  return (
    <header className="sticky top-0 z-30 flex h-14 items-center justify-between gap-3 border-b bg-background/90 px-4 backdrop-blur-sm print:hidden">
      <div className="lg:hidden">
        <BrandWordmark />
      </div>
      <div className="hidden text-sm text-muted-foreground lg:block">
        Kỳ lương <span className="font-medium text-foreground">{periodLabel(period)}</span>
      </div>
      <RoleSwitcher />
    </header>
  )
}
