<template>
  <button v-on:click="count++">Clicked {{ count }} times</button>
</template>

<script>
import { ref } from "vue";

export default {
  setup() {
    const count = ref(0);

    return {
      count
    }
  }
}
</script>