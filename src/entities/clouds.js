import Experience from '@/core/experience'
import * as THREE from 'three'
import cloudsVertexShader from '@/core/shaders/clouds/vertex.glsl'
import cloudsFragmentShader from '@/core/shaders/clouds/fragment.glsl'
import { DoubleSide } from 'three'

const randFloat = THREE.MathUtils.randFloat
const clamp = THREE.MathUtils.clamp
export default class Clouds {
  clouds = []
  velocity = new THREE.Vector3()
  constructor() {
    this.experience = new Experience()
    this.scene = this.experience.scene
    this.time = this.experience.time
    this.camera = this.experience.camera
    this.items = this.experience.loader.items
    this.canvasContainer = this.experience.renderer.canvasContainer
    this.create()
  }

  create() {
    this.experience.register(this)
    this.cloudTexture = this.items.cloud
    this.cloudTexture.encoding = THREE.sRGBEncoding
    let fog = new THREE.Fog(0x4584b4, -100, 5000)
    // this.scene.add(fog)
    this.cloudMaterial = new THREE.ShaderMaterial({
      uniforms: {
        map: { value: this.cloudTexture },
        fogColor: { value: fog.color },
        fogNear: { value: fog.near },
        fogFar: { value: fog.far },
      },
      vertexShader: cloudsVertexShader,
      fragmentShader: cloudsFragmentShader,
      depthWrite: false,
      transparent: true,
    })
    this.cloudMaterial = new THREE.MeshStandardMaterial({
      map: this.cloudTexture,
      depthWrite: false,
      transparent: true,
      // envMap: this.scene.envMap,
      envMapIntensity: 2,
    })
    let numClouds = Math.floor(randFloat(0, 100))
    for (let i = 0; i < numClouds; i++) {
      let cloud = new THREE.Mesh(
        new THREE.PlaneGeometry(32, 32),
        this.cloudMaterial,
      )
      cloud.scale.x = cloud.scale.y = Math.random() * Math.random() * 1.5 + 0.5

      let dir = randomUpperHemisphereDirection()
      dir.multiplyScalar(randFloat(100, 200))
      dir.y = clamp(dir.y, 100, 200)

      cloud.position.copy(dir)

      cloud.velocity = new THREE.Vector3(
        randFloat(-0.5, 0.5),
        0,
        randFloat(-0.5, 0.5),
      )
      this.scene.add(cloud)
      this.clouds.push(cloud)
    }
  }

  update() {
    this.clouds.forEach(cloud => {
      cloud.lookAt(this.camera.position)
      cloud.position.add(
        this.velocity.copy(cloud.velocity).multiplyScalar(this.time.delta),
      )
    })
  }
}
function randomUpperHemisphereDirection() {
  // Derived from https://mathworld.wolfram.com/SpherePointPicking.html
  let vec = new THREE.Vector3()
  const u = (Math.random() - 0.5) * 2
  const t = Math.random() * Math.PI
  const f = Math.sqrt(1 - u ** 2)

  vec.x = f * Math.cos(t)
  vec.y = f * Math.sin(t)
  vec.z = u

  return vec
}
