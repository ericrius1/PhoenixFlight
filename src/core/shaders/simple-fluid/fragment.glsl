uniform float time;
uniform vec4 resolution;

uniform sampler2D backgroundTexture;
uniform sampler2D mask;

varying vec2 vUv;
varying vec3 vPosition;

float PI = 3.14159265;

void main(){
    vec4 masky = texture2D(mask, vUv);

    float strength = masky.a * masky.r;
    strength *= 3.;
    strength = min(1., strength);

    // move distortion to the edge of the masked area to give it a reflecty look
    vec4 image = texture2D(backgroundTexture, vUv + (1.-strength) * 0.5);

    gl_FragColor = image * strength;

    
}