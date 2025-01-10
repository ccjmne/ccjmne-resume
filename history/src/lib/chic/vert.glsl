#version 300 es

in  vec2 aPos;
out vec2 fragCoord;

void main() {
    fragCoord = (aPos * 0.5) + 0.5;
    gl_Position = vec4(aPos, 0.0, 1.0);
}
