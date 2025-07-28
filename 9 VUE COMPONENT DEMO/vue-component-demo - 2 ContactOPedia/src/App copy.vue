<template>
  <div class="container">
    <div class="text-success float-end">
      Contact Owner Name: <input type="text" v-model="ownerName">
    </div>
    <AddContact @add-contact="onAddContact"></AddContact>
    <br />
    <br />
    <div class="row">
      <div class="col-12" v-for="contact in contacts" :key="contact.id">


        <!-- <Contact :id=contact.id :name=contact.name :phone=contact.phone :email=contact.email :address=contact.address
          :role=contact.role :isFavorite=contact.isFavorite :ownername=contact.ownerName
          @update-favorite="contact.isFavorite = onUpdateFavorite($event)">
        </Contact> -->

        <Contact :id=contact.id :name=contact.name :phone=contact.phone :email=contact.email :address=contact.address
          :role=contact.role :isFavorite=contact.isFavorite :ownername=contact.ownerName
          @update-favorite="contact.isFavorite = onUpdateFavorite($event, contact.phone)">
        </Contact>
      </div>
    </div>

    <!-- <Contact name="Ashu" :phone="9856985698" :ownername=contactOwner></Contact>

    <Contact name="Pinku" v-bind:phone="9745632156" v-bind:ownername=contactOwner1 email="pankaj@mail.com"></Contact>

    <Contact name="Kamal" :phone="8978965485" :ownername=contactOwner1 email="kamal@mail.com"></Contact> -->
  </div>
</template>

<script setup>

import { reactive, ref } from 'vue';
import Contact from './components/Contact.vue';
import AddContact from './components/AddContact.vue';

const contactOwner = "SDG's-Owner";

const contactOwner1 = "5A 5102 SDG";

const ownerName = ref("LEARN & CODE");

// const contacts = reactive([{ "id": 1, "ownerName": ownerName.value, "name": "Ashu Joshi", "email": "ashu.joshi@example.com", "phone": "+91-9876543210", "address": "Bengaluru, Karnataka, India", "role": "Software Engineer", "isFavorite": false }, { "id": 2, "ownerName": ownerName.value, "name": "Nikita Sharma", "email": "nikita.sharma@example.com", "phone": "+91-9123456780", "address": "Pune, Maharashtra, India", "role": "Frontend Developer", "isFavorite": true }, { "id": 3, "ownerName": ownerName.value, "name": "Rohan Mehta", "email": "rohan.mehta@example.com", "phone": "+91-9988776655", "address": "Gurgaon, Haryana, India", "role": "UI/UX Designer", "isFavorite": false }, { "id": 4, "ownerName": ownerName.value, "name": "Priya Das", "email": "priya.das@example.com", "phone": "+91-9090909090", "address": "Kolkata, West Bengal, India", "role": "QA Engineer", "isFavorite": true }, { "id": 5, "ownerName": ownerName.value, "name": "Aman Kapoor", "email": "aman.kapoor@example.com", "phone": "+91-8000000001", "address": "Delhi, India", "role": "DevOps Engineer", "isFavorite": true }]);

const contacts = reactive([{ "id": 1, "ownerName": ownerName, "name": "Ashu Joshi", "email": "ashu.joshi@example.com", "phone": 9876543210, "address": "Bengaluru, Karnataka, India", "role": "Software Engineer", "isFavorite": false }, { "id": 2, "ownerName": ownerName, "name": "Nikita Sharma", "email": "nikita.sharma@example.com", "phone": 9123456780, "address": "Pune, Maharashtra, India", "role": "Frontend Developer", "isFavorite": true }, { "id": 3, "ownerName": ownerName, "name": "Rohan Mehta", "email": "rohan.mehta@example.com", "phone": 9988776655, "address": "Gurgaon, Haryana, India", "role": "UI/UX Designer", "isFavorite": false }, { "id": 4, "ownerName": ownerName, "name": "Priya Das", "email": "priya.das@example.com", "phone": 9090909090, "address": "Kolkata, West Bengal, India", "role": "QA Engineer", "isFavorite": true }, { "id": 5, "ownerName": ownerName, "name": "Aman Kapoor", "email": "aman.kapoor@example.com", "phone": 8000000001, "address": "Delhi, India", "role": "DevOps Engineer", "isFavorite": true }]);

/**
 * Function to handle the favorite status update from the child component
 * @param {boolean} isFavoriteFrorChildComponent - The favorite status from the child component
 * @returns {boolean} - The updated favorite status
 */

// function onUpdateFavorite(isFavoriteFrorChildComponent) {
//   return !isFavoriteFrorChildComponent; // Toggle the favorite status
// }

/*
 * Function to handle the favorite status update from the child component
 * @param {Array} oldValuesFromChildComponent - The array of values from the child component
 * @param {string} phoneNumberFromParentComponent - The phone number passed from the parent component
 * @returns {boolean} - The updated favorite status
 */
// function onUpdateFavorite(oldValuesFromChildComponent, phoneNumberFromParentComponent) {
//   console.log("Old Values from Child Component: ", oldValuesFromChildComponent);
//   console.log("Phone Number from Parent Component: ", phoneNumberFromParentComponent);
//   return !oldValuesFromChildComponent[0]; // Toggle the favorite status
// }

/**
 * Function to handle the favorite status update from the child component
 * @param {Array} oldValuesFromChildComponent - The array of values from the child component
 * @param {string} phoneNumberFromParentComponent - The phone number passed from the parent component
 * @returns {boolean} - The updated favorite status
 */
function onUpdateFavorite(oldValuesFromChildComponent, phoneNumberFromParentComponent) {
  console.log("Old Values from Child Component: ", oldValuesFromChildComponent);
  console.log("Phone Number from Parent Component: ", phoneNumberFromParentComponent);
  return !oldValuesFromChildComponent.isFavorite; // Toggle the favorite status
}

function onAddContact(contact) {
  contacts.push(contact);
}

</script>

<!-- v-bind:phone="9856985698" or :phone="9856985698" -> if Number -->
<!-- v-bind:ownername=contactOwner1 or :ownername=contactOwner -> Passing value from script to component -->
