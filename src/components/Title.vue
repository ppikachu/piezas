<template>
  <div
    class="absolute w-full h-full flex flex-col items-center justify-end tracking-widest modal-container text-white"
    @click="showModal = false"
    v-show="showModal"
  >
    <div class="modal-body p-8 text-xs">
      <slot name="body">default body</slot>
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue'
const showModal = ref(true)
</script>