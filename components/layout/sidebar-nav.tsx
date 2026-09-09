"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { navFor } from "@/lib/nav"
import { useHr } from "@/lib/hr-store"
import { BrandWordmark } from "@/components/brand"
import { NavIcon } from "@/components/nav-icons"
import { cn } from "@/lib/utils"

export function SidebarNav() {
  const pathname = usePathname()
  const { role } = useHr()
  const items = navFor(role)

  return (
    <aside className="hidden w-56 shrink-0 border-r bg-sidebar print:hidden lg:flex lg:flex-col">
      <div className="px-4 py-5">
        <BrandWordmark />
      </div>
      <nav className="flex flex-1 flex-col gap-0.5 px-3">
        {items.map((item) => {
          const active =
            pathname === item.href || pathname.startsWith(`${item.href}/`)
          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "flex items-center gap-2.5 rounded-lg px-2.5 py-2 text-sm transition-colors",
                active
                  ? "bg-sidebar-accent font-medium text-foreground"
                  : "text-muted-foreground hover:bg-sidebar-accent/70 hover:text-foreground"
              )}
            >
              <NavIcon name={item.icon} className="size-4" />
              {item.label}
            </Link>
          )
        })}
      </nav>
      <p className="px-5 pb-5 text-[11px] leading-relaxed text-muted-foreground">
        Demo nội bộ — dữ liệu mẫu, chưa kết nối hệ thống thật.
      </p>
    </aside>
  )
}
