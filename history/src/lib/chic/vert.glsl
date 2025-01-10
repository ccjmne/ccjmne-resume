#version 460 core

layout(location = 0) in  vec2 aPos;
layout(location = 0) out vec2 fragCoord;

void main() {
    fragCoord = (aPos * 0.5) + 0.5;
    gl_Position = vec4(aPos, 0.0, 1.0);
}
