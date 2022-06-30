<script setup>
import { ref, onMounted, onBeforeMount } from 'vue'
import {
  Renderer,
  Scene,
  Camera,
  GltfModel,
  AmbientLight,
  RectAreaLight,
} from 'troisjs'
import { ShockWaveEffect, VignetteEffect, BloomEffect, EffectComposer, EffectPass, RenderPass,  BlendFunction } from 'postprocessing'
import { AnimationMixer, Clock, ACESFilmicToneMapping, Vector3 } from 'three'
import { Resizer } from './components/Resizer'
import Title from './components/Title.vue'

const rendererRef = ref()
const sceneRef = ref()
const cameraRef = ref()
const gltfRef = ref()
const areaLight = ref()
const areaLight2 = ref()
const target = new Vector3(0, 0, 0)

var clock = new Clock()
var audio0, audio1, audio2, audio3, once, loop, mixer, light, light2, gltfScene, composer, camera, orbitCtrl, renderer, scene, shockWaveEffect

onBeforeMount(() => {
  console.clear()
})

onMounted(() => {
  renderer = rendererRef.value.renderer
  scene = sceneRef.value.scene
  camera = cameraRef.value.camera
  orbitCtrl = rendererRef.value.three.cameraCtrl
  light = areaLight.value.light
  light2 = areaLight2.value.light
  // audio setup
  once = true
  audio0 = new Audio("/glb/piezas/piezas_0.mp3")
  audio1 = new Audio("/glb/piezas/piezas_1.mp3")
  audio2 = new Audio("/glb/piezas/piezas_2.mp3")
  audio3 = new Audio("/glb/piezas/piezas_3.mp3")
  audio0.loop = audio1.loop = audio2.loop = audio3.loop = false
  //renderer.outputEncoding = sRGBEncoding
  renderer.toneMapping = ACESFilmicToneMapping
  // turn on the physically correct lighting model
  renderer.physicallyCorrectLights = true

  //#region postprocessing
  composer = new EffectComposer(renderer, {
    multisampling: 2
  })
  shockWaveEffect = new ShockWaveEffect(camera, target, {
    speed: 2,
    maxRadius: 0.15,
    waveSize: 0.05,
    amplitude: 0.02
  })
  const bloomEffect = new BloomEffect({
    //blendFunction: BlendFunction.SCREEN,
    luminanceThreshold: 0.5,
    intensity: 1,
    //radius: 0.8,
  })
  const vignetteEffect = new VignetteEffect()
  const renderPass = new RenderPass(scene, camera)
  const effectPass = new EffectPass(camera,
    shockWaveEffect,
    //bloomEffect,
    //vignetteEffect
  )
  // apply postprocessing
  composer.addPass(renderPass)
  composer.addPass(effectPass)
  //#endregion
  light.lookAt( 0, 0, 0 )
  light2.lookAt( 0, 0, 0 )
  // resiser (resize the canvas and composer)
  const resizer = new Resizer(camera, composer)
})

function onReady(gltf) {
  gltfScene = gltf.scene
  // self shadowing
  /*const piezaHeavy = gltfScene.children[0].children[0]
  const piezaLight = gltfScene.children[1].children[0]
  piezaHeavy.receiveShadow = true
  piezaLight.receiveShadow = true
  piezaHeavy.castShadow = true
  piezaLight.castShadow = true*/
  // environment
  /*const loadedTexture = new RGBELoader().load(hdrimgUrl, () => {
    const envMap = loadedTexture
    envMap.mapping = EquirectangularReflectionMapping
    piezaHeavy.material.envMap = envMap
    piezaLight.material.envMap = envMap
  })*/
  // animation
  mixer = new AnimationMixer(gltfScene)
  mixer.clipAction(gltf.animations[0]).play()
  mixer.addEventListener( 'loop', () => {
    console.log('loop')
    once = true
    loop = true
    hitIt()
  })
  animate()
}

function getRandomInt(max) {
  return Math.floor(Math.random() * max);
}

function smoothstep (min, max, value) {
  var x = Math.max(0, Math.min(1, (value-min)/(max-min)))
  return x*x*(3 - 2*x)
}

function hitIt() {
  if (loop) {
  once = false
  shockWaveEffect.explode()
  switch (getRandomInt(4)) {
    case 0:
      audio0.play()
      break;
    case 1:
      audio1.play()
      break;
    case 2:
      audio2.play()
      break;
    case 3:
      audio3.play()
      break;
  }
  }
}

function animate() {
  requestAnimationFrame(animate)
  mixer.update(clock.getDelta())
  // hits the pieza?
  if (mixer._actions[0].time > 1.5 && once) { //#HACK: puede saltar un frame o duplicarse el sonido
    once = true
    loop = true
    hitIt()
  }
  // rotate scene
  gltfScene.rotation.z = Math.PI*smoothstep(-0.8, 0.8, Math.sin(clock.getElapsedTime()/10))
  //FX render pass
  composer.render()
}
</script>

<template>
  <div class="h-screen flex items-center bg-gradient-to-b from-cyan-900 to-pink-900">
    <Title>
      <template #body>(click para habilitar el audio)</template>
    </Title>
    <Renderer
      ref="rendererRef"
      :alpha="true"
      shadow
    >
      <Camera ref="cameraRef" :position="{ x: 0, y: 0, z: 11 }" />
      <Scene ref="sceneRef">
        <!--<AmbientLight ref="light" />-->
        <RectAreaLight ref="areaLight" width="6" height="2" :color="0x55ffff" :intensity="10" :position="{ x: 2, y: 2, z: 2 }" />
        <RectAreaLight ref="areaLight2" width="6" height="2" :color="0xff55ff" :intensity="10" :position="{ x: -2, y: -2, z: 2 }" />
        <GltfModel
          ref="gltfRef"
          src="/glb/piezas/piezas_low_0006.gltf"
          @load="onReady"
        />
      </Scene>
    </Renderer>
  </div>
</template>

<style>
body {
  overflow: hidden;
}
</style>