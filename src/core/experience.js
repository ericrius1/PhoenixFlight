import * as THREE from 'three'
import Renderer from '@/core/renderer'

import { Pane } from 'tweakpane'

import { fov } from '@/core/constants'

import Time from '@/core/time'

import Caster from '@/core/caster'
import Loader from '@/core/loader'
import Stats from '@/core/utils/stats'
import AudioMaster from '@/core/audio/audio-master'
import MettaController from './controllers/metta-controller'

export default class Experience {
  static instance
  hasBegun = false
  constructor() {
    if (Experience.instance) {
      return Experience.instance
    }
    Experience.instance = this
    window.Experience = this  

    this.entities = []

    this.config = {
      // debug: true, 
      width: window.innerWidth,
      height: window.innerHeight,
      pixelRatio: Math.min(Math.max(window.devicePixelRatio, 1), 2),
    }

    this.camera = new THREE.PerspectiveCamera(
      fov,
      this.config.width / this.config.height,
      0.1,
      10000,
    )
    // this.camera.position.set(0, 1.5, 5)
    this.camera.position.set(0, 2, 5)

    this.time = new Time()
    this.setUI()
    this.setStats()
    this.scene = new THREE.Scene()
    this.renderer = new Renderer()

    this.pmremGenerator = new THREE.PMREMGenerator(this.renderer.instance)

    this.loader = new Loader()
    this.caster = new Caster()
    this.mettaController = new MettaController()

    window.addEventListener('resize', () => {
      this.resize()
    })

    this.audioMaster = new AudioMaster()
    this.resize()
    this.update()
  }

  // adds an instance to be updated and managed
  register(entity) {
    this.entities.push(entity)
  }

  unregister(entity) {
    // const entity = this.entities.find(entity)
  }

  setStats() {
    if (this.config.debug) {
      this.stats = new Stats(true)
    }
  }

  begin() {
    if (!this.hasBegun) {
      this.audioMaster.begin()
      this.hasBegun = true
    }
  }

  setUI() {
    if (this.config.debug) {
      this.ui = new Pane()
      this.ui.containerElem_.style.width = '320px'
      this.ui.containerElem_.style.zIndex = 10000
      // this.ui.containerElem_.style.position = 'fixed'
    }
  }

  update() {
    if (this.stats) {
      this.stats.update()
    }

    this.time.update()
    this.caster.update()
    this.entities.map(entity => {
      entity.update()
    })
    this.renderer.update()

    window.requestAnimationFrame(() => {
      this.update()
    })
  }

  resize() {
    this.config.width = window.innerWidth
    this.config.height = window.innerHeight
    this.camera.aspect = this.config.width / this.config.height
    this.config.smallestSide = Math.min(this.config.width, this.config.height)
    this.config.largestSide = Math.max(this.config.width, this.config.height)
    this.camera.updateProjectionMatrix()
    this.renderer.resize()
  }

  reset() {
    this.realm?.reset()
  }
}
