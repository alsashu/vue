<template>
  <button class="btn btn-warning" v-on:click="count++">ButtonCounter.vue - Clicked {{ count }} times</button>
</template>

<script setup>
import { ref, onBeforeMount, onMounted, onBeforeUpdate, onUpdated, onBeforeUnmount, onUnmounted } from 'vue';

onBeforeMount(() => {
  console.log('onBeforeMount - ButtonCounter.vue');
});

onMounted(() => {
  console.log('onMounted - ButtonCounter.vue');
});

onBeforeUpdate(() => {
  console.log('onBeforeUpdate - ButtonCounter.vue');
});

onUpdated(() => {
  console.log('onUpdated - ButtonCounter.vue');
});

onBeforeUnmount(() => {
  console.log('onBeforeUnmount - ButtonCounter.vue');
});

onUnmounted(() => {
  console.log('onUnmounted - ButtonCounter.vue');
});

const count = ref(0);

</script>