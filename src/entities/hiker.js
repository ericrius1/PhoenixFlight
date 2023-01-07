import Experience from '@/core/experience'
import * as THREE from 'three'
import gsap from 'gsap'
import HikerControllerInput from '@/core/controllers/hiker-controller-input'

const randFloat = THREE.MathUtils.randFloat
const mapLinear = THREE.MathUtils.mapLinear
export default class Hiker {
  walkDirection = new THREE.Vector3(0, 0, -1)
  modelDirection = new THREE.Vector3(0, 0, 0)
  groundHeight = 0
  upAxis = new THREE.Vector3(0, 1, 0)
  rotateQuarternion = new THREE.Quaternion()
  cameraTarget = new THREE.Vector3()
  hikerMoveTarget = new THREE.Vector3()
  velocityY = 0
  cameraOffset = 2
  cameraDistanceBehind = 3
  gravity = 0.0011
  moveY = 0
  walkSpeed = 5

  constructor(gltf, model) {
    this.experience = new Experience()
    this.scene = this.experience.scene
    this.time = this.experience.time
    this.world = this.experience.realm.world
    this.camera = this.experience.camera
    this.realm = this.experience.realm
    this.audioMaster = this.experience.audioMaster
    this.gltf = gltf
    this.model = model
    this.startingPosition = new THREE.Vector3(0, 0, 0)
    this.upSpeed = 5
    this.items = this.experience.loader.items

    this.orbitController = this.experience.mettaController.orbitController
    this.init()
  }

  init() {
    this.model.castShadow = true

    this.hikerMoveTarget.copy(this.model.position)

    this.camera.position.copy(this.model.position)
    this.camera.position.y += this.cameraOffset
    this.camera.position.z += this.cameraDistanceBehind
    this.cameraTarget.copy(this.model.position)
    this.cameraTarget.y += this.cameraOffset
    this.orbitController.target = this.cameraTarget

    this.input = new HikerControllerInput()

    this.animationMixer = new THREE.AnimationMixer(this.gltf.scene)
    this.animationClips = this.gltf.animations

    this.walkClip = THREE.AnimationClip.findByName(this.animationClips, 'Walk')
    this.walkAction = this.animationMixer.clipAction(this.walkClip)
    this.walkAction.setEffectiveTimeScale(1.4)

    this.mountClip = THREE.AnimationClip.findByName(
      this.animationClips,
      'Mount',
    )
    this.mountAction = this.animationMixer.clipAction(this.mountClip)

    this.glideClip = THREE.AnimationClip.findByName(
      this.animationClips,
      'Glide',
    )
    this.glideAction = this.animationMixer.clipAction(this.glideClip)

    this.idleClip = THREE.AnimationClip.findByName(
      this.animationClips,
      'Idle_Neutral',
    )
    this.idleAction = this.animationMixer.clipAction(this.idleClip)
    this.currentAction = 'idle'
    this.idleAction.setEffectiveTimeScale(0.5)
    this.idleAction.play()

    this.rollClip = THREE.AnimationClip.findByName(this.animationClips, 'Roll')
    this.rollAction = this.animationMixer.clipAction(this.rollClip)
    this.rollAction.setEffectiveTimeScale(1.7)

    this.experience.register(this)
    // this.updateCameraTarget(0, 0, 0)

    this.input.on('interact', this.interact.bind(this))
  }

  update() {
    if (!this.mounted) {
      // framerate independent lerp
      const f = 0.00001 // A factor between 0 and 1 that decides how quickly the camera catches up to its target position
      const a = 1 - Math.pow(f, this.time.delta)
      this.model.position.lerp(this.hikerMoveTarget, a)
      this.handleMoveInput()
      if (this.currentAction === 'walking') {
        this.walk()
      } else if (this.currentAction === 'gliding') {
        this.glide()
      } else if (this.currentAction === 'rolling') {
        console.log('yeah')
      }
      // uncoment to keep cam from going below surface
      // if (this.camera.position.y < 1) {
      //   this.camera.position.y = 1
      // }
    }

    this.animationMixer.update(this.time.delta)
  }

  glide() {
    this.velocityY -= this.gravity * this.time.delta
    this.moveY += this.velocityY
    this.hikerMoveTarget.y += this.moveY
    this.groundHeight = this.world.calculateGroundHeight(this.hikerMoveTarget)

    this.updateCameraTarget(0, this.moveY, 0)
    if (this.camera.position.y < this.groundHeight + 1) {
      this.camera.position.y = this.groundHeight + 1
    }

    if (this.hikerMoveTarget.y <= this.groundHeight) {
      console.log(this.groundHeight)
      console.log('ROLL')
      // first roll then go back to walking
      this.currentAction = 'rolling'
      this.rollAction.loop = THREE.LoopOnce

      this.hikerMoveTarget.y = this.groundHeight
      this.rollAction.play()
      this.animationMixer.addEventListener('finished', () => {
        console.log('finished animation ')
        this.currentAction = 'idle'
      })
      // this.idleAction.stop() //TODO: replace wwith glide
    }
  }

  walk() {
    const angleYCameraDirection = Math.atan2(
      this.camera.position.x - this.model.position.x,
      this.camera.position.z - this.model.position.z,
    )
    // diagonal movement angle offset
    const directionOffset = this.getDirectionOffset()
    // rotate model
    this.rotateQuarternion.setFromAxisAngle(
      this.upAxis,
      angleYCameraDirection + directionOffset,
    )
    this.model.quaternion.rotateTowards(this.rotateQuarternion, 0.2)
    // calculate direction
    this.camera.getWorldDirection(this.walkDirection)
    this.walkDirection.y = 0
    this.walkDirection.normalize()
    this.walkDirection.applyAxisAngle(this.upAxis, directionOffset)

    // walk model & camera
    const moveX = this.walkDirection.x * this.walkSpeed * this.time.delta
    const moveZ = this.walkDirection.z * this.walkSpeed * this.time.delta
    this.model.position.x += moveX
    this.model.position.z += moveZ

    this.hikerMoveTarget.x = this.model.position.x + moveX
    this.hikerMoveTarget.z = this.model.position.z + moveZ

    let prevY = this.model.position.y

    this.hikerMoveTarget.y = this.world.calculateGroundHeight(
      this.hikerMoveTarget,
    )

    let moveY = this.hikerMoveTarget.y - prevY

    // let moveY = 0
    // TODO: rotate hike based on normal dir

    this.updateCameraTarget(moveX, moveY, moveZ)
  }
  handleMoveInput() {
    if (
      (this.input.keys.forward ||
        this.input.keys.backward ||
        this.input.keys.left ||
        this.input.keys.right) &&
      this.currentAction !== 'walking' &&
      this.currentAction !== 'gliding'
    ) {
      this.walkAction.crossFadeFrom(this.idleAction, 0.5)
      this.walkAction.enabled = true
      this.walkAction.time = 0
      this.currentAction = 'walking'
      this.walkAction.play()
    } else if (
      !(
        this.input.keys.forward ||
        this.input.keys.backward ||
        this.input.keys.right ||
        this.input.keys.left
      ) &&
      this.currentAction !== 'idle' &&
      this.currentAction !== 'gliding'
    ) {
      this.idleAction.crossFadeFrom(this.walkAction, 0.5)
      this.currentAction = 'idle'
      this.idleAction.enabled = true
      this.idleAction.time = 0
    }
  }

  mount(entity) {
    // entity.model.add(this.model)
    // this.model.position.copy(entity.attachBone.position)

    entity.mount(this.model)
    this.walkAction.stop()
    this.mountAction.play()
    this.mounted = true
  }

  dismount() {
    this.mounted = false
    this.velocityY = 0
    const worldPos = this.model.getWorldPosition(new THREE.Vector3())
    const worldDir = this.model.getWorldDirection(new THREE.Vector3())
    worldDir.y = 0
    this.scene.add(this.model)
    this.model.position.copy(worldPos)
    this.hikerMoveTarget.copy(worldPos)
    var mx = new THREE.Matrix4().lookAt(
      worldDir,
      new THREE.Vector3(0, 0, 0),
      new THREE.Vector3(0, 1, 0),
    )
    var qt = new THREE.Quaternion().setFromRotationMatrix(mx)
    this.model.rotation.setFromQuaternion(qt)
    this.mountAction.stop()
    this.currentAction = 'gliding'
    this.idleAction.reset().play() // just for now have idle subsitite for glie until I figure out ik stuff with blender
    // this.model.rotateX(-Math.PI / 2)
  }

  interact() {
    if (this.mounted) {
      // we want to unmount from phoenix and return control to normal walking moode
      this.mountedEntity.dismount()

      this.dismount()
      return
    }
    this.world.interactableEntities.forEach(entity => {
      let distance = entity.model.position.distanceTo(this.model.position)
      if (distance < entity.interactionDistance) {
        if (entity.name === 'Phoenix') {
          this.mountedEntity = entity
          // special case for phoenix... hop on and fly, controls now walk to phoenix
          this.mount(entity)
        } else {
          entity.interact()
        }
      }
    })
  }

  //return the index of the pixel at the specified coordinate from the imagedata

  updateCameraTarget(moveX, moveY, moveZ) {
    // walk camera
    this.camera.position.x += moveX
    this.camera.position.y += moveY * this.time.delta * 10
    this.camera.position.z += moveZ

    // update camera target
    this.cameraTarget.x = this.model.position.x
    this.cameraTarget.y = this.model.position.y + this.cameraOffset
    this.cameraTarget.z = this.model.position.z
    this.orbitController.target = this.cameraTarget
  }

  getDirectionOffset() {
    let directionOffset = 0 // w

    if (this.input.keys.forward) {
      if (this.input.keys.left) {
        directionOffset = Math.PI / 4 //w + a
      } else if (this.input.keys.right) {
        directionOffset = -Math.PI / 4
      }
    } else if (this.input.keys.backward) {
      if (this.input.keys.left) {
        directionOffset = Math.PI / 4 + Math.PI / 2 // s + a
      } else if (this.input.keys.right) {
        directionOffset = -Math.PI / 4 - Math.PI / 2 // s + d
      } else {
        directionOffset = Math.PI //s
      }
    } else if (this.input.keys.left) {
      directionOffset = Math.PI / 2 //a
    } else if (this.input.keys.right) {
      directionOffset = -Math.PI / 2 //d
    }
    return directionOffset
  }

  reset() {
    this.model.position.copy(this.startingPosition)
  }
}

// effective time scale takes into account the current states of warping and paused
