<script setup>
import { ref, onMounted, onBeforeMount } from 'vue'
import {
  Renderer,
  Scene,
  Camera,
  GltfModel,
  Plane,
  AmbientLight,
} from 'troisjs'
import { ShockWaveEffect, VignetteEffect, BloomEffect, EffectComposer, EffectPass, RenderPass, BrightnessContrastEffect, BlendFunction } from 'postprocessing'
import { AnimationMixer, Clock, TextureLoader, EquirectangularReflectionMapping, sRGBEncoding, ACESFilmicToneMapping, Vector3 } from 'three'
import { RGBELoader } from 'three/examples/jsm/loaders/RGBELoader'
import { Resizer } from './components/Resizer'
import Title from './components/Title.vue'

const rendererRef = ref()
const sceneRef = ref()
const cameraRef = ref()
const gltfRef = ref()
const target = new Vector3(0, 0, 0)
const hdrimgUrl = '/images/Env_PinkGrad_512.hdr'

var clock = new Clock()
let audio, mixer, gltfMesh, composer, camera, orbitCtrl, renderer, scene, shockWaveEffect, hit

onBeforeMount(() => {
  console.clear()
})

onMounted(() => {
  renderer = rendererRef.value.renderer
  scene = sceneRef.value.scene
  camera = cameraRef.value.camera
  orbitCtrl = rendererRef.value.three.cameraCtrl
  gltfMesh = gltfRef.value.scene
  audio = new Audio("/glb/piezas/piezas_0.mp3");
  //renderer.outputEncoding = sRGBEncoding
  renderer.toneMapping = ACESFilmicToneMapping
  // turn on the physically correct lighting model
  //renderer.physicallyCorrectLights = true

  //#region postprocessing
  composer = new EffectComposer(renderer)
  shockWaveEffect = new ShockWaveEffect(camera, target, {
    speed: 0.25,
    maxRadius: 0.5,
    waveSize: 0.03,
    amplitude: 0.003
  })
  const bloomEffect = new BloomEffect({
    //blendFunction: BlendFunction.SCREEN,
    luminanceThreshold: 0.1,
    intensity: 0.5,
    //radius: 0.8,
  })
  const brightnessContrastEffect = new BrightnessContrastEffect({
    //blendFunction: BlendFunction.SCREEN,
    brightness: 0.2,
    contrast: 0.3,
  })
  const vignetteEffect = new VignetteEffect()
  const renderPass = new RenderPass(scene, camera)
  const effectPass = new EffectPass(camera,
    shockWaveEffect,
    //bloomEffect,
    //brightnessContrastEffect,
    //vignetteEffect
  )
  // apply postprocessing
  composer.addPass(renderPass)
  composer.addPass(effectPass)
  //#endregion

  // resiser (resize the canvas and composer)
  const resizer = new Resizer(camera, composer)
  orbitCtrl.enabled = false
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
  hit = true
  mixer = new AnimationMixer(model)
  mixer.clipAction(gltf.animations[0]).play()
  mixer.addEventListener( 'loop', () => {
    hitIt()
    hit = true
  })
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

function hitIt() {
  shockWaveEffect.explode()
  audio.play()
}

function animate() {
  requestAnimationFrame(animate)
  mixer.update(clock.getDelta())
  // hits the pieza
  if (mixer._actions[0].time > 1.5 && hit) {
    hitIt()
    hit = false
  }
  //FX render pass
  composer.render()
}
</script>

<template>
  <div class="h-screen flex items-center bg-gradient-to-b from-gray-300 via-slate-400 to-gray-500">
    <Title>
        <template #header>Acción / Reacción</template>
        <template #body>un momento de reflexión</template>
    </Title>
    <Renderer
      ref="rendererRef"
      :alpha="true"
      :orbit-ctrl="{
        enableDamping: true
      }"
      shadow
    >
      <Camera ref="cameraRef" :position="{ x: 0, y: 0, z: 4 }" />
      <Scene ref="sceneRef">
        <GltfModel
          ref="gltfRef"
          src="/glb/piezas/piezas_low_0004.gltf"
          @load="onReady"
        />
        <!--<AmbientLight ref="light" />-->
      </Scene>
    </Renderer>
  </div>
</template>