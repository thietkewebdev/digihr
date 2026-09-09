import { formatVnd } from "@/lib/format"
import { cn } from "@/lib/utils"

export function Money({
  value,
  className,
  muted,
}: {
  value: number
  className?: string
  muted?: boolean
}) {
  return (
    <span
      className={cn(
        "tabular-nums tracking-tight",
        muted && "text-muted-foreground",
        className
      )}
    >
      {formatVnd(value)}
    </span>
  )
}
