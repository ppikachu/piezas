<script setup>
import { ref, onMounted, onBeforeMount } from 'vue'
import {
  Renderer,
  Scene,
  Camera,
  GltfModel,
  AmbientLight,
} from 'troisjs'
import { ShockWaveEffect, VignetteEffect, BloomEffect, EffectComposer, EffectPass, RenderPass,  BlendFunction } from 'postprocessing'
import { AnimationMixer, Clock, EquirectangularReflectionMapping, ACESFilmicToneMapping, Vector3, LightProbe } from 'three'
import { RGBELoader } from 'three/examples/jsm/loaders/RGBELoader'
import { Resizer } from './components/Resizer'
import Title from './components/Title.vue'

const rendererRef = ref()
const sceneRef = ref()
const cameraRef = ref()
const gltfRef = ref()
const target = new Vector3(0, 0, 0)
const hdrimgUrl = '/images/Studio_80s.hdr'

var clock = new Clock()
let audio0, audio1, audio2, audio3, mixer, gltfMesh, composer, camera, orbitCtrl, renderer, scene, shockWaveEffect

onBeforeMount(() => {
  console.clear()
})

onMounted(() => {
  renderer = rendererRef.value.renderer
  scene = sceneRef.value.scene
  camera = cameraRef.value.camera
  orbitCtrl = rendererRef.value.three.cameraCtrl
  gltfMesh = gltfRef.value.scene
  // audio setup
  audio0 = new Audio("/glb/piezas/piezas_0.mp3")
  audio1 = new Audio("/glb/piezas/piezas_1.mp3")
  audio2 = new Audio("/glb/piezas/piezas_2.mp3")
  audio3 = new Audio("/glb/piezas/piezas_3.mp3")

  //renderer.outputEncoding = sRGBEncoding
  renderer.toneMapping = ACESFilmicToneMapping
  // turn on the physically correct lighting model
  renderer.physicallyCorrectLights = true

  //#region postprocessing
  composer = new EffectComposer(renderer, {
    multisampling: 2
  })
  shockWaveEffect = new ShockWaveEffect(camera, target, {
    speed: 0.25,
    maxRadius: 0.015,
    waveSize: 0.03,
    amplitude: 0.005
  })
  const bloomEffect = new BloomEffect({
    //blendFunction: BlendFunction.SCREEN,
    luminanceThreshold: 0.5,
    intensity: 2,
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

  // resiser (resize the canvas and composer)
  const resizer = new Resizer(camera, composer)
})

function onReady(gltf) {
  const model = gltf.scene
  const piezaHeavy = model.children[0].children[0]
  const piezaLight = model.children[1].children[0]
  // resize
  const globalScale = 0.3
  gltfMesh.scale.set(globalScale,globalScale,globalScale)
  // self shadowing
  piezaHeavy.castShadow = true
  piezaHeavy.receiveShadow = true
  piezaLight.castShadow = true
  piezaLight.receiveShadow = true
  // animation
  mixer = new AnimationMixer(model)
  mixer.clipAction(gltf.animations[0]).play()
  mixer.addEventListener( 'loop', () => { hitIt() } )
  animate()
  // environment
  const loadedTexture = new RGBELoader().load(hdrimgUrl, () => {
    const envMap = loadedTexture
    envMap.mapping = EquirectangularReflectionMapping
    //envMap.needsUpdate = true
    //console.log('loaded:',envMap)
    piezaHeavy.material.envMap = envMap
    piezaLight.material.envMap = envMap
  })
}

function getRandomInt(max) {
  return Math.floor(Math.random() * max);
}

function smoothstep (min, max, value) {
  var x = Math.max(0, Math.min(1, (value-min)/(max-min)))
  return x*x*(3 - 2*x)
}

function hitIt() {
  shockWaveEffect.explode()
  switch (getRandomInt(5)) {
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
    default:
      break;
  }
}

function animate() {
  requestAnimationFrame(animate)
  mixer.update(clock.getDelta())
  // hits the pieza?
  if (mixer._actions[0].time > 1.5 && mixer._actions[0].time < 1.52) { //#HACK: puede saltar un frame o duplicarse el sonido
    hitIt()
  }
  // rotate camera
  camera.rotation.z = Math.PI*smoothstep(-0.8, 0.8, Math.sin(clock.getElapsedTime()/10))
  //FX render pass
  composer.render()
}
</script>

<template>
  <div class="h-screen flex items-center bg-gradient-to-b from-slate-200 to-indigo-400">
    <Title>
        <template #header>Acción / Reacción</template>
        <template #body>un momento de reflexión</template>
    </Title>
    <Renderer
      ref="rendererRef"
      :alpha="true"
      shadow
    >
      <Camera ref="cameraRef" :position="{ x: 0, y: 0, z: 3.5 }" />
      <Scene ref="sceneRef">
        <GltfModel
          ref="gltfRef"
          src="/glb/piezas/piezas_low_0006.gltf"
          @load="onReady"
        />
        <AmbientLight ref="light" />
      </Scene>
    </Renderer>
  </div>
</template>

<style>
body {
  overflow: hidden;
}
</style>