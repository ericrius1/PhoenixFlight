import Experience from '@/core/experience'
import OrbitController from '@/core/controllers/orbit-controller'
export default class MettaController {
  constructor() {
    this.experience = new Experience()
    this.orbitController = new OrbitController(
      this.experience.camera,
      this.experience.renderer.instance.domElement,
    )

    this.orbitController.enableDamping = true
    this.orbitController.dampingFactor = 0.1
    this.orbitController.rotateSpeed = 0.2
    this.orbitController.zoomSpeed = 0.2
    this.orbitController.zoomSpeed = 0.4

    this.orbitController.minPolarAngle = Math.PI / 16
    this.orbitController.maxPolarAngle = Math.PI - Math.PI / 16
    this.orbitController.maxDistance = 100000
    this.orbitController.minDistance = 2
    this.experience.register(this)

    window.addEventListener('keydown', evt => {
      if (evt.key === 'f') {
        toggleFullScreen()
      } else if (evt.key === ' ' || evt.key.toLowerCase() === 'w') {
        this.experience.begin()
      }
    })
  }

  update() {
    this.orbitController.update()
  }
}

function toggleFullScreen() {
  if (!document.fullscreenElement) {
    document.documentElement.requestFullscreen()
  } else {
    if (document.exitFullscreen) {
      document.exitFullscreen()
    }
  }
}
