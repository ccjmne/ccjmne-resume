#version 300 es
precision mediump float;

#define FBM_OCTAVES 8
#include "/node_modules/lygia/generative/snoise"
#include "/node_modules/lygia/generative/fbm"
#include "/node_modules/lygia/generative/srandom"

// TODO: Seems broken. Create issue upstream, perhaps contribute fix?
#define CENTER_2D vec2(0.)
#include "/node_modules/lygia/sdf/rectSDF"

in vec2 fragCoord; // [0, 1]
uniform float uTime;
uniform vec2 uRes;
uniform float uMargin;
out vec4 fragColor;

// https://www.youtube.com/watch?v=62-pRVZuS5c
// r: "radius", p: point
float rect(vec2 r, vec2 p) {
    return length(max(abs(p) - r, vec2(0.)));
}

#define RESOLUTION 256. * 2.
#define CUTOFF .128
void main() {
    float t = uTime * 0.0004;

    // Centred around 0
    vec2 uRes1 = uRes / RESOLUTION;
    float uMargin1 = uMargin / RESOLUTION;
    vec2 uv = (fragCoord - 0.5) * uRes1;

    float on = fbm(vec3(uv.x, uv.y - t * 2., t) * 2.);
    float inside = rect((uRes1 - uMargin1 * 2.) / 2., uv);
    float wayinside = 1. - smoothstep(0., uMargin1 / 2., inside);
    inside = 1. - smoothstep(0., uMargin1, inside) + CUTOFF;

    // Smoothly dissipate
    on += wayinside;
    on *= inside;

    // Sharpen
    float red = smoothstep(0., CUTOFF, on);
    on = step(CUTOFF, on);

    vec3 inner = vec3(0.);
    vec3 edge = vec3(.3, .5, .5);
    fragColor = vec4(edge * (red - on) + inner * on, red);
}
