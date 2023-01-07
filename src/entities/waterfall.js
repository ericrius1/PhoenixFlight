import Experience from '@/core/experience'
import * as THREE from 'three'

import waterfallVertexShader from '@/core/shaders/waterfall/vertex.glsl'
import waterfallFragmentShader from '@/core/shaders/waterfall/fragment.glsl'
import { createAudioContext } from 'tone/build/esm/core/context/AudioContext'

export default class Waterfall {
  constructor(model) {
    this.experience = new Experience()
    this.scene = this.experience.scene
    this.time = this.experience.time
    this.items = this.experience.loader.items
    this.model = model
    this.waterfallClip = this.experience.audioMaster.waterfallClip
    this.create()
  }

  create() {
    this.noiseMap = this.items.waterfallNoiseMap
    this.dudvMap = this.items.waterfallDudvMap

    this.noiseMap.wrapS = this.noiseMap.wrapT = THREE.RepeatWrapping
    this.noiseMap.minFilter = THREE.NearestFilter
    this.noiseMap.magFilter = THREE.NearestFilter

    this.dudvMap.wrapsS = this.dudvMap.wrapT = THREE.RepeatWrapping

    let waterfallUniforms = {
      time: this.time.timeUniform,
      tNoise: {
        value: this.noiseMap,
      },
      tDudv: {
        value: this.dudvMap,
      },
      topDarkColor: {
        value: new THREE.Color(0x4e7a71),
      },
      bottomDarkColor: {
        value: new THREE.Color(0x0e7562),
      },
      topLightColor: {
        value: new THREE.Color(0xb0f7e9),
      },
      bottomLightColor: {
        value: new THREE.Color(0x14c6a5),
      },
      foamColor: {
        value: new THREE.Color(0xffffff),
      },
    }

    var waterfallMaterial = new THREE.ShaderMaterial({
      uniforms: THREE.UniformsUtils.merge([
        THREE.UniformsLib['fog'],
        waterfallUniforms,
      ]),
      vertexShader: waterfallVertexShader,
      fragmentShader: waterfallFragmentShader,
      side: THREE.DoubleSide,
      fog: true,
    })

    //   this.waterfallMesh = new THREE.Mesh(
    //     new THREE.CylinderBufferGeometry(10, 10, 15, 16, 1, true,-Math.PI/4, Math.PI/2),
    //     waterfallMaterial
    //   );
    this.waterfallMesh = this.model
    this.waterfallMesh.material = waterfallMaterial

    this.initAudio()
    this.experience.register(this)
  }

  initAudio() {
    this.waterfallMesh.add(this.waterfallClip)
  }

  update() {
    // this.waterfallMesh.material.uniforms.time.value += .1
    this.waterfallMesh.material.uniforms.time.value =
      this.time.timeUniform.value
  }
}
