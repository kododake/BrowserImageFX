/*
 * BrowserImageFX
 * Copyright (C) 2025 kododake
 *
 * This program is free software: you can redistribute it and/or modify
 * it under the terms of the GNU Affero General Public License as
 * published by the Free Software Foundation, either version 3 of the
 * License, or (at your option) any later version.
 *
 * This program is distributed in the hope that it will be useful,
 * but WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE. See the
 * GNU Affero General Public License for more details.
 *
 * You should have received a copy of the GNU Affero General Public License
 * along with this program. If not, see <https://www.gnu.org/licenses/>.
 */

/* eslint-disable react-refresh/only-export-components */
import { useMemo } from 'react'
import { SunMedium } from 'lucide-react'

import { Label } from '@/components/ui/label'
import { Slider } from '@/components/ui/slider'
import type { EffectControlChangeHandler } from '@/core/effects/types'

import { BaseEffect } from './BaseEffect'

const MIN_BRIGHTNESS = 0
const MAX_BRIGHTNESS = 200
const DEFAULT_BRIGHTNESS = 100

function formatBrightness(value: number) {
  const delta = value - DEFAULT_BRIGHTNESS
  if (Math.abs(delta) < 0.5) {
    return '0%'
  }
  const prefix = delta > 0 ? '+' : ''
  return `${prefix}${delta.toFixed(0)}%`
}

interface BrightnessControlsProps {
  value: number
  onValueChange: (value: number) => void
}

function BrightnessControls({ value, onValueChange }: BrightnessControlsProps) {
  const display = useMemo(() => formatBrightness(value), [value])

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between gap-2 text-sm">
        <div className="flex items-center gap-2 text-muted-foreground">
          <SunMedium className="h-4 w-4" aria-hidden="true" />
          <Label className="text-xs uppercase tracking-wide text-muted-foreground">Brightness</Label>
        </div>
        <span className="text-xs font-semibold text-foreground/90">{display}</span>
      </div>
      <Slider
        value={[value]}
        min={MIN_BRIGHTNESS}
        max={MAX_BRIGHTNESS}
        step={1}
        onValueChange={(val) => onValueChange(val[0] ?? DEFAULT_BRIGHTNESS)}
        aria-label="Brightness adjustment"
      />
    </div>
  )
}

export class BrightnessEffect extends BaseEffect {
  constructor() {
    super({
      name: 'Brightness',
      type: 'brightness',
      params: {
        amount: DEFAULT_BRIGHTNESS,
      },
    })
  }

  apply(ctx: CanvasRenderingContext2D, width: number, height: number) {
    const rawAmount = Number(this.params.amount ?? DEFAULT_BRIGHTNESS)
    if (!Number.isFinite(rawAmount)) {
      return
    }

    const clamped = Math.min(Math.max(rawAmount, MIN_BRIGHTNESS), MAX_BRIGHTNESS)
    const factor = clamped / DEFAULT_BRIGHTNESS

    if (Math.abs(factor - 1) < 0.01) {
      return
    }

    const snapshot = document.createElement('canvas')
    snapshot.width = width
    snapshot.height = height
    const snapshotCtx = snapshot.getContext('2d')
    if (!snapshotCtx) {
      return
    }

    snapshotCtx.drawImage(ctx.canvas, 0, 0, width, height)

    ctx.save()
    ctx.clearRect(0, 0, width, height)
    ctx.filter = `brightness(${factor})`
    ctx.drawImage(snapshot, 0, 0, width, height)
    ctx.restore()
  }

  renderControls(onParamsChange: EffectControlChangeHandler) {
    const value = Number(this.params.amount ?? DEFAULT_BRIGHTNESS)

    return (
      <BrightnessControls
        value={value}
        onValueChange={(amount) => {
          const safeValue = Math.min(Math.max(amount, MIN_BRIGHTNESS), MAX_BRIGHTNESS)
          this.setParams({ amount: safeValue })
          onParamsChange({ amount: safeValue })
        }}
      />
    )
  }
}
