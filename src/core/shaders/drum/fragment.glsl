    varying vec2 vUv;
    uniform float fireFactor;

    uniform vec3 surfaceColor;


    vec3 brightnessToColorz(float b){
        b *= 0.25;
        return vec3(b, b*b, b*b*b*b)/0.25 * 0.8;
    }

    void main(){
        vec3 color = brightnessToColorz(0.9) * 2.5;

        vec2 centeredUV = vUv - 0.5;
        vec2 strength = abs(centeredUV);

        color *= (strength.x + strength.y);
        // color.b *= strength.y;
        // Need to have it ripple out
        gl_FragColor = vec4(color, 1.0); 
    }
