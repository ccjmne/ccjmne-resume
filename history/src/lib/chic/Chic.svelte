<script lang="ts">
  import { onMount, type Snippet } from 'svelte'
  import {
    animationFrameScheduler,
    BehaviorSubject,
    distinctUntilChanged,
    interval,
    map,
    switchMap,
    takeWhile,
  } from 'rxjs'

  import vert from './vert.glsl'
  import frag from './frag.glsl'

  const TRANSITION = 200
  const fade$ = new BehaviorSubject<boolean>(false)
  fade$
    .pipe(
      distinctUntilChanged(),
      switchMap(inout => {
        const start = performance.now()
        return interval(0, animationFrameScheduler).pipe(
          map(() => (performance.now() - start) / TRANSITION),
          takeWhile(elapsed => inout || elapsed < 1),
          map(x => (inout ? x : 1 - x) / 3 + 2 / 3)
        )
      })
    )
    .subscribe(expand => render(Math.min(1, expand)))

  $effect(() => fade$.next(active))

  let {
    active: pActive = 'hover',
    margin = 40,
    children,
  }: { active?: boolean | 'hover'; margin?: number; children: Snippet } = $props()

  let hovered = $state(false)
  let active = $derived(pActive === 'hover' ? hovered : !!pActive)
  let render: (expand: number) => void = () => {}

  let canvas: HTMLCanvasElement
  let slot: HTMLDivElement
  let gl: WebGLRenderingContext

  onMount(function initializeShader() {
    if (!(gl = canvas.getContext('webgl2')!)) {
      console.error('WebGL not supported')
      return
    }

    gl.enable(gl.BLEND)
    gl.blendFunc(gl.SRC_ALPHA, gl.ONE_MINUS_SRC_ALPHA)

    const program = createProgram(
      gl,
      createShader(gl, gl.VERTEX_SHADER, vert),
      createShader(gl, gl.FRAGMENT_SHADER, frag)
    )

    gl.useProgram(program)

    gl.bindBuffer(gl.ARRAY_BUFFER, gl.createBuffer())
    // prettier-ignore
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([
      -1, -1, // Bottom-left
       1, -1, // Bottom-right
      -1,  1, // Top-left
       1, -1, // Bottom-right
       1,  1, // Top-right
      -1,  1, // Top-left
    ]), gl.STATIC_DRAW)

    const aPos = gl.getAttribLocation(program, 'aPos')
    gl.enableVertexAttribArray(aPos)
    gl.vertexAttribPointer(aPos, 2, gl.FLOAT, false, 0, 0)

    const uTime = gl.getUniformLocation(program, 'uTime')
    const uRes = gl.getUniformLocation(program, 'uRes')
    const uMargin = gl.getUniformLocation(program, 'uMargin')
    const uExpand = gl.getUniformLocation(program, 'uExpand')

    render = function (expand: number) {
      canvas.setAttribute('width', String(slot.getBoundingClientRect().width + margin * 2))
      canvas.setAttribute('height', String(slot.getBoundingClientRect().height + margin * 2))
      canvas.width = canvas.clientWidth * devicePixelRatio
      canvas.height = canvas.clientHeight * devicePixelRatio
      gl.viewport(0, 0, canvas.width, canvas.height)
      gl.uniform2f(uRes, canvas.width, canvas.height)
      gl.uniform1f(uMargin, margin)
      gl.uniform1f(uExpand, expand)

      gl.uniform1f(uTime, performance.now())
      gl.clear(gl.COLOR_BUFFER_BIT)
      gl.drawArrays(gl.TRIANGLES, 0, 6)
    }
  })

  function createShader(gl: WebGLRenderingContext, type: GLenum, source: string): WebGLShader {
    const shader = gl.createShader(type)!
    gl.shaderSource(shader, source)
    gl.compileShader(shader)
    if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) {
      throw new Error(`Vertex shader failed to compile: ${gl.getShaderInfoLog(shader)}`)
    }
    return shader
  }

  function createProgram(
    gl: WebGLRenderingContext,
    vertex: WebGLShader,
    fragment: WebGLShader
  ): WebGLProgram {
    const program = gl.createProgram()!
    gl.attachShader(program, vertex)
    gl.attachShader(program, fragment)
    gl.linkProgram(program)
    if (!gl.getProgramParameter(program, gl.LINK_STATUS)) {
      throw new Error(`Shader program failed to link: ${gl.getShaderInfoLog(program)}`)
    }
    return program
  }
</script>

<div
  class="container"
  role="figure"
  onmouseenter={() => (hovered = true)}
  onmouseleave={() => (hovered = false)}
>
  <div class="overlay">
    <canvas bind:this={canvas}></canvas>
  </div>
  <div bind:this={slot}>{@render children()}</div>
</div>

<style lang="scss">
  .container {
    position: relative;
    line-height: 0;

    > * {
      position: relative;
    }
  }

  .overlay {
    display: flex;
    justify-content: center;
    align-items: center;
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
  }
</style>
