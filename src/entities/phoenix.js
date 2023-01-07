import Experience from '@/core/experience'
import * as THREE from 'three'
import { Quaternion } from 'three'
import PhoenixControllerInput from '../core/controllers/phoenix-controller-input'

const mapLinear = THREE.MathUtils.mapLinear
export default class Phoenix {
  name = 'Phoenix'
  interactionDistance = 8
  cameraFocusTarget = new THREE.Vector3()
  camDistanceBehindPhoenix = 2000
  cameraMoveTargetWorldPosition = new THREE.Vector3()
  tmpQuaternion = new Quaternion()
  modelWorldQuaternion = new THREE.Quaternion()
  cameraMoveTargetWorldQuaternion = new THREE.Quaternion()
  moveTarget = new THREE.Vector3()
  rollSpeed = 0.005
  euler = new THREE.Euler(0, 0, 0, 'YXZ')
  targetRotation = new THREE.Quaternion()
  rotateQuaternion = new THREE.Quaternion()
  yawAxis = new THREE.Vector3(0, 1, 0)
  rollAxis = new THREE.Vector3(0, 0, 1)
  modelEuler = new THREE.Euler()
  rotationVector = new THREE.Vector3()
  yawLeft = 0
  yawRight = 0
  pitchAngle = 0
  moveX = 0
  moveZ = 0
  moveY = 0
  worldForwardDirection = new THREE.Vector3(0, 0, -1)
  flyDirection = new THREE.Vector3(0, 0, 0)
  flySpeed = 20
  minPolarAngle = (-Math.PI / 4) * 0.98
  maxPolarAngle = (Math.PI / 4) * 0.98
  hoveringTimescale = 0.05
  flappingTimescale = 0.9
  constructor(gltf, model) {
    this.experience = new Experience()
    this.scene = this.experience.scene
    this.world = this.experience.realm.world
    this.camera = this.experience.camera
    this.orbitController = this.experience.mettaController.orbitController
    this.time = this.experience.time
    this.gltf = gltf
    this.model = model
    this.animationMixer = new THREE.AnimationMixer(this.model)
    this.input = new PhoenixControllerInput()
    this.create()
  }

  create() {
    this.experience.register(this)

    this.flyDirection.copy(this.worldForwardDirection)
    this.flyDirection.applyQuaternion(this.model.quaternion)
    this.flyDirection.normalize()

    this.cameraMoveTarget = new THREE.Mesh(new THREE.BoxGeometry(10, 10, 10))
    this.cameraMoveTarget.visible = false

    this.model.add(this.cameraMoveTarget)
    this.cameraMoveTarget.position.z += this.camDistanceBehindPhoenix
    // this.scene.add(this.cameraMoveTarget)
    this.cameraMoveTarget.position.y = 0.5

    this.model.traverse(obj => {
      obj.frustumCulled = false
      if (obj.name === 'body') {
      } else if (obj.name === 'wings') {
      } else if (obj.name === 'attachPoint') {
        this.attachPoint = obj
      }
    })
    this.animationClips = this.gltf.animations
    this.flyClip = THREE.AnimationClip.findByName(this.animationClips, 'Fly')
    this.flyAction = this.animationMixer.clipAction(this.flyClip)

    this.flyAction.play()
    this.flyAction.setEffectiveTimeScale(this.hoveringTimescale)

    this.world.registerInteractable(this)
  }

  interact() {}

  mount(model) {
    this.flying = true
    this.currentAction = 'flying'
    this.flyAction.setEffectiveTimeScale(this.flappingTimescale)
    this.mounted = true

    this.scene.remove(model)
    this.attachPoint.add(model)
    model.position.set(0, -1, 0)

    this.addListeners()
  }

  dismount() {
    this.removeListeners()
    this.mounted = false
    this.flyAction.setEffectiveTimeScale(this.hoveringTimescale)
  }

  update() {
    this.yawRight = 0
    this.yawLeft = 0
    this.animationMixer.update(this.time.delta)
    if (this.mounted) {
      this.handleFlyInput()
      if (this.currentAction === 'flying') {
        this.fly()
      }
      let rotMult = this.time.delta * this.rollSpeed
      this.updateRotationVector()

      this.euler.setFromQuaternion(this.model.quaternion)
      this.euler.y += this.rotationVector.y * rotMult
      this.euler.x += this.rotationVector.x * rotMult

      if (this.euler.x > this.maxPolarAngle) {
        this.euler.x = this.maxPolarAngle
      } else if (this.euler.x < this.minPolarAngle) {
        this.euler.x = this.minPolarAngle
      }
      this.model.quaternion.setFromEuler(this.euler)
      // this.model.rotateZ(0.01)
      // this.model.rotation.z = 0

      // this.model.quaternion.rotateTowards(this.rotateQuaternion, 0.1)
      // this.model.rotation.z = 0
      if (!this.experience.inhaling) {
        this.updateCameraTarget()
      }
    }
  }

  updateRotationVector() {
    this.rotationVector.x = this.pitchAngle * 100
    this.rotationVector.y = (-this.yawRight + this.yawLeft) * 100
    this.rotationVector.z = 0
  }

  fly() {
    if (this.input.keys.forward) {
      this.model.translateZ(-this.flySpeed * this.time.delta)
    }
    if (this.input.keys.backward) {
      this.model.translateZ(this.flySpeed * this.time.delta)
    }
    if (this.input.keys.right) {
      this.yawRight = 1
    }
    if (this.input.keys.left) {
      this.yawLeft = 1
    }

    if (this.model.position.y < 1) {
      this.model.position.y = 1
    }
  }
  handleFlyInput() {
    if (
      (this.input.keys.forward ||
        this.input.keys.backward ||
        this.input.keys.left ||
        this.input.keys.right) &&
      this.currentAction !== 'flying'
    ) {
      this.currentAction = 'flying'
    } else if (
      !(
        this.input.keys.forward ||
        this.input.keys.backward ||
        this.input.keys.right ||
        this.input.keys.left
      ) &&
      this.currentAction !== 'hovering'
    ) {
      this.currentAction = 'hovering'
    }
  }

  updateCameraTarget() {
    this.cameraMoveTarget.getWorldPosition(this.cameraMoveTargetWorldPosition)
    this.cameraMoveTarget.getWorldQuaternion(
      this.cameraMoveTargetWorldQuaternion,
    )
    // console.log(this.cameraMoveTargetWorldPosition)
    if (this.cameraMoveTargetWorldPosition.y < 1) {
      this.cameraMoveTargetWorldPosition.y = 1
    }
    // this.cameraMoveTargetWorldPosition.y = this.model.position.y + 2
    // this.camera.quaternion.slerp(this.cameraMoveTargetWorldQuaternion, 0.1)
    const f = 0.01 // A factor between 0 and 1 that decides how quickly the camera catches up to its target position
    const a = 1 - Math.pow(f, this.time.delta)
    this.camera.position.lerp(this.cameraMoveTargetWorldPosition, a)

    this.cameraFocusTarget.x = this.model.position.x
    this.cameraFocusTarget.z = this.model.position.z
    this.cameraFocusTarget.y = this.model.position.y
    this.orbitController.target = this.cameraFocusTarget
  }

  addListeners() {
    this.boundCalculatePitch = this.calculatePitch.bind(this)
    window.addEventListener('pointermove', this.boundCalculatePitch)
  }
  removeListeners() {
    window.removeEventListener('pointermove', this.boundCalculatePitch)
  }

  calculatePitch(evt) {
    //map so mouse in middle is straight flight
    this.pitchAngle = mapLinear(
      evt.offsetY,
      0,
      window.innerHeight,
      Math.PI / 3,
      -Math.PI / 3,
    )
  }
}
