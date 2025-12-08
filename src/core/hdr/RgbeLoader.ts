import type { HDRImage } from './types'

class RgbeLoaderError extends Error {}

function readLine(bytes: Uint8Array, offsetRef: { value: number }): string {
  let line = ''
  while (offsetRef.value < bytes.length) {
    const charCode = bytes[offsetRef.value++]
    if (charCode === 0x0a) {
      break
    }
    line += String.fromCharCode(charCode)
  }
  return line
}

function rgbeToFloat(r: number, g: number, b: number, e: number): [number, number, number] {
  if (e > 0) {
    const f = Math.pow(2, e - 136)
    return [r * f, g * f, b * f]
  }
  return [0, 0, 0]
}

export function decodeRgbe(buffer: ArrayBuffer): HDRImage {
  const bytes = new Uint8Array(buffer)
  const offsetRef = { value: 0 }

  const signature = readLine(bytes, offsetRef)
  if (!signature.startsWith('#?')) {
    throw new RgbeLoaderError('Invalid HDR signature')
  }

  let format: string | null = null
  while (offsetRef.value < bytes.length) {
    const line = readLine(bytes, offsetRef)
    if (line.length === 0) {
      break
    }
    if (line.startsWith('FORMAT=')) {
      format = line.substring(7)
    }
  }

  if (format !== '32-bit_rle_rgbe') {
    throw new RgbeLoaderError(`Unsupported HDR format: ${format ?? 'unknown'}`)
  }

  const resolution = readLine(bytes, offsetRef)
  const match = /-Y\s+(\d+)\s+\+X\s+(\d+)/.exec(resolution)
  if (!match) {
    throw new RgbeLoaderError('Invalid resolution string in HDR header')
  }

  const height = Number.parseInt(match[1] ?? '0', 10)
  const width = Number.parseInt(match[2] ?? '0', 10)
  if (!Number.isFinite(width) || !Number.isFinite(height) || width <= 0 || height <= 0) {
    throw new RgbeLoaderError('Invalid HDR dimensions')
  }

  const result = new Float32Array(width * height * 4)
  const scanlineBuffer = new Uint8Array(width * 4)

  for (let y = 0; y < height; y++) {
    if (offsetRef.value + 4 > bytes.length) {
      throw new RgbeLoaderError('Unexpected end of file while reading scanline header')
    }

    const rleHeader0 = bytes[offsetRef.value++]
    const rleHeader1 = bytes[offsetRef.value++]
    const rleHeader2 = bytes[offsetRef.value++]
    const rleHeader3 = bytes[offsetRef.value++]

    if (rleHeader0 !== 2 || rleHeader1 !== 2 || (rleHeader2 & 0x80) !== 0) {
      throw new RgbeLoaderError('Unsupported HDR scanline encoding')
    }

    const scanlineWidth = (rleHeader2 << 8) | rleHeader3
    if (scanlineWidth !== width) {
      throw new RgbeLoaderError('Scanline width mismatch in HDR data')
    }

    for (let channel = 0; channel < 4; channel++) {
      let index = 0
      while (index < width) {
        if (offsetRef.value >= bytes.length) {
          throw new RgbeLoaderError('Unexpected end of file while decoding scanline data')
        }
        const count = bytes[offsetRef.value++]
        if (count > 128) {
          const runLength = count - 128
          if (runLength === 0 || index + runLength > width) {
            throw new RgbeLoaderError('Invalid RLE run length in HDR data')
          }
          const value = bytes[offsetRef.value++]
          scanlineBuffer.fill(value, channel * width + index, channel * width + index + runLength)
          index += runLength
        } else {
          const runLength = count
          if (runLength === 0 || index + runLength > width) {
            throw new RgbeLoaderError('Invalid literal length in HDR data')
          }
          for (let i = 0; i < runLength; i++) {
            scanlineBuffer[channel * width + index++] = bytes[offsetRef.value++]
          }
        }
      }
    }

    for (let x = 0; x < width; x++) {
      const r = scanlineBuffer[x]
      const g = scanlineBuffer[width + x]
      const b = scanlineBuffer[width * 2 + x]
      const e = scanlineBuffer[width * 3 + x]
      const [fr, fg, fb] = rgbeToFloat(r, g, b, e)
      const offset = (y * width + x) * 4
      result[offset] = fr
      result[offset + 1] = fg
      result[offset + 2] = fb
      result[offset + 3] = 1
    }
  }

  return {
    width,
    height,
    data: result,
  }
}

export class HDRLoader {
  static async load(file: File): Promise<HDRImage> {
    const buffer = await file.arrayBuffer()
    return decodeRgbe(buffer)
  }
}

export { RgbeLoaderError }
