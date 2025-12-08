import { create } from 'zustand'

import type { EffectParams, IEffect } from '@/core/effects/types'

export interface EffectState {
  effects: IEffect[]
  addEffect: (effect: IEffect) => void
  updateEffectParams: (id: string, params: EffectParams) => void
  toggleEffect: (id: string) => void
  removeEffect: (id: string) => void
  moveEffect: (id: string, direction: 'up' | 'down') => void
  clear: () => void
}

export const useEffectStore = create<EffectState>((set) => ({
  effects: [],
  addEffect: (effect) =>
    set((state) => ({
      effects: [...state.effects, effect],
    })),
  updateEffectParams: (id, params) =>
    set((state) => {
      const target = state.effects.find((effect) => effect.id === id)
      target?.setParams(params)
      return { effects: [...state.effects] }
    }),
  toggleEffect: (id) =>
    set((state) => {
      const target = state.effects.find((effect) => effect.id === id)
      target?.toggleEnabled()
      return { effects: [...state.effects] }
    }),
  removeEffect: (id) =>
    set((state) => ({
      effects: state.effects.filter((effect) => effect.id !== id),
    })),
  moveEffect: (id, direction) =>
    set((state) => {
      const index = state.effects.findIndex((effect) => effect.id === id)
      if (index === -1) {
        return { effects: [...state.effects] }
      }
      const nextIndex = direction === 'up' ? index - 1 : index + 1
      if (nextIndex < 0 || nextIndex >= state.effects.length) {
        return { effects: [...state.effects] }
      }
      const next = [...state.effects]
      const [item] = next.splice(index, 1)
      next.splice(nextIndex, 0, item)
      return { effects: next }
    }),
  clear: () => set({ effects: [] }),
}))
