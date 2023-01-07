import Experience from '@/core/experience'
import * as THREE from 'three'

import vertexShader from '@/core/shaders/particle/vertex.glsl'
import fragmentShader from '@/core/shaders/particle/fragment.glsl'

import gsap from 'gsap'

const randFloat = THREE.MathUtils.randFloat
const mapLinear = THREE.MathUtils.mapLinear
export default class ParticleField {
  constructor(position) {
    this.experience = new Experience()
    this.scene = this.experience.scene
    this.position = position.clone()
    this.camera = this.experience.camera
    this.ui = this.experience.ui
    this.caster = this.experience.caster
    this.time = this.experience.time
    this.items = this.experience.loader.items
    this.create()
  }

  create() {
    this.geometry = new THREE.BufferGeometry()
    const side = 256
    const count = side * side
    const scale = 0.03
    this.positions = new THREE.BufferAttribute(new Float32Array(count * 3), 3)
    this.coordinates = new THREE.BufferAttribute(new Float32Array(count * 3), 3)
    this.speeds = new THREE.BufferAttribute(new Float32Array(count), 1)
    this.offsets = new THREE.BufferAttribute(new Float32Array(count), 1)
    this.direction = new THREE.BufferAttribute(new Float32Array(count), 1)
    this.press = new THREE.BufferAttribute(new Float32Array(count), 1)

    let index = 0
    for (let i = 0; i < side; i++) {
      for (let j = 0; j < side; j++) {
        this.positions.setXYZW(
          index,
          (i - side / 2) * scale,
          (j - side / 2) * scale,
          0,
        )
        this.coordinates.setXYZ(index, i, j, 0)
        this.offsets.setX(index, randFloat(-0.01, 0.01))
        this.speeds.setX(index, randFloat(-0.5, 0.5))
        this.direction.setX(index, Math.random() > 0.5 ? 1 : -1)
        this.press.setX(index, randFloat(0.7, 2.2))
        index++
      }
    }
    this.geometry.setAttribute('position', this.positions)
    this.geometry.setAttribute('aCoordinates', this.coordinates)
    this.geometry.setAttribute('aSpeed', this.speeds)
    this.geometry.setAttribute('aOffset', this.offsets)
    this.geometry.setAttribute('aPress', this.press)
    this.geometry.setAttribute('aDirection', this.direction)
    this.texture1 = this.items.pyramidGirl
    this.texture1.magFilter = THREE.NearestFilter
    this.texture1.minFilter = THREE.NearestFilter

    this.material = new THREE.ShaderMaterial({
      vertexShader: vertexShader,
      fragmentShader: fragmentShader,
      uniforms: {
        texture1: { value: this.texture1 },
        maskTexture: { value: this.items.particleMask },
        time: this.time.timeUniform,
        point: { value: new THREE.Vector2(0, 0) },
        mousePressed: { value: 0.3 },
      },
      side: THREE.DoubleSide,
      transparent: true,
      depthTest: true,
      depthWrite: false,
    })

    const mat = new THREE.MeshBasicMaterial({
      map: this.texture1,
    })
    // const testMesh = new THREE.Mesh(new THREE.PlaneGeometry(3, 3), mat)
    // testMesh.rotation.x -= Math.PI / 2
    // this.scene.add(testMesh)
    this.mesh = new THREE.Points(this.geometry, this.material)
    this.mesh.position.copy(this.position)
    this.scene.add(this.mesh)

    this.intersectionMesh = new THREE.Mesh(
      new THREE.PlaneGeometry(10, 10),
      new THREE.MeshBasicMaterial({
        side: THREE.DoubleSide,
      }),
    )
    this.intersectionMesh.position.copy(this.position)
    this.intersectionMesh.visible = false
    this.scene.add(this.intersectionMesh)
    this.caster.register(this.intersectionMesh)
    this.intersectionMesh.select = () => {
      const point = this.caster.intersects[0].point
      const localPoint = this.intersectionMesh.worldToLocal(point)
      this.material.uniforms.point.value.set(localPoint.x, localPoint.y)

      gsap.to(this.material.uniforms.mousePressed, {
        duration: 1,
        value: 1,
        ease: 'elastic.out(1, 0.3)',
      })
    }
    this.intersectionMesh.release = () => {
      gsap.to(this.material.uniforms.mousePressed, {
        duration: 1,
        value: 0.5,
        ease: 'elastic.out(1, 0.3)',
      })
    }
    this.intersectionMesh.move = () => {
      const point = this.caster.intersects[0].point
      const localPoint = this.intersectionMesh.worldToLocal(point)
      this.material.uniforms.point.value.set(localPoint.x, localPoint.y)
    }

    if (this.ui) {
      this.folder = this.ui.addFolder({
        title: 'particle field',
      })
    }
  }
}
