
varying vec3 eyeVector;
varying vec3 vNormal;


void main(){

    vNormal = normal;
    vec4 worldPosition = modelMatrix * vec4(position, 1.0);
    eyeVector = normalize(worldPosition.xyz- cameraPosition);

    gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
}