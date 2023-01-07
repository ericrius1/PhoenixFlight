import * as THREE from 'three'
import Experience from '@/core/experience'
import EventEmitter from '@/core/event-emitter'
import Sky from '@/entities/sky'
import Ocean2 from '@/entities/ocean2'

export default class World extends EventEmitter {
  interactableEntities = []
  skyHighPosition = new THREE.Vector3()
  constructor() {
    super()
    this.experience = new Experience()
    this.renderer = this.experience.renderer.instance
    this.scene = this.experience.scene
    this.caster = this.experience.caster
    this.camera = this.experience.camera
    this.time = this.experience.time
    this.groundMeshes = []

    this.directionalLight = new THREE.DirectionalLight(0xffffff, 10)
    // this.scene.add(this.directionalLight)

    this.ui = this.experience.ui
    this.create()
  }

  addGroundMesh(mesh) {
    this.groundMeshes.push(mesh)
  }

  create() {
    this.createSky()
    this.createOcean()
  }

  createSky() {
    this.sky = new Sky()
    this.scene.add(this.sky)
  }

  createOcean() {
    // this.ocean = new Ocean2()
  }

  // returns the y position of the ground at the specified world position
  // returns 0 if there is
  calculateGroundHeight(worldPosition) {
    this.skyHighPosition.copy(worldPosition)
    this.skyHighPosition.y += 1000
    const intersection = this.caster.topdownCast(
      this.skyHighPosition,
      this.groundMeshes,
    )
    if (intersection) {
      this.groundNormal = intersection.face.normal.normalize()
      return intersection.point.y
    }
    return 0
  }

  registerInteractable(entity) {
    if (
      entity.model.position === undefined ||
      typeof entity.interact !== 'function' ||
      entity.interactionDistance === undefined
    ) {
      console.warn(
        'Entity must have a model with a position, a interact method, and a interactDistance property to be interactable. Registration failed',
      )
      return
    }
    this.interactableEntities.push(entity)
  }
}
