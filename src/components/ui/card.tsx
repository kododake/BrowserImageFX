import * as React from 'react'

import { cn } from '@/lib/utils'

export type CardProps = React.HTMLAttributes<HTMLDivElement>

export function Card({ className, ...props }: CardProps) {
  return (
    <div
      className={cn(
        'rounded-xl border border-white/10 bg-card/40 p-5 shadow-lg shadow-black/20 backdrop-blur-2xl transition-colors',
        className,
      )}
      {...props}
    />
  )
}

export function CardHeader(
  { className, ...props }: React.HTMLAttributes<HTMLDivElement>,
) {
  return (
    <div className={cn('mb-4 space-y-1', className)} {...props} />
  )
}

export function CardTitle({ className, ...props }: React.HTMLAttributes<HTMLHeadingElement>) {
  return <h3 className={cn('text-sm font-semibold uppercase tracking-wide text-muted-foreground', className)} {...props} />
}

export function CardContent({ className, ...props }: React.HTMLAttributes<HTMLDivElement>) {
  return <div className={cn('space-y-3 text-sm text-muted-foreground', className)} {...props} />
}
