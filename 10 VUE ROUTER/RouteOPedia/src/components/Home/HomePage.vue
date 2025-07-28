<template>
  <div>
    <h1>Home Page</h1>
    <p>Welcome to the home page!</p>

    <button @click="goToContact" class="btn btn-warning">Contact Us</button>
  </div>
</template>

<script setup>
import { useRouter } from 'vue-router';

const router = useRouter();

function goToContact() {
  //router.push({ name: 'contact' })
  router.push("/contact-us")
}
</script>