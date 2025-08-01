<!-- App.vue or TrackEditor.vue -->
<template>
  <div class="track-editor">
    <DrawingCanvas />
  </div>
</template>

<script setup>
import { onMounted } from 'vue'
import DrawingCanvas from '@/components/DrawingCanvas.vue'
import { useTrackStore } from '@/stores/trackStore'

const trackStore = useTrackStore()

// Initialize with some sample data (optional)
onMounted(() => {
  // You can load saved tracks/components here
  // trackStore.loadFromStorage()
})
</script>

<style>
.track-editor {
  width: 100vw;
  height: 100vh;
  overflow: hidden;
}

* {
  margin: 0;
  padding: 0;
  box-sizing: border-box;
}
</style>