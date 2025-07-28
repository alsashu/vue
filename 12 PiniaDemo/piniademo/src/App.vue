<script setup>
import { RouterLink, RouterView } from 'vue-router'
</script>

<template>
  <header>
    <div class="text-center pt-3 text-success h3">PiniaOPedia</div>
    <hr />
    <div class="row">
      <div class="col-4 offset-1">
        <router-link to="/" class="form-control badge rounded-pill text-bg-warning p-4">Home</router-link>
      </div>
      <div class="col-4 offset-1">
        <router-link to="/info" class="form-control badge rounded-pill text-bg-warning p-4">Info</router-link>
      </div>
    </div>
  </header>
  <RouterView />
</template>