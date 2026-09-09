"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { canAccess } from "@/lib/nav"
import { useHr } from "@/lib/hr-store"
import { buttonVariants } from "@/components/ui/button"
import { EmptyState } from "@/components/empty-state"
import { ShieldOff } from "lucide-react"
import { cn } from "@/lib/utils"
import type { ReactNode } from "react"

export function RoleGate({ children }: { children: ReactNode }) {
  const pathname = usePathname()
  const { role } = useHr()

  if (!canAccess(role, pathname)) {
    return (
      <EmptyState
        icon={<ShieldOff className="size-4" />}
        title="Bạn không xem được trang này"
        description="Đổi vai trò trên cùng nếu đang demo, hoặc quay lại trang chủ."
        action={
          <Link href="/dashboard" className={cn(buttonVariants())}>
            Về trang chủ
          </Link>
        }
      />
    )
  }

  return children
}
