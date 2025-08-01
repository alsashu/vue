<template>
  <div class="drawing-canvas-container">
    <!-- Toolbar -->
    <div class="toolbar">
      <!-- Drawing Tools -->
      <div class="tool-group">
        <button :class="{ active: trackStore.drawingMode === 'select' }" @click="switchToSelectMode">
          Select
        </button>
        <button :class="{ active: trackStore.drawingMode === 'polyline' }" @click="switchToPolylineMode">
          Draw Track
        </button>
        <button @click="trackStore.clearTracks()">Clear All</button>
      </div>

      <!-- Component Tools -->
      <div class="tool-group component-tools">
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

      <!-- Export Tools -->
      <div class="tool-group export-tools">
        <div class="dropdown">
          <button class="dropdown-toggle" @click="toggleExportDropdown">
            Export ▼
          </button>
          <div v-if="showExportDropdown" class="dropdown-menu">
            <button @click="exportSVG" :disabled="isExporting">
              <span v-if="isExporting && exportType === 'svg'">Exporting...</span>
              <span v-else>Export as SVG</span>
            </button>
            <button @click="exportPDF" :disabled="isExporting">
              <span v-if="isExporting && exportType === 'pdf'">Exporting...</span>
              <span v-else>Export as PDF</span>
            </button>
            <button @click="exportRailML" :disabled="isExporting">
              <span v-if="isExporting && exportType === 'railml'">Exporting...</span>
              <span v-else>Export as RailML JSON</span>
            </button>
            <hr class="dropdown-divider">
            <button @click="showExportPreview = true">
              Preview Export Data
            </button>
          </div>
        </div>
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

    <!-- Export Preview Modal -->
    <div v-if="showExportPreview" class="modal-overlay" @click="showExportPreview = false">
      <div class="modal-content" @click.stop>
        <div class="modal-header">
          <h3>Export Preview</h3>
          <button class="close-btn" @click="showExportPreview = false">&times;</button>
        </div>
        <div class="modal-body">
          <div class="preview-tabs">
            <button :class="{ active: previewTab === 'svg' }" @click="previewTab = 'svg'">SVG</button>
            <button :class="{ active: previewTab === 'railml' }" @click="previewTab = 'railml'">RailML JSON</button>
            <button :class="{ active: previewTab === 'stats' }" @click="previewTab = 'stats'">Statistics</button>
          </div>

          <div class="preview-content">
            <!-- SVG Preview -->
            <div v-if="previewTab === 'svg'" class="preview-section">
              <h4>SVG Export Preview</h4>
              <div class="code-preview" v-html="svgPreview"></div>
              <button @click="exportSVG" class="export-btn">Download SVG</button>
            </div>

            <!-- RailML Preview -->
            <div v-if="previewTab === 'railml'" class="preview-section">
              <h4>RailML JSON Export Preview</h4>
              <pre class="code-preview">{{ railmlPreview }}</pre>
              <button @click="exportRailML" class="export-btn">Download RailML JSON</button>
            </div>

            <!-- Statistics Preview -->
            <div v-if="previewTab === 'stats'" class="preview-section">
              <h4>Design Statistics</h4>
              <div class="stats-grid">
                <div class="stat-item">
                  <span class="stat-label">Total Tracks:</span>
                  <span class="stat-value">{{ trackStore.tracks.length }}</span>
                </div>
                <div class="stat-item">
                  <span class="stat-label">Total Track Length:</span>
                  <span class="stat-value">{{ totalTrackLength.toFixed(2) }} px</span>
                </div>
                <div class="stat-item">
                  <span class="stat-label">Components:</span>
                  <span class="stat-value">{{ trackStore.components.length }}</span>
                </div>
                <div class="stat-item">
                  <span class="stat-label">Signals:</span>
                  <span class="stat-value">{{ componentStats.signals }}</span>
                </div>
                <div class="stat-item">
                  <span class="stat-label">Switches:</span>
                  <span class="stat-value">{{ componentStats.switches }}</span>
                </div>
                <div class="stat-item">
                  <span class="stat-label">Stations:</span>
                  <span class="stat-value">{{ componentStats.stations }}</span>
                </div>
                <div class="stat-item">
                  <span class="stat-label">Platforms:</span>
                  <span class="stat-value">{{ componentStats.platforms }}</span>
                </div>
                <div class="stat-item">
                  <span class="stat-label">Canvas Size:</span>
                  <span class="stat-value">{{ stageConfig.width }}×{{ stageConfig.height }}</span>
                </div>
              </div>
            </div>
          </div>
        </div>
        <div class="modal-footer">
          <button @click="showExportPreview = false" class="btn-secondary">Close</button>
        </div>
      </div>
    </div>

    <!-- Export Progress Modal -->
    <div v-if="isExporting" class="modal-overlay">
      <div class="modal-content export-progress">
        <div class="progress-content">
          <div class="spinner"></div>
          <h3>Exporting {{ exportType.toUpperCase() }}...</h3>
          <p>Please wait while we generate your export file.</p>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, onUnmounted, watch } from 'vue'
import { useTrackStore } from '@/stores/trackStore'
import RailComponent from './RailComponent.vue'
import { ExportUtils } from '@/utils/exportUtils'

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

// Export state
const showExportDropdown = ref(false)
const showExportPreview = ref(false)
const isExporting = ref(false)
const exportType = ref('')
const previewTab = ref('stats')
const svgPreview = ref('')
const railmlPreview = ref('')

// Export utilities instance
let exportUtils = null

// Initialize export utils when stage is ready
watch(stage, (newStage) => {
  if (newStage) {
    exportUtils = new ExportUtils(trackStore, stage)
  }
})

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

const totalTrackLength = computed(() => {
  return trackStore.tracks.reduce((total, track) => {
    return total + calculateTrackLength(track.points)
  }, 0)
})

const componentStats = computed(() => {
  const stats = {
    signals: 0,
    switches: 0,
    stations: 0,
    platforms: 0
  }

  trackStore.components.forEach(component => {
    if (component.type in stats) {
      stats[component.type]++
    }
  })

  return stats
})

// Utility function to calculate track length
const calculateTrackLength = (points) => {
  let length = 0
  for (let i = 0; i < points.length - 2; i += 2) {
    const dx = points[i + 2] - points[i]
    const dy = points[i + 3] - points[i + 1]
    length += Math.sqrt(dx * dx + dy * dy)
  }
  return length
}

// Component tool management
const switchToSelectMode = () => {
  if (trackStore.drawingMode === 'polyline' && polylinePoints.value.length > 0) {
    finishPolyline()
  }
  trackStore.setDrawingMode('select')
  currentComponentTool.value = null
  showExportDropdown.value = false
}

const switchToPolylineMode = () => {
  currentComponentTool.value = null
  trackStore.setDrawingMode('polyline')
  polylinePoints.value = []
  trackStore.currentTrack = null
  showExportDropdown.value = false
}

const setComponentTool = (toolType) => {
  if (trackStore.drawingMode === 'polyline' && polylinePoints.value.length > 0) {
    finishPolyline()
  }

  if (currentComponentTool.value === toolType) {
    currentComponentTool.value = null
    trackStore.setDrawingMode('select')
  } else {
    currentComponentTool.value = toolType
    trackStore.setDrawingMode('component')
  }
  showExportDropdown.value = false
}

// Export functions
const toggleExportDropdown = () => {
  showExportDropdown.value = !showExportDropdown.value
}

const exportSVG = async () => {
  if (!exportUtils) return

  try {
    isExporting.value = true
    exportType.value = 'svg'
    showExportDropdown.value = false
    showExportPreview.value = false

    await exportUtils.downloadSVG(`railway-design-${Date.now()}.svg`)
  } catch (error) {
    console.error('Export failed:', error)
    alert('Export failed. Please try again.')
  } finally {
    isExporting.value = false
    exportType.value = ''
  }
}

const exportPDF = async () => {
  if (!exportUtils) return

  try {
    isExporting.value = true
    exportType.value = 'pdf'
    showExportDropdown.value = false
    showExportPreview.value = false

    const pdf = await exportUtils.exportToPDF()

    // Check if we got a proper PDF object or fallback
    if (pdf && typeof pdf.save === 'function') {
      pdf.save(`railway-design-${Date.now()}.pdf`)
    } else {
      throw new Error('PDF generation failed - unsupported browser or missing dependencies')
    }
  } catch (error) {
    console.error('PDF Export failed:', error)

    // Show user-friendly error with fallback options
    const errorMessage = error.message.includes('jsPDF') || error.message.includes('constructor')
      ? 'PDF export requires additional libraries. Try using SVG export instead, or enable JavaScript libraries in your browser settings.'
      : `PDF export failed: ${error.message}`

    // You could also show a modal here instead of alert
    if (confirm(`${errorMessage}\n\nWould you like to export as SVG instead?`)) {
      try {
        await exportSVG()
      } catch (svgError) {
        alert('SVG export also failed. Please try again or contact support.')
      }
    }
  } finally {
    isExporting.value = false
    exportType.value = ''
  }
}

const exportRailML = async () => {
  if (!exportUtils) return

  try {
    isExporting.value = true
    exportType.value = 'railml'
    showExportDropdown.value = false
    showExportPreview.value = false

    await exportUtils.downloadRailML(`railway-design-${Date.now()}.railml.json`)
  } catch (error) {
    console.error('Export failed:', error)
    alert('Export failed. Please try again.')
  } finally {
    isExporting.value = false
    exportType.value = ''
  }
}

// Generate preview data
const generatePreviews = async () => {
  if (!exportUtils) return

  try {
    // Generate SVG preview (truncated for display)
    const svgContent = await exportUtils.exportToSVG()
    svgPreview.value = svgContent.substring(0, 1000) + (svgContent.length > 1000 ? '...\n\n[Content truncated for preview]' : '')

    // Generate RailML preview (formatted)
    const railmlContent = exportUtils.exportToRailML()
    const parsed = JSON.parse(railmlContent)
    railmlPreview.value = JSON.stringify(parsed, null, 2).substring(0, 2000) +
      (railmlContent.length > 2000 ? '...\n\n[Content truncated for preview]' : '')
  } catch (error) {
    console.error('Preview generation failed:', error)
  }
}

// Watch for preview modal opening to generate previews
watch(showExportPreview, (isOpen) => {
  if (isOpen) {
    generatePreviews()
  }
})

// Mouse event handlers
const handleMouseDown = (e) => {
  isMouseDown.value = true
}

const handleMouseMove = (e) => {
  const stage = e.target.getStage()
  const pointerPosition = stage.getPointerPosition()
  mousePosition.value = pointerPosition

  if (trackStore.drawingMode === 'component' && currentComponentTool.value) {
    updateSnapPreview(pointerPosition)
  }
}

const handleMouseUp = (e) => {
  isMouseDown.value = false
}

const handleStageClick = (e) => {
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
    trackStore.selectedTrack = null
    trackStore.selectedComponent = null
  }

  // Close export dropdown when clicking on canvas
  showExportDropdown.value = false
}

// Polyline drawing
const addPolylinePoint = (pointerPosition) => {
  if (polylinePoints.value.length === 0) {
    polylinePoints.value = [pointerPosition]
    trackStore.currentTrack = {
      points: [pointerPosition.x, pointerPosition.y],
      color: '#333333',
      strokeWidth: 4
    }
  } else {
    const lastPoint = polylinePoints.value[polylinePoints.value.length - 1]
    polylinePoints.value.push(pointerPosition)
    trackStore.currentTrack.points.push(pointerPosition.x, pointerPosition.y)
  }
}

const finishPolyline = () => {
  if (trackStore.currentTrack && trackStore.currentTrack.points.length >= 4) {
    trackStore.addTrack(trackStore.currentTrack)
  }
  polylinePoints.value = []
  trackStore.currentTrack = null
}

const cancelPolyline = () => {
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
    switchToSelectMode()
    showExportDropdown.value = false
    showExportPreview.value = false
  } else if (e.key === 'Enter' && trackStore.drawingMode === 'polyline') {
    finishPolyline()
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

// Click outside handler for dropdowns
const handleClickOutside = (e) => {
  if (!e.target.closest('.dropdown')) {
    showExportDropdown.value = false
  }
}

// Lifecycle
onMounted(() => {
  document.addEventListener('keydown', handleKeyDown)
  document.addEventListener('click', handleClickOutside)

  const container = document.querySelector('.drawing-canvas-container')
  if (container) {
    const resizeObserver = new ResizeObserver(() => {
      stageConfig.value.width = container.clientWidth
      stageConfig.value.height = container.clientHeight - 100
    })
    resizeObserver.observe(container)
  }
})

onUnmounted(() => {
  document.removeEventListener('keydown', handleKeyDown)
  document.removeEventListener('click', handleClickOutside)
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
  gap: 15px;
  padding: 10px;
  background: white;
  border-bottom: 1px solid #ddd;
  flex-wrap: wrap;
  align-items: center;
}

.tool-group {
  display: flex;
  gap: 5px;
  padding-right: 15px;
  border-right: 1px solid #ddd;
}

.tool-group:last-child {
  border-right: none;
}

.toolbar button {
  padding: 8px 16px;
  border: 1px solid #ddd;
  background: white;
  border-radius: 4px;
  cursor: pointer;
  transition: all 0.2s;
  font-size: 14px;
}

.toolbar button:hover {
  background: #f0f0f0;
}

.toolbar button.active {
  background: #007bff;
  color: white;
  border-color: #007bff;
}

.toolbar button:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

.component-tools button.active {
  background: #28a745;
  color: white;
  border-color: #28a745;
}

.export-tools {
  margin-left: auto;
}

.dropdown {
  position: relative;
}

.dropdown-toggle {
  background: #6c757d !important;
  color: white !important;
  border-color: #6c757d !important;
}

.dropdown-toggle:hover {
  background: #5a6268 !important;
}

.dropdown-menu {
  position: absolute;
  top: 100%;
  right: 0;
  background: white;
  border: 1px solid #ddd;
  border-radius: 4px;
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
  min-width: 200px;
  z-index: 1000;
  animation: fadeIn 0.2s ease;
}

.dropdown-menu button {
  width: 100%;
  text-align: left;
  border: none;
  border-radius: 0;
  background: white;
  padding: 10px 15px;
}

.dropdown-menu button:hover {
  background: #f8f9fa;
}

.dropdown-divider {
  margin: 5px 0;
  border: none;
  border-top: 1px solid #ddd;
}

.status-info {
  font-size: 12px;
  color: #666;
  padding: 8px 12px;
  background: #f8f9fa;
  border-radius: 4px;
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

/* Modal Styles */
.modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.5);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 2000;
  animation: fadeIn 0.3s ease;
}

.modal-content {
  background: white;
  border-radius: 8px;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.2);
  max-width: 800px;
  max-height: 80vh;
  width: 90%;
  overflow: hidden;
  animation: slideIn 0.3s ease;
}

.modal-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 20px;
  border-bottom: 1px solid #ddd;
}

.modal-header h3 {
  margin: 0;
  color: #333;
}

.close-btn {
  background: none;
  border: none;
  font-size: 24px;
  cursor: pointer;
  color: #666;
  padding: 0;
  width: 30px;
  height: 30px;
  display: flex;
  align-items: center;
  justify-content: center;
}

.close-btn:hover {
  color: #333;
}

.modal-body {
  padding: 20px;
  max-height: 60vh;
  overflow-y: auto;
}

.modal-footer {
  padding: 15px 20px;
  border-top: 1px solid #ddd;
  display: flex;
  justify-content: flex-end;
  gap: 10px;
}

.preview-tabs {
  display: flex;
  gap: 5px;
  margin-bottom: 20px;
  border-bottom: 1px solid #ddd;
}

.preview-tabs button {
  padding: 10px 20px;
  border: none;
  background: transparent;
  cursor: pointer;
  border-bottom: 2px solid transparent;
  transition: all 0.2s;
}

.preview-tabs button.active {
  color: #007bff;
  border-bottom-color: #007bff;
}

.preview-tabs button:hover {
  background: #f8f9fa;
}

.preview-section {
  animation: fadeIn 0.3s ease;
}

.preview-section h4 {
  margin: 0 0 15px 0;
  color: #333;
}

.code-preview {
  background: #f8f9fa;
  border: 1px solid #ddd;
  border-radius: 4px;
  padding: 15px;
  font-family: 'Courier New', monospace;
  font-size: 12px;
  line-height: 1.4;
  max-height: 300px;
  overflow: auto;
  white-space: pre-wrap;
  word-break: break-all;
}

.stats-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 15px;
}

.stat-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 10px;
  background: #f8f9fa;
  border-radius: 4px;
  border: 1px solid #e9ecef;
}

.stat-label {
  font-weight: 500;
  color: #666;
}

.stat-value {
  font-weight: bold;
  color: #333;
}

.export-btn {
  background: #28a745;
  color: white;
  border: none;
  padding: 10px 20px;
  border-radius: 4px;
  cursor: pointer;
  margin-top: 15px;
  transition: background 0.2s;
}

.export-btn:hover {
  background: #218838;
}

.btn-secondary {
  background: #6c757d;
  color: white;
  border: none;
  padding: 8px 16px;
  border-radius: 4px;
  cursor: pointer;
}

.btn-secondary:hover {
  background: #5a6268;
}

/* Export Progress Modal */
.export-progress {
  max-width: 400px;
  text-align: center;
}

.progress-content {
  padding: 40px 20px;
}

.spinner {
  border: 4px solid #f3f3f3;
  border-top: 4px solid #007bff;
  border-radius: 50%;
  width: 50px;
  height: 50px;
  animation: spin 1s linear infinite;
  margin: 0 auto 20px;
}

.progress-content h3 {
  margin: 0 0 10px 0;
  color: #333;
}

.progress-content p {
  margin: 0;
  color: #666;
}

/* Animations */
@keyframes fadeIn {
  from {
    opacity: 0;
  }

  to {
    opacity: 1;
  }
}

@keyframes slideIn {
  from {
    opacity: 0;
    transform: translateY(-20px);
  }

  to {
    opacity: 1;
    transform: translateY(0);
  }
}

@keyframes spin {
  0% {
    transform: rotate(0deg);
  }

  100% {
    transform: rotate(360deg);
  }
}
</style>