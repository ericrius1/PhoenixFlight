
uniform float time;
uniform float progress;

varying vec2 vUv;
varying vec3 vPosition;
varying vec3 vNormal;

varying vec3 vLayer0;
varying vec3 vLayer1;
varying vec3 vLayer2;

varying vec3 eyeVector;

uniform samplerCube uPerlin;

float supersun(){
    float sum = 0.;
    sum += textureCube(uPerlin, vLayer0).r;
    sum += textureCube(uPerlin, vLayer1).r;
    sum += textureCube(uPerlin, vLayer2).r;
    sum *= 0.33;
    return sum;
}

vec3 brightnessToColor(float b){
    b *= 0.25;
    return vec3(b, b*b, b*b*b*b)/0.25 * 0.8;
}


float Fresnel(vec3 eyeVector, vec3 worldNormal){
    return pow(1.0 + dot(eyeVector, worldNormal), 3.0);
}

void main(){
    // gl_FragColor = textureCube(uPerlin, vPosition);
    float brightness = supersun();
    brightness = brightness * 4. +1.;

    float fres = Fresnel(eyeVector, vNormal);
    brightness += pow(fres, 0.8);
    vec3 color = brightnessToColor(brightness);



    gl_FragColor = vec4(color, 1.0);

}