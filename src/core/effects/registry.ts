import type { IEffect, EffectType } from './types'
import { GaussianBlurEffect } from './GaussianBlur'
import { BrightnessEffect } from './Brightness'
import { ContrastEffect } from './Contrast'

export interface EffectDefinition {
  type: EffectType
  name: string
  description: string
  create: () => IEffect
}

const definitions: EffectDefinition[] = [
  {
    type: 'brightness',
    name: 'Brightness',
    description: 'Brighten or darken the image with a simple percentage-based adjustment.',
    create: () => new BrightnessEffect(),
  },
  {
    type: 'contrast',
    name: 'Contrast',
    description: 'Increase or decrease the image contrast to emphasize shadows and highlights.',
    create: () => new ContrastEffect(),
  },
  {
    type: 'gaussian-blur',
    name: 'Gaussian Blur',
    description: 'Softens details by applying a configurable Gaussian blur.',
    create: () => new GaussianBlurEffect(),
  },
]

const definitionMap = new Map<EffectType, EffectDefinition>()
for (const def of definitions) {
  definitionMap.set(def.type, def)
}

export function listAvailableEffects(): EffectDefinition[] {
  return definitions
}

export function createEffect(type: EffectType): IEffect | undefined {
  return definitionMap.get(type)?.create()
}
