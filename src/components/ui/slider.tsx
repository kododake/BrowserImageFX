import * as React from 'react'
import * as SliderPrimitive from '@radix-ui/react-slider'

import { cn } from '@/lib/utils'

export type SliderProps = React.ComponentPropsWithoutRef<typeof SliderPrimitive.Root>

export const Slider = React.forwardRef<
  React.ElementRef<typeof SliderPrimitive.Root>,
  SliderProps
>(({ className, value, defaultValue, style, onContextMenu, ...props }, ref) => (
  <SliderPrimitive.Root
    ref={ref}
    value={value}
    defaultValue={defaultValue}
    className={cn('relative flex w-full touch-none select-none items-center', className)}
    style={{
      WebkitTouchCallout: 'none',
      WebkitUserSelect: 'none',
      ...style,
    }}
    onContextMenu={(event) => {
      event.preventDefault()
      onContextMenu?.(event)
    }}
    {...props}
  >
    <SliderPrimitive.Track className="relative h-1.5 w-full overflow-hidden rounded-full bg-white/10">
      <SliderPrimitive.Range className="absolute h-full bg-primary" />
    </SliderPrimitive.Track>
    <SliderPrimitive.Thumb className="block h-4 w-4 rounded-full border border-primary bg-background shadow-sm shadow-primary/40 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 focus-visible:ring-offset-background" />
  </SliderPrimitive.Root>
))

Slider.displayName = SliderPrimitive.Root.displayName
