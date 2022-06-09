import { defineComponent, watch } from 'vue'
import { Rain } from '/assets/fragments/rain.frag'
import { EffectPass } from 'troisjs'
import { ShaderPass } from 'three/examples/jsm/postprocessing/ShaderPass.js'

const props = {
  texture: { type: String, default: '/assets/images/Audrey-Hepburn.jpg' },
  strength: { type: Number, default: 1.5 },
}

export default defineComponent({
  extends: EffectPass,
  props,
  created() {
    if (!this.renderer) return

    const pass = new ShaderPass(Rain)

    Object.keys(props).forEach(p => {
      watch(() => this[p], (value) => { pass.uniforms[p].value = value })
    })

    this.initEffectPass(pass)
  },
})