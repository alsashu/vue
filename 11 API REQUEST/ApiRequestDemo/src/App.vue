<template>
  <div v-if="destinationObj.isLoading" class="d-flex justify-content-center p-4">
    <Loader></Loader>
  </div>
  <div class="container p-4 bg-white">
    <div>
      <h1 class="text-success text-center">TravelOPedia</h1>
    </div>
    <hr />
    <table class="table table-striped table-light">
      <thead>
        <tr>
          <th>ID</th>
          <th>Name</th>
          <th>Days</th>
          <th>Fun Fact</th>
          <th>Price</th>
        </tr>
      </thead>
      <tbody>
        <tr class="table-light" v-for="destination in destinationObj.destination" :key="destination.id">
          <td>{{ destination.id }}</td>
          <td>{{ destination.name }}</td>
          <td>{{ destination.days }}</td>
          <td>{{ destination.funFact }}</td>
          <td>{{ destination.price }}</td>
        </tr>
      </tbody>
    </table>
  </div>
</template>

<script setup>
import axios from 'axios';
import { onMounted, reactive } from 'vue';

const destinationObj = reactive({
  destination: [],
  isLoading: false
});

onMounted(() => {
  loadDestination();
})

function loadDestination() {
  destinationObj.isLoading = true;
  axios.get('http://localhost:3000/destination')
    .then((response) => {
      new Promise((resolve) => setTimeout(resolve, 2000)).then(() => {
        console.log(response.data);
        destinationObj.destination = response.data;
        destinationObj.isLoading = false;
      })
    });

}
</script>
