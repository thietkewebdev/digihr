"use client"

import { ChevronDown } from "lucide-react"
import { useHr } from "@/lib/hr-store"
import { PersonAvatar } from "@/components/person-avatar"
import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
  DropdownMenuGroup,
} from "@/components/ui/dropdown-menu"

const ROLE_LABEL = {
  employee: "Nhân viên",
  manager: "Quản lý",
  admin: "Payroll-Admin",
}

export function RoleSwitcher() {
  const { currentUser, users, switchUser } = useHr()
  const staff = users.filter((u) => u.role === "employee")
  const leads = users.filter((u) => u.role !== "employee")

  return (
    <DropdownMenu>
      <DropdownMenuTrigger
        render={
          <Button variant="outline" className="h-9 gap-2 px-2 sm:pr-2.5" />
        }
      >
        <PersonAvatar
          name={currentUser.name}
          initials={currentUser.initials}
          size="sm"
        />
        <span className="hidden max-w-[140px] truncate text-left sm:block">
          <span className="block text-xs leading-none text-muted-foreground">
            {ROLE_LABEL[currentUser.role]}
          </span>
          <span className="block text-sm font-medium leading-tight">
            {currentUser.name}
          </span>
        </span>
        <ChevronDown className="size-3.5 text-muted-foreground" />
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-72">
        <DropdownMenuGroup>
          <DropdownMenuLabel>Demo — đổi người xem</DropdownMenuLabel>
        </DropdownMenuGroup>
        <DropdownMenuSeparator />
        <DropdownMenuGroup>
          <DropdownMenuLabel>Nhân viên</DropdownMenuLabel>
          {staff.map((user) => (
            <DropdownMenuItem
              key={user.id}
              onClick={() => switchUser(user.id)}
              className="gap-2"
            >
              <PersonAvatar
                name={user.name}
                initials={user.initials}
                size="sm"
              />
              <span className="min-w-0">
                <span className="block truncate font-medium">{user.name}</span>
                <span className="block truncate text-xs text-muted-foreground">
                  {user.id} · {user.title}
                </span>
              </span>
            </DropdownMenuItem>
          ))}
        </DropdownMenuGroup>
        <DropdownMenuSeparator />
        <DropdownMenuGroup>
          <DropdownMenuLabel>Quản lý & lương</DropdownMenuLabel>
          {leads.map((user) => (
            <DropdownMenuItem
              key={user.id}
              onClick={() => switchUser(user.id)}
              className="gap-2"
            >
              <PersonAvatar
                name={user.name}
                initials={user.initials}
                size="sm"
              />
              <span className="min-w-0">
                <span className="block truncate font-medium">{user.name}</span>
                <span className="block truncate text-xs text-muted-foreground">
                  {ROLE_LABEL[user.role]} · {user.title}
                </span>
              </span>
            </DropdownMenuItem>
          ))}
        </DropdownMenuGroup>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
