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
import { ThermometerSun } from 'lucide-react'

import { Label } from '@/components/ui/label'
import { Slider } from '@/components/ui/slider'
import type { EffectControlChangeHandler } from '@/core/effects/types'

import { BaseEffect } from './BaseEffect'

const MIN_TEMPERATURE = -100
const MAX_TEMPERATURE = 100
const DEFAULT_TEMPERATURE = 0

function formatTemperature(value: number) {
  if (value === 0) {
    return 'Neutral'
  }
  return value > 0 ? `Warm +${value}` : `Cool ${value}`
}

interface ColorTemperatureControlsProps {
  value: number
  onValueChange: (value: number) => void
}

function ColorTemperatureControls({ value, onValueChange }: ColorTemperatureControlsProps) {
  const display = useMemo(() => formatTemperature(value), [value])

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between gap-2 text-sm">
        <div className="flex items-center gap-2 text-muted-foreground">
          <ThermometerSun className="h-4 w-4" aria-hidden="true" />
          <Label className="text-xs uppercase tracking-wide text-muted-foreground">Temperature</Label>
        </div>
        <span className="text-xs font-semibold text-foreground/90">{display}</span>
      </div>
      <Slider
        value={[value]}
        min={MIN_TEMPERATURE}
        max={MAX_TEMPERATURE}
        step={1}
        onValueChange={(val) => onValueChange(val[0] ?? DEFAULT_TEMPERATURE)}
        aria-label="Color temperature"
      />
    </div>
  )
}

export class ColorTemperatureEffect extends BaseEffect {
  constructor() {
    super({
      name: 'Color Temperature',
      type: 'color-temperature',
      params: {
        temperature: DEFAULT_TEMPERATURE,
      },
    })
  }

  apply(ctx: CanvasRenderingContext2D, width: number, height: number) {
    const rawTemp = Number(this.params.temperature ?? DEFAULT_TEMPERATURE)
    if (!Number.isFinite(rawTemp)) {
      return
    }

    const temperature = clamp(rawTemp, MIN_TEMPERATURE, MAX_TEMPERATURE)
    if (temperature === 0) {
      return
    }

    const imageData = ctx.getImageData(0, 0, width, height)
    const { data } = imageData
    const normalized = temperature / MAX_TEMPERATURE

    const warmBoost = normalized > 0 ? normalized : 0
    const coolBoost = normalized < 0 ? -normalized : 0

    const redScale = 1 + warmBoost * 0.4 - coolBoost * 0.1
    const greenScale = 1 + warmBoost * 0.1 - coolBoost * 0.1
    const blueScale = 1 - warmBoost * 0.2 + coolBoost * 0.5

    for (let i = 0; i < data.length; i += 4) {
      data[i] = clampChannel(data[i] * redScale)
      data[i + 1] = clampChannel(data[i + 1] * greenScale)
      data[i + 2] = clampChannel(data[i + 2] * blueScale)
    }

    ctx.putImageData(imageData, 0, 0)
  }

  renderControls(onParamsChange: EffectControlChangeHandler) {
    const value = clamp(Number(this.params.temperature ?? DEFAULT_TEMPERATURE), MIN_TEMPERATURE, MAX_TEMPERATURE)

    return (
      <ColorTemperatureControls
        value={value}
        onValueChange={(next) => {
          const safeValue = clamp(next, MIN_TEMPERATURE, MAX_TEMPERATURE)
          this.setParams({ temperature: safeValue })
          onParamsChange({ temperature: safeValue })
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

function clampChannel(value: number) {
  return Math.max(0, Math.min(255, Math.round(value)))
}
