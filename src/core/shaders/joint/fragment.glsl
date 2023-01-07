    varying vec2 vUv;
    uniform float fireFactor;
    vec3 brightnessToColor(float b){
        b *= 0.25;
        return vec3(b, b*b, b*b*b*b)/0.25 * 0.8;
    }

    void main(){
        vec3 color = brightnessToColor(0.9) * 2.5;
        color *= 1.- pow(vUv.x, fireFactor);
        gl_FragColor = vec4(color, 1.0);
    }