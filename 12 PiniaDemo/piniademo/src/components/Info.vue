<template>
  <div>
    <h1 class="text-center">Info</h1>
    <p class="text-center">This is the Info page.</p>
    <p class="text-center">This is a simple game where you incerment decrement or randomize the score. The score starts
      at 50 and you win by reaching {{ gameStore.getWinningScore }}.
    </p>

    <input class="form-control" type="text" v-model="gameStore.maxHealth" />
  </div>
</template>

<script setup>
import { useGameStore } from '@/store/gameStore';

const gameStore = useGameStore();
</script>