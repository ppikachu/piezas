<template>
  <Slider :images="images" />
</template>

<script>
import { default as Slider }  from 'troisjs/src/components/sliders/Slider2.vue';
export default {
  components: { Slider },
  data() {
    return {
      images: [
        { src: '/assets/images/Audrey-Hepburn.jpg' },
        { src: '/assets/images/bruce.jpg' },
        { src: '/assets/images/captura.jpg' },
      ],
    };
  },
};
</script>