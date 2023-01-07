import Experience from '@/core/experience'
import * as THREE from 'three'
import CrystalMaterial from '@/core/materials/crystal-material'

const mapLinear = THREE.MathUtils.mapLinear
export default class SnowGlobe {
  constructor(mesh) {
    this.experience = new Experience()
    this.mesh = mesh

    this.orbitController = this.experience.mettaController.orbitController
    this.time = this.experience.time
    this.items = this.experience.loader.items
    this.create()
  }

  create() {
    // this.mesh.material = new THREE.MeshStandardMaterial({
    //   //   transmission: 0.99,
    //   roughness: 0.6,
    //   metalness: 0.3,
    //   //   thickness: 0,
    //   side: THREE.DoubleSide,
    //   bumpMap: this.items.clouds,
    //   bumpScale: 0.3,
    //   transparent: true,
    //   opacity: 0.2,
    // })
    // this.experience.register(this)
  }

  update() {
    this.mesh.rotation.x += 0.01 * this.time.delta
    this.mesh.rotation.y -= 0.022 * this.time.delta
    // when cam is inside globe, its more clear, when outside, its more solid
    const opacity = THREE.MathUtils.clamp(
      mapLinear(this.orbitController.getDistance(), 0, 400, 0.2, 0.7),
      0.2,
      0.7,
    )
    this.mesh.material.opacity = opacity
  }
}
