import Experience from '@/core/experience'
import * as THREE from 'three'
import gsap from 'gsap'

import { randFloat } from 'three/src/math/MathUtils'

import drumVertexShader from '@/core/shaders/drum/vertex.glsl'
import drumFragmentShader from '@/core/shaders/drum/fragment.glsl'

export default class Drum {
  interactionDistance = 5
  constructor(model) {
    this.experience = new Experience()
    this.world = this.experience.realm.world
    this.model = model
    this.time = this.experience.time
    this.drumNotes = this.experience.audioMaster.drumNotes
    this.create()
  }

  create() {
    // debugger
    for (const noteClip of this.drumNotes.values()) {
      this.model.add(noteClip)
    }
    this.world.registerInteractable(this)
    this.addEventlisteners()

    // this.material = new THREE.MeshStandardMaterial({
    //   color: 0x2d7fa3,
    //   metalness: 1,
    //   roughness: 0.5,
    // })

    this.material = new THREE.ShaderMaterial({
      vertexShader: drumVertexShader,
      fragmentShader: drumFragmentShader,
      uniforms: {
        time: this.time.timeUniform,
        surfaceColor: { value: new THREE.Color(0x2d7fa3) },
        fireFactor: 1,
      },
    })
    this.model.material = this.material

    // this.removeEventListeners()
  }

  addEventlisteners() {
    this.onKeyDownBound = this.onKeyDown.bind(this)
    window.addEventListener('keydown', this.onKeyDownBound)
  }

  onKeyDown(evt) {
    if (!this.playing) return

    let noteClip
    switch (evt.key.toLowerCase()) {
      case 'h':
        noteClip = this.drumNotes.get('A2')
        break
      case 'j':
        noteClip = this.drumNotes.get('A3')
        break
      case 'k':
        noteClip = this.drumNotes.get('F3')
        break
      case 'l':
        noteClip = this.drumNotes.get('C3')
        break
      case 'y':
        noteClip = this.drumNotes.get('E3')
        break
      case 'u':
        noteClip = this.drumNotes.get('G3')
        break
      case 'i':
        noteClip = this.drumNotes.get('B3')
        break
      case 'o':
        noteClip = this.drumNotes.get('E4')
        break
      case 'p':
        noteClip = this.drumNotes.get('C4')
        break
    }
    if (noteClip) {
      //   console.log(evt.key)

      if (noteClip.isPlaying) {
        noteClip.stop()
      }
      noteClip.play()

      // this.material.color.r = 1
      // this.material.color.offsetHSL(0.1, 0.1, 0.1)
      this.tweening = true
      // gsap.to(this.material.color, {
      //   duration: 0.2,
      //   ease: 'power2.inOut',
      //   b: randFloat(0.7, 1),
      //   r: randFloat(0.6, 1),
      //   g: randFloat(0.1, 0.6),
      // })
    }
  }

  interact() {
    this.playing = true
  }
}
