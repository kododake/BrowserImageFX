export interface HDRImage {
  width: number
  height: number
  data: Float32Array // RGBA, linear space
}

export interface ToneMappingOptions {
  exposure: number
  gamma: number
}
