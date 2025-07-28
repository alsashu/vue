<template>
  <button class="btn btn-warning" v-on:click="count++">LifecycleConcept.vue - Clicked {{ count }} times</button>
</template>

<script setup>
import { ref, onBeforeMount, onMounted, onBeforeUpdate, onUpdated, onBeforeUnmount, onUnmounted } from 'vue';

onBeforeMount(() => {
  console.log('onBeforeMount - LifecycleConcept.vue');
});

onMounted(() => {
  console.log('onMounted - LifecycleConcept.vue');
});

onBeforeUpdate(() => {
  console.log('onBeforeUpdate - LifecycleConcept.vue');
});

onUpdated(() => {
  console.log('onUpdated - LifecycleConcept.vue');
});

onBeforeUnmount(() => {
  console.log('onBeforeUnmount - LifecycleConcept.vue');
});

onUnmounted(() => {
  console.log('onUnmounted - LifecycleConcept.vue');
});

const count = ref(0);

</script>
