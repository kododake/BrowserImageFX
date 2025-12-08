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
import { Droplets } from 'lucide-react'

import { Label } from '@/components/ui/label'
import { Slider } from '@/components/ui/slider'
import type { EffectControlChangeHandler } from '@/core/effects/types'

import { BaseEffect } from './BaseEffect'

const MAX_RADIUS = 200

function formatBlurValue(value: number) {
  return `${value.toFixed(0)} px`
}

interface GaussianBlurControlsProps {
  value: number
  onValueChange: (value: number) => void
}

function GaussianBlurControls({ value, onValueChange }: GaussianBlurControlsProps) {
  const display = useMemo(() => formatBlurValue(value), [value])

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between gap-2 text-sm">
        <div className="flex items-center gap-2 text-muted-foreground">
          <Droplets className="h-4 w-4" aria-hidden="true" />
          <Label className="text-xs uppercase tracking-wide text-muted-foreground">Radius</Label>
        </div>
        <span className="text-xs font-semibold text-foreground/90">{display}</span>
      </div>
      <Slider
        value={[value]}
        min={0}
        max={MAX_RADIUS}
        step={1}
        onValueChange={(val) => onValueChange(val[0] ?? 0)}
        aria-label="Gaussian blur radius"
      />
    </div>
  )
}

export class GaussianBlurEffect extends BaseEffect {
  constructor() {
    super({
      name: 'Gaussian Blur',
      type: 'gaussian-blur',
      params: {
        radius: 12,
      },
    })
  }

  apply(ctx: CanvasRenderingContext2D, width: number, height: number) {
    const radius = Number(this.params.radius ?? 0)
    if (!Number.isFinite(radius) || radius <= 0) {
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
    ctx.filter = `blur(${radius}px)`
    ctx.drawImage(snapshot, 0, 0, width, height)
    ctx.restore()
  }

  renderControls(onParamsChange: EffectControlChangeHandler) {
    const value = Number(this.params.radius ?? 0)

    return (
      <GaussianBlurControls
        value={value}
        onValueChange={(radius) => {
          const safeValue = Math.min(Math.max(radius, 0), MAX_RADIUS)
          this.setParams({ radius: safeValue })
          onParamsChange({ radius: safeValue })
        }}
      />
    )
  }
}
