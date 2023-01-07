import Experience from '@/core/experience'
import * as THREE from 'three'
import ShimmerMaterial from '@/core/materials/shimmer-material'
import gsap from 'gsap'
import gsapCore from 'gsap/gsap-core'

export default class Moon {
  constructor() {
    this.experience = new Experience()
    this.scene = this.experience.scene
    this.time = this.experience.time
    this.create()
  }

  create() {
    this.mesh = new THREE.Mesh(
      new THREE.SphereGeometry(5, 30, 30),
      new ShimmerMaterial(this.time.timeUniform),
    )
    this.mesh.position.set(20, 33, 50)
    this.scene.add(this.mesh)

    this.light = new THREE.DirectionalLight(0x007aa2, 0.1)
    this.light.position.copy(this.mesh.position)
    this.scene.add(this.light)

    // gsap.to(this.mesh.position, {
    //   duration: 5,
    //   ease: 'power3.inOut',
    //   y: 40,
    // })
    // this.experience.register(this)
  }
}
