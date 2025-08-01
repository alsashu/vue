// stores/trackStore.js - Pinia Store for Track Management
import { defineStore } from "pinia";
import { ref, computed } from "vue";

export const useTrackStore = defineStore("trackStore", () => {
  // State
  const tracks = ref([]);
  const components = ref([]);
  const drawingMode = ref("select"); // 'select', 'draw', 'polyline'
  const currentTrack = ref(null);
  const selectedTrack = ref(null);
  const selectedComponent = ref(null);
  const snapDistance = ref(10);

  // Computed
  const isDrawing = computed(
    () => drawingMode.value === "draw" || drawingMode.value === "polyline"
  );

  // Track Management
  const addTrack = (track) => {
    const newTrack = {
      id: `track-${Date.now()}`,
      type: "track",
      points: track.points || [],
      color: track.color || "#333333",
      strokeWidth: track.strokeWidth || 4,
      createdAt: new Date().toISOString(),
      ...track,
    };
    tracks.value.push(newTrack);
    return newTrack;
  };

  const updateTrack = (trackId, updates) => {
    const index = tracks.value.findIndex((t) => t.id === trackId);
    if (index !== -1) {
      tracks.value[index] = { ...tracks.value[index], ...updates };
    }
  };

  const removeTrack = (trackId) => {
    const index = tracks.value.findIndex((t) => t.id === trackId);
    if (index !== -1) {
      tracks.value.splice(index, 1);
    }
  };

  const clearTracks = () => {
    tracks.value = [];
    currentTrack.value = null;
    selectedTrack.value = null;
  };

  // Component Management
  const addComponent = (component) => {
    const newComponent = {
      id: `component-${Date.now()}`,
      position: { x: 0, y: 0 },
      rotation: 0,
      createdAt: new Date().toISOString(),
      ...component,
    };
    components.value.push(newComponent);
    return newComponent;
  };

  const updateComponent = (componentId, updates) => {
    const index = components.value.findIndex((c) => c.id === componentId);
    if (index !== -1) {
      components.value[index] = { ...components.value[index], ...updates };
    }
  };

  const removeComponent = (componentId) => {
    const index = components.value.findIndex((c) => c.id === componentId);
    if (index !== -1) {
      components.value.splice(index, 1);
    }
  };

  // Drawing State Management
  const startDrawing = (mode = "draw") => {
    drawingMode.value = mode;
    currentTrack.value = null;
    selectedTrack.value = null;
    selectedComponent.value = null;
  };

  const stopDrawing = () => {
    if (currentTrack.value && currentTrack.value.points.length >= 4) {
      addTrack(currentTrack.value);
    }
    drawingMode.value = "select";
    currentTrack.value = null;
  };

  const setDrawingMode = (mode) => {
    drawingMode.value = mode;
    if (mode !== "draw" && mode !== "polyline") {
      currentTrack.value = null;
    }
  };

  // Utility Functions
  const getTrackById = (trackId) => {
    return tracks.value.find((t) => t.id === trackId);
  };

  const getComponentById = (componentId) => {
    return components.value.find((c) => c.id === componentId);
  };

  // Find nearest point on any track
  const findNearestTrackPoint = (x, y) => {
    let minDistance = Infinity;
    let nearestPoint = null;
    let nearestTrack = null;

    tracks.value.forEach((track) => {
      const points = track.points;
      for (let i = 0; i < points.length - 2; i += 2) {
        const x1 = points[i];
        const y1 = points[i + 1];
        const x2 = points[i + 2] || x1;
        const y2 = points[i + 3] || y1;

        // Calculate distance to line segment
        const distance = distanceToLineSegment(x, y, x1, y1, x2, y2);
        if (distance < minDistance && distance <= snapDistance.value) {
          minDistance = distance;
          nearestPoint = { x: x1, y: y1 }; // Simplified - could calculate exact point on line
          nearestTrack = track;
        }
      }
    });

    return nearestPoint
      ? { point: nearestPoint, track: nearestTrack, distance: minDistance }
      : null;
  };

  // Helper function to calculate distance from point to line segment
  const distanceToLineSegment = (px, py, x1, y1, x2, y2) => {
    const dx = x2 - x1;
    const dy = y2 - y1;
    const length = Math.sqrt(dx * dx + dy * dy);

    if (length === 0) {
      return Math.sqrt((px - x1) * (px - x1) + (py - y1) * (py - y1));
    }

    const t = Math.max(
      0,
      Math.min(1, ((px - x1) * dx + (py - y1) * dy) / (length * length))
    );
    const projX = x1 + t * dx;
    const projY = y1 + t * dy;

    return Math.sqrt((px - projX) * (px - projX) + (py - projY) * (py - projY));
  };

  return {
    // State
    tracks,
    components,
    drawingMode,
    currentTrack,
    selectedTrack,
    selectedComponent,
    snapDistance,

    // Computed
    isDrawing,

    // Actions
    addTrack,
    updateTrack,
    removeTrack,
    clearTracks,
    addComponent,
    updateComponent,
    removeComponent,
    startDrawing,
    stopDrawing,
    setDrawingMode,
    getTrackById,
    getComponentById,
    findNearestTrackPoint,
  };
});
