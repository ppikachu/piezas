<script setup>
import Modal from './components/Modal.vue'
import { ref, onMounted } from 'vue'
import {
  Renderer,
  Scene,
  Camera,
  PointLight,
  Mesh,
  PlaneGeometry,
  BasicMaterial,
  StandardMaterial,
  Texture,
  EffectComposer,
  RenderPass,
  EffectPass,
  UnrealBloomPass,
  HalftonePass,
  Sphere,
  Text,
  AmbientLight,
} from 'troisjs'

import imgUrl from './assets/images/f_polaroid.png'
import fontUrl from './assets/fonts/helvetiker_regular.typeface.json'
import Rain from './fx/rainfx'
import gsap from 'gsap'
// import chroma from 'chroma-js'

const renderer = ref()
const light = ref()
const theShader = ref()
const showModal = ref(false)

onMounted(() => {
  // animate
  renderer.value.onBeforeRender(animate)
  console.log(fontUrl)
  gsap.to(light.value.light.position, {
    x: 0.8,
    y: 0.9,
    z: 1,
    duration: 5,
    repeat: -1,
    yoyo: true,
  })
})

function animate() {
  if (!theShader.value) return
  theShader.value.pass.uniforms.u_time.value += 0.01
}
</script>

<template>
  <div ref="sushi_container" class="container mx-auto flex flex-col space-y-8 justify-center items-center h-screen">
    <div class="absolutexx">
      <Renderer
        ref="renderer"
        width="512"
        height="512"
        shadow
        antialias
      >
        <!--:orbit-ctrl="{ enableDamping: true, dampingFactor: 0.05 }"-->
        <Camera :position="{ z: 1 }" />
        <Scene>
          <AmbientLight intensity="0.5" />
          <!--<PointLight :color="0x00ee99" :position="{ x:-0.1, y: -1, z: 2 }" intensity="1" />-->
          <PointLight
            ref="light"
            intensity="0.5"
            cast-shadow
            :position="{ x:-.8, y: 0.9, z: 1 }"
            :shadow-map-size="{ width: 1024, height: 1024 }"
          />
          <!--BG card-->
          <Mesh receive-shadow>
            <PlaneGeometry />
            <StandardMaterial ref="theTexture" color="white">
              <Texture :src=imgUrl />
            </StandardMaterial>
          </Mesh>
          <!--texto-->
          <Text
            text="sushi time!"
            :font-src=fontUrl
            align="center"
            size="0.1"
            height="0.01"
            :position="{ x: 0, y: -0.25, z: 0.02 }"
            cast-shadow
          >
            <StandardMaterial />
          </Text>
        </Scene>
        <!--FX-->
        <EffectComposer>
          <RenderPass />
          <Rain ref="theShader" />
        </EffectComposer>
      </Renderer>
    </div>

    <button id="show-modal" class="btn btn-primary z-50" @click="showModal = true">Show Modal</button>
    <Teleport to="body">
      <!-- use the modal component, pass in the prop -->
      <modal :show="showModal" @close="showModal = false">
        <template #header>
          <h3>custom header</h3>
        </template>
      </modal>
    </Teleport>
  </div>
</template>