<template>
  <div
    class="absolute bg-black/10 w-full h-full flex flex-col items-center justify-center tracking-widest modal-container text-white"
    @click="showModal = false"
    v-show="showModal"
  >
    <div class="modal-body py-4 text-xs">
      <slot name="body">default body</slot>
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue'
const showModal = ref(true)
</script>