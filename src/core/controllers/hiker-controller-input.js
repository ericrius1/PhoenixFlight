import EventEmitter from '@/core/event-emitter'

export default class HikerControllerInput extends EventEmitter {
  constructor() {
    super()
    this.init()
  }

  init() {
    this.keys = {
      forward: false,
      backward: false,
      left: false,
      right: false,
      up: false,
      space: false,
      shift: false,
      smoke: false,
      interact: false,
    }
    document.addEventListener('keydown', evt => this.onKeyDown(evt), false)
    document.addEventListener('keyup', evt => this.onKeyUp(evt), false)
  }
  onKeyDown(evt) {
    switch (evt.code) {
      case 'KeyW': // w
        this.keys.forward = true
        break
      case 'KeyA': // a
        this.keys.left = true
        break
      case 'KeyS': // s
        this.keys.backward = true
        break
      case 'KeyD': // d
        this.keys.right = true
        break
      case 'KeyE':
        !this.keys.interact && this.trigger('interact')
        this.keys.interact = true
        evt.stopPropagation()
        break
      case ' ': // SPACE
        this.keys.space = true
        break
      case 'Shift': // SHIFT
        this.keys.shift = true
        break
      case 'j':
        !this.keys.smoke && this.trigger('inhale')
        this.keys.smoke = true
        break
    }
  }

  onKeyUp(evt) {
    switch (evt.code) {
      case 'KeyW': // w
        this.keys.forward = false
        break
      case 'KeyA': // a
        this.keys.left = false
        break
      case 'KeyS':
        this.keys.backward = false
        break
      case 'KeyD':
        this.keys.right = false
        break
      case 'KeyE':
        this.keys.interact = false
        break
      case 'Space': // SPACE
        this.keys.space = false
        break
      case 'Shift': // SHIFT
        this.keys.shift = false
        break
      case 'KeyJ':
        this.trigger('exhale')
        this.keys.smoke = false
        break
    }
  }
}
