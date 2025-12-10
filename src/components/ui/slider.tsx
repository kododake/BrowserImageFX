import * as React from 'react'
import * as SliderPrimitive from '@radix-ui/react-slider'

import { cn, useFrameThrottledCallback } from '@/lib/utils'

export interface SliderProps extends React.ComponentPropsWithoutRef<typeof SliderPrimitive.Root> {
  throttleFps?: number
}

export const Slider = React.forwardRef<
  React.ElementRef<typeof SliderPrimitive.Root>,
  SliderProps
>(
  (
    {
      className,
      value,
      defaultValue,
      style,
      onContextMenu,
      onValueChange,
      onValueCommit,
      throttleFps = 30,
      ...props
    },
    ref,
  ) => {
    const isThrottled = throttleFps > 0
    const [internalValue, setInternalValue] = React.useState<number[]>(() => {
      if (Array.isArray(value)) {
        return value
      }
      if (Array.isArray(defaultValue)) {
        return defaultValue
      }
      return [0]
    })

    React.useEffect(() => {
      if (Array.isArray(value)) {
        setInternalValue(value)
      }
    }, [value])

    const throttledEmit = useFrameThrottledCallback((next: number[]) => {
      onValueChange?.(next)
    }, throttleFps)

    const handleValueChange = React.useCallback(
      (next: number[]) => {
        if (isThrottled) {
          setInternalValue(next)
          throttledEmit(next)
        } else {
          onValueChange?.(next)
        }
      },
      [isThrottled, throttledEmit, onValueChange],
    )

    const handleValueCommit = React.useCallback(
      (next: number[]) => {
        if (isThrottled) {
          setInternalValue(next)
          onValueChange?.(next)
        }
        onValueCommit?.(next)
      },
      [isThrottled, onValueChange, onValueCommit],
    )

    const sliderValue = isThrottled ? internalValue : value
    const sliderDefaultValue = isThrottled ? undefined : defaultValue

    return (
      <SliderPrimitive.Root
        ref={ref}
        value={sliderValue}
        defaultValue={sliderDefaultValue}
        onValueChange={handleValueChange}
        onValueCommit={handleValueCommit}
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
    )
  },
)

Slider.displayName = SliderPrimitive.Root.displayName
