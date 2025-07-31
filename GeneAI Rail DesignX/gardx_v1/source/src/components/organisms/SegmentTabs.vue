<template>
  <div class="segment-tabs">
    <!-- Tab Navigation -->
    <div class="tabs-nav d-flex align-items-center border-bottom bg-light">
      <div class="tabs-list d-flex flex-grow-1 overflow-auto">
        <button v-for="segment in segments" :key="segment.id"
          class="tab-button btn d-flex align-items-center gap-2 px-3 py-2 border-0 rounded-0" :class="{
            'active border-primary border-bottom-0 bg-white': segment.id === activeSegmentId,
            'text-muted': segment.id !== activeSegmentId
          }" @click="selectSegment(segment.id)" @contextmenu.prevent="showContextMenu($event, segment)">
          <span class="tab-title">{{ segment.name }}</span>
          <span v-if="segment.isDirty" class="dirty-indicator text-warning" title="Unsaved changes">
            ●
          </span>
          <button v-if="segments.length > 1" class="close-tab btn-close btn-close-sm ms-1"
            @click.stop="closeSegment(segment.id)" title="Close tab"></button>
        </button>
      </div>

      <!-- Tab Actions -->
      <div class="tabs-actions d-flex align-items-center px-2">
        <div class="dropdown">
          <button class="btn btn-outline-secondary btn-sm dropdown-toggle" type="button" data-bs-toggle="dropdown"
            aria-expanded="false">
            <i class="bi bi-plus"></i>
          </button>
          <ul class="dropdown-menu">
            <li>
              <a class="dropdown-item" href="#" @click.prevent="addNewSegment">
                <i class="bi bi-file-plus me-2"></i>
                New Segment
              </a>
            </li>
            <li>
              <a class="dropdown-item" href="#" @click.prevent="duplicateSegment">
                <i class="bi bi-files me-2"></i>
                Duplicate Current
              </a>
            </li>
            <li>
              <hr class="dropdown-divider">
            </li>
            <li>
              <a class="dropdown-item" href="#" @click.prevent="importSegment">
                <i class="bi bi-upload me-2"></i>
                Import Segment
              </a>
            </li>
          </ul>
        </div>

        <button class="btn btn-outline-secondary btn-sm ms-2" @click="showSegmentManager" title="Manage Segments">
          <i class="bi bi-gear"></i>
        </button>
      </div>
    </div>

    <!-- Tab Content -->
    <div class="tab-content flex-grow-1">
      <div v-for="segment in segments" :key="segment.id" class="tab-pane h-100"
        :class="{ active: segment.id === activeSegmentId }">
        <slot :segment="segment" :is-active="segment.id === activeSegmentId"></slot>
      </div>
    </div>

    <!-- Context Menu -->
    <div v-if="contextMenu.show" class="context-menu position-fixed bg-white border shadow-sm rounded py-1"
      :style="{ top: contextMenu.y + 'px', left: contextMenu.x + 'px', zIndex: 1050 }" @mouseleave="hideContextMenu">
      <button class="dropdown-item px-3 py-1" @click="renameSegment(contextMenu.segment)">
        <i class="bi bi-pencil me-2"></i>
        Rename
      </button>
      <button class="dropdown-item px-3 py-1" @click="duplicateSegment(contextMenu.segment)">
        <i class="bi bi-files me-2"></i>
        Duplicate
      </button>
      <hr class="dropdown-divider my-1">
      <button class="dropdown-item px-3 py-1" @click="exportSegment(contextMenu.segment)">
        <i class="bi bi-download me-2"></i>
        Export
      </button>
      <hr class="dropdown-divider my-1">
      <button class="dropdown-item px-3 py-1 text-danger" @click="closeSegment(contextMenu.segment.id)"
        :disabled="segments.length <= 1">
        <i class="bi bi-x me-2"></i>
        Close
      </button>
    </div>

    <!-- Segment Manager Modal -->
    <div v-if="showManager" class="modal fade show d-block" tabindex="-1" style="background: rgba(0,0,0,0.5);"
      @click.self="hideSegmentManager">
      <div class="modal-dialog modal-lg">
        <div class="modal-content">
          <div class="modal-header">
            <h5 class="modal-title">
              <i class="bi bi-kanban me-2"></i>
              Segment Manager
            </h5>
            <button type="button" class="btn-close" @click="hideSegmentManager"></button>
          </div>
          <div class="modal-body">
            <div class="row">
              <div class="col-md-8">
                <h6>Segments</h6>
                <div class="list-group">
                  <div v-for="segment in segments" :key="segment.id"
                    class="list-group-item d-flex align-items-center justify-content-between"
                    :class="{ active: segment.id === activeSegmentId }">
                    <div class="d-flex align-items-center">
                      <div class="me-3">
                        <strong>{{ segment.name }}</strong>
                        <div class="small text-muted">
                          {{ segment.components?.length || 0 }} components
                        </div>
                      </div>
                    </div>
                    <div class="btn-group btn-group-sm">
                      <button class="btn btn-outline-primary" @click="selectSegment(segment.id)">
                        Select
                      </button>
                      <button class="btn btn-outline-secondary" @click="editSegmentProperties(segment)">
                        Edit
                      </button>
                    </div>
                  </div>
                </div>
              </div>
              <div class="col-md-4">
                <h6>Properties</h6>
                <div v-if="editingSegment" class="card">
                  <div class="card-body">
                    <div class="mb-3">
                      <label class="form-label">Name</label>
                      <input type="text" class="form-control" v-model="editingSegment.name">
                    </div>
                    <div class="mb-3">
                      <label class="form-label">Description</label>
                      <textarea class="form-control" rows="3" v-model="editingSegment.description"></textarea>
                    </div>
                    <div class="d-flex gap-2">
                      <button class="btn btn-primary btn-sm" @click="saveSegmentProperties">
                        Save
                      </button>
                      <button class="btn btn-secondary btn-sm" @click="editingSegment = null">
                        Cancel
                      </button>
                    </div>
                  </div>
                </div>
                <div v-else class="text-muted">
                  Select a segment to edit properties
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Rename Modal -->
    <div v-if="renameModal.show" class="modal fade show d-block" tabindex="-1" style="background: rgba(0,0,0,0.5);"
      @click.self="hideRenameModal">
      <div class="modal-dialog modal-sm">
        <div class="modal-content">
          <div class="modal-header">
            <h6 class="modal-title">Rename Segment</h6>
            <button type="button" class="btn-close" @click="hideRenameModal"></button>
          </div>
          <div class="modal-body">
            <input ref="renameInput" type="text" class="form-control" v-model="renameModal.name"
              @keyup.enter="confirmRename" @keyup.escape="hideRenameModal">
          </div>
          <div class="modal-footer">
            <button type="button" class="btn btn-secondary btn-sm" @click="hideRenameModal">
              Cancel
            </button>
            <button type="button" class="btn btn-primary btn-sm" @click="confirmRename">
              Rename
            </button>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, nextTick } from 'vue'
import { useDesignStore } from '@stores/designStore'

const emit = defineEmits(['segment-changed', 'segment-added', 'segment-removed'])

// Stores
const designStore = useDesignStore()

// Component state
const showManager = ref(false)
const editingSegment = ref(null)
const contextMenu = ref({
  show: false,
  x: 0,
  y: 0,
  segment: null
})
const renameModal = ref({
  show: false,
  segment: null,
  name: ''
})
const renameInput = ref(null)

// Computed properties
const segments = computed(() => Object.values(designStore.segments))
const activeSegmentId = computed(() => designStore.activeSegment)

// Methods
const selectSegment = (segmentId) => {
  designStore.setActiveSegment(segmentId)
  emit('segment-changed', segmentId)
}

const addNewSegment = () => {
  const segmentNumber = segments.value.length + 1
  designStore.addSegment({
    name: `Segment ${segmentNumber}`,
    description: ''
  })
  emit('segment-added')
}

const closeSegment = (segmentId) => {
  if (segments.value.length <= 1) return

  const segment = designStore.segments[segmentId]
  if (segment?.isDirty) {
    if (!confirm(`Segment "${segment.name}" has unsaved changes. Close anyway?`)) {
      return
    }
  }

  designStore.removeSegment(segmentId)
  emit('segment-removed', segmentId)
  hideContextMenu()
}

const duplicateSegment = (segment = null) => {
  const targetSegment = segment || designStore.segments[activeSegmentId.value]
  if (!targetSegment) return

  designStore.addSegment({
    name: `${targetSegment.name} Copy`,
    description: targetSegment.description,
    components: [...(targetSegment.components || [])]
  })

  hideContextMenu()
  emit('segment-added')
}

const renameSegment = async (segment) => {
  renameModal.value = {
    show: true,
    segment,
    name: segment.name
  }

  hideContextMenu()

  await nextTick()
  if (renameInput.value) {
    renameInput.value.focus()
    renameInput.value.select()
  }
}

const confirmRename = () => {
  if (renameModal.value.segment && renameModal.value.name.trim()) {
    designStore.segments[renameModal.value.segment.id].name = renameModal.value.name.trim()
  }
  hideRenameModal()
}

const hideRenameModal = () => {
  renameModal.value = {
    show: false,
    segment: null,
    name: ''
  }
}

const exportSegment = (segment) => {
  const segmentData = {
    segment,
    components: segment.components?.map(id => designStore.components[id]).filter(Boolean) || []
  }

  const dataStr = JSON.stringify(segmentData, null, 2)
  const dataBlob = new Blob([dataStr], { type: 'application/json' })

  const link = document.createElement('a')
  link.href = URL.createObjectURL(dataBlob)
  link.download = `${segment.name.replace(/\s+/g, '_')}_segment.json`
  link.click()

  hideContextMenu()
}

const importSegment = () => {
  const input = document.createElement('input')
  input.type = 'file'
  input.accept = '.json'

  input.onchange = (e) => {
    const file = e.target.files[0]
    if (!file) return

    const reader = new FileReader()
    reader.onload = (event) => {
      try {
        const data = JSON.parse(event.target.result)
        designStore.addSegment({
          name: `${data.segment.name} (Imported)`,
          description: data.segment.description,
          components: []
        })

        // Add components
        data.components?.forEach(componentData => {
          designStore.addComponent(componentData)
        })

        emit('segment-added')
      } catch (error) {
        alert('Failed to import segment: Invalid file format')
      }
    }
    reader.readAsText(file)
  }

  input.click()
}

const showContextMenu = (event, segment) => {
  contextMenu.value = {
    show: true,
    x: event.clientX,
    y: event.clientY,
    segment
  }
}

const hideContextMenu = () => {
  contextMenu.value.show = false
}

const showSegmentManager = () => {
  showManager.value = true
}

const hideSegmentManager = () => {
  showManager.value = false
  editingSegment.value = null
}

const editSegmentProperties = (segment) => {
  editingSegment.value = { ...segment }
}

const saveSegmentProperties = () => {
  if (editingSegment.value) {
    const segment = designStore.segments[editingSegment.value.id]
    if (segment) {
      segment.name = editingSegment.value.name
      segment.description = editingSegment.value.description
    }
  }
  editingSegment.value = null
}

// Global click handler to hide context menu
document.addEventListener('click', (e) => {
  if (!e.target.closest('.context-menu')) {
    hideContextMenu()
  }
})
</script>

<style scoped>
.segment-tabs {
  display: flex;
  flex-direction: column;
  height: 100%;
}

.tabs-nav {
  min-height: 48px;
  border-bottom: 1px solid #dee2e6;
}

.tabs-list {
  scrollbar-width: none;
  -ms-overflow-style: none;
}

.tabs-list::-webkit-scrollbar {
  display: none;
}

.tab-button {
  white-space: nowrap;
  position: relative;
  border-bottom: 3px solid transparent !important;
  transition: all 0.2s ease;
}

.tab-button:hover {
  background-color: #f8f9fa;
}

.tab-button.active {
  background-color: white;
  border-bottom-color: #0d6efd !important;
  color: #0d6efd;
  font-weight: 500;
}

.tab-content {
  flex: 1;
  display: flex;
  flex-direction: column;
}

.tab-pane {
  display: none;
}

.tab-pane.active {
  display: flex;
  flex-direction: column;
}

.close-tab {
  opacity: 0;
  transition: opacity 0.2s ease;
  width: 16px;
  height: 16px;
  font-size: 10px;
}

.tab-button:hover .close-tab {
  opacity: 1;
}

.dirty-indicator {
  font-size: 8px;
}

.context-menu {
  min-width: 150px;
  max-width: 250px;
}

.context-menu .dropdown-item {
  font-size: 0.875rem;
  padding: 0.375rem 0.75rem;
  border: none;
  background: none;
  width: 100%;
  text-align: left;
}

.context-menu .dropdown-item:hover {
  background-color: #f8f9fa;
}

.context-menu .dropdown-item:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.list-group-item.active {
  background-color: rgba(13, 110, 253, 0.1);
  border-color: #0d6efd;
}
</style>