<template>
  <h1>{{ local }}</h1>
  <h1>{{ test }}</h1>
</template>

<script setup>

import { ref } from 'vue';

const local = "TEST"

const test = ref("LOCAL")

</script>