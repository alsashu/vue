<template>
  <button class="btn btn-warning" @click="increment">++</button>
  &nbsp;<span>{{ count }}</span> &nbsp;
  <button class="btn btn-danger" @click="decrement">--</button>
  <br />
  <br />

</template>

<script setup>
import { useCounter } from '@/composibles/useCounter';

const { count, increment, decrement } = useCounter(100, 10);

</script>
