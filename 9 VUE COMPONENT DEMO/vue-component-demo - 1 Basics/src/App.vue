<template>
  <div class="bg-black text pt-3" :style="{ height: '100vh' }">
    <h1 class="text-center text-success">ContactOPedia</h1>
    <div class="container">
      <div class="row text-white p-2 mb-2">
        <div class="col-6">
          Owner Name : <input class="form-control" type="text" v-model="ownerName">
        </div>

        <div class="col-6">
          Max Lucky Number : <input class="form-control" type="text" v-model="maxNumber">
        </div>
      </div>
      <div class="text-success float-end">
        Contact Owner Name:
      </div>
      <AddContact @add-contact="onAddContact"></AddContact>
      <br />
      <br />
      <div class="row">
        <div class="col-12" v-for="contact in contacts" :key="contact.id">
          <Contact :id=contact.id :name=contact.name :phone=contact.phone :email=contact.email :address=contact.address
            :role=contact.role :isFavorite=contact.isFavorite :ownername=contact.ownerName :maxLuckyNumber="maxNumber"
            @update-favorite="contact.isFavorite = onUpdateFavorite($event, contact.phone)">
          </Contact>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>

import { reactive, ref } from 'vue';
import Contact from './components/Contact.vue';
import AddContact from './components/AddContact.vue';

const ownerName = ref("LEARN & CODE");

const maxNumber = ref(1000);

const contacts = reactive([{ "id": 1, "ownerName": ownerName, "name": "Ashu Joshi", "email": "ashu.joshi@example.com", "phone": 9876543210, "address": "Bengaluru, Karnataka, India", "role": "Software Engineer", "isFavorite": false }, { "id": 2, "ownerName": ownerName, "name": "Nikita Sharma", "email": "nikita.sharma@example.com", "phone": 9123456780, "address": "Pune, Maharashtra, India", "role": "Frontend Developer", "isFavorite": true }, { "id": 3, "ownerName": ownerName, "name": "Rohan Mehta", "email": "rohan.mehta@example.com", "phone": 9988776655, "address": "Gurgaon, Haryana, India", "role": "UI/UX Designer", "isFavorite": false }, { "id": 4, "ownerName": ownerName, "name": "Priya Das", "email": "priya.das@example.com", "phone": 9090909090, "address": "Kolkata, West Bengal, India", "role": "QA Engineer", "isFavorite": true }, { "id": 5, "ownerName": ownerName, "name": "Aman Kapoor", "email": "aman.kapoor@example.com", "phone": 8000000001, "address": "Delhi, India", "role": "DevOps Engineer", "isFavorite": true }]);

function onUpdateFavorite(oldValuesFromChildComponent, phoneNumberFromParentComponent) {
  console.log("Old Values from Child Component: ", oldValuesFromChildComponent);
  console.log("Phone Number from Parent Component: ", phoneNumberFromParentComponent);
  return !oldValuesFromChildComponent.isFavorite; // Toggle the favorite status
}

function onAddContact(contact) {
  contacts.push(contact);
}

</script>