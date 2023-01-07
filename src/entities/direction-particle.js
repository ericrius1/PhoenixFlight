import Experience from '@/core/experience'
import * as THREE from 'three'

import vertexShader from '@/core/shaders/direction-particle/vertex.glsl'
import fragmentShader from '@/core/shaders/direction-particle/fragment.glsl'
export default class DirectionParticle {
  constructor() {
    this.experience = new Experience()
    this.renderer = this.experience.renderer.instance
    this.scene = this.experience.scene
    this.scene1 = new THREE.Scene()
    this.config = this.experience.config
    this.camera = this.experience.camera
    this.camera1 = new THREE.OrthographicCamera(-0.5, 0.5, 0.5, -0.5, 0.01, 5)
    this.camera1.position.z += 4
    this.renderTarget = new THREE.WebGLRenderTarget(1024, 1024)
    this.create()
  }

  create() {
    const geo = new THREE.PlaneGeometry(1, 1, 1, 1)
    const mat = new THREE.ShaderMaterial({
      vertexShader: vertexShader,
      fragmentShader: fragmentShader,
      transparent: true,
    })
    this.particleQuad = new THREE.Mesh(geo, mat)
    this.scene1.add(this.particleQuad)

    this.displayPlane = new THREE.Mesh(
      new THREE.PlaneGeometry(1, 1),
      new THREE.MeshBasicMaterial({
        map: this.renderTarget.texture,
        transparent: true,
        depthTest: false,
        depthWrite: false,
        blending: THREE.AdditiveBlending,
      }),
    )
    this.displayPlane.position.y += 2
    this.scene.add(this.displayPlane)
    this.renderer.setRenderTarget(this.renderTarget)
    this.renderer.render(this.scene1, this.camera1)
    this.renderTarget.texture.needsUpdate = true
    this.renderer.setRenderTarget(null)
  }
}
