<script lang="ts">
  import { onMount } from 'svelte'

  import vert from './vert.glsl'
  import frag from './frag.glsl'

  let canvas: HTMLCanvasElement
  let gl: WebGLRenderingContext

  onMount(function initializeShader() {
    if (!(gl = canvas.getContext('webgl2')!)) {
      console.error('WebGL not supported')
      return
    }

    const program = createProgram(
      gl,
      createShader(gl, gl.VERTEX_SHADER, vert),
      createShader(gl, gl.FRAGMENT_SHADER, frag)
    )

    gl.useProgram(program)

    // prettier-ignore
    const positions = new Float32Array([
      -1, -1, // Bottom-left
       1, -1, // Bottom-right
      -1,  1, // Top-left
       1, -1, // Bottom-right
       1,  1, // Top-right
      -1,  1, // Top-left
    ])

    const positionBuffer = gl.createBuffer()
    gl.bindBuffer(gl.ARRAY_BUFFER, positionBuffer)
    gl.bufferData(gl.ARRAY_BUFFER, positions, gl.STATIC_DRAW)

    const aPos = gl.getAttribLocation(program, 'aPos')
    gl.enableVertexAttribArray(aPos)
    gl.vertexAttribPointer(aPos, 2, gl.FLOAT, false, 0, 0)

    const uTime = gl.getUniformLocation(program, 'uTime')
    ;(function render() {
      gl.uniform1f(uTime, performance.now())
      gl.clear(gl.COLOR_BUFFER_BIT)
      gl.drawArrays(gl.TRIANGLES, 0, 6)
      requestAnimationFrame(render)
    })()
  })

  function createShader(gl: WebGLRenderingContext, type: GLenum, source: string): WebGLShader {
    const shader = gl.createShader(type)!
    gl.shaderSource(shader, source)
    gl.compileShader(shader)
    return shader
  }

  function createProgram(
    gl: WebGLRenderingContext,
    vertexShader: WebGLShader,
    fragmentShader: WebGLShader
  ): WebGLProgram {
    const program = gl.createProgram()!
    gl.attachShader(program, vertexShader!)
    gl.attachShader(program, fragmentShader!)
    gl.linkProgram(program)
    return program
  }
</script>

<div class="shader-container">
  <canvas bind:this={canvas} width="400" height="400"></canvas>
  <div class="overlay">
    <slot></slot>
  </div>
</div>

<style lang="scss">
  .shader-container {
    position: relative;
  }

  .overlay {
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    display: flex;
    justify-content: center;
    align-items: center;
  }
</style>
