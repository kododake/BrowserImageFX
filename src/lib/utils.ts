import { useCallback, useEffect, useRef } from 'react'
import { type ClassValue, clsx } from 'clsx'
import { twMerge } from 'tailwind-merge'

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function createEffectId(type: string) {
  return `${type}-${Math.random().toString(36).slice(2, 8)}`
}

export function useFrameThrottledCallback<T extends (...args: any[]) => void>(
  callback: T,
  fps = 30,
) {
  const callbackRef = useRef(callback)
  const timeoutIdRef = useRef<number | null>(null)
  const lastRunRef = useRef(0)
  const latestArgsRef = useRef<Parameters<T> | null>(null)
  const shouldThrottle = fps > 0
  const frameDuration = shouldThrottle ? 1000 / fps : 0

  useEffect(() => {
    callbackRef.current = callback
  }, [callback])

  useEffect(() => () => {
    if (timeoutIdRef.current !== null) {
      window.clearTimeout(timeoutIdRef.current)
      timeoutIdRef.current = null
    }
  }, [])

  return useCallback(
    (...args: Parameters<T>) => {
      if (!shouldThrottle) {
        callbackRef.current(...args)
        return
      }

      latestArgsRef.current = args
      const invoke = () => {
        if (!latestArgsRef.current) {
          return
        }
        lastRunRef.current = performance.now()
        callbackRef.current(...latestArgsRef.current)
        latestArgsRef.current = null
      }

      const now = performance.now()
      const elapsed = now - lastRunRef.current

      if (elapsed >= frameDuration) {
        if (timeoutIdRef.current !== null) {
          window.clearTimeout(timeoutIdRef.current)
          timeoutIdRef.current = null
        }
        invoke()
        return
      }

      if (timeoutIdRef.current === null) {
        const delay = frameDuration - elapsed
        timeoutIdRef.current = window.setTimeout(() => {
          timeoutIdRef.current = null
          invoke()
        }, delay)
      }
    },
    [frameDuration],
  ) as T
}
