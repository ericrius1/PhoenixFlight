varying vec2 vUv;
varying vec2 vCoordinates;
varying vec3 vPos;

attribute vec3 aCoordinates;
attribute float aSpeed;
attribute float aOffset;
attribute float aDirection;
attribute float aPress;

uniform float time;
uniform float move;
uniform vec2 point;


uniform float mousePressed;


     
void main(){
    vUv = uv;



    // Stable
    vec3 stable = position;
    float dist = distance(stable.xy, point.xy);
    float area = 1. - smoothstep(0., 1., dist);
    stable.x +=   -sin(time * aPress)/.33 * aDirection * area * mousePressed;
    stable.y +=   sin(time * aPress)/.66 * aDirection * area * mousePressed;
    stable.z +=   cos(time * aPress)/.77 * aDirection * area * mousePressed;




    // getting position in space
    vec4 mvPosition = modelViewMatrix * vec4(stable, 1.0);

    gl_PointSize =5.;
    gl_Position = projectionMatrix * mvPosition;

    vCoordinates = aCoordinates.xy;
}