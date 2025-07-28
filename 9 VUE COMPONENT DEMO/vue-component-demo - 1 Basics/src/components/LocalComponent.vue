<template>
  <p>{{ compType }}</p>
  <button v-on:click="count++">Clicked {{ count }} times</button>
</template>

<script setup>

import { ref } from "vue";
const compType = "Local Component";
const count = ref(0);

</script>