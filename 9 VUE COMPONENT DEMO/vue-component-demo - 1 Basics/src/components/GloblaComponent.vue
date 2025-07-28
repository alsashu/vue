<template>
  <p>{{ compType }}</p>
  <button v-on:click="count--">{{ count }}</button>
</template>

<script setup>

import { ref } from "vue";
const count = ref(100);
const compType = ref("Global omponent");

</script>