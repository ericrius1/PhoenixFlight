import * as THREE from 'three'
import Experience from '@/core/experience'
import { CubeCamera } from 'three'

export default class Renderer {
  constructor() {
    this.experience = new Experience()
    this.scene = this.experience.scene
    this.config = this.experience.config

    this.setInstance()
  }

  setInstance() {
    this.instance = new THREE.WebGLRenderer({
      antialias: true,
      powerPreference: 'high-performance',
      // powerPreference: 'low-power',
      alpha: true,
    })

    this.canvasContainer = document.createElement('div')
    this.canvasContainer.style.position = 'fixed'
    this.canvasContainer.style.width = '100%'
    this.canvasContainer.style.height = '100%'

    this.instance.outputEncoding = THREE.sRGBEncoding
    // this.instance.toneMapping = THREE.ACESFilmicToneMapping
    this.instance.toneMapping = THREE.CineonToneMapping
    this.instance.shadowMap.enabled = true

    // this.instance.setClearColor(0x00001a)
    // this.instance.setClearColor(0xff00ff)

    document.body.appendChild(this.canvasContainer)

    this.instance.domElement.style.width = '100%'
    this.canvasContainer.appendChild(this.instance.domElement)
  }

  resize() {
    this.instance.setSize(
      this.config.width * this.config.pixelRatio,
      this.config.height * this.config.pixelRatio,
      false,
    )
  }

  update() {
    this.instance.render(this.scene, this.experience.camera)
  }
}
