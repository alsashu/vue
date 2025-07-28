<template>
  <h1>{{ message }}</h1>
  <button class="btn btn-primary" v-on:click="showMessage">Show Message</button>
  <br />
  <h1>{{ count }}</h1>
  <button class="btn btn-success" v-on:click="count++">App.vue - Clicked {{ count }} times</button>
  <br />
  <br />
  <ButtonCounter v-if="count == 1" />
  <br />
  <br />
  <!-- <LifecycleConcept /> -->
</template>

<script setup>
import ButtonCounter from './components/ButtonCounter.vue';
import { ref, onBeforeMount, onMounted, onBeforeUpdate, onUpdated, onBeforeUnmount, onUnmounted } from 'vue';
import LifecycleConcept from './components/LifecycleConcept.vue';

const message = ref('HELLO LIFECYCLE IN VUE (App.vue)');
const count = ref(0);

const showMessage = () => {
  message.value = 'Hello vue from function.';
};

onBeforeMount(() => {
  console.log('onBeforeMount - App.vue');
});

onMounted(() => {
  console.log('onMounted - App.vue');
});

onBeforeUpdate(() => {
  console.log('onBeforeUpdate - App.vue');
});

onUpdated(() => {
  console.log('onUpdated - App.vue');
});

onBeforeUnmount(() => {
  console.log('onBeforeUnmount - App.vue');
});

onUnmounted(() => {
  console.log('onUnmounted - App.vue');
});


</script>
