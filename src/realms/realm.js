import Experience from '@/core/experience'
import assets from '@/resources/assets'
import Forest from '@/entities/forest'
import Moon from '@/entities/moon'
import Sun from '@/entities/sun'
import ParticleField from '@/entities/particle-field'
import Hiker from '@/entities/hiker'
import * as THREE from 'three'
import FluidFun from '@/entities/fluid-fun'
import DirectionParticle from '@/entities/direction-particle'
import Clouds from '@/entities/clouds'
import Phoenix from '@/entities/phoenix'
import World from '@/core/world'
import Stars from '@/entities/stars'
import Stag from '@/entities/stag'
import Waterfall from '@/entities/waterfall'
import Drum from '@/entities/drum'

import Grass from '@/entities/grass'

import { mapLinear } from 'three/src/math/MathUtils'
export default class Realm {
  constructor() {
    this.experience = new Experience()
    this.scene = this.experience.scene
    this.time = this.experience.time
    this.loader = this.experience.loader
    this.loader.load(assets[0].items)
    this.currentTime = 0
    this.experience.realm = this
    this.harmonySong = this.experience.audioMaster.harmonySong

    this.moon = new Moon()
    this.sun = new Sun()

    this.loader.on('end', () => {
      this.world = new World()
      this.clouds = new Clouds()
      this.snowglobe = this.loader.items.snowglobe

      this.grass = new Grass()

      // this.plane = new Plane()

      this.scene.add(this.snowglobe.scene)
      this.snowglobe.scene.traverse(obj => {
        if (obj.material) {
          obj.frustumCulled = false
        }
        if (obj.name?.includes('ground')) {
          this.world.addGroundMesh(obj)
        }
        if (obj.name === 'hiker') {
          this.hiker = new Hiker(this.snowglobe, obj)
        }
        if (obj.name === 'phoenix') {
          this.phoenix = new Phoenix(this.snowglobe, obj)
        }
        if (obj.name === 'stag') {
          this.stag = new Stag(this.snowglobe, obj)
        }
        if (obj.name?.includes('waterfall')) {
          this.waterfall = new Waterfall(obj)
        }
        if (obj.name === 'drum') {
          this.drum = new Drum(obj)
        }

        if (obj.isMesh) {
          // console.log(obj)
          obj.castShadow = true
          obj.receiveShadow = true
        }
        if (obj.name === 'teahouseSpotlight') {
          obj.castShadow = true
          obj.shadow.mapSize.width = 1024
          obj.shadow.mapSize.height = 1024
          obj.shadow.bias = -0.001
          this.experience.spotlight = obj
          obj.add(this.harmonySong)
        }
        if (obj.name === 'chakraLight1') {
          this.chakraLight1 = obj
          this.chakraLight1.startingPosition = obj.position.clone()
          this.chakraLight1.penumbra = 1
        }
        if (obj.name === 'chakraLight2') {
          this.chakraLight2 = obj
          this.chakraLight2.startingPosition = obj.position.clone()
          this.chakraLight2.penumbra = 1
        }
      })

      this.experience.register(this)
      // this.stars = new Stars()
    })
  }

  update() {
    let deltaY = Math.sin(this.time.elapsed * 0.77)
    deltaY = mapLinear(deltaY, 0, 1, -0.01, 0.01)
    this.chakraLight1.position.y = this.chakraLight1.startingPosition.y + deltaY
    this.chakraLight2.position.y = this.chakraLight2.startingPosition.y - deltaY
  }

  reset() {
    this.hiker.reset()
  }
}
