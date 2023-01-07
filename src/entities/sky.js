import Experience from '@/core/experience'
import {
  BackSide,
  BoxGeometry,
  Mesh,
  ShaderMaterial,
  UniformsUtils,
  Vector3,
  MathUtils,
  DoubleSide,
} from 'three'

import skyVertexShader from '@/core/shaders/sky/vertex.glsl'
import skyFragmentShader from '@/core/shaders/sky/fragment.glsl'
import { SphereGeometry } from 'three'

/**
 * Based on "A Practical Analytic Model for Daylight"
 * aka The Preetham Model, the de facto standard analytic skydome model
 * https://www.researchgate.net/publication/220720443_A_Practical_Analytic_Model_for_Daylight
 *
 * First implemented by Simon Wallner
 * http://simonwallner.at/project/atmospheric-scattering/
 *
 * Improved by Martin Upitis
 * http://blenderartists.org/forum/showthread.php?245954-preethams-sky-impementation-HDR
 *
 * Three.js integration by zz85 http://twitter.com/blurspline
 */

const mapLinear = MathUtils.mapLinear
export default class Sky extends Mesh {
  sunPosition = new Vector3()

  constructor() {
    const shader = Sky.SkyShader
    const material = new ShaderMaterial({
      name: 'SkyShader',
      fragmentShader: shader.fragmentShader,
      vertexShader: shader.vertexShader,
      uniforms: UniformsUtils.clone(shader.uniforms),
      side: BackSide,
      depthWrite: false,
    })

    super(
      new SphereGeometry(1, 30, 30, 0, Math.PI * 2, 0, Math.PI / 1.9),
      material,
    )
    this.scale.setScalar(300) // how large is skybox
    this.experience = new Experience()
    this.camera = this.experience.camera
    this.scene = this.experience.scene
    this.pmremGenerator = this.experience.pmremGenerator
    this.create()
    this.ui = this.experience.ui
    if (this.ui) {
      this.createUI()
    }

    this.updateSun()
  }

  create() {
    const skyUniforms = this.material.uniforms

    this.parameters = {
      elevation: -1.25,
      azimuth: -180,
    }
    skyUniforms.outerspaceFactor.value = 0
    skyUniforms.turbidity.value = 10
    skyUniforms.rayleigh.value = 7.2
    skyUniforms.mieCoefficient.value = 0.05
    skyUniforms.mieDirectionalG.value = 0.8
  }

  createUI() {
    this.ui.addFolder({ title: 'sky' })
    this.ui
      .addInput(this.parameters, 'elevation', {
        label: 'elevation',
        min: -3,
        max: 20,
        step: 0.001,
      })
      .on('change', this.updateSun.bind(this))
    this.ui
      .addInput(this.parameters, 'azimuth', {
        label: 'azimuth',
        min: -180,
        max: 180,
        step: 0.1,
      })
      .on('change', this.updateSun.bind(this))
    this.ui
      .addInput(this.material.uniforms.outerspaceFactor, 'value', {
        label: 'outerspaceFactor',
        min: 0,
        max: 1,
        step: 0.01,
      })
      .on('change', () => {
        this.scene.environment = this.pmremGenerator.fromScene(this).texture
      })
    this.ui
      .addInput(this.material.uniforms.turbidity, 'value', {
        label: 'turbidity',
        min: 0,
        max: 20,
        step: 0.1,
      })
      .on('change', () => {
        this.scene.environment = this.pmremGenerator.fromScene(this).texture
      })
    this.ui
      .addInput(this.material.uniforms.rayleigh, 'value', {
        label: 'rayleigh',
        min: 0,
        max: 20,
        step: 0.1,
      })
      .on('change', () => {
        this.scene.environment = this.pmremGenerator.fromScene(this).texture
      })
    this.ui
      .addInput(this.material.uniforms.mieCoefficient, 'value', {
        label: 'mieCoefficient',
        min: 0,
        max: 1,
        step: 0.001,
      })
      .on('change', () => {
        this.scene.environment = this.pmremGenerator.fromScene(this).texture
      })
    this.ui
      .addInput(this.material.uniforms.mieDirectionalG, 'value', {
        label: 'mieDirectionalG',
        min: 0,
        max: 1,
        step: 0.01,
      })
      .on('change', () => {
        this.scene.environment = this.pmremGenerator.fromScene(
          this,
          0,
          1,
          10,
        ).texture
      })
  }

  updateSun() {
    const phi = MathUtils.degToRad(90 - this.parameters.elevation)
    const theta = MathUtils.degToRad(this.parameters.azimuth)

    this.sunPosition.setFromSphericalCoords(1, phi, theta)

    this.material.uniforms['sunPosition'].value.copy(this.sunPosition)

    this.scene.environment = this.pmremGenerator.fromScene(this).texture
  }
}

Sky.prototype.isSky = true

Sky.SkyShader = {
  uniforms: {
    turbidity: { value: 2 },
    rayleigh: { value: 1 },
    mieCoefficient: { value: 0.005 },
    mieDirectionalG: { value: 0.8 },
    sunPosition: { value: new Vector3() },
    up: { value: new Vector3(0, 1, 0) },
    outerspaceFactor: { value: 0.0 },
  },

  vertexShader: skyVertexShader,
  fragmentShader: skyFragmentShader,
}
