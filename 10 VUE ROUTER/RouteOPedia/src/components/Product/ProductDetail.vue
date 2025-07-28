<template>
  <div>
    <h1>Product Detail</h1>
    <p>This is the product detail page.</p>
    <div v-if="route.params.productId">
      <p>Product ID: {{ route.params.productId }}</p>
    </div>
    <div v-else>
      <p>No product selected.</p>
    </div>

    <div v-if="route.params.categoryId">
      <p>Category ID: {{ route.params.categoryId }}</p>
    </div>
    <div v-else>
      <p>No category selected.</p>
    </div>
  </div>
</template>

<script setup>
import { useRoute } from 'vue-router';

const route = useRoute();

console.log('Current route:', route.params);
</script>