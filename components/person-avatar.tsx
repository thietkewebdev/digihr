import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { cn } from "@/lib/utils"

const COLORS = [
  "bg-emerald-100 text-emerald-800",
  "bg-sky-100 text-sky-800",
  "bg-violet-100 text-violet-800",
  "bg-amber-100 text-amber-800",
  "bg-rose-100 text-rose-800",
  "bg-teal-100 text-teal-800",
]

function tone(seed: string) {
  const n = [...seed].reduce((s, c) => s + c.charCodeAt(0), 0)
  return COLORS[n % COLORS.length]
}

export function PersonAvatar({
  name,
  initials,
  size = "default",
}: {
  name: string
  initials: string
  size?: "sm" | "default" | "lg"
}) {
  return (
    <Avatar size={size}>
      <AvatarFallback className={cn(tone(name), "font-medium")}>
        {initials}
      </AvatarFallback>
    </Avatar>
  )
}
