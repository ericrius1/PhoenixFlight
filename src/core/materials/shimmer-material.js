import { RawShaderMaterial, GLSL3, Uniform, Color } from 'three'

import periodic3d from '@/core/shaders/modules/noise/periodic3d.glsl.js'

const vertexShader = /* glsl */ `
            in vec3 position;
            in vec3 normal;

            uniform mat4 modelMatrix;
            uniform mat4 modelViewMatrix;
            uniform mat4 projectionMatrix;
            uniform vec3 cameraPosition;

            uniform float uTime;
            uniform float uTimeScale;

            out vec3 vWorldNormal;
            out vec3 vViewDirection;

            ${periodic3d}

            void main() {
                // http://connorbell.ca/2017/09/09/Generating-Looping-Noise.html

                float loopLength = 3.;
                float transitionStart = 1.5;
                float time = mod(uTime * uTimeScale, loopLength);

                float v1 = 0.05 * pnoise(vec3(2.0 * normal + time), vec3(10.0));
                float v2 = 0.05 * pnoise(vec3(2.0 * normal + time - loopLength), vec3(10.0));

                float transitionProgress = (time - transitionStart) / (loopLength - transitionStart);
                float progress = clamp(transitionProgress, 0.0, 1.0);

                float result = mix(v1, v2, progress);

                vec4 worldPosition = modelMatrix * vec4(position + result * normal, 1.0);
                vWorldNormal = normalize(modelMatrix * vec4(normal, 0.0)).xyz;
                vViewDirection = normalize(cameraPosition - worldPosition.xyz);

                gl_Position = projectionMatrix * modelViewMatrix * vec4(position + result * normal * 2., 1.0);
            }
        `

const fragmentShader = /* glsl */ `
            precision highp float;

            uniform vec3 uBaseColor;
            uniform vec3 uFresnelColor;
            uniform float uFresnelPower;

            in vec3 vWorldNormal;
            in vec3 vViewDirection;

            out vec4 FragColor;

            void main() {
                float fresnelFactor = abs(dot(vViewDirection, vWorldNormal));
                float inversefresnelFactor = 1.0 - fresnelFactor;

                // Shaping function
                fresnelFactor = pow(fresnelFactor, uFresnelPower);
                inversefresnelFactor = pow(inversefresnelFactor, uFresnelPower);

                FragColor = vec4(fresnelFactor * uBaseColor + inversefresnelFactor * uFresnelColor, 1.0);
            }
        `

export default class ShimmerMaterial extends RawShaderMaterial {
  constructor(timeUniform) {
    super({
      glslVersion: GLSL3,
      // wireframe: true,
      uniforms: {
        uBaseColor: new Uniform(new Color('#D0D0D0')),
        uFresnelColor: new Uniform(new Color('#00caf2')),
        uFresnelPower: new Uniform(1.5),
        uTime: timeUniform,
        uTimeScale: new Uniform(0.2),
      },
      transparent: true,
      // depthTest: false,
      // depthWrite: false,
      vertexShader,
      fragmentShader,
    })
  }
}
