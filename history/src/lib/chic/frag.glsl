#version 300 es
precision mediump float;

in vec2 fragCoord; // [0, 1]
uniform float uTime;
out vec4 fragColor;

void main() {
    vec3 color = vec3(fragCoord.x, fragCoord.y, abs(sin(uTime * 0.001)));
    fragColor = vec4(color, 1.0);
}
