import Experience from '@/core/experience'
import * as THREE from 'three'

import waterVertexShader from '@/core/shaders/ocean/vertex.glsl'
import waterFragmentShader from '@/core/shaders/ocean/fragment.glsl'

import { Water } from 'three/examples/jsm/objects/Water2'

export default class Ocean {
  debugObject = {}
  constructor() {
    this.experience = new Experience()
    this.scene = this.experience.scene
    this.time = this.experience.time
    this.ui = this.experience.ui
    this.debugObject.depthColor = '#186691'
    this.debugObject.surfaceColor = '#9bd8ff'
    this.noiseTexture = this.experience.loader.items.terrainHeightMap.clone()

    this.create()
  }

  create() {
    const waterGeometry = new THREE.PlaneGeometry(200, 200, 512, 512)
    this.noiseTexture.repeat.set(1, 1)
    this.noiseTexture.wrapT = THREE.RepeatWrapping
    this.noiseTexture.wrapS = THREE.RepeatWrapping
    this.noiseTexture
    this.waterMaterial = new THREE.ShaderMaterial({
      uniforms: {
        uTime: this.time.timeUniform,

        uBigWavesElevation: { value: 0.2 },
        uBigWavesFrequency: {
          value: new THREE.Vector2(4, 1.5),
        },
        uBigWavesSpeed: { value: 0.1 },

        uDepthColor: { value: new THREE.Color(this.debugObject.depthColor) },
        uSurfaceColor: {
          value: new THREE.Color(this.debugObject.surfaceColor),
        },
        uColorOffset: { value: 0.085 },
        uColorMultiplier: { value: 5 },

        uSmallWavesElevation: { value: 0.15 },
        uSmallWavesFrequency: { value: 3 },
        uSmallWavesSpeed: { value: 0.2 },
        uSmallWavesIterations: { value: 2 },

        uNoiseTexture: { value: this.noiseTexture },
      },

      vertexShader: waterVertexShader,
      fragmentShader: waterFragmentShader,
    })

    this.water = new THREE.Mesh(waterGeometry, this.waterMaterial)
    this.water.rotation.x = -Math.PI * 0.5
    this.scene.add(this.water)

    // this.water.scale.multiplyScalar(10)

    if (this.ui) {
      this.createUI()
    }
  }

  createUI() {
    this.folder = this.ui.addFolder({
      title: 'ocean',
    })
    this.folder.addInput(
      this.waterMaterial.uniforms.uBigWavesElevation,
      'value',
      {
        label: 'bigWavesElevation',
        min: 0,
        max: 1,
        step: 0.001,
      },
    )
    this.folder.addInput(
      this.waterMaterial.uniforms.uBigWavesFrequency.value,
      'x',
      {
        label: 'bigWavesFrequencyX',
        min: 0.01,
        max: 10,
        step: 0.001,
      },
    )
    this.folder.addInput(
      this.waterMaterial.uniforms.uBigWavesFrequency.value,
      'y',
      {
        label: 'bigWavesFrequencyY',
        min: 0.01,
        max: 10,
        step: 0.001,
      },
    )
    this.folder.addInput(this.waterMaterial.uniforms.uBigWavesSpeed, 'value', {
      label: 'bigWavesSpeed',
      min: 0.01,
      max: 1,
      step: 0.001,
    })

    this.folder
      .addInput(this.debugObject, 'depthColor', {
        view: 'color',
        label: 'depthColor',
      })
      .on('change', () => {
        this.waterMaterial.uniforms.uDepthColor.value.set(
          this.debugObject.depthColor,
        )
      })
    this.folder
      .addInput(this.debugObject, 'surfaceColor', {
        view: 'color',
        label: 'surfaceColor',
      })
      .on('change', () => {
        this.waterMaterial.uniforms.uSurfaceColor.value.set(
          this.debugObject.surfaceColor,
        )
      })
    this.folder.addInput(this.waterMaterial.uniforms.uColorOffset, 'value', {
      label: 'colorOffset',
      min: 0,
      max: 5,
      step: 0.001,
    })
    this.folder.addInput(
      this.waterMaterial.uniforms.uColorMultiplier,
      'value',
      {
        label: 'colorMultiplier',
        min: 0,
        max: 10,
        step: 0.001,
      },
    )

    this.folder.addInput(
      this.waterMaterial.uniforms.uSmallWavesElevation,
      'value',
      {
        label: 'uSmallWavesElevation',
        min: 0,
        max: 1,
        step: 0.001,
      },
    )
    this.folder.addInput(
      this.waterMaterial.uniforms.uSmallWavesFrequency,
      'value',
      {
        label: 'uSmallWavesFrequency',
        min: 0,
        max: 30,
        step: 0.001,
      },
    )
    this.folder.addInput(
      this.waterMaterial.uniforms.uSmallWavesSpeed,
      'value',
      {
        label: 'uSmallWavesSpeed',
        min: 0,
        max: 4,
        step: 0.001,
      },
    )
    this.folder.addInput(
      this.waterMaterial.uniforms.uSmallWavesIterations,
      'value',
      {
        label: 'uSmallWavesIterations',
        min: 0,
        max: 5,
        step: 1,
      },
    )
  }
}
