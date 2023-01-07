import Experience from '../experience.js'
import { Euler } from './euler.js'

class Physics {
  constructor(integrator = new Euler()) {
    this.experience = new Experience()
    this.time = this.experience.time
    this.integrator = integrator
    this.timestep = 1 / 480
    this.viscosity = 0.0025
    this.behaviours = []
    this.buffer = 0
    this.maxSteps = 32
    this.particles = []
    this.springs = []
  }

  integrate(dt) {
    const drag = 1 - this.viscosity
    for (let [index, particle] of this.particles.entries()) {
      for (const behaviour of this.behaviours) {
        behaviour.apply(particle, dt, index)
      }
      particle.update(dt, index)
    }

    this.integrator.integrate(this.particles, dt, drag)

    for (const spring of this.springs) {
      spring.apply()
    }
  }

  step(dt) {
    if (dt < 0) {
      return
    }
    this.buffer += dt

    let i = 0
    while (this.buffer >= this.timestep && ++i < this.maxSteps) {
      this.integrate(this.timestep)
      this.buffer -= this.timestep
    }
    // console.log(i)
  }

  destroy() {
    this.integrator = null
    this.particles.length = 0
    this.particles = null
    this.springs.length = 0
    this.springs = null
  }
}

export { Physics }
