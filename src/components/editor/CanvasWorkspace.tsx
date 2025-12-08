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

import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { Download, ImageIcon, RefreshCcw, UploadCloud } from 'lucide-react'

import { Button } from '@/components/ui/button'
import { Label } from '@/components/ui/label'
import { Slider } from '@/components/ui/slider'
import { EffectPipeline } from '@/core/Pipeline'
import { HDRLoader } from '@/core/hdr/RgbeLoader'
import { ToneMappingRenderer } from '@/core/hdr/ToneMappingRenderer'
import { useEffectStore } from '@/store/effects'

async function loadImage(file: File): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const url = URL.createObjectURL(file)
    const img = new Image()
    img.onload = () => {
      URL.revokeObjectURL(url)
      resolve(img)
    }
    img.onerror = (err) => {
      URL.revokeObjectURL(url)
      reject(err)
    }
    img.src = url
  })
}

export function CanvasWorkspace() {
  const effects = useEffectStore((state) => state.effects)
  const clearEffects = useEffectStore((state) => state.clear)
  const fileInputRef = useRef<HTMLInputElement | null>(null)
  const canvasRef = useRef<HTMLCanvasElement | null>(null)
  const pipeline = useMemo(() => new EffectPipeline(), [])
  const toneMappingRenderer = useMemo(() => {
    try {
      return new ToneMappingRenderer()
    } catch (error) {
      console.warn((error as Error).message)
      return null
    }
  }, [])
  const [image, setImage] = useState<HTMLImageElement | HTMLCanvasElement | null>(null)
  const [isDragging, setIsDragging] = useState(false)
  const [zoom, setZoom] = useState(1)
  const [hdrWarning, setHdrWarning] = useState<string | null>(null)

  useEffect(() => () => toneMappingRenderer?.dispose(), [toneMappingRenderer])

  const renderPreview = useCallback(() => {
    if (!canvasRef.current || !image) {
      return
    }
    pipeline.render({ image, canvas: canvasRef.current, effects })
  }, [effects, image, pipeline])

  useEffect(() => {
    renderPreview()
  }, [renderPreview])

  const handleFiles = useCallback(
    async (fileList: FileList | null) => {
      if (!fileList || fileList.length === 0) {
        return
      }
      const file = fileList.item(0)
      if (!file || !file.type.startsWith('image/')) {
        return
      }
      const filename = file.name.toLowerCase()
      if (filename.endsWith('.hdr')) {
        try {
          const hdr = await HDRLoader.load(file)
          if (!toneMappingRenderer) {
            setHdrWarning('WebGL2 に対応していないため HDR 画像を処理できません。対応ブラウザをご利用ください。')
            setImage(null)
            return
          }
          const tonemapped = toneMappingRenderer.render(hdr, {
            exposure: 1.0,
            gamma: 2.2,
          })
          setImage(tonemapped)
          setHdrWarning(null)
        } catch (error) {
          console.error('Failed to load HDR image', error)
          setHdrWarning('HDR 画像のデコードに失敗しました。ファイルが破損している可能性があります。')
          setImage(null)
        }
      } else {
        try {
          const loadedImage = await loadImage(file)
          setHdrWarning(null)
          setImage(loadedImage)
        } catch (error) {
          console.error('Failed to load image', error)
        }
      }
      if (fileInputRef.current) {
        fileInputRef.current.value = ''
      }
    },
    [toneMappingRenderer],
  )



  const onDrop = useCallback(
    (event: React.DragEvent<HTMLDivElement>) => {
      event.preventDefault()
      setIsDragging(false)
      handleFiles(event.dataTransfer.files)
    },
    [handleFiles],
  )

  const onDragOver = useCallback((event: React.DragEvent<HTMLDivElement>) => {
    event.preventDefault()
    setIsDragging(true)
  }, [])

  const onDragLeave = useCallback((event: React.DragEvent<HTMLDivElement>) => {
    event.preventDefault()
    setIsDragging(false)
  }, [])

  const handleSelectFile = useCallback(() => {
    fileInputRef.current?.click()
  }, [])

  const handleFileInput = useCallback(
    (event: React.ChangeEvent<HTMLInputElement>) => {
      handleFiles(event.target.files)
    },
    [handleFiles],
  )

  const handleDownload = useCallback(() => {
    if (!canvasRef.current) {
      return
    }
    const link = document.createElement('a')
    link.download = 'browserimagefx.png'
    link.href = canvasRef.current.toDataURL('image/png')
    link.click()
  }, [])

  const resetView = useCallback(() => {
    setZoom(1)
    clearEffects()
    setImage(null)
    setHdrWarning(null)
    if (fileInputRef.current) {
      fileInputRef.current.value = ''
    }
    if (canvasRef.current) {
      const ctx = canvasRef.current.getContext('2d')
      if (ctx) {
        ctx.clearRect(0, 0, canvasRef.current.width, canvasRef.current.height)
      }
    }
  }, [clearEffects])

  const zoomPercentage = Math.round(zoom * 100)

  return (
    <div className="flex h-full flex-col">
      <header className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
        <div>
          <h1 className="text-lg font-semibold text-foreground">BrowserImageFX</h1>
          <p className="text-sm text-muted-foreground">
            Load an image, stack effects, and export the result directly from your browser.
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <input
            type="file"
            accept="image/*"
            ref={fileInputRef}
            className="hidden"
            onChange={handleFileInput}
          />
          <Button variant="secondary" size="sm" onClick={handleSelectFile}>
            <UploadCloud className="mr-1.5 h-4 w-4" /> Import image
          </Button>
          <Button variant="outline" size="sm" onClick={handleDownload} disabled={!image}>
            <Download className="mr-1.5 h-4 w-4" /> Download
          </Button>
          <Button variant="ghost" size="sm" onClick={resetView}>
            <RefreshCcw className="mr-1.5 h-4 w-4" /> Reset
          </Button>
        </div>
      </header>

      {hdrWarning && (
        <div className="mt-4 rounded-xl border border-destructive/40 bg-destructive/10 p-4 text-xs text-destructive">
          {hdrWarning}
        </div>
      )}

      <section className="mt-4 flex flex-1 flex-col gap-4 overflow-hidden lg:mt-6">
        <div
          className={`relative flex flex-1 min-h-[320px] items-center justify-center overflow-hidden rounded-2xl border border-white/10 bg-card/20 p-3 transition-colors sm:min-h-[360px] sm:p-4 ${
            isDragging ? 'border-primary/60 bg-primary/10' : ''
          }`}
          onDrop={onDrop}
          onDragOver={onDragOver}
          onDragLeave={onDragLeave}
        >
          {image ? (
            <div className="relative h-full w-full overflow-auto">
              <div
                className="mx-auto flex items-center justify-center"
                style={{ transform: `scale(${zoom})`, transformOrigin: 'top center' }}
              >
                <canvas
                  ref={canvasRef}
                  className="max-h-[80vh] max-w-full rounded-xl shadow-2xl shadow-black/40"
                />
              </div>
            </div>
          ) : (
            <label
              className={`flex h-full w-full cursor-pointer flex-col items-center justify-center rounded-xl border border-dashed border-white/10 bg-white/5 p-6 text-center text-sm text-muted-foreground transition-colors hover:border-primary/40 hover:text-foreground sm:p-8 ${
                isDragging ? 'border-primary/60 text-foreground' : ''
              }`}
              onClick={handleSelectFile}
            >
              <ImageIcon className="mb-3 h-10 w-10 text-primary" aria-hidden="true" />
              <span className="font-medium">Drop an image here or click to browse</span>
              <span className="mt-1 text-xs text-muted-foreground">
                Supports PNG, JPEG, WebP. Processing happens entirely in your browser.
              </span>
            </label>
          )}
        </div>

        <div className="rounded-xl border border-white/10 bg-card/20 p-4 sm:p-5">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <Label className="text-xs uppercase tracking-wide text-muted-foreground">Zoom</Label>
              <span className="text-xs text-foreground/80">{zoomPercentage}%</span>
            </div>
            <div className="flex items-center gap-2">
              <Button variant="ghost" size="sm" onClick={() => setZoom((prev) => Math.max(prev - 0.1, 0.25))}>
                -
              </Button>
              <Button variant="ghost" size="sm" onClick={() => setZoom((prev) => Math.min(prev + 0.1, 3))}>
                +
              </Button>
            </div>
          </div>
          <div className="mt-3 sm:mt-4">
            <Slider
              className="w-full"
              value={[zoom]}
              min={0.25}
              max={3}
              step={0.05}
              onValueChange={(value) => setZoom(value[0] ?? 1)}
              aria-label="Preview zoom"
            />
          </div>
        </div>
      </section>
    </div>
  )
}
