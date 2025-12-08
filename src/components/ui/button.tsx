import * as React from 'react'

import { cn } from '@/lib/utils'

type ButtonVariant = 'default' | 'secondary' | 'ghost' | 'outline'

type ButtonSize = 'sm' | 'md' | 'lg'

const baseStyles: Record<ButtonVariant, string> = {
  default:
    'bg-primary text-primary-foreground hover:bg-primary/90 shadow-sm shadow-primary/30',
  secondary:
    'bg-secondary text-secondary-foreground hover:bg-secondary/80 shadow-sm shadow-secondary/20',
  ghost: 'bg-transparent hover:bg-white/10 text-foreground',
  outline:
    'border border-white/10 bg-transparent hover:bg-white/10 text-foreground shadow-sm shadow-black/20',
}

const sizeStyles: Record<ButtonSize, string> = {
  sm: 'h-9 px-3 text-sm',
  md: 'h-10 px-4 text-sm',
  lg: 'h-11 px-6 text-base',
}

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: ButtonVariant
  size?: ButtonSize
}

export const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant = 'default', size = 'md', type = 'button', ...props }, ref) => {
    return (
      <button
        type={type}
        className={cn(
          'inline-flex items-center justify-center gap-2 rounded-lg font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 focus-visible:ring-offset-background disabled:pointer-events-none disabled:opacity-60',
          baseStyles[variant],
          sizeStyles[size],
          className,
        )}
        ref={ref}
        {...props}
      />
    )
  },
)
Button.displayName = 'Button'
