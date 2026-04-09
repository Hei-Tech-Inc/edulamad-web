import * as React from "react"

import { cn } from "@/lib/utils"

function Textarea({ className, ...props }: React.ComponentProps<"textarea">) {
  return (
    <textarea
      data-slot="textarea"
      className={cn(
        "flex field-sizing-content min-h-16 w-full rounded-md border border-slate-300 bg-white px-2.5 py-2 text-base text-slate-900 transition-colors outline-none placeholder:text-slate-500 focus-visible:border-teal-700 focus-visible:ring-1 focus-visible:ring-teal-600/35 disabled:cursor-not-allowed disabled:bg-slate-50 disabled:opacity-60 aria-invalid:border-red-500 aria-invalid:ring-1 aria-invalid:ring-red-500/25 md:text-sm dark:border-slate-600 dark:bg-slate-950 dark:text-slate-100 dark:placeholder:text-slate-500 dark:disabled:bg-slate-900",
        className
      )}
      {...props}
    />
  )
}

export { Textarea }
