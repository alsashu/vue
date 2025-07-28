<template>
  <div class="bg-info rounded p-4 pb-4 m-2">
    <div class="row">
      <div class="col-6">
        <h3>Id: {{ id }}</h3>
        <p>Name: {{ name }}</p>
        <p>Email: {{ email }}</p>
        <p>Phone: {{ phone }}</p>
        <p>Address: {{ address }}</p>
        <p>Role: {{ role }}</p>
      </div>
      <div class="col-3">
        <!-- <p>IsFavorite: {{ isFavorite }}</p> -->
        <button @click="toggleFavorite()" :class="[isFavorite ? 'btn btn-warning' : 'btn btn-success']">
          {{ isFavorite ? 'Remove From' : 'Add To' }} Favorites
        </button>
      </div>
    </div>

    <!-- <div class="row">
      <div class="col-6">
        <h3>Id: {{ id }}</h3>
        <p>Name: {{ name }}</p>
        <p>Email: {{ email }}</p>
        <p>Phone: {{ phone }}</p>
        <p>Address: {{ address }}</p>
        <p>Role: {{ role }}</p>
      </div>
      <div class="col-3">
          <p>INLINE EMIT component communication</p>
        <button @click="emit('update-favorite', { isFavorite: props.isFavorite, id: props.id, name: props.name })"
          :class="[isFavorite ? 'btn btn-warning' : 'btn btn-success']">
          {{ isFavorite ? 'Remove From' : 'Add To' }} Favorites INLINE EMIT
        </button>
      </div>
    </div> -->
    <span class="float-end small">*this contact belongs to: {{ ownername }}</span>

  </div>
</template>

<script setup>


/**
 *  Passing props
 *  */
// const props = defineProps(["name", "phone", "ownername"]);

/**
 * Validating props
 * /
// const props = defineProps({ name: String, phone: Number, ownername: String });

/**
 * PROPS AND LOCAL VARIABLE component communication
 */

// const props = defineProps({
//   name: { type: String, required: true },
//   phone: Number,
//   ownername: String,
//   email: { type: String, required: false, default: "-n/a-" }
// });

/**
 * LIST OF CONTACT component communication
 */

// const props = defineProps({
//   id: Number,
//   name: { type: String, required: true },
//   phone: Number,
//   email: { type: String, required: false, default: "-n/a-" },
//   address: String,
//   role: String,
//   ownername: String,
//   isFavorite: Boolean
// });

/**
 * PASSING DYNAMIC PROP BINDING component communication
 */


import { defineEmits } from 'vue';

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

/**
* EMITS IN ACTION component communication
*/

const emit = defineEmits(['update-favorite']);

/**
 * DYNAMICALLY CHANGE CLASS AND BUTTON TEXT component communication
 */

// function toggleFavorite() {
//   // Emit an event to the parent component to update the favorite status
//   emit('update-favorite');
// }

/**
 * PASSING PARAMETER IN EMITS component communication
 */

// function toggleFavorite() {
//   // Emit an event to the parent component to update the favorite status
//   emit('update-favorite', props.isFavorite);
// }

/**
 * PASS ARRAY IN EMIT component communication
 */

// function toggleFavorite() {
//   // Emit an event to the parent component to update the favorite status
//   emit('update-favorite', [props.isFavorite, props.id, props.name, props.phone, props.email, props.address, props.role, props.ownername]);
// }

/**
 * PASSING OBJECTS IN EMIT component communication
 */

function toggleFavorite() {
  // Emit an event to the parent component to update the favorite status
  emit('update-favorite', { isFavorite: props.isFavorite, id: props.id, name: props.name, phone: props.phone, email: props.email, address: props.address, role: props.role, ownername: props.ownername });
}

/**
 * INLINE EMIT component communication
 */

/**
 * ADD NEW CONTACT COMPONENT
 */

</script>