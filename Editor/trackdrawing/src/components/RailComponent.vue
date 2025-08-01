<template>
  <v-group v-if="validComponent" :config="{
    id: validComponent.id,
    x: validComponent.position?.x || 0,
    y: validComponent.position?.y || 0,
    rotation: validComponent.rotation || 0,
    scaleX: validComponent.scale?.x || 1,
    scaleY: validComponent.scale?.y || 1,
    draggable: isDraggable
  }" @dragstart="handleDragStart" @dragend="handleDragEnd" @click="handleClick" @dblclick="handleDoubleClick"
    @mouseenter="handleMouseEnter" @mouseleave="handleMouseLeave">
    <!-- Signal Component -->
    <template v-if="validComponent.type === 'signal'">
      <!-- Signal pole -->
      <v-line :config="{
        points: [0, 0, 0, -40],
        stroke: '#666666',
        strokeWidth: 3
      }" />
      <!-- Signal head -->
      <v-circle :config="{
        x: 0,
        y: -35,
        radius: 8,
        fill: getSignalColor(),
        stroke: '#333',
        strokeWidth: 1
      }" />
      <!-- Signal number -->
      <v-text :config="{
        x: 10,
        y: -30,
        text: validComponent.signalNumber || validComponent.name || 'S1',
        fontSize: 10,
        fill: '#333'
      }" />
    </template>

    <!-- Switch Component -->
    <template v-else-if="validComponent.type === 'switch'">
      <!-- Switch base -->
      <v-rect :config="{
        x: -15,
        y: -8,
        width: 30,
        height: 16,
        fill: '#666666',
        stroke: '#333',
        strokeWidth: 2,
        cornerRadius: 4
      }" />
      <!-- Switch indicator -->
      <v-circle :config="{
        x: 0,
        y: 0,
        radius: 6,
        fill: validComponent.state === 'normal' ? '#00ff00' : '#ff9900',
        stroke: '#333',
        strokeWidth: 1
      }" />
      <!-- Switch label -->
      <v-text :config="{
        x: -10,
        y: 12,
        text: validComponent.name || 'SW',
        fontSize: 8,
        fill: '#333'
      }" />
    </template>

    <!-- Station Component -->
    <template v-else-if="validComponent.type === 'station'">
      <!-- Station building -->
      <v-rect :config="{
        x: -30,
        y: -20,
        width: 60,
        height: 40,
        fill: validComponent.color || '#0066cc',
        stroke: '#333',
        strokeWidth: 2,
        cornerRadius: 4
      }" />
      <!-- Station roof -->
      <v-line :config="{
        points: [-35, -20, 0, -35, 35, -20],
        stroke: '#333',
        strokeWidth: 2,
        fill: '#8B4513',
        closed: true
      }" />
      <!-- Station name -->
      <v-text :config="{
        x: -25,
        y: -5,
        text: validComponent.name || 'Station',
        fontSize: 10,
        fill: 'white',
        fontStyle: 'bold'
      }" />
    </template>

    <!-- Platform Component -->
    <template v-else-if="validComponent.type === 'platform'">
      <v-rect :config="{
        x: -40,
        y: -8,
        width: 80,
        height: 16,
        fill: validComponent.color || '#999999',
        stroke: '#333',
        strokeWidth: 1
      }" />
      <!-- Platform edge (safety line) -->
      <v-line :config="{
        points: [-40, -8, 40, -8],
        stroke: '#ffff00',
        strokeWidth: 2
      }" />
      <!-- Platform supports -->
      <v-line :config="{
        points: [-30, 8, -30, 15],
        stroke: '#666',
        strokeWidth: 2
      }" />
      <v-line :config="{
        points: [0, 8, 0, 15],
        stroke: '#666',
        strokeWidth: 2
      }" />
      <v-line :config="{
        points: [30, 8, 30, 15],
        stroke: '#666',
        strokeWidth: 2
      }" />
      <!-- Platform label -->
      <v-text :config="{
        x: -15,
        y: -2,
        text: validComponent.name || 'Platform',
        fontSize: 8,
        fill: '#333'
      }" />
    </template>

    <!-- Generic Component (fallback) -->
    <template v-else>
      <v-rect :config="{
        x: -15,
        y: -15,
        width: 30,
        height: 30,
        fill: validComponent.color || '#cccccc',
        stroke: '#333',
        strokeWidth: 1,
        cornerRadius: 4
      }" />
      <v-text :config="{
        x: -10,
        y: -3,
        text: validComponent.type ? validComponent.type.charAt(0).toUpperCase() : '?',
        fontSize: 14,
        fill: '#333'
      }" />
    </template>

    <!-- Selection Indicator -->
    <v-rect v-if="isSelected" :config="{
      x: -getBounds().width / 2 - 5,
      y: -getBounds().height / 2 - 5,
      width: getBounds().width + 10,
      height: getBounds().height + 10,
      stroke: '#0d6efd',
      strokeWidth: 2,
      dash: [5, 5],
      fill: 'transparent'
    }" />

    <!-- Hover Indicator -->
    <v-rect v-if="isHovered && !isSelected" :config="{
      x: -getBounds().width / 2 - 3,
      y: -getBounds().height / 2 - 3,
      width: getBounds().width + 6,
      height: getBounds().height + 6,
      stroke: '#17a2b8',
      strokeWidth: 1,
      dash: [3, 3],
      fill: 'transparent',
      opacity: 0.7
    }" />

    <!-- Connection Points (when selected) -->
    <template v-if="isSelected && showConnectionPoints">
      <v-circle v-for="(point, index) in getConnectionPoints()" :key="`connection-${index}`" :config="{
        x: point.x,
        y: point.y,
        radius: 4,
        fill: '#00ff00',
        stroke: '#333',
        strokeWidth: 1
      }" />
    </template>

    <!-- Snap Indicator (when being placed) -->
    <v-circle v-if="showSnapIndicator" :config="{
      x: 0,
      y: 0,
      radius: 12,
      fill: 'transparent',
      stroke: '#00ff00',
      strokeWidth: 2,
      dash: [4, 4],
      opacity: 0.8
    }" />
  </v-group>

  <!-- Error fallback for invalid components -->
  <v-group v-else :config="{
    id: 'invalid-component',
    x: 0,
    y: 0,
    draggable: false
  }">
    <v-rect :config="{
      x: -20,
      y: -20,
      width: 40,
      height: 40,
      fill: '#ff0000',
      stroke: '#333',
      strokeWidth: 2
    }" />
    <v-text :config="{
      x: -5,
      y: -3,
      text: '!',
      fontSize: 16,
      fill: 'white',
      fontStyle: 'bold'
    }" />
  </v-group>
</template>

<script setup>
import { computed, ref } from 'vue'

const props = defineProps({
  component: {
    type: Object,
    required: true,
    validator: (value) => {
      if (!value || typeof value !== 'object') {
        console.error('RailComponent: component prop must be an object, received:', value)
        return false
      }

      // Check if we have either type or a valid id that can be used as type
      const validTypes = ['signal', 'switch', 'station', 'platform']
      const hasType = value.type && validTypes.includes(value.type)
      const hasValidId = value.id && validTypes.includes(value.id)

      if (!hasType && !hasValidId) {
        console.error('RailComponent: component must have a valid type property or id property matching component types:', value)
        console.error('Valid types:', validTypes)
        console.error('Received component keys:', Object.keys(value))
        return false
      }

      return true
    }
  },
  isSelected: {
    type: Boolean,
    default: false
  },
  showConnectionPoints: {
    type: Boolean,
    default: false
  },
  isDraggable: {
    type: Boolean,
    default: true
  },
  showSnapIndicator: {
    type: Boolean,
    default: false
  }
})

const emit = defineEmits(['select', 'update', 'delete', 'connect'])

// Local state
const isHovered = ref(false)

// Computed properties
const validComponent = computed(() => {
  if (!props.component || typeof props.component !== 'object') {
    return null
  }

  // Create a normalized component object
  const component = { ...props.component }

  // If no type but has id that looks like a type, use id as type
  if (!component.type && component.id) {
    // Check if id is a component type
    const validTypes = ['signal', 'switch', 'station', 'platform']
    if (validTypes.includes(component.id)) {
      component.type = component.id
    }
  }

  // Still no type? Return null
  if (!component.type) {
    return null
  }

  return component
})

const getBounds = () => {
  const component = validComponent.value
  if (!component) {
    return { width: 40, height: 40 }
  }

  switch (component.type) {
    case 'signal':
      return { width: 20, height: 50 }
    case 'switch':
      return { width: 30, height: 20 }
    case 'station':
      return { width: 70, height: 50 }
    case 'platform':
      return { width: 80, height: 25 }
    default:
      return { width: 30, height: 30 }
  }
}

// Signal-specific methods
const getSignalColor = () => {
  const component = validComponent.value
  const aspect = component?.aspect || component?.state || 'red'
  const colors = {
    red: '#ff0000',
    yellow: '#ffff00',
    green: '#00ff00',
    off: '#666666',
    danger: '#ff0000',
    caution: '#ffff00',
    clear: '#00ff00'
  }
  return colors[aspect] || colors.red
}

// Connection points for different component types
const getConnectionPoints = () => {
  const component = validComponent.value
  if (!component) {
    return [{ x: 0, y: 0 }]
  }

  switch (component.type) {
    case 'signal':
      return [{ x: 0, y: 0 }] // Base connection point

    case 'switch':
      return [
        { x: -15, y: 0 }, // Left connection
        { x: 15, y: 0 },  // Right connection
        { x: 0, y: -8 },  // Top connection
        { x: 0, y: 8 }    // Bottom connection
      ]

    case 'station':
      return [
        { x: -30, y: 0 },
        { x: 30, y: 0 },
        { x: 0, y: -20 },
        { x: 0, y: 20 }
      ]

    case 'platform':
      return [
        { x: -40, y: 0 },
        { x: 40, y: 0 },
        { x: 0, y: -8 },
        { x: 0, y: 8 }
      ]

    default:
      return [{ x: 0, y: 0 }]
  }
}

// Event handlers
const handleClick = (e) => {
  e.cancelBubble = true
  const component = validComponent.value
  if (component) {
    emit('select', component)
  }
}

const handleDoubleClick = (e) => {
  e.cancelBubble = true
  const component = validComponent.value
  if (!component) return

  // Toggle component states on double-click
  if (component.type === 'switch') {
    const newState = component.state === 'normal' ? 'reverse' : 'normal'
    emit('update', component.id, { state: newState })
  } else if (component.type === 'signal') {
    const aspects = ['red', 'yellow', 'green', 'off']
    const currentAspect = component.aspect || component.state || 'red'
    const currentIndex = aspects.indexOf(currentAspect)
    const nextAspect = aspects[(currentIndex + 1) % aspects.length]
    emit('update', component.id, { aspect: nextAspect, state: nextAspect })
  }
}

const handleMouseEnter = () => {
  isHovered.value = true
}

const handleMouseLeave = () => {
  isHovered.value = false
}

const handleDragStart = (e) => {
  const component = validComponent.value
  if (!component) return

  // Store initial position for snapping
  const stage = e.target.getStage()
  if (stage && component.position) {
    stage.dragStartPosition = {
      x: component.position.x,
      y: component.position.y
    }
  }
}

const handleDragEnd = (e) => {
  const component = validComponent.value
  if (!component) return

  const stage = e.target.getStage()
  const node = e.target

  let newPosition = {
    x: node.x(),
    y: node.y()
  }

  // Snap to grid if enabled
  const gridSize = 20 // Should come from store/settings
  if (stage?.snapToGrid) {
    newPosition.x = Math.round(newPosition.x / gridSize) * gridSize
    newPosition.y = Math.round(newPosition.y / gridSize) * gridSize

    // Update visual position
    node.position(newPosition)
  }

  // Check for track snapping
  // This would need to be implemented with access to the track store
  // For now, just emit the update
  emit('update', component.id, { position: newPosition })
}
</script>