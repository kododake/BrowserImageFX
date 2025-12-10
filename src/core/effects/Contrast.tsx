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
import { useEffect, useMemo, useState } from 'react'
import { Contrast as ContrastIcon } from 'lucide-react'

import { Label } from '@/components/ui/label'
import { Slider } from '@/components/ui/slider'
import type { EffectControlChangeHandler } from '@/core/effects/types'
import { useFrameThrottledCallback } from '@/lib/utils'

import { BaseEffect } from './BaseEffect'

const MIN_CONTRAST = 0
const MAX_CONTRAST = 200
const DEFAULT_CONTRAST = 100

function formatContrast(value: number) {
  const delta = value - DEFAULT_CONTRAST
  if (Math.abs(delta) < 0.5) {
    return '0%'
  }
  const prefix = delta > 0 ? '+' : ''
  return `${prefix}${delta.toFixed(0)}%`
}

interface ContrastControlsProps {
  value: number
  onValueChange: (value: number) => void
}

function ContrastControls({ value, onValueChange }: ContrastControlsProps) {
  const [internalValue, setInternalValue] = useState(value)
  const throttledChange = useFrameThrottledCallback(onValueChange, 30)

  useEffect(() => {
    setInternalValue(value)
  }, [value])

  const display = useMemo(() => formatContrast(internalValue), [internalValue])

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between gap-2 text-sm">
        <div className="flex items-center gap-2 text-muted-foreground">
          <ContrastIcon className="h-4 w-4" aria-hidden="true" />
          <Label className="text-xs uppercase tracking-wide text-muted-foreground">Contrast</Label>
        </div>
        <span className="text-xs font-semibold text-foreground/90">{display}</span>
      </div>
      <Slider
        value={[internalValue]}
        min={MIN_CONTRAST}
        max={MAX_CONTRAST}
        step={1}
        onValueChange={(val) => {
          const next = val[0] ?? DEFAULT_CONTRAST
          setInternalValue(next)
          throttledChange(next)
        }}
        onValueCommit={(val) => {
          const next = val[0] ?? DEFAULT_CONTRAST
          setInternalValue(next)
          onValueChange(next)
        }}
        aria-label="Contrast adjustment"
      />
    </div>
  )
}

export class ContrastEffect extends BaseEffect {
  constructor() {
    super({
      name: 'Contrast',
      type: 'contrast',
      params: {
        amount: DEFAULT_CONTRAST,
      },
    })
  }

  apply(ctx: CanvasRenderingContext2D, width: number, height: number) {
    const rawAmount = Number(this.params.amount ?? DEFAULT_CONTRAST)
    if (!Number.isFinite(rawAmount)) {
      return
    }

    const clamped = Math.min(Math.max(rawAmount, MIN_CONTRAST), MAX_CONTRAST)
    const factor = clamped / DEFAULT_CONTRAST

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
    ctx.filter = `contrast(${factor})`
    ctx.drawImage(snapshot, 0, 0, width, height)
    ctx.restore()
  }

  renderControls(onParamsChange: EffectControlChangeHandler) {
    const value = Number(this.params.amount ?? DEFAULT_CONTRAST)

    return (
      <ContrastControls
        value={value}
        onValueChange={(amount) => {
          const safeValue = Math.min(Math.max(amount, MIN_CONTRAST), MAX_CONTRAST)
          this.setParams({ amount: safeValue })
          onParamsChange({ amount: safeValue })
        }}
      />
    )
  }
}
