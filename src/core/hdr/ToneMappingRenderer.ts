import type { HDRImage, ToneMappingOptions } from './types'

const VERTEX_SHADER = `#version 300 es
precision highp float;
layout(location = 0) in vec2 a_position;
out vec2 v_uv;
void main() {
  v_uv = (a_position + 1.0) * 0.5;
  v_uv.y = 1.0 - v_uv.y;
  gl_Position = vec4(a_position, 0.0, 1.0);
}
`

const FRAGMENT_SHADER = `#version 300 es
precision highp float;
uniform sampler2D u_hdrMap;
uniform float u_exposure;
uniform float u_gamma;
in vec2 v_uv;
out vec4 outColor;

vec3 toneMap(vec3 color) {
  vec3 mapped = vec3(1.0) - exp(-color * u_exposure);
  return pow(mapped, vec3(1.0 / u_gamma));
}

void main() {
  vec3 hdr = texture(u_hdrMap, v_uv).rgb;
  vec3 mapped = toneMap(hdr);
  outColor = vec4(mapped, 1.0);
}
`

export class ToneMappingRenderer {
  private readonly gl: WebGL2RenderingContext
  private readonly vao: WebGLVertexArrayObject
  private readonly program: WebGLProgram
  private readonly positionBuffer: WebGLBuffer
  private readonly exposureLocation: WebGLUniformLocation
  private readonly gammaLocation: WebGLUniformLocation

  constructor(canvas?: HTMLCanvasElement) {
    const targetCanvas = canvas ?? document.createElement('canvas')
    const gl = targetCanvas.getContext('webgl2', { premultipliedAlpha: false })
    if (!gl) {
      throw new Error('WebGL2 is not supported. HDR tone mapping is unavailable.')
    }
    this.gl = gl

    const program = this.createProgram(VERTEX_SHADER, FRAGMENT_SHADER)
    this.program = program

    const vao = gl.createVertexArray()
    if (!vao) throw new Error('Failed to create VAO for HDR renderer')
    this.vao = vao

    const positionBuffer = gl.createBuffer()
    if (!positionBuffer) throw new Error('Failed to create buffer for HDR renderer')
    this.positionBuffer = positionBuffer

    gl.bindVertexArray(this.vao)
    gl.bindBuffer(gl.ARRAY_BUFFER, this.positionBuffer)
    gl.bufferData(
      gl.ARRAY_BUFFER,
      new Float32Array([
        -1, -1,
        1, -1,
        -1, 1,
        -1, 1,
        1, -1,
        1, 1,
      ]),
      gl.STATIC_DRAW,
    )
    gl.enableVertexAttribArray(0)
    gl.vertexAttribPointer(0, 2, gl.FLOAT, false, 0, 0)

    this.exposureLocation = this.getUniformLocation('u_exposure')
    this.gammaLocation = this.getUniformLocation('u_gamma')
  }

  render(hdr: HDRImage, options: ToneMappingOptions): HTMLCanvasElement {
    const { width, height } = hdr
    const gl = this.gl

    gl.canvas.width = width
    gl.canvas.height = height
    gl.viewport(0, 0, width, height)

    const texture = gl.createTexture()
    if (!texture) throw new Error('Failed to create texture for HDR tone mapping')
    gl.bindTexture(gl.TEXTURE_2D, texture)
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.NEAREST)
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.NEAREST)
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE)
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE)
    gl.pixelStorei(gl.UNPACK_ALIGNMENT, 1)
    gl.texImage2D(
      gl.TEXTURE_2D,
      0,
      gl.RGBA32F,
      width,
      height,
      0,
      gl.RGBA,
      gl.FLOAT,
      hdr.data,
    )

    gl.useProgram(this.program)
    gl.bindVertexArray(this.vao)
    gl.uniform1f(this.exposureLocation, options.exposure)
    gl.uniform1f(this.gammaLocation, options.gamma)
    gl.activeTexture(gl.TEXTURE0)
    gl.bindTexture(gl.TEXTURE_2D, texture)

    gl.clearColor(0, 0, 0, 1)
    gl.clear(gl.COLOR_BUFFER_BIT)
    gl.drawArrays(gl.TRIANGLES, 0, 6)

    const pixels = new Uint8Array(width * height * 4)
    gl.readPixels(0, 0, width, height, gl.RGBA, gl.UNSIGNED_BYTE, pixels)

    gl.deleteTexture(texture)

    const flipped = new Uint8ClampedArray(width * height * 4)
    const rowSize = width * 4
    for (let y = 0; y < height; y++) {
      const srcOffset = y * rowSize
      const dstOffset = (height - 1 - y) * rowSize
      flipped.set(pixels.subarray(srcOffset, srcOffset + rowSize), dstOffset)
    }

    const canvas = document.createElement('canvas')
    canvas.width = width
    canvas.height = height
    const ctx = canvas.getContext('2d')
    if (!ctx) {
      throw new Error('Failed to acquire 2D context for HDR output')
    }
    const imageData = new ImageData(flipped, width, height)
    ctx.putImageData(imageData, 0, 0)

    return canvas
  }

  dispose() {
    const { gl } = this
    gl.deleteBuffer(this.positionBuffer)
    gl.deleteVertexArray(this.vao)
    gl.deleteProgram(this.program)
  }

  private createShader(type: GLenum, source: string): WebGLShader {
    const shader = this.gl.createShader(type)
    if (!shader) {
      throw new Error('Unable to allocate shader for HDR renderer')
    }
    this.gl.shaderSource(shader, source)
    this.gl.compileShader(shader)
    if (!this.gl.getShaderParameter(shader, this.gl.COMPILE_STATUS)) {
      const info = this.gl.getShaderInfoLog(shader)
      this.gl.deleteShader(shader)
      throw new Error(`Shader compilation failed: ${info ?? 'unknown error'}`)
    }
    return shader
  }

  private createProgram(vertexSource: string, fragmentSource: string): WebGLProgram {
    const vertexShader = this.createShader(this.gl.VERTEX_SHADER, vertexSource)
    const fragmentShader = this.createShader(this.gl.FRAGMENT_SHADER, fragmentSource)
    const program = this.gl.createProgram()
    if (!program) {
      throw new Error('Unable to allocate shader program for HDR renderer')
    }
    this.gl.attachShader(program, vertexShader)
    this.gl.attachShader(program, fragmentShader)
    this.gl.linkProgram(program)
    this.gl.deleteShader(vertexShader)
    this.gl.deleteShader(fragmentShader)
    if (!this.gl.getProgramParameter(program, this.gl.LINK_STATUS)) {
      const info = this.gl.getProgramInfoLog(program)
      this.gl.deleteProgram(program)
      throw new Error(`Program link failed: ${info ?? 'unknown error'}`)
    }
    return program
  }

  private getUniformLocation(name: string): WebGLUniformLocation {
    const location = this.gl.getUniformLocation(this.program, name)
    if (!location) {
      throw new Error(`Uniform not found: ${name}`)
    }
    return location
  }
}
