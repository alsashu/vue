<template>
  <div class="drawing-canvas-container">
    <!-- Toolbar -->
    <div class="toolbar">
      <button :class="{ active: trackStore.drawingMode === 'select' }" @click="switchToSelectMode">
        Select
      </button>
      <button :class="{ active: trackStore.drawingMode === 'polyline' }" @click="switchToPolylineMode">
        Draw Track
      </button>
      <button @click="trackStore.clearTracks()">Clear All</button>

      <!-- Component Tools -->
      <div class="component-tools">
        <button :class="{ active: currentComponentTool === 'signal' }" @click="setComponentTool('signal')">
          Signal
        </button>
        <button :class="{ active: currentComponentTool === 'switch' }" @click="setComponentTool('switch')">
          Switch
        </button>
        <button :class="{ active: currentComponentTool === 'station' }" @click="setComponentTool('station')">
          Station
        </button>
        <button :class="{ active: currentComponentTool === 'platform' }" @click="setComponentTool('platform')">
          Platform
        </button>
      </div>

      <!-- Status Info -->
      <div class="status-info">
        <span v-if="trackStore.drawingMode === 'polyline' && polylinePoints.length > 0">
          Points: {{ polylinePoints.length }} | Press Enter to finish, Escape to cancel
        </span>
        <span v-else-if="currentComponentTool">
          Click near a track to place {{ currentComponentTool }}
        </span>
        <span v-else>
          Mode: {{ trackStore.drawingMode }}
        </span>
      </div>
    </div>

    <!-- Canvas -->
    <v-stage ref="stage" :config="stageConfig" @mousedown="handleMouseDown" @mousemove="handleMouseMove"
      @mouseup="handleMouseUp" @click="handleStageClick">
      <!-- Background Layer -->
      <v-layer ref="backgroundLayer">
        <!-- Grid -->
        <template v-if="showGrid">
          <v-line v-for="i in gridLines.vertical" :key="`v-${i}`" :config="{
            points: [i, 0, i, stageConfig.height],
            stroke: '#ddd',
            strokeWidth: 0.5
          }" />
          <v-line v-for="i in gridLines.horizontal" :key="`h-${i}`" :config="{
            points: [0, i, stageConfig.width, i],
            stroke: '#ddd',
            strokeWidth: 0.5
          }" />
        </template>
      </v-layer>

      <!-- Track Layer -->
      <v-layer ref="trackLayer">
        <!-- Existing Tracks -->
        <v-line v-for="track in trackStore.tracks" :key="track.id" :config="{
          points: track.points,
          stroke: track.color,
          strokeWidth: track.strokeWidth,
          lineCap: 'round',
          lineJoin: 'round'
        }" @click="selectTrack(track)" />

        <!-- Current Drawing Track (preview) -->
        <v-line v-if="trackStore.currentTrack && trackStore.currentTrack.points.length >= 2" :config="{
          points: trackStore.currentTrack.points,
          stroke: trackStore.currentTrack.color || '#333333',
          strokeWidth: trackStore.currentTrack.strokeWidth || 4,
          lineCap: 'round',
          lineJoin: 'round',
          opacity: 0.8,
          dash: [5, 5]
        }" />

        <!-- Polyline Points -->
        <template v-if="trackStore.drawingMode === 'polyline' && polylinePoints.length > 0">
          <v-circle v-for="(point, index) in polylinePoints" :key="`poly-${index}`" :config="{
            x: point.x,
            y: point.y,
            radius: 4,
            fill: '#ff6b6b',
            stroke: '#fff',
            strokeWidth: 2
          }" />
        </template>

        <!-- Track Selection Indicators -->
        <template v-if="trackStore.selectedTrack">
          <v-circle v-for="(point, index) in getTrackControlPoints(trackStore.selectedTrack)" :key="`control-${index}`"
            :config="{
              x: point.x,
              y: point.y,
              radius: 6,
              fill: '#4ecdc4',
              stroke: '#fff',
              strokeWidth: 2
            }" @dragstart="startDragPoint(index)" @dragend="endDragPoint(index, $event)" draggable />
        </template>
      </v-layer>

      <!-- Component Layer -->
      <v-layer ref="componentLayer">
        <RailComponent v-for="component in trackStore.components" :key="component.id" :component="component"
          :is-selected="component.id === trackStore.selectedComponent?.id" @select="selectComponent"
          @update="updateComponent" />

        <!-- Snap Preview -->
        <v-circle v-if="snapPreview" :config="{
          x: snapPreview.x,
          y: snapPreview.y,
          radius: 8,
          fill: 'transparent',
          stroke: '#00ff00',
          strokeWidth: 2,
          dash: [4, 4]
        }" />
      </v-layer>

      <!-- UI Layer -->
      <v-layer ref="uiLayer">
        <!-- Polyline preview line (from last point to mouse) -->
        <v-line v-if="trackStore.drawingMode === 'polyline' && polylinePoints.length > 0 && mousePosition" :config="{
          points: [
            polylinePoints[polylinePoints.length - 1].x,
            polylinePoints[polylinePoints.length - 1].y,
            mousePosition.x,
            mousePosition.y
          ],
          stroke: '#999',
          strokeWidth: 2,
          dash: [3, 3],
          opacity: 0.6
        }" />
      </v-layer>
    </v-stage>

    <!-- Info Panel -->
    <div class="info-panel">
      <div>Mode: {{ trackStore.drawingMode }}</div>
      <div>Tracks: {{ trackStore.tracks.length }}</div>
      <div>Components: {{ trackStore.components.length }}</div>
      <div v-if="mousePosition">
        Mouse: {{ mousePosition.x.toFixed(0) }}, {{ mousePosition.y.toFixed(0) }}
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, onUnmounted } from 'vue'
import { useTrackStore } from '@/stores/trackStore'
import RailComponent from './RailComponent.vue'

const trackStore = useTrackStore()

// Refs
const stage = ref(null)
const backgroundLayer = ref(null)
const trackLayer = ref(null)
const componentLayer = ref(null)
const uiLayer = ref(null)

// State
const stageConfig = ref({
  width: 1200,
  height: 800
})

const showGrid = ref(true)
const gridSize = ref(20)
const isMouseDown = ref(false)
const mousePosition = ref(null)
const polylinePoints = ref([])
const snapPreview = ref(null)
const currentComponentTool = ref(null)

// Computed
const gridLines = computed(() => {
  const vertical = []
  const horizontal = []

  for (let i = 0; i <= stageConfig.value.width; i += gridSize.value) {
    vertical.push(i)
  }

  for (let i = 0; i <= stageConfig.value.height; i += gridSize.value) {
    horizontal.push(i)
  }

  return { vertical, horizontal }
})

// Component tool management
const switchToSelectMode = () => {
  // Finish any current polyline before switching
  if (trackStore.drawingMode === 'polyline' && polylinePoints.value.length > 0) {
    finishPolyline()
  }
  trackStore.setDrawingMode('select')
  currentComponentTool.value = null
}

const switchToPolylineMode = () => {
  // Clear any component tool
  currentComponentTool.value = null
  trackStore.setDrawingMode('polyline')
  // Reset polyline state
  polylinePoints.value = []
  trackStore.currentTrack = null
}

const setComponentTool = (toolType) => {
  // Finish any current polyline before switching to component mode
  if (trackStore.drawingMode === 'polyline' && polylinePoints.value.length > 0) {
    finishPolyline()
  }

  // Toggle component tool
  if (currentComponentTool.value === toolType) {
    currentComponentTool.value = null
    trackStore.setDrawingMode('select')
  } else {
    currentComponentTool.value = toolType
    trackStore.setDrawingMode('component')
  }
}

// Mouse event handlers
const handleMouseDown = (e) => {
  // Only handle freehand drawing (removed as requested)
  isMouseDown.value = true
}

const handleMouseMove = (e) => {
  const stage = e.target.getStage()
  const pointerPosition = stage.getPointerPosition()
  mousePosition.value = pointerPosition

  // Update snap preview for component placement
  if (trackStore.drawingMode === 'component' && currentComponentTool.value) {
    updateSnapPreview(pointerPosition)
  }
}

const handleMouseUp = (e) => {
  isMouseDown.value = false
}

const handleStageClick = (e) => {
  // Prevent handling clicks on components or tracks
  if (e.target !== e.target.getStage()) {
    return
  }

  const stage = e.target.getStage()
  const pointerPosition = stage.getPointerPosition()

  if (trackStore.drawingMode === 'polyline') {
    addPolylinePoint(pointerPosition)
  } else if (trackStore.drawingMode === 'component' && currentComponentTool.value) {
    placeComponent(pointerPosition)
  } else if (trackStore.drawingMode === 'select') {
    // Clear selections if clicking on empty space
    trackStore.selectedTrack = null
    trackStore.selectedComponent = null
  }
}

// Remove freehand drawing methods - only keeping polyline
// (Freehand drawing methods removed as requested)

// Polyline drawing (straight lines only)
const addPolylinePoint = (pointerPosition) => {
  if (polylinePoints.value.length === 0) {
    // Start new polyline
    polylinePoints.value = [pointerPosition]
    trackStore.currentTrack = {
      points: [pointerPosition.x, pointerPosition.y],
      color: '#333333',
      strokeWidth: 4
    }
  } else {
    // Add point to current polyline - create straight line segments
    const lastPoint = polylinePoints.value[polylinePoints.value.length - 1]
    polylinePoints.value.push(pointerPosition)

    // Add the new point to create a straight line
    trackStore.currentTrack.points.push(pointerPosition.x, pointerPosition.y)
  }
}

const finishPolyline = () => {
  if (trackStore.currentTrack && trackStore.currentTrack.points.length >= 4) {
    // Add the completed track to the store
    trackStore.addTrack(trackStore.currentTrack)
  }

  // Reset polyline state
  polylinePoints.value = []
  trackStore.currentTrack = null
}

const cancelPolyline = () => {
  // Just reset without saving
  polylinePoints.value = []
  trackStore.currentTrack = null
}

// Track selection and editing
const selectTrack = (track) => {
  if (trackStore.drawingMode === 'select') {
    trackStore.selectedTrack = track
    trackStore.selectedComponent = null
  }
}

const getTrackControlPoints = (track) => {
  const points = []
  for (let i = 0; i < track.points.length; i += 2) {
    points.push({
      x: track.points[i],
      y: track.points[i + 1]
    })
  }
  return points
}

const startDragPoint = (pointIndex) => {
  // Store original position for undo functionality
}

const endDragPoint = (pointIndex, e) => {
  const node = e.target
  const newX = node.x()
  const newY = node.y()

  if (trackStore.selectedTrack) {
    const points = [...trackStore.selectedTrack.points]
    points[pointIndex * 2] = newX
    points[pointIndex * 2 + 1] = newY

    trackStore.updateTrack(trackStore.selectedTrack.id, { points })
  }
}

// Component placement
const updateSnapPreview = (pointerPosition) => {
  const nearestPoint = trackStore.findNearestTrackPoint(pointerPosition.x, pointerPosition.y)
  snapPreview.value = nearestPoint ? nearestPoint.point : null
}

const placeComponent = (pointerPosition) => {
  if (!currentComponentTool.value) return

  let position = pointerPosition

  // Snap to nearest track if close enough
  const nearestPoint = trackStore.findNearestTrackPoint(pointerPosition.x, pointerPosition.y)
  if (nearestPoint) {
    position = nearestPoint.point
  }

  const component = {
    type: currentComponentTool.value,
    position,
    name: `${currentComponentTool.value.charAt(0).toUpperCase() + currentComponentTool.value.slice(1)} ${trackStore.components.length + 1}`
  }

  trackStore.addComponent(component)

  // Don't reset tool - allow placing multiple components
  // User can click Select to exit component mode
}

// Component management
const selectComponent = (component) => {
  trackStore.selectedComponent = component
  trackStore.selectedTrack = null
}

const updateComponent = (componentId, updates) => {
  trackStore.updateComponent(componentId, updates)
}

// Keyboard shortcuts
const handleKeyDown = (e) => {
  if (e.key === 'Escape') {
    if (trackStore.drawingMode === 'polyline') {
      cancelPolyline()
    }
    // Reset to select mode
    switchToSelectMode()
  } else if (e.key === 'Enter' && trackStore.drawingMode === 'polyline') {
    finishPolyline()
    // Stay in polyline mode for drawing more lines
  } else if (e.key === 'Delete' || e.key === 'Backspace') {
    if (trackStore.selectedTrack) {
      trackStore.removeTrack(trackStore.selectedTrack.id)
      trackStore.selectedTrack = null
    } else if (trackStore.selectedComponent) {
      trackStore.removeComponent(trackStore.selectedComponent.id)
      trackStore.selectedComponent = null
    }
  }
}

// Lifecycle
onMounted(() => {
  document.addEventListener('keydown', handleKeyDown)

  // Resize stage to fit container
  const container = document.querySelector('.drawing-canvas-container')
  if (container) {
    const resizeObserver = new ResizeObserver(() => {
      stageConfig.value.width = container.clientWidth
      stageConfig.value.height = container.clientHeight - 100 // Account for toolbar
    })
    resizeObserver.observe(container)
  }
})

onUnmounted(() => {
  document.removeEventListener('keydown', handleKeyDown)
})
</script>

<style scoped>
.drawing-canvas-container {
  width: 100%;
  height: 100vh;
  display: flex;
  flex-direction: column;
  background: #f5f5f5;
}

.toolbar {
  display: flex;
  gap: 10px;
  padding: 10px;
  background: white;
  border-bottom: 1px solid #ddd;
  flex-wrap: wrap;
  align-items: center;
}

.toolbar button {
  padding: 8px 16px;
  border: 1px solid #ddd;
  background: white;
  border-radius: 4px;
  cursor: pointer;
  transition: all 0.2s;
}

.toolbar button:hover {
  background: #f0f0f0;
}

.toolbar button.active {
  background: #007bff;
  color: white;
  border-color: #007bff;
}

.component-tools {
  display: flex;
  gap: 5px;
  margin-left: 20px;
  padding-left: 20px;
  border-left: 1px solid #ddd;
}

.status-info {
  margin-left: auto;
  font-size: 12px;
  color: #666;
  padding: 8px 12px;
  background: #f8f9fa;
  border-radius: 4px;
}

.component-tools button.active {
  background: #28a745;
  color: white;
  border-color: #28a745;
}

.info-panel {
  position: absolute;
  top: 70px;
  right: 10px;
  background: rgba(255, 255, 255, 0.9);
  padding: 10px;
  border-radius: 4px;
  font-size: 12px;
  border: 1px solid #ddd;
}

.info-panel div {
  margin-bottom: 5px;
}
</style>