import EventEmitter from '@/core/event-emitter'

export default class PhoenixControllerInput extends EventEmitter {
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
    }
    document.addEventListener('keydown', evt => this.onKeyDown(evt), false)
    document.addEventListener('keyup', evt => this.onKeyUp(evt), false)
  }
  onKeyDown(evt) {
    switch (evt.key.toLowerCase()) {
      case 'w': // w
        this.keys.forward = true
        break
      case 'a': // a
        this.keys.left = true
        break
      case 's': // s
        this.keys.backward = true
        break
      case 'd': // d
        this.keys.right = true
        break
      case 'q':
        this.keys.up = true

      case ' ': // SPACE
        this.keys.space = true
        break
      case 'Shift': // SHIFT
        this.keys.shift = true
        break
    }
  }

  onKeyUp(evt) {
    switch (evt.key.toLowerCase()) {
      case 'w': // w
        this.keys.forward = false
        break
      case 'a': // a
        this.keys.left = false
        break
      case 's':
        this.keys.backward = false
        break
      case 'd':
        this.keys.right = false
        break
      case 'e':
        this.keys.interact = false
        break
      case 'q':
        this.keys.up = false
      case ' ': // SPACE
        this.keys.space = false
        break
      case 'Shift': // SHIFT
        this.keys.shift = false
        break
    }
  }
}
