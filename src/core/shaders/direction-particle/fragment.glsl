

varying vec2 vUv;
uniform float time;

float circleShape(vec2 position, float radius){
    return smoothstep(0.2, radius, length(position));
}
void main(){
    vec3 color = vec3(0.0);

    // remap uvs from -1 to 1
    vec2 coord = vUv * 2.0 - 1.0;
    float alpha = 1.-circleShape(coord, 1.);
    gl_FragColor = vec4(vUv.x, vUv.y, 0.,alpha);
    
}