precision mediump float;
varying vec2 vTexCoord;
uniform float uTime;

void main() {
    vec3 color = vec3(vTexCoord.x, vTexCoord.y, abs(sin(uTime * 0.001)));
    gl_FragColor = vec4(color, 1.0);
}
