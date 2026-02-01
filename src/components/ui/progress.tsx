import * as ProgressPrimitive from "@radix-ui/react-progress"
import * as React from "react"

import { cn } from "@/lib/utils"

interface ProgressProps
  extends React.ComponentPropsWithoutRef<typeof ProgressPrimitive.Root> {
  indicatorClassName?: string
  variant?: 'default' | 'blue' | 'green' | 'red' | 'orange' | 'purple' | 'cyan' | 'gradient'
}

const Progress = React.forwardRef<
  React.ElementRef<typeof ProgressPrimitive.Root>,
  ProgressProps
>(({ className, value, indicatorClassName, variant = 'default', ...props }, ref) => {
  const variantStyles = {
    default: 'bg-primary',
    blue: 'bg-gradient-to-r from-blue-500 to-blue-600',
    green: 'bg-gradient-to-r from-green-500 to-green-600',
    red: 'bg-gradient-to-r from-red-500 to-red-600',
    orange: 'bg-gradient-to-r from-orange-500 to-orange-600',
    purple: 'bg-gradient-to-r from-purple-500 to-purple-600',
    cyan: 'bg-gradient-to-r from-cyan-500 to-cyan-600',
    gradient: 'bg-gradient-to-r from-blue-500 via-purple-500 to-pink-500',
  }

  return (
    <ProgressPrimitive.Root
      ref={ref}
      className={cn(
        "relative h-4 w-full overflow-hidden rounded-full bg-secondary",
        className
      )}
      {...props}
    >
      <ProgressPrimitive.Indicator
        className={cn(
          "h-full w-full flex-1 transition-all duration-500 ease-out",
          variantStyles[variant],
          indicatorClassName
        )}
        style={{ transform: `translateX(-${100 - (value || 0)}%)` }}
      />
    </ProgressPrimitive.Root>
  )
})
Progress.displayName = ProgressPrimitive.Root.displayName

export { Progress }
