import Experience from '@/core/experience'
import { gsap } from 'gsap'
import * as THREE from 'three'

import HangScale from '../../resources/hang-scale'

export default class AudioMaster {
  constructor() {
    this.experience = new Experience()
    this.camera = this.experience.camera
    this.scene = this.experience.scene
    this.audioListener = new THREE.AudioListener()
    this.drumNotes = new Map()
    this.camera.add(this.audioListener)

    this.waterfallClip = new THREE.PositionalAudio(this.audioListener)

    this.waterfallClip.setRefDistance(20)
    this.waterfallClip.setRolloffFactor(1)
    this.waterfallClip.setVolume(0.8)
    const loader = new THREE.AudioLoader()
    loader.load('/audio/waterfall.mp3', buffer => {
      this.waterfallClip.setBuffer(buffer)
    })
  }

  begin() {
    // this.waterfallClip.setNodeSource(oscillator)

    this.waterfallClip.play()

    // this.scene.add(box)
    // box.add(this.waterfallClip)
  }
}
