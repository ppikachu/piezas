<template>
  <div class="absolute bottom-8 w-full text-center tracking-widest modal-container text-white">
    <div class="font-light text-3xl uppercase">
      <slot name="header">default header</slot>
    </div>
    <div class="modal-body py-4 text-xs">
      <slot name="body">default body</slot>
    </div>
  </div>
</template>