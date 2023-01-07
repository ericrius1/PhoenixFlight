import * as THREE from 'three'

import EventEmitter from '@/core/event-emitter'
import Experience from '@/core/experience'

export default class Caster extends EventEmitter {
  downDirection = new THREE.Vector3(0, -1, 0)
  constructor() {
    super()
    this.experience = new Experience()
    this.config = this.experience.config
    this.resources = this.experience.resources
    this.debug = this.experience.debug
    this.scene = this.experience.scene
    this.time = this.experience.time
    this.raycaster = new THREE.Raycaster()
    this.objectsToTest = []
    this.mouse = new THREE.Vector2()
    this.centerVec = new THREE.Vector2()
    this.selectedIntersection = null

    this.currentIntersection = null

    window.addEventListener('pointermove', event => {
      this.mouse.x = (event.offsetX / this.config.width) * 2 - 1
      this.mouse.y = -(event.offsetY / this.config.height) * 2 + 1
    })

    window.addEventListener('pointerdown', event => {
      if (this.currentIntersect && this.currentIntersect.object.select) {
        this.currentIntersect.object.select()
        this.selectedIntersection = this.currentIntersect
      }
    })

    window.addEventListener('pointerup', () => {
      if (
        this.selectedIntersection &&
        this.selectedIntersection.object.release
      ) {
        this.selectedIntersection.object.release()
        this.selectedIntersection = null
      }
    })
  }

  // layer can be a string maybe? Or a num, bit masking
  register(obj, layer) {
    this.objectsToTest.push(obj)
  }

  topdownCast(worldPosition, objs) {
    this.raycaster.set(worldPosition, this.downDirection)
    this.intersects = this.raycaster.intersectObjects(objs)
    if (this.intersects.length > 0) return this.intersects[0]
    // cast down from above specified position and return the position of the object
  }

  update() {
    // set raycaster
    // if ray hits object, call that objects onHover or whatever if it has it...
    if (this.experience.pointerLocked) {
      this.raycaster.setFromCamera(this.centerVec, this.experience.camera)
    } else {
      this.raycaster.setFromCamera(this.mouse, this.experience.camera)
    }
    // console.log(this.camera.instance.rotation.x)
    this.intersects = this.raycaster.intersectObjects(this.objectsToTest)
    // console.log(intersects[0]);

    // pointer up and down
    if (this.intersects.length) {
      if (!this.currentIntersect) {
        document.body.style.cursor = 'pointer'
        if (this.intersects[0].object.pointerEnter) {
          this.intersects[0].object.pointerEnter()
        }
      } else if (this.intersects[0].object.move) {
        this.intersects[0].object.move()
      }
      this.currentIntersect = this.intersects[0]
    } else {
      if (this.currentIntersect) {
        document.body.style.cursor = 'default'
        if (this.currentIntersect.object.pointerExit) {
          this.currentIntersect.object.pointerExit()
        }
      }
      this.currentIntersect = null
    }
  }
}
