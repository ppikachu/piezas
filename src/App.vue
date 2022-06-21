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
  EffectComposer,
  RenderPass,
  GltfModel,
  AmbientLight,
} from 'troisjs'
import {
  AnimationClip,
  AnimationMixer,
  KeyframeTrack,
  Clock
} from 'three'
import imgUrl from './assets/images/f_polaroid.png'
//import TroikaText from './components/TroikaText'
import gsap from 'gsap'
// import chroma from 'chroma-js'

const  PARAMS = {
  antialias:         false,
  param1:            0.3,
  param2:            1,
}

const scene = ref()
const light = ref()
const renderer = ref()
const mesh = ref()
var piezaLight, piezaHeavy, mixer
var timer = 0
var clock = new Clock()
var scaleTrack = new KeyframeTrack('.rotation[z]', [0,4], [0,0,3,3,0,1])
var clip = new AnimationClip("bang", 4, [ scaleTrack ])

onMounted(() => {
  console.clear()
})

function onReady(model){
  console.log("done loading model")
  piezaLight = mesh.value.scene.children[3].children[0]
  piezaHeavy = mesh.value.scene.children[2]
  // animate
  // 剪辑clip作为参数，通过混合器clipAction方法返回一个操作对象AnimationAction
  mixer = new AnimationMixer(piezaLight)
  var AnimationAction = mixer.clipAction(clip)
  //通过操作Action设置播放方式
  //AnimationAction.timeScale = 20;//默认1，可以调节播放速度
  // AnimationAction.loop = THREE.LoopOnce; //不循环播放
  AnimationAction.play()
  console.log(AnimationAction)

  // pre
  renderer.value.onBeforeRender(animate)
}

function onProgress(model){
  console.log("loading stuff")
}

function animate() {
  //piezaLight.rotation.z = Math.abs(Math.sin(timer)*Math.PI*1.5)-1.5
  //piezaHeavy.rotation.z = Math.abs(Math.sin(timer)*Math.PI*1.5)+Math.PI/2
  //timer += -0.01
  mixer.update(clock.getDelta())
}
</script>

<template>
<div class=" h-screen">
  <Renderer
    ref="renderer"
    antialias
    :orbit-ctrl="{ enableDamping: true }"
    resize
    shadow
  >
    <Camera :position="{ x: 1, y: 2, z: 10 }" />
    <Scene ref="scene" background="blue">
      <!--<AmbientLight ref="light" />-->
      <PointLight ref="light" color="#ffffff" :intensity="1" :position="{ x: 15, y: 10, z: 20 }" castShadow="true">
        <!--<Sphere :radius="2" />-->
      </PointLight>
18    <GltfModel ref="mesh" src="/glb/pieza_light/light.gltf" :position="{ x: -3.18, y: 0.4 }" @progress="onProgress" @ready="onReady" />
      <GltfModel src="/glb/pieza_heavy/heavy.gltf" :position="{ x: 3.18, y: -0.4 }" @progress="onProgress" />
      <Plane :width="2000" :height="2000" :rotation="{ x: -Math.PI / 2 }" receive-shadow>
        <PhongMaterial color="#999999" :props="{ depthWrite: false }" />
      </Plane>
    </Scene>
  </Renderer>
</div>
</template>