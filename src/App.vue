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

  Text,
  AmbientLight,
} from 'troisjs'

import { Text as TroikaText } from 'troika-three-text'
import imgUrl from './assets/images/f_polaroid.png'
import Rain from './fx/rainfx'
//import TroikaText from './components/TroikaText'
import gsap from 'gsap'
// import chroma from 'chroma-js'

const fontUrl = '/fonts/helvetiker_regular.typeface.json'
const renderer = ref()
const scene = ref()
const light = ref()
const theShader = ref()
const showModal = ref(false)
const  PARAMS = {
  credit:            'Fight Club',
  message:           'Llueve',
  messageY:          'justify-end',
  fontSize:          0.15,
  fontWeight:        'bold',
  font:              'Bangers',
  fontColor:         0xffffff,
  antialias:         false,
  messageOver:       false,
  enableRain:        true,
  param1:            0.3,
  param2:            1,
}

onMounted(() => {
  // animate
  renderer.value.onBeforeRender(animate)
  console.log(fontUrl)
  makeTroikaText()
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

function makeTroikaText() {
  const myText = new TroikaText()
  scene.value.add(myText)
  // Set properties to configure:
  myText.text = PARAMS.message
  myText.fontSize = PARAMS.fontSize
  myText.color = PARAMS.fontColor
  myText.anchorX = 'center'
  myText.anchorY = 'middle'
  myText.maxWidth = 1.5
  myText.textAlign = 'center'
  // myText.overflowWrap = 'break-word'
  myText.lineHeight = .8

  // fix for cross site error
  var url = 'http://themes.googleusercontent.com/static/fonts/anonymouspro/v3/Zhfjj_gat3waL4JSju74E-V_5zh5b-_HiooIRUBwn1A.ttf'
  myText.font = url
  // Update the rendering:
  myText.sync()
}

function updateTroikaText() {
  // Set properties to configure:
  myText.fontSize = PARAMS.fontSize*.005//TODO: fix this
  myText.color = PARAMS.fontColor
  myText.anchorX = 'center'
  myText.anchorY = 'middle'
  myText.maxWidth = 1.5
  myText.textAlign = 'center'
  myText.overflowWrap = 'break-word'
  myText.lineHeight = .8
  textPosition()
  // Update the rendering:
  myText.sync()
}

function textPosition() {
  var position = 0
  var margin = 0.7, top = margin, bottom = -margin

  if (frameAspect > 1) {
    top = margin - (1/(h/(w / 2 - h / 2)))
    bottom = -top
  }
  switch (PARAMS.messageY) {
    case 'justify-start':
      position = top
      break
    case 'justify-center':
      position = 0
      break
    case 'justify-end':
      position = bottom
      break
  }
  myText.position.set(0, position, 0)
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
        <Scene ref="scene">
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
            :text=PARAMS.message
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

    <button id="show-modal" class="btn z-50" @click="showModal = true">Show Modal</button>
    <Teleport to="body">
      <!-- use the modal component, pass in the prop -->
      <modal :show="showModal" @close="showModal = false">
        <template #header>
          <h3>custom header</h3>
        </template>
        <template #body>
          custom body
        </template>
      </modal>
    </Teleport>
  </div>
</template>