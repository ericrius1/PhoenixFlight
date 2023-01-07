uniform float time;
uniform sampler2D canvasTexture;
varying vec2 vUv;

void main(){
    vec4 pixel = texture2D(canvasTexture, vUv);
    gl_FragColor = pixel;
}