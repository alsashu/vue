<template>
  <button v-on:click="count--">{{ count }}</button>
</template>

<script setup>

import { ref } from "vue";
const count = ref(100);

</script>