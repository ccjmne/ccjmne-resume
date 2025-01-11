#version 300 es
#extension GL_GOOGLE_include_directive : enable
precision mediump float;

#define FBM_OCTAVES 8
#include "../../../node_modules/lygia/generative/fbm.glsl"
#include "../../../node_modules/lygia/generative/snoise.glsl"
#include "../../../node_modules/lygia/math/const.glsl"

in      vec2  fragCoord;
out     vec4  fragColor;
uniform float uTime;
uniform float uMargin;
uniform vec2  uRes;
uniform float uExpand;

// Delete?
float disc(float r, vec2 p) {
    return length(p) - r;
}

// https://www.youtube.com/watch?v=62-pRVZuS5c
float rect(vec2 r, vec2 p) {
    return length(max(abs(p) - r, vec2(0.)));
}
float rect_hollow(vec2 r, vec2 p) {
    vec2 q = abs(p) - r;
    return abs(length(max(q, vec2(0.))) + min(max(q.x, q.y), 0.));
}

float lineSDF(vec2 uv, float angle) {
    // TODO: Rewrite better
    vec2 dir = vec2(cos(angle), sin(angle));
    return abs(dot(uv, vec2(-dir.y, dir.x)));
}

#define RESOLUTION 128.
#define CUTOFF     .128
#define TIMESCALE  0.0004

void main() {
    vec2  uRes1    = uRes    / RESOLUTION;
    float uMargin1 = uMargin / RESOLUTION;

    vec2  uv = (fragCoord - 0.5) * uRes1;
    float t  = uTime * TIMESCALE;
    float noise = fbm(vec3(uv.xy, t * 2.));
    float noiseY = fbm(vec3(uv.yx, t * 2.));

    uv += vec2(noise, noiseY) * uMargin1 * 1.;

    float d = rect_hollow((uRes1 / 2. - uMargin1 * (2. - uExpand)), uv);

    // play with the exponent
    d = pow(d / uMargin1 * 2., 1.); // [0, uMargin1 / 2] => [0, 1]
    float i = 1. - d; // BLACK is 1

    float arc = PI / 3.;
    float angle = t * 8.;

    float i2 = pow(lineSDF(uv, angle) * 1., 1.); // play with the exponent
    i *= 1. - smoothstep( 0., 1., i2);

    // fragColor = vec4(vec3(0.), i);
    fragColor = vec4(vec3(1. - i), step(.2, i));
    // fragColor = vec4(vec3(0.), noise);
    // fragColor = vec4(noise, noiseY, 0., 1.);
}
