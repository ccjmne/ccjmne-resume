#version 300 es
precision mediump float;

#define FBM_OCTAVES 8
#include "/node_modules/lygia/generative/fbm"

in      vec2  fragCoord;
out     vec4  fragColor;
uniform float uTime;
uniform float uMargin;
uniform vec2  uRes;

// https://www.youtube.com/watch?v=62-pRVZuS5c
float rect(vec2 r, vec2 p) {
    return length(max(abs(p) - r, vec2(0.)));
}

#define RESOLUTION 128.
#define CUTOFF     .128
#define TIMESCALE  0.0004

void main() {
    vec2  uRes1    = uRes    / RESOLUTION;
    float uMargin1 = uMargin / RESOLUTION;

    vec2  uv = (fragCoord - 0.5) * uRes1;
    float t  = uTime * TIMESCALE;

    float d     = rect((uRes1 - uMargin1 * 2.) / 2., uv);
    float outer = smoothstep(uMargin1, 0., d);
    float inner = smoothstep(uMargin1 / 2., 0., d);
    float noise = fbm(vec3(uv.x, uv.y - t * 2., t) * 2.) * outer + inner;

    float core = step(CUTOFF, noise);
    float edge = smoothstep(min(CUTOFF, max(0., uMargin1 / 2. - CUTOFF)), CUTOFF, noise);

    vec3 cCore = vec3(0.);
    vec3 cEdge = vec3(.3, .5, .5);

    fragColor = vec4(cEdge * max(0., (edge - core)) + cCore * core, max(edge, core));
}
