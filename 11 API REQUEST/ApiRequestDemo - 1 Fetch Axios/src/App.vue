<template>
  <div>
    <h1>RequestOPedia</h1>
    <h3>User List</h3>
  </div>
  <hr />

  <div v-for="user in userObj.users" :key="user.id">
    <h2>{{ user.name }}</h2>
    <p>{{ user.email }}</p>
    <hr />
  </div>

  <div>
    <h1>RequestOPedia</h1>
    <h3>Comment List</h3>
  </div>
  <hr />

  <div v-for="comment in userObj.comments" :key="comment.id">
    <h1>{{ comment.name }}</h1>
    <p>{{ comment.body }}</p>
    <hr />
  </div>
</template>

<script setup>
import axios from 'axios';
import { onMounted, reactive } from 'vue';

const userObj = reactive({
  users: [],
  comments: []
});

onMounted(() => {

  //using traditional fetch method.
  fetch('https://jsonplaceholder.typicode.com/comments')
    .then((response) => response.json())
    .then((data) => {

      userObj.comments = data;
      console.log(userObj.comments);
    })

  // using axios
  axios.get('https://jsonplaceholder.typicode.com/users')
    .then((response) => {
      console.log(response.data);
      userObj.users = response.data;
    });
})
</script>
