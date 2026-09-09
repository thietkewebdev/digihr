"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { navFor } from "@/lib/nav"
import { useHr } from "@/lib/hr-store"
import { NavIcon } from "@/components/nav-icons"
import { cn } from "@/lib/utils"

export function BottomNav() {
  const pathname = usePathname()
  const { role } = useHr()
  const items = navFor(role).slice(0, 5)

  return (
    <nav className="fixed inset-x-0 bottom-0 z-40 border-t bg-background/95 backdrop-blur-sm print:hidden lg:hidden">
      <div className="mx-auto grid max-w-lg grid-cols-3 sm:grid-cols-none sm:flex sm:justify-around"
        style={{ gridTemplateColumns: `repeat(${Math.min(items.length, 5)}, minmax(0, 1fr))` }}
      >
        {items.map((item) => {
          const active =
            pathname === item.href || pathname.startsWith(`${item.href}/`)
          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "flex flex-col items-center gap-0.5 px-1 py-2 text-[11px]",
                active ? "text-foreground" : "text-muted-foreground"
              )}
            >
              <NavIcon name={item.icon} className="size-4" />
              {item.short}
            </Link>
          )
        })}
      </div>
    </nav>
  )
}
