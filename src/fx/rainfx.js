import { defineComponent, watch } from 'vue'
import { Rain } from '../../static/fragments/rain.frag'
import { EffectPass } from 'troisjs'
import { ShaderPass } from 'three/examples/jsm/postprocessing/ShaderPass.js'

const props = {
  texture: { type: String, default: '/static/images/Audrey-Hepburn.jpg' },
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