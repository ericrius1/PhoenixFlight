uniform float time;
uniform sampler2D uTexture;

varying vec2 vUv;



void main(){
  vec4 t = texture2D(uTexture, vUv);
  gl_FragColor = vec4(vec3(1.), t.r);

}