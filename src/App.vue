<script setup>
import { ref, onMounted, onBeforeMount } from 'vue'

import {
  Renderer,
  Scene,
  Camera,
  PointLight,
  Plane,
  StandardMaterial,
  AmbientLight,
} from 'troisjs'
import { ShockWaveEffect, VignetteEffect, BloomEffect, EffectComposer, EffectPass, RenderPass, BrightnessContrastEffect, BlendFunction } from 'postprocessing'
import { AnimationMixer, Clock, TextureLoader, EquirectangularReflectionMapping, sRGBEncoding, ACESFilmicToneMapping, Vector3, FloatType, PMREMGenerator } from 'three'
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader'
import { RGBELoader } from 'three/examples/jsm/loaders/RGBELoader'

import imgUrl from './assets/images/2294472375_24a3b8ef46_o.jpeg'

const settings = {
 antialias: false,
}
const rendererRef = ref()
const sceneRef = ref()
const cameraRef = ref()
const target = new Vector3(0, 0, 0)
//const light = ref()
//const plane = ref()
//const PARAMS = {
//  param1:            0.3,
//  param2:            1,
//  planeSize:         50,
//}

var clock = new Clock()
let mixer, textureEquirec, sphereMesh, sphereMaterial, composer, camera, renderer, scene, shockWaveEffect, hit

onBeforeMount(() => {
  console.clear()
})

onMounted(() => {
  renderer = rendererRef.value.renderer
  scene = sceneRef.value.scene
  camera = cameraRef.value.camera
  
  // postprocessing
  renderer.outputEncoding = sRGBEncoding
  //renderer.toneMapping = ACESFilmicToneMapping
  shockWaveEffect = new ShockWaveEffect(camera, target, {
    speed: 1.25,
    maxRadius: 0.01,
    waveSize: 0.05,
    amplitude: 0.05
  })
  const bloomEffect = new BloomEffect({
    //blendFunction: BlendFunction.SCREEN,
    luminanceThreshold: 0.2,
    intensity: 0.5,
    radius: 0.8,
  })
  const brightnessContrastEffect = new BrightnessContrastEffect({
    //blendFunction: BlendFunction.SCREEN,
    brightness: 0.3,
    contrast: 0.6,
  })
  const vignetteEffect = new VignetteEffect()
  const renderPass = new RenderPass(scene, camera)
  const effectPass = new EffectPass(camera,
    shockWaveEffect,
    bloomEffect,
    brightnessContrastEffect,
    //vignetteEffect
  )

  // apply postprocessing
  composer = new EffectComposer(renderer)
  //composer.addPass(renderPass)
  //composer.addPass(effectPass)

  // piezas
  const loader = new GLTFLoader()
  loader.load( '/glb/piezas/piezas_low_0004.gltf', function ( gltf ) {
    const model = gltf.scene
    const piezaHeavy = model.children[0].children[0]
    const piezaLight = model.children[1].children[0]
    scene.add(model)
    //console.log(rendererRef.value.renderer)
    // self shadowing
    piezaHeavy.castShadow = true
    piezaHeavy.receiveShadow = true
    piezaLight.castShadow = true
    piezaLight.receiveShadow = true
    // environment
    const hdrimgUrl = '/images/sample.hdr'

    const loadedTexture = new TextureLoader().load(imgUrl)
    //const loadedTexture = new RGBELoader().load(hdrimgUrl)
    //loadedTexture.setDataType(FloatType)
    const gen = new PMREMGenerator(renderer)
    const texture = loadedTexture
    //const texture = gen.fromEquirectangular(loadedTexture).texture
    texture.mapping = EquirectangularReflectionMapping
    texture.encoding = sRGBEncoding
    //console.log(texture)

    scene.background = texture
    piezaHeavy.material.envMap = texture
    piezaLight.material.envMap = texture

    // animation
    hit = true
    mixer = new AnimationMixer(model)
    mixer.clipAction(gltf.animations[0]).play()
    mixer.addEventListener( 'loop', () => {
      shockWaveEffect.explode()
      hit = true
    })
    //console.log(mixer)
    animate()
  },
  undefined, function (e) {
    console.error(e)
  })

  window.addEventListener("resize", onResize);
  onResize()
})

function animate() {
  requestAnimationFrame(animate)
  mixer.update(clock.getDelta())
  if (mixer._actions[0].time > 1.5 && hit) {
    shockWaveEffect.explode()
    hit = false
  }
  //FX render pass
  //composer.render()
}

// Resizing
function onResize(event) {
  const width = window.innerWidth
  const height = window.innerHeight
  composer.setSize(width, height)
}
</script>

<template>
<div class=" h-screen">
  <Renderer
    ref="rendererRef"
    :antialias="settings.antialias"
    :orbit-ctrl="{ enableDamping: true }"
    resize
    shadow
  >
    <Camera ref="cameraRef" :position="{ x: 1, y: 2, z: 10 }" />
    <Scene ref="sceneRef">
      <!--<AmbientLight ref="light" />-->
      <PointLight ref="light" color="#ffffff" :intensity="5" :distance="30" :position="{ x:1, y:15, z:15 }" cast-shadow :shadow-map-size="{ width: 1024, height: 1024 }" />
      <!--<Plane ref="plane" :width="PARAMS.planeSize" :height="PARAMS.planeSize" :rotation="{ x: -Math.PI / 2 }" :position="{y: -4}" receive-shadow>
        <StandardMaterial color="#2299EE" />
      </Plane>-->
    </Scene>
  </Renderer>
</div>
</template>