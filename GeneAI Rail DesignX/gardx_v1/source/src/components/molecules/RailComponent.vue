<template>
  <v-group :config="{
    id: component.id,
    x: component.position.x,
    y: component.position.y,
    rotation: component.rotation || 0,
    scaleX: component.scale?.x || 1,
    scaleY: component.scale?.y || 1,
    draggable: true
  }" @dragstart="handleDragStart" @dragend="handleDragEnd" @click="handleClick" @dblclick="handleDoubleClick">
    <!-- Track Component -->
    <template v-if="component.type === 'track'">
      <v-line :config="{
        points: getTrackPoints(),
        stroke: component.color || '#333333',
        strokeWidth: component.strokeWidth || 4,
        lineCap: 'round'
      }" />
      <!-- Track markers -->
      <v-circle v-for="(point, index) in getTrackEndPoints()" :key="`marker-${index}`" :config="{
        x: point.x,
        y: point.y,
        radius: 3,
        fill: component.color || '#333333'
      }" />
    </template>

    <!-- Switch Component -->
    <template v-else-if="component.type === 'switch'">
      <!-- Main track -->
      <v-line :config="{
        points: getSwitchMainPoints(),
        stroke: component.color || '#666666',
        strokeWidth: 4,
        lineCap: 'round'
      }" />
      <!-- Branch track -->
      <v-line :config="{
        points: getSwitchBranchPoints(),
        stroke: component.color || '#666666',
        strokeWidth: 4,
        lineCap: 'round'
      }" />
      <!-- Switch mechanism -->
      <v-rect :config="{
        x: -10,
        y: -5,
        width: 20,
        height: 10,
        fill: component.state === 'normal' ? '#00ff00' : '#ff9900',
        stroke: '#333',
        strokeWidth: 1
      }" />
    </template>

    <!-- Signal Component -->
    <template v-else-if="component.type === 'signal'">
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
        text: component.signalNumber || 'S1',
        fontSize: 10,
        fill: '#333'
      }" />
    </template>

    <!-- Station Component -->
    <template v-else-if="component.type === 'station'">
      <!-- Station building -->
      <v-rect :config="{
        x: -30,
        y: -20,
        width: 60,
        height: 40,
        fill: component.color || '#0066cc',
        stroke: '#333',
        strokeWidth: 2
      }" />
      <!-- Station name -->
      <v-text :config="{
        x: -25,
        y: -5,
        text: component.name || 'Station',
        fontSize: 12,
        fill: 'white',
        fontStyle: 'bold'
      }" />
    </template>

    <!-- Platform Component -->
    <template v-else-if="component.type === 'platform'">
      <v-rect :config="{
        x: -40,
        y: -8,
        width: 80,
        height: 16,
        fill: component.color || '#999999',
        stroke: '#333',
        strokeWidth: 1
      }" />
      <!-- Platform edge -->
      <v-line :config="{
        points: [-40, -8, 40, -8],
        stroke: '#ffff00',
        strokeWidth: 2
      }" />
    </template>

    <!-- Generic Component (fallback) -->
    <template v-else>
      <v-rect :config="{
        x: -15,
        y: -15,
        width: 30,
        height: 30,
        fill: component.color || '#cccccc',
        stroke: '#333',
        strokeWidth: 1
      }" />
      <v-text :config="{
        x: -10,
        y: -3,
        text: component.type.charAt(0).toUpperCase(),
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

    <!-- Connection Points -->
    <template v-if="showConnectionPoints">
      <v-circle v-for="(point, index) in getConnectionPoints()" :key="`connection-${index}`" :config="{
        x: point.x,
        y: point.y,
        radius: 4,
        fill: '#00ff00',
        stroke: '#333',
        strokeWidth: 1
      }" />
    </template>
  </v-group>
</template>

<script setup>
import { computed } from 'vue'

const props = defineProps({
  component: {
    type: Object,
    required: true
  },
  isSelected: {
    type: Boolean,
    default: false
  },
  showConnectionPoints: {
    type: Boolean,
    default: false
  }
})

const emit = defineEmits(['select', 'update', 'delete', 'connect'])

// Computed properties
const getBounds = () => {
  switch (props.component.type) {
    case 'track':
      return { width: 100, height: 10 }
    case 'switch':
      return { width: 80, height: 60 }
    case 'signal':
      return { width: 20, height: 50 }
    case 'station':
      return { width: 60, height: 40 }
    case 'platform':
      return { width: 80, height: 16 }
    default:
      return { width: 30, height: 30 }
  }
}

// Track-specific methods
const getTrackPoints = () => {
  const length = props.component.length || 100
  return [-length / 2, 0, length / 2, 0]
}

const getTrackEndPoints = () => {
  const length = props.component.length || 100
  return [
    { x: -length / 2, y: 0 },
    { x: length / 2, y: 0 }
  ]
}

// Switch-specific methods
const getSwitchMainPoints = () => {
  return [-40, 0, 40, 0]
}

const getSwitchBranchPoints = () => {
  const angle = props.component.branchAngle || 15
  const endX = 40 * Math.cos(angle * Math.PI / 180)
  const endY = -40 * Math.sin(angle * Math.PI / 180)
  return [0, 0, endX, endY]
}

// Signal-specific methods
const getSignalColor = () => {
  const aspect = props.component.aspect || 'red'
  const colors = {
    red: '#ff0000',
    yellow: '#ffff00',
    green: '#00ff00',
    off: '#666666'
  }
  return colors[aspect] || colors.red
}

// Connection points for different component types
const getConnectionPoints = () => {
  switch (props.component.type) {
    case 'track':
      const trackLength = props.component.length || 100
      return [
        { x: -trackLength / 2, y: 0 },
        { x: trackLength / 2, y: 0 }
      ]

    case 'switch':
      const branchAngle = props.component.branchAngle || 15
      const branchEndX = 40 * Math.cos(branchAngle * Math.PI / 180)
      const branchEndY = -40 * Math.sin(branchAngle * Math.PI / 180)
      return [
        { x: -40, y: 0 }, // Main entry
        { x: 40, y: 0 },  // Main exit
        { x: branchEndX, y: branchEndY } // Branch exit
      ]

    case 'signal':
      return [{ x: 0, y: 0 }] // Base connection point

    case 'station':
      return [
        { x: -30, y: 0 },
        { x: 30, y: 0 }
      ]

    case 'platform':
      return [
        { x: -40, y: 0 },
        { x: 40, y: 0 }
      ]

    default:
      return [{ x: 0, y: 0 }]
  }
}

// Event handlers
const handleClick = (e) => {
  e.cancelBubble = true
  emit('select', props.component)
}

const handleDoubleClick = (e) => {
  e.cancelBubble = true
  // Open properties dialog or toggle state
  if (props.component.type === 'switch') {
    const newState = props.component.state === 'normal' ? 'reverse' : 'normal'
    emit('update', props.component.id, { state: newState })
  } else if (props.component.type === 'signal') {
    const aspects = ['red', 'yellow', 'green', 'off']
    const currentIndex = aspects.indexOf(props.component.aspect || 'red')
    const nextAspect = aspects[(currentIndex + 1) % aspects.length]
    emit('update', props.component.id, { aspect: nextAspect })
  }
}

const handleDragStart = (e) => {
  // Store initial position for snapping
  const stage = e.target.getStage()
  stage.dragStartPosition = {
    x: props.component.position.x,
    y: props.component.position.y
  }
}

const handleDragEnd = (e) => {
  const stage = e.target.getStage()
  const node = e.target

  let newPosition = {
    x: node.x(),
    y: node.y()
  }

  // Snap to grid if enabled
  const gridSize = 20 // Should come from store/settings
  if (stage.snapToGrid) {
    newPosition.x = Math.round(newPosition.x / gridSize) * gridSize
    newPosition.y = Math.round(newPosition.y / gridSize) * gridSize

    // Update visual position
    node.position(newPosition)
  }

  // Emit update
  emit('update', props.component.id, { position: newPosition })
}
</script>