<template>
  <div class="component-palette h-100 d-flex flex-column">
    <!-- Palette Header -->
    <div class="palette-header p-3 border-bottom bg-light">
      <h6 class="mb-0 fw-bold text-primary">
        <i class="bi bi-palette"></i>
        Component Palette
      </h6>
    </div>

    <!-- Search and Filter -->
    <div class="p-3 border-bottom">
      <div class="mb-3">
        <input type="text" class="form-control form-control-sm" placeholder="Search components..."
          v-model="searchQuery">
      </div>

      <div class="btn-group w-100" role="group">
        <input type="radio" class="btn-check" id="filter-all" value="" v-model="activeFilter">
        <label class="btn btn-outline-primary btn-sm" for="filter-all">All</label>

        <input type="radio" class="btn-check" id="filter-infra" value="infrastructure" v-model="activeFilter">
        <label class="btn btn-outline-primary btn-sm" for="filter-infra">Infra</label>

        <input type="radio" class="btn-check" id="filter-rolling" value="rollingStock" v-model="activeFilter">
        <label class="btn btn-outline-primary btn-sm" for="filter-rolling">Rolling</label>
      </div>
    </div>

    <!-- Component Categories -->
    <div class="flex-grow-1 overflow-auto">
      <div class="accordion" id="componentAccordion">
        <div v-for="(category, categoryKey) in filteredCategories" :key="categoryKey"
          class="accordion-item border-0 border-bottom">
          <h2 class="accordion-header">
            <button class="accordion-button py-2 px-3 bg-light" type="button" :data-bs-toggle="`collapse`"
              :data-bs-target="`#collapse-${categoryKey}`" :aria-expanded="expandedCategories[categoryKey]"
              :aria-controls="`collapse-${categoryKey}`" @click="toggleCategory(categoryKey)">
              <span class="fw-semibold text-capitalize">
                {{ getCategoryDisplayName(categoryKey) }}
                <span class="badge bg-secondary ms-2">{{ category.length }}</span>
              </span>
            </button>
          </h2>
          <div :id="`collapse-${categoryKey}`" class="accordion-collapse collapse"
            :class="{ show: expandedCategories[categoryKey] }">
            <div class="accordion-body p-0">
              <div class="row g-2 p-2">
                <div v-for="component in category" :key="component.id" class="col-6">
                  <div class="component-item card border h-100 cursor-pointer"
                    :class="{ 'border-primary': draggedComponent?.id === component.id }" :draggable="true"
                    @dragstart="handleDragStart($event, component)" @dragend="handleDragEnd"
                    @click="selectComponent(component)">
                    <div class="card-body p-2 text-center">
                      <div class="component-icon mb-1">
                        <i :class="`bi bi-${component.icon}`"
                          :style="{ color: component.color, fontSize: '1.5rem' }"></i>
                      </div>
                      <div class="component-name small fw-medium text-truncate">
                        {{ component.name }}
                      </div>
                      <div class="component-description text-muted" style="font-size: 0.7rem;">
                        {{ getComponentDescription(component) }}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Selected Component Info -->
    <div v-if="selectedComponent" class="border-top p-3 bg-light">
      <h6 class="fw-bold mb-2">{{ selectedComponent.name }}</h6>
      <div class="small text-muted mb-2">
        {{ getComponentDescription(selectedComponent) }}
      </div>
      <div class="d-flex gap-2">
        <button class="btn btn-primary btn-sm flex-fill" @click="addComponentToCanvas">
          <i class="bi bi-plus"></i> Add to Canvas
        </button>
        <button class="btn btn-outline-secondary btn-sm" @click="selectedComponent = null">
          <i class="bi bi-x"></i>
        </button>
      </div>
    </div>

    <!-- Quick Actions -->
    <div class="border-top p-2">
      <div class="d-flex gap-1">
        <button class="btn btn-outline-secondary btn-sm flex-fill" @click="collapseAll" title="Collapse All">
          <i class="bi bi-chevron-up"></i>
        </button>
        <button class="btn btn-outline-secondary btn-sm flex-fill" @click="expandAll" title="Expand All">
          <i class="bi bi-chevron-down"></i>
        </button>
        <button class="btn btn-outline-secondary btn-sm flex-fill" @click="refreshPalette" title="Refresh">
          <i class="bi bi-arrow-clockwise"></i>
        </button>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { useDesignStore } from '@stores/designStore'

const emit = defineEmits(['component-selected', 'component-added'])

// Stores
const designStore = useDesignStore()

// Component state
const searchQuery = ref('')
const activeFilter = ref('')
const selectedComponent = ref(null)
const draggedComponent = ref(null)
const expandedCategories = ref({
  infrastructure: true,
  rollingStock: false,
  timetable: false,
  interlocking: false,
  ocs: false
})

// Computed properties
const filteredCategories = computed(() => {
  const categories = designStore.componentTypes
  const filtered = {}

  Object.keys(categories).forEach(categoryKey => {
    // Apply category filter
    if (activeFilter.value && activeFilter.value !== categoryKey) {
      return
    }

    // Apply search filter
    const filteredComponents = categories[categoryKey].filter(component => {
      if (!searchQuery.value) return true

      const query = searchQuery.value.toLowerCase()
      return (
        component.name.toLowerCase().includes(query) ||
        component.id.toLowerCase().includes(query)
      )
    })

    if (filteredComponents.length > 0) {
      filtered[categoryKey] = filteredComponents
    }
  })

  return filtered
})

// Methods
const getCategoryDisplayName = (categoryKey) => {
  const displayNames = {
    infrastructure: 'Infrastructure',
    rollingStock: 'Rolling Stock',
    timetable: 'Timetable',
    interlocking: 'Interlocking',
    ocs: 'OCS Elements'
  }
  return displayNames[categoryKey] || categoryKey
}

const getComponentDescription = (component) => {
  const descriptions = {
    track: 'Basic railway track segment',
    switch: 'Track junction for routing',
    signal: 'Traffic control device',
    station: 'Passenger/freight facility',
    platform: 'Passenger boarding area',
    locomotive: 'Self-propelled train unit',
    wagon: 'Non-powered train car',
    trainset: 'Multiple unit train',
    'train-path': 'Scheduled train route',
    'operating-period': 'Service time window',
    route: 'Interlocked path',
    block: 'Track occupation section',
    balise: 'Electronic beacon',
    'level-crossing': 'Road/rail intersection'
  }
  return descriptions[component.id] || 'Railway component'
}

const toggleCategory = (categoryKey) => {
  expandedCategories.value[categoryKey] = !expandedCategories.value[categoryKey]
}

const collapseAll = () => {
  Object.keys(expandedCategories.value).forEach(key => {
    expandedCategories.value[key] = false
  })
}

const expandAll = () => {
  Object.keys(expandedCategories.value).forEach(key => {
    expandedCategories.value[key] = true
  })
}

const refreshPalette = () => {
  // Reset filters and selections
  searchQuery.value = ''
  activeFilter.value = ''
  selectedComponent.value = null
}

const selectComponent = (component) => {
  selectedComponent.value = component
  emit('component-selected', component)
}

const handleDragStart = (event, component) => {
  draggedComponent.value = component

  // Set drag data
  event.dataTransfer.setData('application/json', JSON.stringify({
    ...component,
    dragType: 'component'
  }))

  event.dataTransfer.effectAllowed = 'copy'

  // Create drag image
  const dragImage = createDragImage(component)
  if (dragImage) {
    event.dataTransfer.setDragImage(dragImage, 25, 25)
  }
}

const handleDragEnd = () => {
  draggedComponent.value = null
}

const createDragImage = (component) => {
  // Create a temporary element for drag preview
  const dragElement = document.createElement('div')
  dragElement.style.cssText = `
    position: absolute;
    top: -1000px;
    left: -1000px;
    width: 50px;
    height: 50px;
    background: white;
    border: 2px solid #0d6efd;
    border-radius: 4px;
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 1.5rem;
    color: ${component.color};
    box-shadow: 0 2px 8px rgba(0,0,0,0.15);
  `

  const icon = document.createElement('i')
  icon.className = `bi bi-${component.icon}`
  dragElement.appendChild(icon)

  document.body.appendChild(dragElement)

  // Remove after a short delay
  setTimeout(() => {
    document.body.removeChild(dragElement)
  }, 100)

  return dragElement
}

const addComponentToCanvas = () => {
  if (!selectedComponent.value) return

  // Add component to center of canvas
  const component = designStore.addComponent({
    ...selectedComponent.value,
    position: { x: 400, y: 300 }, // Default center position
    module: designStore.activeModule
  })

  emit('component-added', component)
  selectedComponent.value = null
}

// Lifecycle
onMounted(() => {
  // Auto-expand first category if none are expanded
  const hasExpanded = Object.values(expandedCategories.value).some(Boolean)
  if (!hasExpanded) {
    expandedCategories.value.infrastructure = true
  }
})
</script>

<style scoped>
.component-palette {
  width: 280px;
  min-width: 280px;
  background: white;
  border-right: 1px solid #dee2e6;
}

.component-item {
  transition: all 0.2s ease;
  user-select: none;
}

.component-item:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);
  border-color: #0d6efd !important;
}

.component-item.border-primary {
  background: rgba(13, 110, 253, 0.05);
}

.cursor-pointer {
  cursor: pointer;
}

.accordion-button {
  font-size: 0.9rem;
}

.accordion-button:not(.collapsed) {
  background-color: #e7f1ff;
  border-color: #b6d7ff;
  color: #0d6efd;
}

.component-icon {
  height: 32px;
  display: flex;
  align-items: center;
  justify-content: center;
}

.btn-check:checked+.btn-outline-primary {
  background-color: #0d6efd;
  border-color: #0d6efd;
  color: white;
}

/* Drag and drop styles */
.component-item[draggable="true"] {
  cursor: grab;
}

.component-item[draggable="true"]:active {
  cursor: grabbing;
}

/* Scrollbar styling */
.overflow-auto::-webkit-scrollbar {
  width: 6px;
}

.overflow-auto::-webkit-scrollbar-track {
  background: #f1f1f1;
}

.overflow-auto::-webkit-scrollbar-thumb {
  background: #c1c1c1;
  border-radius: 3px;
}

.overflow-auto::-webkit-scrollbar-thumb:hover {
  background: #a8a8a8;
}
</style>