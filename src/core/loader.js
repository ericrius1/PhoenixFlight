import EventEmitter from '@/core/event-emitter.js'
import Experience from '@/core/experience.js'
import { TextureLoader } from 'three'
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js'
import { FBXLoader } from 'three/examples/jsm/loaders/FBXLoader.js'
import { DRACOLoader } from 'three/examples/jsm/loaders/DRACOLoader.js'
import { RGBELoader } from 'three/examples/jsm/loaders/RGBELoader.js'
import { KTX2Loader } from 'three/examples/jsm/loaders/KTX2Loader.js'
import { EXRLoader } from 'three/examples/jsm/loaders/EXRLoader.js'
import { sRGBEncoding } from 'three'

import { PMREMGenerator } from 'three'

export default class Loader extends EventEmitter {
  /**
   * Constructor
   */
  constructor() {
    super()

    this.experience = new Experience()
    this.renderer = this.experience.renderer.instance
    this.pmremGenerator = new PMREMGenerator(this.renderer)
    this.pmremGenerator.compileEquirectangularShader()

    this.setLoaders()

    this.toLoad = 0
    this.loaded = 0
    this.items = {}
  }

  /**
   * Set loaders
   */
  setLoaders() {
    this.loaders = []

    // Images
    const textureLoader = new TextureLoader()
    this.loaders.push({
      extensions: ['jpg', 'png'],
      action: _resource => {
        textureLoader.load(_resource.source, _map => {
          this.fileLoadEnd(_resource, _map)
        })
      },
    })

    // Basis images
    const basisLoader = new KTX2Loader()
    basisLoader.setTranscoderPath('three/examples/js/libs/basis')
    basisLoader.detectSupport(this.renderer)

    this.loaders.push({
      extensions: ['basis'],
      action: _resource => {
        basisLoader.load(_resource.source, _data => {
          this.fileLoadEnd(_resource, _data)
        })
      },
    })

    // Draco
    const dracoLoader = new DRACOLoader()
    dracoLoader.setDecoderPath('/draco/')
    dracoLoader.setDecoderConfig({ type: 'js' })

    this.loaders.push({
      extensions: ['drc'],
      action: _resource => {
        dracoLoader.load(_resource.source, _data => {
          this.fileLoadEnd(_resource, _data)

          DRACOLoader.releaseDecoderModule()
        })
      },
    })

    // GLTF
    const gltfLoader = new GLTFLoader()
    gltfLoader.setDRACOLoader(dracoLoader)

    this.loaders.push({
      extensions: ['glb', 'gltf'],
      action: _resource => {
        gltfLoader.load(_resource.source, _data => {
          this.fileLoadEnd(_resource, _data)
        })
      },
    })

    // FBX
    const fbxLoader = new FBXLoader()

    this.loaders.push({
      extensions: ['fbx'],
      action: _resource => {
        fbxLoader.load(_resource.source, _data => {
          this.fileLoadEnd(_resource, _data)
        })
      },
    })

    // RGBE | HDR
    const rgbeLoader = new RGBELoader()

    this.loaders.push({
      extensions: ['hdr'],
      action: _resource => {
        rgbeLoader.load(_resource.source, _data => {
          const envMap = this.pmremGenerator.fromEquirectangular(_data).texture
          envMap.encoding = sRGBEncoding
          this.fileLoadEnd(_resource, envMap)
        })
      },
    })

    // EXR | HDR
    const exrLoader = new EXRLoader()
    this.loaders.push({
      extensions: ['exr'],
      action: _resource => {
        exrLoader.load(_resource.source, _data => {
          const exrCubeRenderTarget =
            this.pmremGenerator.fromEquirectangular(_data)
          const envMap = exrCubeRenderTarget.texture
          envMap.encoding = sRGBEncoding

          this.fileLoadEnd(_resource, envMap)
        })
      },
    })
  }

  /**
   * Load
   */
  load(_resources = []) {
    for (const _resource of _resources) {
      this.toLoad++
      const extensionMatch = _resource.source.match(/\.([a-z]+)$/)

      if (typeof extensionMatch[1] !== 'undefined') {
        const extension = extensionMatch[1]
        const loader = this.loaders.find(_loader =>
          _loader.extensions.find(_extension => _extension === extension),
        )

        if (loader) {
          loader.action(_resource)
        } else {
          console.warn(`Cannot find loader for ${_resource}`)
        }
      } else {
        console.warn(`Cannot find extension of ${_resource}`)
      }
    }
  }

  /**
   * File load end
   */
  fileLoadEnd(_resource, _data) {
    this.loaded++
    this.items[_resource.name] = _data

    this.trigger('fileEnd', [_resource, _data])
    if (this.loaded === this.toLoad) {
      this.trigger('end')
    }
  }
}
