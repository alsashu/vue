<template>
  <div class="bg-info rounded p-2 m-2">
    <h3>Contact Us</h3>
    <p>Please send an email to {{ email }}</p>
  </div>
</template>

<script>
import { ref } from "vue";

export default {
  setup() {
    const email = ref("hello@mail.com");

    return {
      email
    }
  }
}
</script>