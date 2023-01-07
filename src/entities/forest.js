import Experience from '@/core/experience'
import * as THREE from 'three'
import Altar from '@/entities/altar'

export default class Forest {
  constructor(gltf) {
    this.experience = new Experience()
    this.orbitController = this.experience.mettaController.orbitController
    this.time = this.experience.time
    this.scene = this.experience.scene
    this.rollSpeed = 0.0
    this.gltf = gltf
    this.create()
  }

  create() {
    this.scene.add(this.gltf.scene)

    this.animationMixer = new THREE.AnimationMixer(this.gltf.scene)
    this.animationClips = this.gltf.animations
    this.walkClip = THREE.AnimationClip.findByName(this.animationClips, 'Walk')
    this.gltf.scene.traverse(obj => {
      if (obj.name?.includes('forest-world')) {
        this.globe = obj
        // this.globe.material.wireframe = true
      } else if (obj.name?.includes('Adventurer_Body')) {
        this.body = obj
        // this.orbitController.view
      } else if (obj.name?.includes('altar')) {
        this.altar = new Altar(obj)
      }
    })
    this.animationMixer.clipAction(this.walkClip).play()
    this.experience.register(this)
    this.scene.add(this.gltf.scene)

    // this.orbitController.view.target.value.copy(overheadCam.position)
    this.addListeners()
  }

  update() {
    this.animationMixer.update(this.time.delta)
    // this.globe.rotation.x += this.rollSpeed * this.time.delta
  }

  increaseRollSpeed() {
    this.rollSpeed += 0.001
  }

  addListeners() {
    window.addEventListener('keydown', evt => {
      if (evt.key === 'w') {
        this.increaseRollSpeed()
      }
    })
  }
}
