<template>
  <div class="bg-info rounded p-4 pb-4 m-2">
    <div class="row">
      <div class="col-5">
        <h3>Id: {{ id }}</h3>
        <p>Name: {{ name }}</p>
        <p>Email: {{ email }}</p>
        <p>Phone: {{ phone }}</p>
        <p>Address: {{ address }}</p>
        <p>Role: {{ role }}</p>
      </div>
      <div class="col-3">
        <button @click="toggleFavorite()"
          :class="[isFavorite ? 'btn btn-warning form-control' : 'btn btn-success form-control']">
          {{ isFavorite ? 'Remove From' : 'Add To' }} Favorites
        </button>
      </div>
      <div class="col-4">
        <LuckyNumber></LuckyNumber>
      </div>
    </div>

    <span class="float-end small">*this contact belongs to: {{ ownername }}</span>

  </div>
</template>

<script setup>

import { defineEmits } from 'vue';
import LuckyNumber from './LuckyNumber.vue';

const props = defineProps({
  id: Number,
  name: { type: String, required: true },
  phone: Number,
  email: { type: String, required: false, default: "-n/a-" },
  address: String,
  role: String,
  ownername: String,
  isFavorite: Boolean
});

const emit = defineEmits(['update-favorite']);


function toggleFavorite() {
  emit('update-favorite', { isFavorite: props.isFavorite, id: props.id, name: props.name, phone: props.phone, email: props.email, address: props.address, role: props.role, ownername: props.ownername });
}

</script>