<template>
  <div class="rail-canvas-container position-relative h-100">
    <!-- Canvas Toolbar -->
    <div class="canvas-toolbar d-flex align-items-center justify-content-between p-2 border-bottom bg-light">
      <div class="d-flex align-items-center gap-2">
        <button class="btn btn-outline-primary btn-sm" @click="zoomIn" :disabled="zoom >= maxZoom">
          <i class="bi bi-zoom-in"></i>
        </button>
        <button class="btn btn-outline-primary btn-sm" @click="zoomOut" :disabled="zoom <= minZoom">
          <i class="bi bi-zoom-out"></i>
        </button>
        <span class="text-muted small">{{ Math.round(zoom * 100) }}%</span>
        <button class="btn btn-outline-secondary btn-sm" @click="resetView">
          <i class="bi bi-arrows-fullscreen"></i> Reset
        </button>
      </div>

      <div class="d-flex align-items-center gap-2">
        <div class="form-check form-switch">
          <input class="form-check-input" type="checkbox" id="gridToggle" v-model="showGrid">
          <label class="form-check-label small" for="gridToggle">Grid</label>
        </div>
        <div class="form-check form-switch">
          <input class="form-check-input" type="checkbox" id="snapToggle" v-model="snapToGrid">
          <label class="form-check-label small" for="snapToggle">Snap</label>
        </div>
      </div>
    </div>

    <!-- Main Canvas -->
    <div ref="canvasContainer" class="canvas-wrapper position-relative flex-grow-1" @drop="handleDrop" @dragover.prevent
      @dragenter.prevent>
      <v-stage ref="stage" :config="stageConfig" @mousedown="handleStageMouseDown" @mousemove="handleStageMouseMove"
        @mouseup="handleStageMouseUp" @wheel="handleWheel">
        <!-- Grid Layer -->
        <v-layer ref="gridLayer" v-if="showGrid">
          <v-line v-for="line in gridLines" :key="line.id" :config="line" />
        </v-layer>

        <!-- Components Layer -->
        <v-layer ref="componentsLayer">
          <rail-component v-for="component in visibleComponents" :key="component.id" :component="component"
            :is-selected="selectedComponent?.id === component.id" @select="selectComponent" @update="updateComponent"
            @delete="deleteComponent" />
        </v-layer>

        <!-- Selection Layer -->
        <v-layer ref="selectionLayer">
          <v-rect v-if="selectionRect" :config="selectionRect" />
          <v-transformer ref="transformer" v-if="selectedComponent" />
        </v-layer>
      </v-stage>

      <!-- Loading Overlay -->
      <div v-if="isLoading"
        class="position-absolute top-0 start-0 w-100 h-100 d-flex align-items-center justify-content-center bg-white bg-opacity-75"
        style="z-index: 1000;">
        <div class="text-center">
          <div class="spinner-border text-primary" role="status">
            <span class="visually-hidden">Loading...</span>
          </div>
          <p class="mt-2 text-muted">Loading canvas...</p>
        </div>
      </div>
    </div>

    <!-- Component Properties Panel -->
    <component-properties v-if="selectedComponent" :component="selectedComponent" @update="updateComponent"
      @close="selectedComponent = null" />
  </div>
</template>

<script setup>
import { ref, computed, onMounted, watch, nextTick } from 'vue'
import { useDesignStore } from '@stores/designStore'
import RailComponent from '@components/molecules/RailComponent.vue'
import ComponentProperties from '@components/molecules/ComponentProperties.vue'
import VueKonva from 'vue-konva'

const props = defineProps({
  module: {
    type: String,
    default: 'track-editor'
  }
})

const emit = defineEmits(['component-added', 'component-updated', 'component-deleted'])

// Stores
const designStore = useDesignStore()

// Template refs
const canvasContainer = ref(null)
const stage = ref(null)
const transformer = ref(null)
const gridLayer = ref(null)
const componentsLayer = ref(null)
const selectionLayer = ref(null)

// Canvas state
const isLoading = ref(false)
const zoom = ref(1)
const minZoom = ref(0.1)
const maxZoom = ref(5)
const showGrid = ref(true)
const snapToGrid = ref(true)
const gridSize = ref(20)

// Stage configuration
const stageConfig = ref({
  width: 800,
  height: 600,
  draggable: true,
  scaleX: 1,
  scaleY: 1
})

// Selection state
const selectedComponent = ref(null)
const selectionRect = ref(null)
const isSelecting = ref(false)
const selectionStart = ref({ x: 0, y: 0 })

// Computed properties
const visibleComponents = computed(() => {
  const currentSeg = designStore.currentSegment
  if (!currentSeg) return []

  return currentSeg.components
    .map(id => designStore.components[id])
    .filter(Boolean)
})

const gridLines = computed(() => {
  if (!showGrid.value) return []

  const lines = []
  const { width, height } = stageConfig.value
  const size = gridSize.value

  // Vertical lines
  for (let i = 0; i <= width; i += size) {
    lines.push({
      id: `v-${i}`,
      points: [i, 0, i, height],
      stroke: '#e0e0e0',
      strokeWidth: 1
    })
  }

  // Horizontal lines
  for (let i = 0; i <= height; i += size) {
    lines.push({
      id: `h-${i}`,
      points: [0, i, width, i],
      stroke: '#e0e0e0',
      strokeWidth: 1
    })
  }

  return lines
})

// Methods
const updateCanvasSize = () => {
  if (!canvasContainer.value) return

  const rect = canvasContainer.value.getBoundingClientRect()
  stageConfig.value.width = rect.width
  stageConfig.value.height = rect.height
}

const zoomIn = () => {
  if (zoom.value < maxZoom.value) {
    zoom.value = Math.min(zoom.value * 1.2, maxZoom.value)
    updateStageScale()
  }
}

const zoomOut = () => {
  if (zoom.value > minZoom.value) {
    zoom.value = Math.max(zoom.value / 1.2, minZoom.value)
    updateStageScale()
  }
}

const resetView = () => {
  zoom.value = 1
  stageConfig.value.x = 0
  stageConfig.value.y = 0
  updateStageScale()
}

const updateStageScale = () => {
  if (stage.value) {
    const stageNode = stage.value.getNode()
    stageNode.scale({ x: zoom.value, y: zoom.value })
    stageNode.batchDraw()
  }
}

const handleWheel = (e) => {
  e.evt.preventDefault()

  const scaleBy = 1.1
  const stage = e.target.getStage()
  const oldScale = stage.scaleX()
  const pointer = stage.getPointerPosition()

  const newScale = e.evt.deltaY > 0 ? oldScale / scaleBy : oldScale * scaleBy
  const clampedScale = Math.max(minZoom.value, Math.min(maxZoom.value, newScale))

  zoom.value = clampedScale

  const mousePointTo = {
    x: (pointer.x - stage.x()) / oldScale,
    y: (pointer.y - stage.y()) / oldScale
  }

  const newPos = {
    x: pointer.x - mousePointTo.x * clampedScale,
    y: pointer.y - mousePointTo.y * clampedScale
  }

  stage.scale({ x: clampedScale, y: clampedScale })
  stage.position(newPos)
  stage.batchDraw()
}

const handleStageMouseDown = (e) => {
  // Check if clicked on empty area
  if (e.target === e.target.getStage()) {
    selectedComponent.value = null
    updateTransformer()

    // Start selection rectangle
    const pos = e.target.getStage().getPointerPosition()
    selectionStart.value = pos
    isSelecting.value = true
  }
}

const handleStageMouseMove = (e) => {
  if (!isSelecting.value) return

  const stage = e.target.getStage()
  const pos = stage.getPointerPosition()

  selectionRect.value = {
    x: Math.min(selectionStart.value.x, pos.x),
    y: Math.min(selectionStart.value.y, pos.y),
    width: Math.abs(pos.x - selectionStart.value.x),
    height: Math.abs(pos.y - selectionStart.value.y),
    fill: 'rgba(0, 123, 255, 0.1)',
    stroke: '#007bff',
    strokeWidth: 1
  }
}

const handleStageMouseUp = () => {
  isSelecting.value = false
  selectionRect.value = null
}

const handleDrop = (e) => {
  e.preventDefault()

  const componentData = JSON.parse(e.dataTransfer.getData('application/json'))
  const rect = canvasContainer.value.getBoundingClientRect()

  let position = {
    x: e.clientX - rect.left,
    y: e.clientY - rect.top
  }

  // Snap to grid if enabled
  if (snapToGrid.value) {
    position.x = Math.round(position.x / gridSize.value) * gridSize.value
    position.y = Math.round(position.y / gridSize.value) * gridSize.value
  }

  // Create new component
  const component = designStore.addComponent({
    ...componentData,
    position,
    module: props.module
  })

  emit('component-added', component)
}

const selectComponent = (component) => {
  selectedComponent.value = component
  designStore.selectComponent(component)
  updateTransformer()
}

const updateComponent = (componentId, updates) => {
  designStore.updateComponent(componentId, updates)
  emit('component-updated', { componentId, updates })
}

const deleteComponent = (componentId) => {
  designStore.removeComponent(componentId)
  if (selectedComponent.value?.id === componentId) {
    selectedComponent.value = null
  }
  emit('component-deleted', componentId)
}

const updateTransformer = async () => {
  await nextTick()

  if (transformer.value) {
    const transformerNode = transformer.value.getNode()

    if (selectedComponent.value) {
      // Find the component node to attach transformer
      const componentNode = stage.value.getNode().findOne(`#${selectedComponent.value.id}`)
      if (componentNode) {
        transformerNode.nodes([componentNode])
      }
    } else {
      transformerNode.nodes([])
    }

    transformerNode.getLayer().batchDraw()
  }
}

// Lifecycle
onMounted(() => {
  updateCanvasSize()
  window.addEventListener('resize', updateCanvasSize)
})

// Watchers
watch(() => designStore.selectedComponent, (newComponent) => {
  selectedComponent.value = newComponent
  updateTransformer()
})

watch(() => designStore.activeSegment, () => {
  selectedComponent.value = null
  updateTransformer()
})
</script>

<style scoped>
.rail-canvas-container {
  background: #f8f9fa;
}

.canvas-wrapper {
  overflow: hidden;
  background: white;
  background-image:
    linear-gradient(rgba(0, 0, 0, .1) 1px, transparent 1px),
    linear-gradient(90deg, rgba(0, 0, 0, .1) 1px, transparent 1px);
  background-size: 20px 20px;
}

.canvas-toolbar {
  min-height: 48px;
  border-bottom: 1px solid #dee2e6;
}

.form-check-input:checked {
  background-color: #0d6efd;
  border-color: #0d6efd;
}
</style>