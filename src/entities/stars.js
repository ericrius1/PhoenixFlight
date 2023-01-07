import Experience from '@/core/experience'
import * as THREE from 'three'

import starsVertexShader from '@/core/shaders/stars/vertex.glsl'
import starsFragmentShader from '@/core/shaders/stars/fragment.glsl'
import { mapLinear, randFloat } from 'three/src/math/MathUtils'

function lerp(a, b, t) {
  return a * (1 - t) + b * t
}

export default class Stars {
  constructor() {
    this.experience = new Experience()
    this.scene = this.experience.scene
    this.time = this.experience.time
    this.items = this.experience.loader.items
    this.create()
  }

  create() {
    let count = 10000
    let minRadius = 0.5
    let maxRadius = 1
    let particleGeo = new THREE.PlaneGeometry(1, 1)
    let geo = new THREE.InstancedBufferGeometry()

    geo.instanceCount = count
    geo.setAttribute('position', particleGeo.getAttribute('position'))
    geo.index = particleGeo.index

    let pos = new Float32Array(count * 3)

    for (let i = 0; i < count; i++) {
      let theta = Math.random() * 2 * Math.PI
      // let r = lerp(minRadius, maxRadius, Math.random())
      let r = randFloat(minRadius, maxRadius)

      let x = r * Math.sin(theta)
      let y = randFloat(-0.1, 0.1)
      let z = r * Math.cos(theta)

      pos.set([x, y, z], i * 3)
    }
    geo.setAttribute('pos', new THREE.InstancedBufferAttribute(pos, 3, false))

    this.material = new THREE.ShaderMaterial({
      side: THREE.DoubleSide,
      uniforms: {
        time: this.time.timeUniform,
        uTexture: { value: this.items.particle },
      },
      vertexShader: starsVertexShader,
      fragmentShader: starsFragmentShader,
      transparent: true,
      // depthTest: false,
      depthWrite: false,
      // blending: THREE.AdditiveBlending,
    })
    this.points = new THREE.Mesh(geo, this.material)
    this.points.frustumCulled = false
    this.scene.add(this.points)
  }
}
