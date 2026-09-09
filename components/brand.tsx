export function BrandMark({ className }: { className?: string }) {
  return (
    <div className={className}>
      <div className="flex size-8 items-center justify-center rounded-lg bg-[#1f6b4a] text-white">
        <svg
          viewBox="0 0 24 24"
          className="size-4"
          fill="none"
          aria-hidden="true"
        >
          <path
            d="M5 16.5c3.5-1 5.2-4.2 6-8.5.8 4.3 2.5 7.5 6 8.5-2.4 2.6-6 3.4-6 3.4s-3.6-.8-6-3.4Z"
            fill="currentColor"
          />
          <path
            d="M12 4c.4 3.8-1 7.2-4 9.2C10.6 15.4 12 18 12 18s1.4-2.6 4-4.8C13 11.2 11.6 7.8 12 4Z"
            fill="currentColor"
            className="opacity-80"
          />
        </svg>
      </div>
    </div>
  )
}

export function BrandWordmark() {
  return (
    <div className="flex items-center gap-2.5">
      <BrandMark />
      <div className="leading-tight">
        <div className="text-sm font-semibold tracking-tight">DigiHR</div>
        <div className="text-[11px] text-muted-foreground">GREENSOFT</div>
      </div>
    </div>
  )
}
