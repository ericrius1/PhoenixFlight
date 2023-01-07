import Experience from '@/core/experience'
import * as THREE from 'three'

import { Water } from 'three/examples/jsm/objects/Water'

export default class Ocean2 {
  constructor() {
    this.experience = new Experience()
    this.scene = this.experience.scene
    this.renderer = this.experience.renderer.instance
    this.time = this.experience.time
    this.items = this.experience.loader.items
    this.ui = this.experience.ui

    this.create()
  }

  create() {
    const waterGeometry = new THREE.CircleGeometry(700, 50, 50)
    this.waterNormalTexture = this.items.waterNormalMap
    this.waterNormalTexture.wrapS = this.waterNormalTexture.wrapT =
      THREE.RepeatWrapping

    this.water = new Water(waterGeometry, {
      textureWidth: 1024,
      textureHeight: 1024,
      waterNormals: this.waterNormalTexture,
      sunDirection: new THREE.Vector3(),
      sunColor: 0xffffff,
      waterColor: 0x001e0f,
      distortionScale: 1,
      fog: this.scene.fog !== undefined,
    })

    this.water.rotation.x = -Math.PI / 2
    // this.water.position.y -= 50
    this.scene.add(this.water)

    this.experience.register(this)
  }

  updateSunPosition(sunPosition) {
    this.water.material.uniforms['sunDirection'].value
      .copy(sunPosition)
      .normalize()
  }

  update() {
    this.water.material.uniforms['time'].value += this.time.delta * 0.1
  }
}
