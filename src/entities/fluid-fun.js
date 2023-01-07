import Experience from '@/core/experience'
import * as THREE from 'three'
import { Scene } from 'three'
import fluidVertexShader from '@/core/shaders/simple-fluid/vertex.glsl'
import fluidFragmentShader from '@/core/shaders/simple-fluid/fragment.glsl'
import { randFloat } from 'three/src/math/MathUtils'

export default class FluidFun {
  blobs = []
  intersectionPoint = new THREE.Vector3()
  constructor() {
    this.experience = new Experience()
    this.scene = this.experience.scene
    this.scene1 = new THREE.Scene()
    this.renderer = this.experience.renderer.instance
    this.caster = this.experience.caster
    this.camera = this.experience.camera
    this.config = this.experience.config
    this.items = this.experience.loader.items
    this.time = this.experience.time
    this.create()
  }

  create() {
    this.renderTarget = new THREE.WebGLRenderTarget(
      this.config.width,
      this.config.height,
    )

    const dist = this.camera.position.z
    const height = 1
    this.camera.fov = 2 * (180 / Math.PI) * Math.atan(height / (2 * dist))

    this.camera.updateProjectionMatrix()

    this.addObjects()
    this.addBlobs()

    this.experience.register(this)
  }

  addBlobs() {
    let number = 50
    let blobTemplate = new THREE.Mesh(
      new THREE.PlaneGeometry(0.2, 0.2),
      new THREE.MeshBasicMaterial({
        map: this.items.particleMask,
        transparent: true,
        blending: THREE.AdditiveBlending,
        // depthTest: false,
        // depthWrite: false,
        opacity: 0.88,
      }),
    )
    for (let i = 0; i < number; i++) {
      let blob = blobTemplate.clone()
      let theta = randFloat(0, Math.PI * 2)
      let radius = randFloat(0.1, 0.3)
      blob.position.x = radius * Math.sin(theta)
      blob.position.y = radius * Math.cos(theta)
      blob.userData.life = randFloat(-Math.PI * 2, Math.PI * 2)
      this.blobs.push(blob)
      this.scene1.add(blob)
    }
  }

  updateBlobs() {
    this.blobs.forEach(blob => {
      blob.userData.life += 0.05
      blob.scale.setScalar(Math.sin(0.5 * blob.userData.life))

      if (blob.userData.life > Math.PI * 2) {
        blob.userData.life = -Math.PI * 2
        let theta = randFloat(0, Math.PI * 2)
        let radius = randFloat(0.1, 0.2)
        blob.position.x = this.intersectionPoint.x + radius * Math.sin(theta)
        blob.position.y = this.intersectionPoint.y + radius * Math.cos(theta)
      }
    })
  }

  addObjects() {
    this.material = new THREE.ShaderMaterial({
      extensions: {
        derivatives: '#extension GL_OES_standard_derivatives: enable',
      },
      side: THREE.DoubleSide,
      uniforms: {
        mask: { value: this.items.particleMask },
        backgroundTexture: { value: this.items.om },
      },
      vertexShader: fluidVertexShader,
      fragmentShader: fluidFragmentShader,
      transparent: true,
    })
    this.camera.position.set(0, 0, 2)

    this.geometry = new THREE.PlaneGeometry(1, 1, 1, 1)
    this.plane = new THREE.Mesh(this.geometry, this.material)
    this.plane.position.z += 0.01
    this.scene.add(this.plane)

    this.caster.register(this.plane)
    this.plane.move = () => {
      this.intersectionPoint = this.caster.intersects[0].point
    }

    this.bgMesh = new THREE.Mesh(
      new THREE.PlaneGeometry(1, 1),
      new THREE.MeshBasicMaterial({
        map: this.items.pyramidGirl,
        side: THREE.DoubleSide,
      }),
    )
    this.scene.add(this.bgMesh)
  }

  update() {
    this.updateBlobs()
    this.renderer.setRenderTarget(this.renderTarget)
    this.renderer.render(this.scene1, this.camera)

    this.material.uniforms.mask.value = this.renderTarget.texture
    this.renderer.setRenderTarget(null)
  }
}
