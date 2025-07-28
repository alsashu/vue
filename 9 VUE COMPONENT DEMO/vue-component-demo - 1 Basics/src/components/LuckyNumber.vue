<template>
  <div class="float-end">
    <button class="btn btn-outline-danger" @click="geneateLuckyNumber()">
      <span v-if="luckyNumber === 0">
        Generate Lucky Number
        <br />
        Range(1-{{ maxNumber }})
      </span>
      <span v-else>
        Lucky Number:{{ luckyNumber }}
        <br />
        Click to generate new lucky number
      </span>
    </button>
  </div>
</template>

<script setup>
import { ref } from 'vue';

let luckyNumber = ref(0);

const props = defineProps({
  maxNumber: {
    type: Number,
    default: 10
  }
});

function geneateLuckyNumber() {
  luckyNumber.value = Math.floor(Math.random() * props.maxNumber);
  console.log(luckyNumber);
}
</script>