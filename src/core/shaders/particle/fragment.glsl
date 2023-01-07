varying vec2 vUv;
varying vec2 vCoordinates;

uniform sampler2D texture1;
uniform sampler2D maskTexture;
uniform float move;





void main(){
    vec4 maskTexture = texture2D(maskTexture, gl_PointCoord);
    vec2 myUv = vec2(vCoordinates.x/256., vCoordinates.y/256.); 

    vec4 image = texture2D(texture1, myUv);

    gl_FragColor = image;
    gl_FragColor.a *= maskTexture.r;

    
}