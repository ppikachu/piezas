<script setup>
import { ref, onMounted, onBeforeMount } from "vue";
import {
  Renderer,
  Scene,
  Camera,
  GltfModel,
  Plane,
  Sphere,
  StandardMaterial,
  AmbientLight,
  PointLight,
  RectAreaLight,
} from "troisjs";
//import NoisyImage from 'troisjs/src/components/noisy/NoisyImage.js'
import {
  ShockWaveEffect,
  VignetteEffect,
  BloomEffect,
  EffectComposer,
  EffectPass,
  RenderPass,
  BlendFunction,
} from "postprocessing";
import { AnimationMixer, Clock, ACESFilmicToneMapping, Vector3 } from "three";
import { Resizer } from "./components/Resizer";
import Title from "./components/Title.vue";
import anime from "animejs";

const rendererRef = ref();
const sceneRef = ref();
const cameraRef = ref();
const gltfRef = ref();
const areaLightL = ref();
const areaLightH = ref();
const hitLightRef = ref();
const target = new Vector3(0, 0, 0);

var clock = new Clock();
var audio0,
  audio1,
  audio2,
  audio3,
  once,
  mixer,
  light,
  light2,
  hitLight,
  gltfScene,
  composer,
  camera,
  orbitCtrl,
  renderer,
  scene,
  shockWaveEffect;

onBeforeMount(() => {
  console.clear();
});

onMounted(() => {
  renderer = rendererRef.value.renderer;
  scene = sceneRef.value.scene;
  camera = cameraRef.value.camera;
  orbitCtrl = rendererRef.value.three.cameraCtrl;
  light = areaLightL.value.light;
  light2 = areaLightH.value.light;
  hitLight = hitLightRef.value.light;
  // audio setup
  once = true;
  audio0 = new Audio("/glb/piezas/piezas_0.mp3");
  audio1 = new Audio("/glb/piezas/piezas_1.mp3");
  audio2 = new Audio("/glb/piezas/piezas_2.mp3");
  audio3 = new Audio("/glb/piezas/piezas_3.mp3");
  audio0.loop = audio1.loop = audio2.loop = audio3.loop = false;
  //renderer.outputEncoding = sRGBEncoding
  renderer.toneMapping = ACESFilmicToneMapping;
  // turn on the physically correct lighting model
  renderer.physicallyCorrectLights = true;

  //#region postprocessing
  composer = new EffectComposer(renderer, {
    multisampling: 2,
  });
  shockWaveEffect = new ShockWaveEffect(camera, target, {
    speed: 2,
    maxRadius: 0.15,
    waveSize: 0.05,
    amplitude: 0.03,
  });
  const bloomEffect = new BloomEffect({
    //blendFunction: BlendFunction.SCREEN,
    luminanceThreshold: 0.7,
    intensity: 1,
    //radius: 0.8,
  });
  const vignetteEffect = new VignetteEffect();
  const renderPass = new RenderPass(scene, camera);
  const effectPass = new EffectPass(
    camera,
    shockWaveEffect,
    bloomEffect,
    //vignetteEffect
  );
  // apply postprocessing
  composer.addPass(renderPass);
  composer.addPass(effectPass);
  //#endregion
  light.lookAt(0, 0, 0);
  light2.lookAt(0, 0, 0);
  // resiser (resize the canvas and composer)
  const resizer = new Resizer(camera, renderer, composer);
});

function onReady(gltf) {
  gltfScene = gltf.scene
  // self shadowing
  const piezaHeavy = gltfScene.children[0].children[0]
  const piezaLight = gltfScene.children[1].children[0]
  piezaHeavy.receiveShadow = true
  piezaLight.receiveShadow = true
  piezaHeavy.castShadow = true
  piezaLight.castShadow = true
  /*// environment
    const loadedTexture = new RGBELoader().load(hdrimgUrl, () => {
    const envMap = loadedTexture
    envMap.mapping = EquirectangularReflectionMapping
    piezaHeavy.material.envMap = envMap
    piezaLight.material.envMap = envMap
  })*/
  // animation
  mixer = new AnimationMixer(gltf.scene);
  mixer.clipAction(gltf.animations[0]).play();
  mixer.addEventListener("loop", () => {
    hitIt();
    once = true;
  });
  animate();
}

function getRandomInt(max) {
  return Math.floor(Math.random() * max);
}

function smoothstep(min, max, value) {
  var x = Math.max(0, Math.min(1, (value - min) / (max - min)));
  return x * x * (3 - 2 * x);
}

function hitIt() {
  // flash
  anime({
    targets: hitLight,
    intensity: 4,
    duration: 100,
    direction: 'alternate',
    easing: "easeOutQuad",
  });
  // screen distortion
  shockWaveEffect.explode();
  // sound
  switch (getRandomInt(4)) {
    case 0:
      audio0.play();
      break;
    case 1:
      audio1.play();
      break;
    case 2:
      audio2.play();
      break;
    case 3:
      audio3.play();
      break;
  }
}

function animate() {
  requestAnimationFrame(animate);
  mixer.update(clock.getDelta());
  // hits the pieza?
  if (mixer._actions[0].time > 1.5 && once) {
    hitIt();
    once = false;
  }
  // rotate scene
  gltfScene.rotation.z = Math.PI * smoothstep(-0.8, 0.8, Math.sin(clock.getElapsedTime() / 10))
  //FX render pass
  composer.render();
}
</script>

<template>
  <div
    class="h-screen flex items-center bg-gradient-to-b from-cyan-900 to-pink-900"
  >
    <Title>
      <template #body>1. click para habilitar el audio<br>2. arrastrar para rotar</template>
    </Title>
    <Renderer
    ref="rendererRef"
    shadow
    :orbit-ctrl="{
      enableDamping: true,
      enablePan: false,
      minAzimuthAngle: Math.PI*1.75,
      maxAzimuthAngle: Math.PI*0.25,
      minPolarAngle: Math.PI*0.25,
      maxPolarAngle: Math.PI*0.75,
    }"
    pointer
    >
      <Camera ref="cameraRef" :position="{ x: 0, y: 0, z: 12 }" />
      <Scene ref="sceneRef">
        <!--<AmbientLight ref="light" />-->
        <RectAreaLight
          ref="areaLightL"
          width="20"
          height="7"
          :color="0x44ffff"
          :intensity="12"
          :position="{ x: 2, y: 18, z: 5 }"
        />
        <RectAreaLight
          ref="areaLightH"
          width="20"
          height="7"
          :color="0x4444ff"
          :intensity="12"
          :position="{ x: -2, y: -18, z: 5 }"
        />
        <GltfModel
          ref="gltfRef"
          src="/glb/piezas/piezas_low_0007.gltf"
          @load="onReady"
        />
        <Plane
          width="100"
          height="100"
          :position="{ x: 0, y:0 , z: -4 }"
          :rotation="{ x: Math.PI, y: Math.PI, z: 0 }"
        >
          <StandardMaterial
            :color="0x555555"
            :roughness="1"
            :metalness="0"
            side="double"
          />
        </Plane>
        <!--<NoisyImage
          src="./src/assets/images/bruce.jpg"
          :width="200"
          :time-coef="0.001"
          :noise-coef="128"
          :z-coef=".1"
          :disp-coef="0.01"
          :position="{ x: 0, y: 0, z: -4 }"
          :rotation="{ x: 0, y: Math.PI, z: 0 }"
        />-->
        <PointLight
          helper
          ref="hitLightRef"
          :color="0xffffff"
          :intensity="0"
          :distance="48"
          :decay="2"
          :position="{x:0, y:0, z:.2}"
          castShadow
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