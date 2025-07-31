<template>
  <header class="header-bar navbar navbar-expand-lg navbar-dark bg-primary">
    <div class="container-fluid">
      <!-- Brand -->
      <a class="navbar-brand d-flex align-items-center" href="/">
        <i class="bi bi-train-front me-2"></i>
        Railway Designer
      </a>

      <!-- Project Info -->
      <div class="navbar-nav me-auto">
        <div class="nav-item d-flex align-items-center">
          <span class="text-light me-2">
            {{ currentProject?.name || 'Untitled Project' }}
          </span>
          <span v-if="isDirty" class="badge bg-warning text-dark" title="Unsaved changes">
            ●
          </span>
        </div>
      </div>

      <!-- Main Actions -->
      <div class="d-flex align-items-center gap-2">
        <!-- File Menu -->
        <div class="dropdown">
          <button class="btn btn-outline-light btn-sm dropdown-toggle" type="button" data-bs-toggle="dropdown"
            aria-expanded="false">
            <i class="bi bi-folder me-1"></i>
            File
          </button>
          <ul class="dropdown-menu">
            <li>
              <a class="dropdown-item" href="#" @click.prevent="$emit('new-project')">
                <i class="bi bi-file-plus me-2"></i>
                New Project
              </a>
            </li>
            <li>
              <a class="dropdown-item" href="#" @click.prevent="openProject">
                <i class="bi bi-folder-open me-2"></i>
                Open Project
              </a>
            </li>
            <li>
              <hr class="dropdown-divider">
            </li>
            <li>
              <a class="dropdown-item" href="#" @click.prevent="$emit('save')" :class="{ disabled: !isDirty }">
                <i class="bi bi-save me-2"></i>
                Save Project
                <kbd class="ms-2">Ctrl+S</kbd>
              </a>
            </li>
            <li>
              <a class="dropdown-item" href="#" @click.prevent="saveAsProject">
                <i class="bi bi-save-fill me-2"></i>
                Save As...
              </a>
            </li>
            <li>
              <hr class="dropdown-divider">
            </li>
            <li>
              <a class="dropdown-item" href="#" @click.prevent="$emit('import')">
                <i class="bi bi-upload me-2"></i>
                Import
              </a>
            </li>
            <li>
              <a class="dropdown-item" href="#" @click.prevent="$emit('export')">
                <i class="bi bi-download me-2"></i>
                Export
              </a>
            </li>
          </ul>
        </div>

        <!-- Edit Menu -->
        <div class="dropdown">
          <button class="btn btn-outline-light btn-sm dropdown-toggle" type="button" data-bs-toggle="dropdown"
            aria-expanded="false">
            <i class="bi bi-pencil me-1"></i>
            Edit
          </button>
          <ul class="dropdown-menu">
            <li>
              <a class="dropdown-item" href="#" @click.prevent="designStore.undo()"
                :class="{ disabled: !designStore.canUndo }">
                <i class="bi bi-arrow-counterclockwise me-2"></i>
                Undo
                <kbd class="ms-2">Ctrl+Z</kbd>
              </a>
            </li>
            <li>
              <a class="dropdown-item" href="#" @click.prevent="designStore.redo()"
                :class="{ disabled: !designStore.canRedo }">
                <i class="bi bi-arrow-clockwise me-2"></i>
                Redo
                <kbd class="ms-2">Ctrl+Shift+Z</kbd>
              </a>
            </li>
            <li>
              <hr class="dropdown-divider">
            </li>
            <li>
              <a class="dropdown-item" href="#" @click.prevent="selectAll">
                <i class="bi bi-check-all me-2"></i>
                Select All
                <kbd class="ms-2">Ctrl+A</kbd>
              </a>
            </li>
            <li>
              <a class="dropdown-item" href="#" @click.prevent="deleteSelected" :class="{ disabled: !hasSelection }">
                <i class="bi bi-trash me-2"></i>
                Delete Selected
                <kbd class="ms-2">Del</kbd>
              </a>
            </li>
          </ul>
        </div>

        <!-- View Menu -->
        <div class="dropdown">
          <button class="btn btn-outline-light btn-sm dropdown-toggle" type="button" data-bs-toggle="dropdown"
            aria-expanded="false">
            <i class="bi bi-eye me-1"></i>
            View
          </button>
          <ul class="dropdown-menu">
            <li>
              <a class="dropdown-item" href="#" @click.prevent="zoomIn">
                <i class="bi bi-zoom-in me-2"></i>
                Zoom In
                <kbd class="ms-2">Ctrl++</kbd>
              </a>
            </li>
            <li>
              <a class="dropdown-item" href="#" @click.prevent="zoomOut">
                <i class="bi bi-zoom-out me-2"></i>
                Zoom Out
                <kbd class="ms-2">Ctrl+-</kbd>
              </a>
            </li>
            <li>
              <a class="dropdown-item" href="#" @click.prevent="zoomFit">
                <i class="bi bi-arrows-fullscreen me-2"></i>
                Fit to Window
                <kbd class="ms-2">Ctrl+0</kbd>
              </a>
            </li>
            <li>
              <hr class="dropdown-divider">
            </li>
            <li>
              <a class="dropdown-item" href="#" @click.prevent="toggleGrid">
                <i class="bi bi-grid me-2"></i>
                Toggle Grid
              </a>
            </li>
            <li>
              <a class="dropdown-item" href="#" @click.prevent="toggleSnap">
                <i class="bi bi-magnet me-2"></i>
                Toggle Snap
              </a>
            </li>
            <li>
              <hr class="dropdown-divider">
            </li>
            <li>
              <a class="dropdown-item" href="#" @click.prevent="toggleFullscreen">
                <i class="bi bi-fullscreen me-2"></i>
                Fullscreen
                <kbd class="ms-2">F11</kbd>
              </a>
            </li>
          </ul>
        </div>

        <!-- Quick Actions -->
        <div class="btn-group">
          <button class="btn btn-outline-light btn-sm" @click="$emit('save')" :disabled="!isDirty"
            title="Save Project (Ctrl+S)">
            <i class="bi bi-save"></i>
          </button>

          <button class="btn btn-outline-light btn-sm" @click="designStore.undo()" :disabled="!designStore.canUndo"
            title="Undo (Ctrl+Z)">
            <i class="bi bi-arrow-counterclockwise"></i>
          </button>

          <button class="btn btn-outline-light btn-sm" @click="designStore.redo()" :disabled="!designStore.canRedo"
            title="Redo (Ctrl+Shift+Z)">
            <i class="bi bi-arrow-clockwise"></i>
          </button>
        </div>

        <!-- User Menu -->
        <div class="dropdown">
          <button class="btn btn-outline-light btn-sm dropdown-toggle d-flex align-items-center" type="button"
            data-bs-toggle="dropdown" aria-expanded="false">
            <i class="bi bi-person-circle me-1"></i>
            {{ authStore.user?.name || 'User' }}
          </button>
          <ul class="dropdown-menu dropdown-menu-end">
            <li>
              <h6 class="dropdown-header">
                {{ authStore.user?.email }}
                <br>
                <span class="badge bg-secondary">{{ authStore.userRole }}</span>
              </h6>
            </li>
            <li>
              <hr class="dropdown-divider">
            </li>
            <li>
              <a class="dropdown-item" href="#" @click.prevent="showProfile">
                <i class="bi bi-person me-2"></i>
                Profile
              </a>
            </li>
            <li>
              <a class="dropdown-item" href="#" @click.prevent="showSettings">
                <i class="bi bi-gear me-2"></i>
                Settings
              </a>
            </li>
            <li>
              <a class="dropdown-item" href="#" @click.prevent="showHelp">
                <i class="bi bi-question-circle me-2"></i>
                Help
              </a>
            </li>
            <li>
              <hr class="dropdown-divider">
            </li>
            <li>
              <a class="dropdown-item text-danger" href="#" @click.prevent="logout">
                <i class="bi bi-box-arrow-right me-2"></i>
                Logout
              </a>
            </li>
          </ul>
        </div>
      </div>
    </div>

    <!-- Auto-save Indicator -->
    <div v-if="isAutoSaving" class="position-absolute top-100 end-0 me-3 mt-1">
      <div class="d-flex align-items-center bg-success text-white px-2 py-1 rounded-pill small">
        <div class="spinner-border spinner-border-sm me-2" role="status">
          <span class="visually-hidden">Saving...</span>
        </div>
        Auto-saving...
      </div>
    </div>
  </header>
</template>

<script setup>
import { computed } from 'vue'
import { useRouter } from 'vue-router'
import { useAuthStore } from '@stores/authStore'
import { useDesignStore } from '@stores/designStore'

const props = defineProps({
  currentProject: Object,
  isDirty: Boolean,
  isAutoSaving: {
    type: Boolean,
    default: false
  }
})

const emit = defineEmits(['save', 'export', 'import', 'new-project'])

// Stores
const authStore = useAuthStore()
const designStore = useDesignStore()
const router = useRouter()

// Computed
const hasSelection = computed(() => !!designStore.selectedComponent)

// Methods
const openProject = () => {
  const input = document.createElement('input')
  input.type = 'file'
  input.accept = '.json'

  input.onchange = (e) => {
    const file = e.target.files[0]
    if (!file) return

    const reader = new FileReader()
    reader.onload = (event) => {
      try {
        const projectData = JSON.parse(event.target.result)
        designStore.loadProject(projectData)
      } catch (error) {
        alert('Failed to open project: Invalid file format')
      }
    }
    reader.readAsText(file)
  }

  input.click()
}

const saveAsProject = () => {
  const projectData = designStore.exportProject('json')
  const dataStr = JSON.stringify(projectData, null, 2)
  const dataBlob = new Blob([dataStr], { type: 'application/json' })

  const link = document.createElement('a')
  link.href = URL.createObjectURL(dataBlob)
  link.download = `${props.currentProject?.name?.replace(/\s+/g, '_') || 'railway_project'}.json`
  link.click()
}

const selectAll = () => {
  // Implementation depends on canvas selection system
  console.log('Select all components')
}

const deleteSelected = () => {
  if (designStore.selectedComponent) {
    designStore.removeComponent(designStore.selectedComponent.id)
  }
}

const zoomIn = () => {
  // Emit event to canvas component
  document.dispatchEvent(new CustomEvent('canvas-zoom-in'))
}

const zoomOut = () => {
  document.dispatchEvent(new CustomEvent('canvas-zoom-out'))
}

const zoomFit = () => {
  document.dispatchEvent(new CustomEvent('canvas-zoom-fit'))
}

const toggleGrid = () => {
  document.dispatchEvent(new CustomEvent('canvas-toggle-grid'))
}

const toggleSnap = () => {
  document.dispatchEvent(new CustomEvent('canvas-toggle-snap'))
}

const toggleFullscreen = () => {
  if (!document.fullscreenElement) {
    document.documentElement.requestFullscreen()
  } else {
    document.exitFullscreen()
  }
}

const showProfile = () => {
  // Open profile modal/page
  console.log('Show profile')
}

const showSettings = () => {
  // Open settings modal/page
  console.log('Show settings')
}

const showHelp = () => {
  // Open help documentation
  window.open('/help', '_blank')
}

const logout = async () => {
  if (props.isDirty) {
    const confirmed = confirm('You have unsaved changes. Are you sure you want to logout?')
    if (!confirmed) return
  }

  await authStore.logout()
  router.push('/login')
}
</script>

<style scoped>
.header-bar {
  min-height: 64px;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
}

.navbar-brand {
  font-weight: 600;
  font-size: 1.25rem;
}

.dropdown-item.disabled {
  opacity: 0.5;
  pointer-events: none;
}

.dropdown-item kbd {
  font-size: 0.75rem;
  opacity: 0.7;
}

.btn-group .btn {
  border-radius: 0.25rem;
}

.btn-group .btn:not(:first-child) {
  margin-left: 1px;
}

.dropdown-header {
  font-size: 0.875rem;
  line-height: 1.2;
}

.badge {
  font-size: 0.7rem;
}

/* Auto-save indicator animation */
@keyframes slideDown {
  from {
    transform: translateY(-100%);
    opacity: 0;
  }

  to {
    transform: translateY(0);
    opacity: 1;
  }
}

.position-absolute[v-if] {
  animation: slideDown 0.3s ease;
}
</style>