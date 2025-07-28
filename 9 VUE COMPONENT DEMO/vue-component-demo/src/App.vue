<template>
  <div class="container m-3 p-3">
    <button class="btn btn-warning" @click="increment">Increment</button>
    <p>{{ count }}</p>
    <button class="btn btn-danger" @click="decrement">Decrement</button>
    <br />
    <br />
    <br />
    <ButtonCounter />
  </div>
</template>

<script setup>
import ButtonCounter from './components/ButtonCounter.vue';
import { useCounter } from './composibles/useCounter';

const { count, increment, decrement } = useCounter(10, 5);

</script>
