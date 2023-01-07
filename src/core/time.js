import { Uniform } from 'three'

export default class Time {
  // unit in ms
  constructor() {
    // Setup
    this.start = performance.now()
    this.current = this.start
    this.elapsed = 0
    this.delta = 0
    this.timeUniform = new Uniform(0)
    this.masterTimeScale = 1
  }

  update() {
    const currentTime = performance.now()
    this.delta = (currentTime - this.current) * 0.001 * this.masterTimeScale
    this.current = currentTime
    this.elapsed += this.delta
    this.timeUniform.value = this.elapsed
  }
}
