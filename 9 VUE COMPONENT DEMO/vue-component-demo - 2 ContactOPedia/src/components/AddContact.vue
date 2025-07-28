<template>
  <div class="bg-warning text pt-3">
    <div class="container border rounded p-2">
      <div class="text-center text-white">Add New Contact</div>
      <form @submit.prevent="addContact">
        <div class="row">
          <div class="col-4">
            <input type="text" v-model="contact.name" class="form-control" placeholder="Name">
          </div>
          <div class="col-4">
            <input type="text" v-model.number="contact.phone" class="form-control" placeholder="Phone">
          </div>
          <div class="col-4">
            <input type="email" v-model="contact.email" class="form-control" placeholder="Email">
          </div>
          <div class="col-6 offset-3 p-2">
            <button type="submit" class="btn btn-primary w-100">Add Contact</button>
          </div>
        </div>
      </form>
    </div>
  </div>
</template>

<script setup>
import { reactive, defineProps } from 'vue';

const props = defineProps({ onAddContact: Function });

const contact = reactive({ name: "", phone: "", email: "" });

/**
 * Function to handle adding a new contact
 * Emits the 'add-contact' event with the contact details
 */
function addContact() {

  const randomNumber = Math.floor(Math.random() * 100) + 1;

  props.onAddContact({
    name: contact.name,
    phone: contact.phone,
    email: contact.email,
    ownerName: "SDG's-Owner",
    id: randomNumber,
    address: "SDG Bangalore",
    role: "SSE",
    isFavorite: false
  });

  console.log(contact);

  contact.name = "";
  contact.phone = "";
  contact.email = "";
  contact.id = null;
  contact.address = "";
  contact.role = "";
  contact.isFavorite = false;
}
</script>