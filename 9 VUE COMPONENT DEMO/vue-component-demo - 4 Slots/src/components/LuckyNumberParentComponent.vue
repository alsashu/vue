<template>
  <div class="bg-black text pt-3" :style="{ height: '100vh' }">
    <h1 class="text-center text-success">Learn Slots</h1>
    <div class="container text-center bg-white">
      <slot></slot>
      <button @click="newVersion = !newVersion" class="btn btn-primary text-black m-2">Toggle Component</button>
      <br />
      <slot name="moreInfo"></slot>
      <button @click="newVersion = false" class="btn btn-primary text-black m-2">Lucky Number V1</button>
      <button @click="newVersion = true" class="btn btn-primary text-black m-2">Lucky Number V2</button>
      <br />
      <slot name="learnSlot"></slot>
      <br />
      <keep-alive :include="['LuckyNumber', 'LuckyNumberV2']">
        <component :is="currentComponent" />
      </keep-alive>
      <slot name="default"></slot>

    </div>
  </div>
</template>

<script setup>

import { computed, reactive, ref } from 'vue';
import LuckyNumberV2 from './LuckyNumberV2.vue';
import LuckyNumber from './LuckyNumber.vue';

const newVersion = ref(true);

const currentComponent = computed(() => {
  return newVersion.value ? LuckyNumberV2 : LuckyNumber;
});

</script>
<style scoped>
h1 {
  background-color: pink;
}
</style>