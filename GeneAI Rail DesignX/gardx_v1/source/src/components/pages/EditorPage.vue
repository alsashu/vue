<template>
  <div class="editor-page d-flex flex-column h-100">
    <!-- Header Bar -->
    <header-bar :current-project="designStore.currentProject" :is-dirty="designStore.isDirty" @save="saveProject"
      @export="handleExport" @import="handleImport" @new-project="showNewProjectModal" />

    <!-- Main Content -->
    <div class="editor-content d-flex flex-grow-1 overflow-hidden">
      <!-- Left Sidebar - Component Palette -->
      <component-palette @component-selected="handleComponentSelected" @component-added="handleComponentAdded" />

      <!-- Center - Canvas and Tabs -->
      <div class="canvas-section d-flex flex-column flex-grow-1">
        <!-- Module Navigation -->
        <div class="module-nav d-flex align-items-center px-3 py-2 bg-light border-bottom">
          <div class="d-flex align-items-center gap-2 flex-grow-1">
            <button v-for="module in designStore.modules" :key="module.id" class="btn btn-sm" :class="{
              'btn-primary': module.id === designStore.activeModule,
              'btn-outline-secondary': module.id !== designStore.activeModule
            }" @click="designStore.setActiveModule(module.id)">
              <i :class="`bi bi-${module.icon}`" class="me-1"></i>
              {{ module.name }}
            </button>
          </div>

          <!-- Module Actions -->
          <div class="d-flex align-items-center gap-2">
            <button class="btn btn-outline-secondary btn-sm" @click="toggleAiAssistant"
              :class="{ active: showAiAssistant }">
              <i class="bi bi-robot"></i>
              AI Assistant
            </button>
            <div class="dropdown">
              <button class="btn btn-outline-secondary btn-sm dropdown-toggle" type="button" data-bs-toggle="dropdown">
                <i class="bi bi-three-dots"></i>
              </button>
              <ul class="dropdown-menu">
                <li><a class="dropdown-item" href="#" @click="validateDesign">
                    <i class="bi bi-check-circle me-2"></i>Validate Design
                  </a></li>
                <li><a class="dropdown-item" href="#" @click="optimizeLayout">
                    <i class="bi bi-lightning me-2"></i>Optimize Layout
                  </a></li>
                <li>
                  <hr class="dropdown-divider">
                </li>
                <li><a class="dropdown-item" href="#" @click="showSettings">
                    <i class="bi bi-gear me-2"></i>Settings
                  </a></li>
              </ul>
            </div>
          </div>
        </div>

        <!-- Segment Tabs -->
        <segment-tabs @segment-changed="handleSegmentChanged" @segment-added="handleSegmentAdded"
          @segment-removed="handleSegmentRemoved">
          <template #default="{ segment, isActive }">
            <rail-canvas v-if="isActive" :module="designStore.activeModule"
              @component-added="handleCanvasComponentAdded" @component-updated="handleComponentUpdated"
              @component-deleted="handleComponentDeleted" />
          </template>
        </segment-tabs>
      </div>

      <!-- Right Sidebar - AI Assistant -->
      <div v-if="showAiAssistant" class="ai-sidebar border-start bg-white" style="width: 320px; min-width: 320px;">
        <ai-assistant-panel :current-design="getCurrentDesignContext()" @suggestion-applied="handleSuggestionApplied"
          @close="showAiAssistant = false" />
      </div>
    </div>

    <!-- Modals -->
    <!-- New Project Modal -->
    <div v-if="showNewProject" class="modal fade show d-block" tabindex="-1" style="background: rgba(0,0,0,0.5);"
      @click.self="hideNewProjectModal">
      <div class="modal-dialog">
        <div class="modal-content">
          <div class="modal-header">
            <h5 class="modal-title">
              <i class="bi bi-plus-circle me-2"></i>
              New Railway Project
            </h5>
            <button type="button" class="btn-close" @click="hideNewProjectModal"></button>
          </div>
          <div class="modal-body">
            <form @submit.prevent="createNewProject">
              <div class="mb-3">
                <label for="projectName" class="form-label">Project Name</label>
                <input id="projectName" type="text" class="form-control" v-model="newProjectForm.name" required>
              </div>
              <div class="mb-3">
                <label for="projectDescription" class="form-label">Description</label>
                <textarea id="projectDescription" class="form-control" rows="3"
                  v-model="newProjectForm.description"></textarea>
              </div>
              <div class="mb-3">
                <label for="projectType" class="form-label">Project Type</label>
                <select id="projectType" class="form-select" v-model="newProjectForm.type">
                  <option value="suburban">Suburban Railway</option>
                  <option value="metro">Metro System</option>
                  <option value="freight">Freight Network</option>
                  <option value="highspeed">High-Speed Rail</option>
                  <option value="industrial">Industrial Siding</option>
                </select>
              </div>
            </form>
          </div>
          <div class="modal-footer">
            <button type="button" class="btn btn-secondary" @click="hideNewProjectModal">
              Cancel
            </button>
            <button type="button" class="btn btn-primary" @click="createNewProject"
              :disabled="!newProjectForm.name.trim()">
              Create Project
            </button>
          </div>
        </div>
      </div>
    </div>

    <!-- Export Modal -->
    <div v-if="showExportModal" class="modal fade show d-block" tabindex="-1" style="background: rgba(0,0,0,0.5);"
      @click.self="hideExportModal">
      <div class="modal-dialog">
        <div class="modal-content">
          <div class="modal-header">
            <h5 class="modal-title">
              <i class="bi bi-download me-2"></i>
              Export Project
            </h5>
            <button type="button" class="btn-close" @click="hideExportModal"></button>
          </div>
          <div class="modal-body">
            <div class="row g-3">
              <div class="col-md-6">
                <div class="card h-100">
                  <div class="card-body text-center">
                    <i class="bi bi-filetype-json display-4 text-primary"></i>
                    <h6 class="mt-2">JSON Format</h6>
                    <p class="small text-muted">Native format with all data</p>
                    <button class="btn btn-outline-primary btn-sm" @click="exportAs('json')">
                      Export JSON
                    </button>
                  </div>
                </div>
              </div>
              <div class="col-md-6">
                <div class="card h-100">
                  <div class="card-body text-center">
                    <i class="bi bi-filetype-svg display-4 text-success"></i>
                    <h6 class="mt-2">SVG Format</h6>
                    <p class="small text-muted">Scalable vector graphics</p>
                    <button class="btn btn-outline-success btn-sm" @click="exportAs('svg')">
                      Export SVG
                    </button>
                  </div>
                </div>
              </div>
              <div class="col-md-6">
                <div class="card h-100">
                  <div class="card-body text-center">
                    <i class="bi bi-filetype-pdf display-4 text-danger"></i>
                    <h6 class="mt-2">PDF Format</h6>
                    <p class="small text-muted">Portable document</p>
                    <button class="btn btn-outline-danger btn-sm" @click="exportAs('pdf')">
                      Export PDF
                    </button>
                  </div>
                </div>
              </div>
              <div class="col-md-6">
                <div class="card h-100">
                  <div class="card-body text-center">
                    <i class="bi bi-code-square display-4 text-warning"></i>
                    <h6 class="mt-2">RailML Format</h6>
                    <p class="small text-muted">Railway markup language</p>
                    <button class="btn btn-outline-warning btn-sm" @click="exportAs('railml')">
                      Export RailML
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Loading Overlay -->
    <div v-if="isLoading"
      class="position-fixed top-0 start-0 w-100 h-100 d-flex align-items-center justify-content-center"
      style="background: rgba(255,255,255,0.9); z-index: 2000;">
      <div class="text-center">
        <div class="spinner-border text-primary mb-3" role="status">
          <span class="visually-hidden">Loading...</span>
        </div>
        <p class="text-muted">{{ loadingMessage }}</p>
      </div>
    </div>

    <!-- Toast Notifications -->
    <div class="toast-container position-fixed bottom-0 end-0 p-3">
      <div v-for="toast in toasts" :key="toast.id" class="toast show" role="alert">
        <div class="toast-header">
          <i :class="`bi bi-${toast.icon} me-2`" :style="{ color: toast.color }"></i>
          <strong class="me-auto">{{ toast.title }}</strong>
          <button type="button" class="btn-close" @click="removeToast(toast.id)"></button>
        </div>
        <div class="toast-body">
          {{ toast.message }}
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, onUnmounted } from 'vue'
import { useRouter } from 'vue-router'
import { useDesignStore } from '@stores/designStore'
import { useAiStore } from '@stores/aiStore'
import { exportService } from '@services/exportService'

// Components
import HeaderBar from '@components/organisms/HeaderBar.vue'
import ComponentPalette from '@components/organisms/ComponentPalette.vue'
import SegmentTabs from '@components/organisms/SegmentTabs.vue'
import RailCanvas from '@components/organisms/RailCanvas.vue'
import AiAssistantPanel from '@components/organisms/AiAssistantPanel.vue'

const props = defineProps({
  module: {
    type: String,
    default: 'track-editor'
  }
})

// Stores
const designStore = useDesignStore()
const aiStore = useAiStore()
const router = useRouter()

// Component state
const isLoading = ref(false)
const loadingMessage = ref('')
const showAiAssistant = ref(false)
const showNewProject = ref(false)
const showExportModal = ref(false)
const toasts = ref([])

// Forms
const newProjectForm = ref({
  name: '',
  description: '',
  type: 'suburban'
})

// Methods
const handleComponentSelected = (component) => {
  // Handle component selection from palette
  console.log('Component selected:', component)
}

const handleComponentAdded = (component) => {
  showToast('success', 'Component Added', `${component.name} added to canvas`, 'check-circle')
}

const handleCanvasComponentAdded = (component) => {
  showToast('success', 'Component Added', `${component.name} added to canvas`, 'check-circle')
}

const handleComponentUpdated = ({ componentId, updates }) => {
  showToast('info', 'Component Updated', 'Component properties updated', 'pencil')
}

const handleComponentDeleted = (componentId) => {
  showToast('warning', 'Component Deleted', 'Component removed from canvas', 'trash')
}

const handleSegmentChanged = (segmentId) => {
  console.log('Active segment changed:', segmentId)
}

const handleSegmentAdded = () => {
  showToast('success', 'Segment Added', 'New segment created', 'plus-circle')
}

const handleSegmentRemoved = (segmentId) => {
  showToast('warning', 'Segment Removed', 'Segment deleted', 'x-circle')
}

const handleSuggestionApplied = (suggestion) => {
  showToast('success', 'AI Suggestion Applied', suggestion.title, 'robot')
}

const saveProject = async () => {
  isLoading.value = true
  loadingMessage.value = 'Saving project...'

  try {
    await new Promise(resolve => setTimeout(resolve, 1000)) // Simulate save
    designStore.saveProject()
    showToast('success', 'Project Saved', 'All changes saved successfully', 'check-circle')
  } catch (error) {
    showToast('error', 'Save Failed', error.message, 'exclamation-triangle')
  } finally {
    isLoading.value = false
  }
}

const handleExport = () => {
  showExportModal.value = true
}

const handleImport = () => {
  const input = document.createElement('input')
  input.type = 'file'
  input.accept = '.json,.railml,.xml'

  input.onchange = async (e) => {
    const file = e.target.files[0]
    if (!file) return

    isLoading.value = true
    loadingMessage.value = 'Importing project...'

    try {
      const result = await exportService.importFromFile(file)
      designStore.loadProject(result.data)
      showToast('success', 'Import Successful', `Project imported from ${file.name}`, 'upload')
    } catch (error) {
      showToast('error', 'Import Failed', error.message, 'exclamation-triangle')
    } finally {
      isLoading.value = false
    }
  }

  input.click()
}

const showNewProjectModal = () => {
  showNewProject.value = true
  newProjectForm.value = {
    name: '',
    description: '',
    type: 'suburban'
  }
}

const hideNewProjectModal = () => {
  showNewProject.value = false
}

const createNewProject = () => {
  if (!newProjectForm.value.name.trim()) return

  designStore.createProject(newProjectForm.value)
  hideNewProjectModal()
  showToast('success', 'Project Created', `New project "${newProjectForm.value.name}" created`, 'plus-circle')
}

const hideExportModal = () => {
  showExportModal.value = false
}

const exportAs = async (format) => {
  isLoading.value = true
  loadingMessage.value = `Exporting as ${format.toUpperCase()}...`

  try {
    const exportData = designStore.exportProject(format)

    switch (format) {
      case 'json':
        exportService.exportAsJSON(exportData)
        break
      case 'svg':
        // Get canvas element for SVG export
        const canvas = document.querySelector('canvas')
        if (canvas) {
          await exportService.exportAsSVG(canvas)
        }
        break
      case 'pdf':
        const canvasEl = document.querySelector('canvas')
        if (canvasEl) {
          await exportService.exportAsPDF(canvasEl)
        }
        break
      case 'railml':
        exportService.exportAsRailML(exportData)
        break
    }

    showToast('success', 'Export Complete', `Project exported as ${format.toUpperCase()}`, 'download')
    hideExportModal()
  } catch (error) {
    showToast('error', 'Export Failed', error.message, 'exclamation-triangle')
  } finally {
    isLoading.value = false
  }
}

const toggleAiAssistant = () => {
  showAiAssistant.value = !showAiAssistant.value
}

const validateDesign = async () => {
  isLoading.value = true
  loadingMessage.value = 'Validating design...'

  try {
    const designData = getCurrentDesignContext()
    const result = await aiStore.validateDesign(designData)

    if (result.isValid) {
      showToast('success', 'Design Valid', 'Design validation passed', 'check-circle')
    } else {
      showToast('warning', 'Validation Issues', `Found ${result.issues.length} issues`, 'exclamation-triangle')
    }
  } catch (error) {
    showToast('error', 'Validation Failed', error.message, 'exclamation-triangle')
  } finally {
    isLoading.value = false
  }
}

const optimizeLayout = async () => {
  isLoading.value = true
  loadingMessage.value = 'Optimizing layout...'

  try {
    const currentLayout = getCurrentDesignContext()
    const result = await aiStore.optimizeLayout(currentLayout)
    showToast('success', 'Layout Optimized', 'AI optimization suggestions generated', 'lightning')
    showAiAssistant.value = true
  } catch (error) {
    showToast('error', 'Optimization Failed', error.message, 'exclamation-triangle')
  } finally {
    isLoading.value = false
  }
}

const showSettings = () => {
  // Implement settings modal
  console.log('Show settings')
}

const getCurrentDesignContext = () => {
  return {
    project: designStore.currentProject,
    activeModule: designStore.activeModule,
    segments: designStore.segments,
    components: designStore.components,
    selectedComponent: designStore.selectedComponent
  }
}

const showToast = (type, title, message, icon) => {
  const colors = {
    success: '#198754',
    error: '#dc3545',
    warning: '#fd7e14',
    info: '#0dcaf0'
  }

  const toast = {
    id: Date.now(),
    type,
    title,
    message,
    icon,
    color: colors[type] || '#6c757d'
  }

  toasts.value.push(toast)

  // Auto-remove after 5 seconds
  setTimeout(() => {
    removeToast(toast.id)
  }, 5000)
}

const removeToast = (toastId) => {
  const index = toasts.value.findIndex(t => t.id === toastId)
  if (index > -1) {
    toasts.value.splice(index, 1)
  }
}

// Keyboard shortcuts
const handleKeyDown = (e) => {
  if (e.ctrlKey || e.metaKey) {
    switch (e.key) {
      case 's':
        e.preventDefault()
        saveProject()
        break
      case 'z':
        e.preventDefault()
        if (e.shiftKey) {
          designStore.redo()
        } else {
          designStore.undo()
        }
        break
      case 'n':
        e.preventDefault()
        showNewProjectModal()
        break
    }
  }
}

// Lifecycle
onMounted(() => {
  // Set initial module if provided
  if (props.module && props.module !== designStore.activeModule) {
    designStore.setActiveModule(props.module)
  }

  // Create default project if none exists
  if (!designStore.currentProject) {
    designStore.createProject({
      name: 'GARD-X',
      description: 'A new railway infrastructure design',
      type: 'suburban'
    })
  }

  // Add keyboard shortcuts
  document.addEventListener('keydown', handleKeyDown)
})

onUnmounted(() => {
  document.removeEventListener('keydown', handleKeyDown)
})
</script>

<style scoped>
.editor-page {
  height: 100vh;
  overflow: hidden;
}

.editor-content {
  height: calc(100vh - 64px);
  /* Adjust based on header height */
}

.module-nav {
  min-height: 48px;
  border-bottom: 1px solid #dee2e6;
}

.ai-sidebar {
  background: #f8f9fa;
}

.canvas-section {
  min-width: 0;
  /* Allow flex shrink */
}

.toast {
  margin-bottom: 0.5rem;
}

.btn.active {
  background-color: #0d6efd;
  border-color: #0d6efd;
  color: white;
}

/* Loading overlay animations */
@keyframes fadeIn {
  from {
    opacity: 0;
  }

  to {
    opacity: 1;
  }
}

.position-fixed {
  animation: fadeIn 0.3s ease;
}

/* Toast animations */
.toast {
  animation: slideIn 0.3s ease;
}

@keyframes slideIn {
  from {
    transform: translateX(100%);
    opacity: 0;
  }

  to {
    transform: translateX(0);
    opacity: 1;
  }
}
</style>