<script setup>
import { ref, onMounted } from 'vue'

import {
  Renderer,
  Scene,
  Camera,
  PointLight,
  Sphere,
  Mesh,
  Plane,
  BasicMaterial,
  StandardMaterial,
  PhongMaterial,
  Texture,
  FXAAPass,
  UnrealBloomPass,
  BokehPass,
  FilmPass,
  SMAAPass,
  AmbientLight,
} from 'troisjs'
import { ShockWaveEffect, VignetteEffect, BloomEffect, EffectComposer, EffectPass, RenderPass, BrightnessContrastEffect, BlendFunction } from 'postprocessing'
import { AnimationMixer, Clock, TextureLoader, EquirectangularReflectionMapping, sRGBEncoding, Vector3 } from 'three'
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader'

import imgUrl from './assets/images/2294472375_24a3b8ef46_o.jpeg'

const PARAMS = {
  param1:            0.3,
  param2:            1,
  planeSize:         50,
}
const settings = {
 antialias: false,
}
const sceneRef = ref()
const cameraRef = ref()
const light = ref()
const rendererRef = ref()
const meshObject = ref()
const plane = ref()
const target = new Vector3(0, 0, 0)

var clock = new Clock()
let mixer, textureEquirec, sphereMesh, sphereMaterial, composer, camera, renderer, scene, shockWaveEffect

onMounted(() => {
  console.clear()
  renderer = rendererRef.value.renderer
  scene = sceneRef.value.scene
  camera = cameraRef.value.camera
  renderer.outputEncoding = sRGBEncoding
  // postprocessing
  shockWaveEffect = new ShockWaveEffect(camera, target, {
    speed: 1.25,
    maxRadius: 0.01,
    waveSize: 0.05,
    amplitude: 0.05
  })
  const bloomEffect = new BloomEffect({
    //blendFunction: BlendFunction.SCREEN,
    luminanceThreshold: 0.1,
    intensity: 0.5,
    radius: 0.8,
  })
  const brightnessContrastEffect = new BrightnessContrastEffect({
    blendFunction: BlendFunction.SCREEN,
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
  composer = new EffectComposer(renderer)
  composer.addPass(renderPass)
  composer.addPass(effectPass)

  // piezas
  const loader = new GLTFLoader()
  loader.load( '/glb/piezas/piezas_low_0004.gltf', function ( gltf ) {
    const model = gltf.scene
    const piezaHeavy = model.children[0].children[0]
    const piezaLight = model.children[1].children[0]
    scene.add(model)
    console.log(rendererRef.value.renderer)
    // self shadowing
    piezaHeavy.castShadow = true
    piezaHeavy.receiveShadow = true
    piezaLight.castShadow = true
    piezaLight.receiveShadow = true
    // environment
    const textureLoader = new TextureLoader()
    textureEquirec = textureLoader.load(imgUrl)
    textureEquirec.mapping = EquirectangularReflectionMapping
    textureEquirec.encoding = sRGBEncoding

    //scene.background = textureEquirec

    piezaHeavy.material.envMap = textureEquirec
    piezaLight.material.envMap = textureEquirec
    //piezaLight.material.needsUpdate = true

    // animation
    mixer = new AnimationMixer(model)
    mixer.clipAction(gltf.animations[0] ).play()
    animate()
    
  },
  undefined, function (e) {
    console.error(e)
  })

  window.addEventListener("resize", onResize);
  onResize()
})

function onReady(model){
  const piezas = meshObject.value
  // AnimationAction
  mixer = new AnimationMixer(piezas)
  const action = mixer.clipAction(piezas.o3d.animations[1])
  action.play()
  // pre
  renderer.value.onBeforeRender(animate)
}

function onProgress(model){
  console.log("loading stuff")
}

function animate() {
  requestAnimationFrame(animate)
  mixer.update(clock.getDelta())
  composer.render()
  if (clock.elapsedTime >= 1.5) {
    shockWaveEffect.explode()
    clock.start()
  }
  //if (theShader.value) theShader.value.pass.uniforms.u_time.value += 0.01
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
      <!--<PointLight ref="light" color="#ffffff" :intensity="5" :distance="30" :position="{ x:1, y:15, z:15 }" cast-shadow :shadow-map-size="{ width: 1024, height: 1024 }" />-->
      <!--<Plane ref="plane" :width="PARAMS.planeSize" :height="PARAMS.planeSize" :rotation="{ x: -Math.PI / 2 }" :position="{y: -4}" receive-shadow>
        <StandardMaterial color="#2299EE" />
      </Plane>-->
    </Scene>
  </Renderer>
</div>
</template>