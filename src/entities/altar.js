import Experience from '@/core/experience'
import * as THREE from 'three'

export default class Altar {
  constructor(mesh) {
    this.experience = new Experience()
    this.scene = this.experience.scene
    this.time = this.experience.time
    this.renderer = this.experience.renderer
    this.items = this.experience.loader.items
    this.mesh = mesh
    this.create()
  }

  create() {
    this.texture2 = this.items.altar2.clone()
    this.texture2.wrapT = THREE.RepeatWrapping
    this.texture2.wrapS = THREE.RepeatWrapping
    this.texture2.repeat.set(16, 4)
    this.texture2.anisotropy =
      this.renderer.instance.capabilities.getMaxAnisotropy()

    this.mesh.material = new THREE.MeshStandardMaterial({
      map: this.texture2,
      metalness: 0.3,
      roughness: 0.7,
      bumpMap: this.texture2,
      bumpScale: 0.3,
    })

    this.experience.register(this)
  }

  update() {
    // this.texture2.offset.x += 0.01 * this.time.delta
    // this.texture2.offset.y -= 0.011 * this.time.delta
  }
}
