import Experience from '@/core/experience'
import * as THREE from 'three'

import vertexShaderPerlin from '@/core/shaders/perlin/vertex.glsl'
import fragmentShaderPerlin from '@/core/shaders/perlin/fragment.glsl'
import vertexShaderSun from '@/core/shaders/sun/vertex.glsl'
import fragmentShaderSun from '@/core/shaders/sun/fragment.glsl'
import vertexShaderSunHalo from '@/core/shaders/sunHalo/vertex.glsl'
import fragmentShaderSunHalo from '@/core/shaders/sunHalo/fragment.glsl'
import { randFloat } from 'three/src/math/MathUtils'

export default class Sun {
  constructor() {
    this.experience = new Experience()
    this.scene = this.experience.scene
    this.renderer = this.experience.renderer
    this.cubeMapScene = new THREE.Scene()
    this.time = this.experience.time
    this.cubeRenderTarget = new THREE.WebGLCubeRenderTarget(256, {
      format: THREE.RGBAFormat,
      //   generateMipmaps: true,
      // minFilter: THREE.LinearMipMapLinearFilter,
      //   minFilter: THREE.NearestFilter,
      //   magFilter: THREE.NearestFilter,

      encoding: THREE.sRGBEncoding,
    })

    this.cubeCamera = new THREE.CubeCamera(0.1, 5, this.cubeRenderTarget)

    this.create()
    this.createSunHalo()
  }

  create() {
    this.sunMaterial = new THREE.ShaderMaterial({
      uniforms: {
        time: this.time.timeUniform,
        uPerlin: { value: this.cubeRenderTarget.texture },
      },
      vertexShader: vertexShaderSun,
      fragmentShader: fragmentShaderSun,
    })
    this.sunMesh = new THREE.Mesh(
      new THREE.SphereGeometry(7, 30, 30),
      this.sunMaterial,
    )
    // this.sunMesh.position.copy(
    //   randomUpperHemisphereDirection().multiplyScalar(randFloat(10000, 30000)),
    // )
    this.sunMesh.position.set(-5, 77, -222)

    this.scene.add(this.sunMesh)

    this.perlinMaterial = new THREE.ShaderMaterial({
      uniforms: {
        time: this.time.timeUniform,
      },
      side: THREE.DoubleSide,
      vertexShader: vertexShaderPerlin,
      fragmentShader: fragmentShaderPerlin,
    })
    this.perlinMesh = new THREE.Mesh(
      new THREE.SphereGeometry(1, 30, 30),
      this.perlinMaterial,
    )
    this.cubeMapScene.add(this.perlinMesh)

    this.experience.register(this)
  }

  createSunHalo() {
    this.sunHaloMaterial = new THREE.ShaderMaterial({
      side: THREE.BackSide,
      transparent: true,
      vertexShader: vertexShaderSunHalo,
      fragmentShader: fragmentShaderSunHalo,
    })
    this.sunHaloMesh = this.sunMesh.clone()
    this.sunHaloMesh.scale.multiplyScalar(3)
    this.sunHaloMesh.material = this.sunHaloMaterial
    this.scene.add(this.sunHaloMesh)
  }

  update() {
    this.cubeCamera.update(this.renderer.instance, this.cubeMapScene)

    this.sunMaterial.uniforms.uPerlin.value = this.cubeRenderTarget.texture
  }
}

function randomUpperHemisphereDirection() {
  // Derived from https://mathworld.wolfram.com/SpherePointPicking.html
  let vec = new THREE.Vector3()
  const u = (Math.random() - 0.5) * 2
  const t = (Math.random() * Math.PI) / 5
  const f = Math.sqrt(1 - u ** 2)

  vec.x = f * Math.cos(t)
  vec.y = f * Math.sin(t)
  vec.z = u

  return vec
}
