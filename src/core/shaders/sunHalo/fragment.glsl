
    varying vec3 eyeVector;
    varying vec3 vNormal;


    vec3 brightnessToColor(float b){
        b *= 0.25;
        return vec3(b, b*b, b*b*b*b)/0.25 * 0.8;
    }


    float Fresnel(vec3 eyeVector, vec3 worldNormal){
        return pow( dot(eyeVector, worldNormal), 4.);
    }

    void main(){
        float fres = Fresnel(eyeVector, vNormal);
        vec3 color = brightnessToColor(0.9) * 2.5;
        gl_FragColor = vec4(color, fres);
        // gl_FragColor.a = fres;


    }