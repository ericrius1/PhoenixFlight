precision mediump float;

attribute vec3 position;
attribute vec3 normal;
attribute vec3 offset;
attribute vec2 uv;
attribute vec2 halfRootAngle;
attribute float scale;
attribute float index;

uniform float heightScale;
uniform float time;
uniform float posX;
uniform float posZ;


uniform mat4 modelViewMatrix;
uniform mat4 projectionMatrix;

varying vec2 vUv;
varying vec3 vNormal;
varying vec3 vPosition;
varying float frc;
varying float idx;

const float PI = 3.1415;
const float TWO_PI = 2.0 * PI;
  
    


//https://www.geeks3d.com/20141201/how-to-rotate-a-vertex-by-a-quaternion-in-glsl/
vec3 rotateVectorByQuaternion(vec3 v, vec4 q){
  return 2.0 * cross(q.xyz, v * q.w + cross(q.xyz, v)) + v;
}

float mapLinear(float value, float min1, float max1, float min2, float max2){
  return min2 + (value - min1) * (max2 -min2)/ (max1 -min1);
}


void main() {
    float bladeHeight = .2;
	//Vertex height in blade geometry
	frc = position.y / bladeHeight;

	//Scale vertices
  vec3 vPosition = position;
	vPosition.y *= scale;

	//Invert scaling for normals
	vNormal = normal;
	vNormal.y /= scale;


	//Rotate blade around Y axis
  vec4 direction = vec4(0.0, halfRootAngle.x, 0.0, halfRootAngle.y );
	vPosition = rotateVectorByQuaternion(vPosition, direction);
	vNormal = rotateVectorByQuaternion(vNormal, direction);

  //UV for texture
  vUv = uv;

	vec3 pos;
	vec3 tile;

	pos.x = offset.x;
	pos.z = offset.z;
	pos.y = offset.y;




	vec3 fractionalPos = pos/=1.0;
	


  //Wind is sine waves in time. 
  float noise = 0.5 + 0.5 * sin(fractionalPos.x + time); // maps noise range to [0 -> 1]
  float halfAngle = -noise * .1;
  noise = 0.5 + 0.5 * cos(fractionalPos.y + time);
  halfAngle -= noise * 0.05;
	direction = normalize(vec4(sin(halfAngle), 0.0, -sin(halfAngle), cos(halfAngle)));


	//Rotate blade and normals according to the wind
  vPosition = rotateVectorByQuaternion(vPosition, direction);
	vNormal = rotateVectorByQuaternion(vNormal, direction);

	//Move vertex to global location
	vPosition += pos;

	//Index of instance for varying color in fragment shader
	idx = index;

  gl_Position = projectionMatrix * modelViewMatrix * vec4(vPosition, 1.0);

}
