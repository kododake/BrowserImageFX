import type { ReactNode } from 'react'

export type EffectType =
  | 'gaussian-blur'
  | 'brightness'
  | 'contrast'
  | 'lut'
  | 'vignette'
  | 'color-temperature'

export type EffectParams = Record<string, number | boolean | string>

export type EffectControlChangeHandler = (params: EffectParams) => void

export interface IEffect {
  id: string
  name: string
  type: EffectType
  params: EffectParams
  isEnabled: boolean
  setParams: (params: EffectParams) => void
  toggleEnabled: () => void
  apply: (ctx: CanvasRenderingContext2D, width: number, height: number) => void
  renderControls: (onParamsChange: EffectControlChangeHandler) => ReactNode
}
