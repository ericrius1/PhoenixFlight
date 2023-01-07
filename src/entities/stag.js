import Experience from "@/core/experience";
import * as THREE from 'three'
export default class Stag{

    constructor(gltf, model){

        this.experience = new Experience()
        this.gltf = gltf; 
        this.model = model

        this.time = this.experience.time
        this.animationMixer = new THREE.AnimationMixer(this.model)

        this.animationClips = this.gltf.animations

        this.walkClip = THREE.AnimationClip.findByName(this.animationClips, 'Eating')
        this.walkAction = this.animationMixer.clipAction(this.walkClip)
        this.walkAction.setEffectiveTimeScale(1.4)

        this.walkAction.play()

        this.experience.register(this)

    }

    create(){

    }

    update(){
        this.animationMixer.update(this.time.delta)
    }
}