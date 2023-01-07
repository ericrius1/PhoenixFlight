import Experience from '@/core/experience'
import * as THREE from 'three'
import gsap from 'gsap'

import grassVertexShader from '@/core/shaders/grass/vertex.glsl'
import grassfragmentShader from '@/core/shaders/grass/fragment.glsl'
import { mapLinear } from 'three/src/math/MathUtils'

let joints = 4
let bladeWidth = 0.024
let bladeHeight = 0.2

//Number of blades
let instances = 100000

//Lighting variables for grass
let ambientStrength = 0.7
let translucencyStrength = 1
let diffuseStrength = 20

let specularColor = new THREE.Color(0x3f71c4)

const randFloat = THREE.MathUtils.randFloat

export default class Grass {
  constructor() {
    this.experience = new Experience()
    this.scene = this.experience.scene
    this.world = this.experience.realm.world
    this.camera = this.experience.camera
    this.time = this.experience.time
    this.items = this.experience.loader.items
    this.ui = this.experience.ui
    this.params = {
      //Rotation around Y axis in range [0, 2*PI]
      azimuth: 3.11,
      //Height over horizon in range [0, PI/2.0]
      elevation: 1.91,
      shininess: 10,
      moonColor: new THREE.Color(0x000523),
    }
    this.createGrass()

    if (this.ui) {
      this.createUI()
    }
  }

  createGrass() {
    // Define the template geometry for an individual blade of grass that will be instanced many times
    let grassBaseGeometry = new THREE.PlaneGeometry(
      bladeWidth,
      bladeHeight,
      1,
      joints,
    )
    grassBaseGeometry.translate(0, bladeHeight / 2, 0)

    // Define the bend of the grass blade as the combination of three quaternion rotations
    let vertex = new THREE.Vector3()
    let quaternion0 = new THREE.Quaternion()
    let quaternion1 = new THREE.Quaternion()
    let x, y, z, w, angle, sinAngle, rotationAxis

    // Rotate around y
    angle = 0.05
    sinAngle = Math.sin(angle / 2.0)
    rotationAxis = new THREE.Vector3(0, 1, 0)
    x = rotationAxis.x * sinAngle
    y = rotationAxis.y * sinAngle
    z = rotationAxis.z * sinAngle
    w = Math.cos(angle / 2.0)
    quaternion0.set(x, y, z, w)

    // Rotate around X
    angle = 0.3
    sinAngle = Math.sin(angle / 2.0)
    rotationAxis.set(1, 0, 0)
    x = rotationAxis.x * sinAngle
    y = rotationAxis.y * sinAngle
    z = rotationAxis.z * sinAngle
    w = Math.cos(angle / 2.0)
    quaternion1.set(x, y, z, w)

    // Combine the rotations to a single quaternion
    quaternion0.multiply(quaternion1)

    // Rotate around z
    angle = 0.1
    sinAngle = Math.sin(angle / 2)
    rotationAxis.set(0, 0, 1)
    x = rotationAxis.x * sinAngle
    y = rotationAxis.y * sinAngle
    z = rotationAxis.z * sinAngle
    w = Math.cos(angle / 2.0)
    quaternion1.set(x, y, z, w)

    // Combine rotations to a single quaternion
    quaternion0.multiply(quaternion1)

    let quaternion2 = new THREE.Quaternion()

    // Bend base grass geometry for a more organic look
    for (
      let v = 0;
      v < grassBaseGeometry.attributes.position.array.length;
      v += 3
    ) {
      quaternion2.setFromAxisAngle(new THREE.Vector3(0, 1, 0), Math.PI / 2)
      vertex.x = grassBaseGeometry.attributes.position.array[v]
      vertex.y = grassBaseGeometry.attributes.position.array[v + 1]
      vertex.z = grassBaseGeometry.attributes.position.array[v + 2]
      let frac = vertex.y / bladeHeight
      quaternion2.slerp(quaternion0, frac)
      vertex.applyQuaternion(quaternion2)
      grassBaseGeometry.attributes.position.array[v] = vertex.x
      grassBaseGeometry.attributes.position.array[v + 1] = vertex.y
      grassBaseGeometry.attributes.position.array[v + 2] = vertex.z
    }
    grassBaseGeometry.computeVertexNormals()

    let baseMaterial = new THREE.MeshNormalMaterial({ side: THREE.DoubleSide })
    let baseBlade = new THREE.Mesh(grassBaseGeometry, baseMaterial)
    // this.scene.add(baseBlade)

    let instancedGrassGeometry = new THREE.InstancedBufferGeometry()

    instancedGrassGeometry.index = grassBaseGeometry.index
    instancedGrassGeometry.attributes.position =
      grassBaseGeometry.attributes.position
    instancedGrassGeometry.attributes.uv = grassBaseGeometry.attributes.uv
    instancedGrassGeometry.attributes.normal =
      grassBaseGeometry.attributes.normal

    // each instance has its own data for position, orientation, and scale
    let indices = []
    let offsets = []
    let scales = []
    let halfRootAngles = []

    // for each instance of grass blade
    for (let i = 0; i < instances; i++) {
      indices.push(i / instances)

      // Offset the roots
      let radius = randFloat(30, 40)
      const segment = 1.9 + (i / instances) * Math.PI * 1.8
      x = radius * Math.cos(segment)
      z = radius * Math.sin(segment)
      let heightOffset = mapLinear(radius, 30, 40, 1, 0)
      y = -heightOffset
      // offsets.push(x, y, z)
      offsets.push(x, y, z)

      // Random orientation
      // let angle = Math.PI - Math.random() * (2 * Math.PI)
      let angle = 0
      halfRootAngles.push(Math.sin(0.5 * angle), Math.cos(0.5 * angle))

      // Define variety in height for less uniform randomness
      if (i % 3 != 0) {
        scales.push(2.0 + Math.random() + 1.25)
      } else {
        scales.push(2 + Math.random())
      }
      // scales.push(1)
    }

    let offsetAttribute = new THREE.InstancedBufferAttribute(
      new Float32Array(offsets),
      3,
    )
    let scaleAttribute = new THREE.InstancedBufferAttribute(
      new Float32Array(scales),
      1,
    )
    let halfRootAngleAttribute = new THREE.InstancedBufferAttribute(
      new Float32Array(halfRootAngles),
      2,
    )
    let indexAttribute = new THREE.InstancedBufferAttribute(
      new Float32Array(indices),
      1,
    )
    instancedGrassGeometry.setAttribute('offset', offsetAttribute)
    instancedGrassGeometry.setAttribute('scale', scaleAttribute)
    instancedGrassGeometry.setAttribute('halfRootAngle', halfRootAngleAttribute)
    instancedGrassGeometry.setAttribute('index', indexAttribute)

    // Define the material, specifying attributes, uniforms, shaders.
    this.grassMaterial = new THREE.RawShaderMaterial({
      uniforms: {
        time: this.time.timeUniform,
        posX: { value: 0 },
        posZ: { value: 0 },
        width: { value: this.terrainWidth },
        map: { value: this.items.grassBladeDiffuse },
        alphaMap: { value: this.items.grassBladeAlphaMap },
        moonDirection: {
          value: new THREE.Vector3(
            Math.sin(this.params.azimuth),
            Math.sin(this.params.elevation),
            -Math.cos(this.params.azimuth),
          ),
        },
        cameraPosition: { value: this.camera.position },
        ambientStrength: { value: ambientStrength },
        translucencyStrength: { value: translucencyStrength },
        diffuseStrength: { value: diffuseStrength },
        specularStrength: { value: this.params.specularStrength },
        shininess: { value: this.params.shininess },
        lightColor: { value: this.params.moonColor },
        specularColor: { value: specularColor },
      },
      vertexShader: grassVertexShader,
      fragmentShader: grassfragmentShader,
      side: THREE.DoubleSide,
      depthTest: true,
      depthWrite: true,
    })
    this.grass = new THREE.Mesh(instancedGrassGeometry, this.grassMaterial)

    this.grass.frustumCulled = false
    this.scene.add(this.grass)
  }

  sparkle() {
    gsap.to(this.grassMaterial.uniforms.specularStrength, {
      duration: 3,
      ease: 'power3.in',
      value: 100,
    })
  }

  endSparkle() {
    gsap.to(this.grassMaterial.uniforms.specularStrength, {
      duration: 3,
      ease: 'power3.out',
      value: 1,
    })
  }

  createUI() {
    this.folder = this.ui.addFolder({
      title: 'grass',
    })
    this.folder
      .addInput(this.params, 'elevation', {
        label: 'elevation',
        min: 0,
        max: Math.PI,
        step: 0.01,
      })
      .on('change', () => {
        this.grassMaterial.uniforms.moonDirection.value.set(
          Math.sin(this.params.azimuth),
          Math.sin(this.params.elevation),
          -Math.cos(this.params.azimuth),
        )
      })
    // this.folder.add
    this.folder
      .addInput(this.params, 'moonColor', {
        view: 'color',
        label: 'light color',
      })
      .on('change', colorChangeEvent => {
        let color = colorChangeEvent.value
        this.grassMaterial.uniforms.lightColor.value.setRGB(
          color.r / 255,
          color.g / 255,
          color.b / 255,
        )
      })
    this.folder
      .addInput(this.params, 'azimuth', {
        label: 'azimuth',
        min: 0,
        max: Math.PI * 2,
        step: 0.01,
      })
      .on('change', () => {
        this.grassMaterial.uniforms.moonDirection.value.set(
          Math.sin(this.params.azimuth),
          Math.sin(this.params.elevation),
          -Math.cos(this.params.azimuth),
        )
      })
  }
}
