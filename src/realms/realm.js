import Experience from '@/core/experience'
import assets from '@/resources/assets'
import Moon from '@/entities/moon'
import Sun from '@/entities/sun'
import Hiker from '@/entities/hiker'
import Clouds from '@/entities/clouds'
import Phoenix from '@/entities/phoenix'
import World from '@/core/world'
import Stag from '@/entities/stag'
import Waterfall from '@/entities/waterfall'

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
      this.alpineLevel = this.loader.items.alpineLevel

      this.grass = new Grass()

      // this.plane = new Plane()

      this.scene.add(this.alpineLevel.scene)
      this.alpineLevel.scene.traverse(obj => {
        if (obj.material) {
          obj.frustumCulled = false
        }
        if (obj.name?.includes('ground')) {
          this.world.addGroundMesh(obj)
        }
        if (obj.name === 'hiker') {
          this.hiker = new Hiker(this.alpineLevel, obj)
        }
        if (obj.name === 'phoenix') {
          this.phoenix = new Phoenix(this.alpineLevel, obj)
        }
        if (obj.name === 'stag') {
          this.stag = new Stag(this.alpineLevel, obj)
        }
        if (obj.name?.includes('waterfall')) {
          this.waterfall = new Waterfall(obj)
        }

        if (obj.isMesh) {
          obj.castShadow = true
          obj.receiveShadow = true
        }
        if (obj.name === 'teahouseSpotlight') {
          obj.castShadow = true
          obj.shadow.mapSize.width = 1024
          obj.shadow.mapSize.height = 1024
          obj.shadow.bias = -0.001
          this.experience.spotlight = obj
        }
      })

      this.experience.register(this)
    })
  }

  update() {
    let deltaY = Math.sin(this.time.elapsed * 0.77)
    deltaY = mapLinear(deltaY, 0, 1, -0.01, 0.01)
  }

  reset() {
    this.hiker.reset()
  }
}
