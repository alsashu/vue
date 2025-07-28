<template>
  <h1>Hello Vue</h1>
  <LuckyNumberParentComponent>
    <p class="pt-2">Have two versions for picking a lucky number.</p>
    <template slot:default>
      <p class="pt-2">We have two version for pibking lucky number.</p>
    </template>
    <template v-slot:moreInfo>
      <p>Click the button to toggle between the two versions.</p>
    </template>
    <template v-slot:learnSlot>
      <button class="btn btn-warning" @click="showMesssage">What will we learn?</button>
      <h4 class="text-success">{{ message }}</h4>
    </template>
  </LuckyNumberParentComponent>
</template>

<script setup>
import { ref } from 'vue';
import LuckyNumberParentComponent from './components/LuckyNumberParentComponent.vue';

const message = ref('');

function showMesssage() {
  message.value = 'We will learn how to use slots!';
}
</script>
