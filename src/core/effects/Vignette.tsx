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
import { Circle } from 'lucide-react'

import { Label } from '@/components/ui/label'
import { Slider } from '@/components/ui/slider'
import type { EffectControlChangeHandler } from '@/core/effects/types'
import { useFrameThrottledCallback } from '@/lib/utils'

import { BaseEffect } from './BaseEffect'

const MIN_STRENGTH = 0
const MAX_STRENGTH = 1
const DEFAULT_STRENGTH = 0.35

const MIN_RADIUS = 0.3
const MAX_RADIUS = 1
const DEFAULT_RADIUS = 0.75

function formatPercentage(value: number) {
  return `${Math.round(value * 100)}%`
}

interface VignetteControlsProps {
  strength: number
  radius: number
  onStrengthChange: (value: number) => void
  onRadiusChange: (value: number) => void
}

function VignetteControls({ strength, radius, onStrengthChange, onRadiusChange }: VignetteControlsProps) {
  const [internalStrength, setInternalStrength] = useState(strength)
  const [internalRadius, setInternalRadius] = useState(radius)
  const throttledStrength = useFrameThrottledCallback(onStrengthChange, 30)
  const throttledRadius = useFrameThrottledCallback(onRadiusChange, 30)

  useEffect(() => {
    setInternalStrength(strength)
  }, [strength])

  useEffect(() => {
    setInternalRadius(radius)
  }, [radius])

  const strengthLabel = useMemo(() => formatPercentage(internalStrength), [internalStrength])
  const radiusLabel = useMemo(() => formatPercentage(internalRadius), [internalRadius])

  return (
    <div className="space-y-4">
      <div className="space-y-3">
        <div className="flex items-center justify-between gap-2 text-sm">
          <div className="flex items-center gap-2 text-muted-foreground">
            <Circle className="h-4 w-4" aria-hidden="true" />
            <Label className="text-xs uppercase tracking-wide text-muted-foreground">Strength</Label>
          </div>
          <span className="text-xs font-semibold text-foreground/90">{strengthLabel}</span>
        </div>
        <Slider
          value={[internalStrength]}
          min={MIN_STRENGTH}
          max={MAX_STRENGTH}
          step={0.01}
          onValueChange={(val) => {
            const next = val[0] ?? DEFAULT_STRENGTH
            setInternalStrength(next)
            throttledStrength(next)
          }}
          onValueCommit={(val) => {
            const next = val[0] ?? DEFAULT_STRENGTH
            setInternalStrength(next)
            onStrengthChange(next)
          }}
          aria-label="Vignette strength"
        />
      </div>
      <div className="space-y-3">
        <div className="flex items-center justify-between gap-2 text-sm">
          <Label className="text-xs uppercase tracking-wide text-muted-foreground">Radius</Label>
          <span className="text-xs font-semibold text-foreground/90">{radiusLabel}</span>
        </div>
        <Slider
          value={[internalRadius]}
          min={MIN_RADIUS}
          max={MAX_RADIUS}
          step={0.01}
          onValueChange={(val) => {
            const next = val[0] ?? DEFAULT_RADIUS
            setInternalRadius(next)
            throttledRadius(next)
          }}
          onValueCommit={(val) => {
            const next = val[0] ?? DEFAULT_RADIUS
            setInternalRadius(next)
            onRadiusChange(next)
          }}
          aria-label="Vignette radius"
        />
      </div>
    </div>
  )
}

export class VignetteEffect extends BaseEffect {
  constructor() {
    super({
      name: 'Vignette',
      type: 'vignette',
      params: {
        strength: DEFAULT_STRENGTH,
        radius: DEFAULT_RADIUS,
      },
    })
  }

  apply(ctx: CanvasRenderingContext2D, width: number, height: number) {
    const strength = clamp(Number(this.params.strength ?? DEFAULT_STRENGTH), MIN_STRENGTH, MAX_STRENGTH)
    const radius = clamp(Number(this.params.radius ?? DEFAULT_RADIUS), MIN_RADIUS, MAX_RADIUS)

    if (strength <= 0) {
      return
    }

    const centerX = width / 2
    const centerY = height / 2
    const maxRadius = Math.sqrt(centerX ** 2 + centerY ** 2)
    const innerRadius = maxRadius * Math.min(radius, 0.95)

    ctx.save()
    const gradient = ctx.createRadialGradient(centerX, centerY, innerRadius, centerX, centerY, maxRadius)
    gradient.addColorStop(0, 'rgba(0, 0, 0, 0)')
    gradient.addColorStop(1, `rgba(0, 0, 0, ${strength})`)

    ctx.fillStyle = gradient
    ctx.fillRect(0, 0, width, height)
    ctx.restore()
  }

  renderControls(onParamsChange: EffectControlChangeHandler) {
    const strength = clamp(Number(this.params.strength ?? DEFAULT_STRENGTH), MIN_STRENGTH, MAX_STRENGTH)
    const radius = clamp(Number(this.params.radius ?? DEFAULT_RADIUS), MIN_RADIUS, MAX_RADIUS)

    return (
      <VignetteControls
        strength={strength}
        radius={radius}
        onStrengthChange={(value) => {
          const safeValue = clamp(value, MIN_STRENGTH, MAX_STRENGTH)
          this.setParams({ strength: safeValue })
          onParamsChange({ strength: safeValue })
        }}
        onRadiusChange={(value) => {
          const safeValue = clamp(value, MIN_RADIUS, MAX_RADIUS)
          this.setParams({ radius: safeValue })
          onParamsChange({ radius: safeValue })
        }}
      />
    )
  }
}

function clamp(value: number, min: number, max: number) {
  if (!Number.isFinite(value)) {
    return min
  }
  return Math.min(Math.max(value, min), max)
}
