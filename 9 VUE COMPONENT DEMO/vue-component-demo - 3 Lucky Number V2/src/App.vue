<template>
  <div class="bg-black text pt-3" :style="{ height: '100vh' }">
    <h1 class="text-center text-success">ContactOPedia</h1>
    <div class="container">
      <button @click="newVersion = !newVersion" class="btn btn-primary text-black m-2">Toggle Component</button>
      <br />
      <button @click="newVersion = false" class="btn btn-primary text-black m-2">Lucky Number V1</button>
      <button @click="newVersion = true" class="btn btn-primary text-black m-2">Lucky Number V2</button>
      <br />
      <br />
      <keep-alive :include="['LuckyNumber', 'LuckyNumberV2']">
        <component :is="currentComponent" />
      </keep-alive>
    </div>
  </div>
</template>

<script setup>

import { computed, reactive, ref } from 'vue';
import LuckyNumberV2 from './components/LuckyNumberV2.vue';
import LuckyNumber from './components/LuckyNumber.vue';

const newVersion = ref(true);

const currentComponent = computed(() => {
  return newVersion.value ? LuckyNumberV2 : LuckyNumber;
});

</script>