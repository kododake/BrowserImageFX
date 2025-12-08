import type { ReactNode } from 'react'

import { createEffectId } from '@/lib/utils'

import type { EffectParams, EffectType, IEffect, EffectControlChangeHandler } from './types'

export abstract class BaseEffect implements IEffect {
  id: string
  name: string
  type: EffectType
  params: EffectParams
  isEnabled: boolean

  protected constructor({ name, type, params }: { name: string; type: EffectType; params: EffectParams }) {
    this.id = createEffectId(type)
    this.name = name
    this.type = type
    this.params = params
    this.isEnabled = true
  }

  setParams(params: EffectParams) {
    this.params = { ...this.params, ...params }
  }

  toggleEnabled() {
    this.isEnabled = !this.isEnabled
  }

  abstract apply(ctx: CanvasRenderingContext2D, width: number, height: number): void

  abstract renderControls(onParamsChange: EffectControlChangeHandler): ReactNode
}
