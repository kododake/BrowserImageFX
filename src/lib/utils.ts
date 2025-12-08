import { type ClassValue, clsx } from 'clsx'
import { twMerge } from 'tailwind-merge'

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function createEffectId(type: string) {
  return `${type}-${Math.random().toString(36).slice(2, 8)}`
}
