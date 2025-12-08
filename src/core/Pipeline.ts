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

import type { IEffect } from '@/core/effects/types'

interface RenderInput {
  image: HTMLImageElement | HTMLCanvasElement
  canvas: HTMLCanvasElement
  effects: IEffect[]
}

export class EffectPipeline {
  private readonly workingCanvas: HTMLCanvasElement
  private readonly workingCtx: CanvasRenderingContext2D | null

  constructor() {
    this.workingCanvas = document.createElement('canvas')
    this.workingCtx = this.workingCanvas.getContext('2d')
  }

  render({ image, canvas, effects }: RenderInput) {
    if (!image) {
      return
    }

    const width = 'naturalWidth' in image ? image.naturalWidth : image.width
    const height = 'naturalHeight' in image ? image.naturalHeight : image.height

    if (!width || !height) {
      return
    }

    const targetCtx = canvas.getContext('2d')
    if (!targetCtx || !this.workingCtx) {
      return
    }

    canvas.width = width
    canvas.height = height
    this.workingCanvas.width = width
    this.workingCanvas.height = height

    this.workingCtx.clearRect(0, 0, width, height)
    this.workingCtx.drawImage(image, 0, 0, width, height)

    for (const effect of effects) {
      if (!effect.isEnabled) {
        continue
      }
      effect.apply(this.workingCtx, width, height)
    }

    targetCtx.clearRect(0, 0, width, height)
    targetCtx.drawImage(this.workingCanvas, 0, 0, width, height)
  }
}
