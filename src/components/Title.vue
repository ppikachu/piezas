<template>
  <Transition name="modal">
    <div class="absolute top-8 w-full text-center tracking-widest modal-container text-white">
      <div class="font-light text-3xl uppercase">
        <slot name="header">default header</slot>
      </div>
      <div class="modal-body py-4 text-xs">
        <slot name="body">default body</slot>
      </div>
    </div>
  </Transition>
</template>

<style>
.modal-container {
  transition: all 0.3s ease;
}

/*
 * The following styles are auto-applied to elements with
 * transition="modal" when their visibility is toggled
 * by Vue.js.
 *
 * You can easily play with the modal transition by editing
 * these styles.
 */

.modal-enter-from {
  opacity: 0;
}

.modal-leave-to {
  opacity: 0;
}

.modal-enter-from .modal-container,
.modal-leave-to .modal-container {
  -webkit-transform: scale(1.1);
  transform: scale(1.1);
}
</style>