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
import { Palette } from 'lucide-react'

import { Button } from '@/components/ui/button'
import { Label } from '@/components/ui/label'
import { Slider } from '@/components/ui/slider'
import type { EffectControlChangeHandler } from '@/core/effects/types'

import { BaseEffect } from './BaseEffect'

const LUT_PRESETS = [
  { id: 'teal-orange', label: 'Teal & Orange' },
  { id: 'film', label: 'Film Fade' },
  { id: 'cool-night', label: 'Cool Night' },
  { id: 'mono', label: 'Monochrome' },
] as const

type LutPresetId = (typeof LUT_PRESETS)[number]['id']
const DEFAULT_PRESET: LutPresetId = LUT_PRESETS[0].id

const MIN_INTENSITY = 0
const MAX_INTENSITY = 100
const DEFAULT_INTENSITY = 60

function formatIntensity(value: number) {
  return `${Math.round((value / MAX_INTENSITY) * 100)}%`
}

interface LutControlsProps {
  preset: LutPresetId
  intensity: number
  onPresetChange: (preset: LutPresetId) => void
  onIntensityChange: (value: number) => void
}

function LutControls({ preset, intensity, onPresetChange, onIntensityChange }: LutControlsProps) {
  const displayIntensity = useMemo(() => formatIntensity(intensity), [intensity])

  return (
    <div className="space-y-4">
      <div className="space-y-2">
        <Label className="flex items-center gap-2 text-xs uppercase tracking-wide text-muted-foreground">
          <Palette className="h-4 w-4" aria-hidden="true" /> Preset
        </Label>
        <div className="flex flex-wrap gap-2">
          {LUT_PRESETS.map((option) => (
            <Button
              key={option.id}
              size="sm"
              type="button"
              variant={option.id === preset ? 'secondary' : 'outline'}
              className="px-3"
              onClick={() => onPresetChange(option.id)}
            >
              {option.label}
            </Button>
          ))}
        </div>
      </div>
      <div className="space-y-3">
        <div className="flex items-center justify-between gap-2 text-sm">
          <Label className="text-xs uppercase tracking-wide text-muted-foreground">Intensity</Label>
          <span className="text-xs font-semibold text-foreground/90">{displayIntensity}</span>
        </div>
        <Slider
          value={[intensity]}
          min={MIN_INTENSITY}
          max={MAX_INTENSITY}
          step={1}
          onValueChange={(val) => onIntensityChange(val[0] ?? DEFAULT_INTENSITY)}
          aria-label="LUT intensity"
        />
      </div>
    </div>
  )
}

function clampChannel(value: number) {
  return Math.max(0, Math.min(255, value))
}

function applyPreset(preset: LutPresetId, r: number, g: number, b: number): [number, number, number] {
  const avg = (r + g + b) / 3
  switch (preset) {
    case 'teal-orange': {
      const warmed = r * 1.1 + avg * 0.05
      const cooled = b * 0.85 + avg * 0.05
      const balanced = g * 1.02
      return [clampChannel(warmed), clampChannel(balanced), clampChannel(cooled)]
    }
    case 'film': {
      const faded = avg * 0.15
      return [clampChannel(r * 0.96 + faded), clampChannel(g * 0.92 + faded), clampChannel(b * 0.9 + faded)]
    }
    case 'cool-night': {
      const lifted = avg * 0.2
      const cooledRed = r * 0.85 + lifted * 0.4
      const cooledGreen = g * 0.95 + lifted * 0.3
      const cooledBlue = b * 1.2 + lifted * 0.1
      return [clampChannel(cooledRed), clampChannel(cooledGreen), clampChannel(cooledBlue)]
    }
    case 'mono': {
      return [avg, avg, avg]
    }
    default:
      return [r, g, b]
  }
}

function resolvePreset(value: unknown): LutPresetId {
  const stringValue = typeof value === 'string' ? value : DEFAULT_PRESET
  return LUT_PRESETS.some((option) => option.id === stringValue)
    ? (stringValue as LutPresetId)
    : DEFAULT_PRESET
}

export class LutEffect extends BaseEffect {
  constructor() {
    super({
      name: 'Color LUT',
      type: 'lut',
      params: {
        preset: DEFAULT_PRESET,
        intensity: DEFAULT_INTENSITY,
      },
    })
  }

  apply(ctx: CanvasRenderingContext2D, width: number, height: number) {
    const preset = resolvePreset(this.params.preset)
    const rawIntensity = Number(this.params.intensity ?? DEFAULT_INTENSITY)

    const intensity = Math.min(Math.max(rawIntensity, MIN_INTENSITY), MAX_INTENSITY)
    if (intensity <= 0) {
      return
    }

    const blend = intensity / MAX_INTENSITY
    const imageData = ctx.getImageData(0, 0, width, height)
    const { data } = imageData

    for (let i = 0; i < data.length; i += 4) {
      const r = data[i]
      const g = data[i + 1]
      const b = data[i + 2]

      const [lr, lg, lb] = applyPreset(preset, r, g, b)

      data[i] = clampChannel(r + (lr - r) * blend)
      data[i + 1] = clampChannel(g + (lg - g) * blend)
      data[i + 2] = clampChannel(b + (lb - b) * blend)
    }

    ctx.putImageData(imageData, 0, 0)
  }

  renderControls(onParamsChange: EffectControlChangeHandler) {
    const preset = resolvePreset(this.params.preset)
    const intensity = Number(this.params.intensity ?? DEFAULT_INTENSITY)

    return (
      <LutControls
        preset={preset}
        intensity={intensity}
        onPresetChange={(nextPreset) => {
          this.setParams({ preset: nextPreset })
          onParamsChange({ preset: nextPreset })
        }}
        onIntensityChange={(nextIntensity) => {
          const safeValue = Math.min(Math.max(nextIntensity, MIN_INTENSITY), MAX_INTENSITY)
          this.setParams({ intensity: safeValue })
          onParamsChange({ intensity: safeValue })
        }}
      />
    )
  }
}
