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
  AmbientLight,
} from 'troisjs'
import {
  AnimationMixer,
  Clock
} from 'three'
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader'

const  PARAMS = {
  antialias:         false,
  param1:            0.3,
  param2:            1,
}
const scene = ref()
const light = ref()
const renderer = ref()
const meshObject = ref()
const plane = ref()
var clock = new Clock()
var mixer

onMounted(() => {
  console.clear()
  const loader = new GLTFLoader()
  loader.load( '/glb/piezas/piezas_low_0003.gltf', function ( gltf ) {
    const model = gltf.scene
    scene.value.add(model)
    //TODO: shadow
    model.children[0].children[0].castShadow = true
    model.children[0].children[0].receiveShadow = true
    model.children[1].children[0].castShadow = true
    model.children[1].children[0].receiveShadow = true
    
    //animation
    mixer = new AnimationMixer(model)
    mixer.clipAction(gltf.animations[0] ).play()
    console.log(light.value)
    animate()
  }, undefined, function (e) {
    console.error(e)
  } )
})

function onReady(model){
  const piezas = meshObject.value
  console.log("done loading model:", piezas)
  // 剪辑clip作为参数，通过混合器clipAction方法返回一个操作对象AnimationAction
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
  requestAnimationFrame( animate );
  mixer.update(clock.getDelta())
  //renderer.render( scene, camera );
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
    <Scene ref="scene">
      <AmbientLight ref="light" />
      <PointLight ref="light" color="#ffffff" :intensity="1" :position="{ x: 5, y:20, z: 20 }" cast-shadow :shadow-map-size="{ width: 1024, height: 1024 }">
        <Sphere :radius="20" />
      </PointLight>
      <Plane ref="plane" :width="1000" :height="1000" :rotation="{ x: -Math.PI / 2 }" :position="{y: -6}" receive-shadow>
        <StandardMaterial color="#999999" />
      </Plane>
    </Scene>
  </Renderer>
</div>
</template>