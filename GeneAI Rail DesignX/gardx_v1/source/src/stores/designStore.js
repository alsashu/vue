import { defineStore } from "pinia";
import { ref, computed } from "vue";
import { v4 as uuidv4 } from "uuid";

export const useDesignStore = defineStore("design", () => {
  const currentProject = ref(null);
  const activeModule = ref("track-editor");
  const activeSegment = ref("segment-1");
  const segments = ref({});
  const components = ref({});
  const selectedComponent = ref(null);
  const canvasHistory = ref([]);
  const historyIndex = ref(-1);
  const isDirty = ref(false);

  // Computed
  const currentSegment = computed(() => {
    return segments.value[activeSegment.value] || null;
  });

  const canUndo = computed(() => historyIndex.value > 0);
  const canRedo = computed(
    () => historyIndex.value < canvasHistory.value.length - 1
  );

  // Available modules
  const modules = ref([
    { id: "track-editor", name: "Track Plan Editor", icon: "train" },
    { id: "io-mapping", name: "Input-Output Mapping", icon: "diagram-3" },
    { id: "wiring-diagram", name: "Wiring Diagram", icon: "bezier" },
    { id: "system-art", name: "System Architecture", icon: "boxes" },
    { id: "common-tools", name: "Common Infrastructure", icon: "tools" },
  ]);

  // Railway component types
  const componentTypes = ref({
    infrastructure: [
      { id: "track", name: "Track", icon: "minus", color: "#333" },
      { id: "switch", name: "Switch", icon: "arrow-left-right", color: "#666" },
      { id: "signal", name: "Signal", icon: "traffic-light", color: "#ff0000" },
      { id: "station", name: "Station", icon: "building", color: "#0066cc" },
      { id: "platform", name: "Platform", icon: "square", color: "#999" },
    ],
    rollingStock: [
      { id: "locomotive", name: "Locomotive", icon: "truck", color: "#cc0000" },
      { id: "wagon", name: "Wagon", icon: "square", color: "#333" },
      {
        id: "trainset",
        name: "Trainset",
        icon: "train-front",
        color: "#0066cc",
      },
    ],
    timetable: [
      {
        id: "train-path",
        name: "Train Path",
        icon: "arrow-right",
        color: "#00cc66",
      },
      {
        id: "operating-period",
        name: "Operating Period",
        icon: "clock",
        color: "#ff9900",
      },
    ],
    interlocking: [
      {
        id: "route",
        name: "Route",
        icon: "arrow-right-circle",
        color: "#6600cc",
      },
      { id: "block", name: "Block", icon: "square-fill", color: "#cc6600" },
    ],
    ocs: [
      { id: "balise", name: "Balise", icon: "circle", color: "#ffcc00" },
      {
        id: "level-crossing",
        name: "Level Crossing",
        icon: "x-octagon",
        color: "#ff0000",
      },
    ],
  });

  // Actions
  const createProject = (projectData) => {
    currentProject.value = {
      id: uuidv4(),
      name: projectData.name,
      description: projectData.description,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      ...projectData,
    };

    // Initialize default segment
    segments.value = {
      "segment-1": {
        id: "segment-1",
        name: "Main Design",
        components: [],
        canvasState: null,
      },
    };

    saveToHistory();
    isDirty.value = false;
  };

  const setActiveModule = (moduleId) => {
    activeModule.value = moduleId;
  };

  const setActiveSegment = (segmentId) => {
    activeSegment.value = segmentId;
  };

  const addSegment = (segmentData) => {
    const segmentId = uuidv4();
    segments.value[segmentId] = {
      id: segmentId,
      name:
        segmentData.name || `Segment ${Object.keys(segments.value).length + 1}`,
      components: [],
      canvasState: null,
      ...segmentData,
    };
    activeSegment.value = segmentId;
    isDirty.value = true;
  };

  const removeSegment = (segmentId) => {
    if (Object.keys(segments.value).length <= 1) return;

    delete segments.value[segmentId];

    if (activeSegment.value === segmentId) {
      activeSegment.value = Object.keys(segments.value)[0];
    }
    isDirty.value = true;
  };

  const addComponent = (componentData) => {
    const component = {
      id: uuidv4(),
      segmentId: activeSegment.value,
      createdAt: new Date().toISOString(),
      ...componentData,
    };

    components.value[component.id] = component;

    if (currentSegment.value) {
      currentSegment.value.components.push(component.id);
    }

    saveToHistory();
    isDirty.value = true;
    return component;
  };

  const updateComponent = (componentId, updates) => {
    if (components.value[componentId]) {
      components.value[componentId] = {
        ...components.value[componentId],
        ...updates,
        updatedAt: new Date().toISOString(),
      };
      isDirty.value = true;
    }
  };

  const removeComponent = (componentId) => {
    const component = components.value[componentId];
    if (component) {
      delete components.value[componentId];

      // Remove from segment
      const segment = segments.value[component.segmentId];
      if (segment) {
        segment.components = segment.components.filter(
          (id) => id !== componentId
        );
      }

      if (selectedComponent.value?.id === componentId) {
        selectedComponent.value = null;
      }

      saveToHistory();
      isDirty.value = true;
    }
  };

  const selectComponent = (component) => {
    selectedComponent.value = component;
  };

  const saveToHistory = () => {
    const state = {
      segments: JSON.parse(JSON.stringify(segments.value)),
      components: JSON.parse(JSON.stringify(components.value)),
      timestamp: Date.now(),
    };

    // Remove future history if we're not at the end
    if (historyIndex.value < canvasHistory.value.length - 1) {
      canvasHistory.value = canvasHistory.value.slice(
        0,
        historyIndex.value + 1
      );
    }

    canvasHistory.value.push(state);
    historyIndex.value = canvasHistory.value.length - 1;

    // Limit history size
    if (canvasHistory.value.length > 50) {
      canvasHistory.value.shift();
      historyIndex.value--;
    }
  };

  const undo = () => {
    if (canUndo.value) {
      historyIndex.value--;
      const state = canvasHistory.value[historyIndex.value];
      segments.value = JSON.parse(JSON.stringify(state.segments));
      components.value = JSON.parse(JSON.stringify(state.components));
    }
  };

  const redo = () => {
    if (canRedo.value) {
      historyIndex.value++;
      const state = canvasHistory.value[historyIndex.value];
      segments.value = JSON.parse(JSON.stringify(state.segments));
      components.value = JSON.parse(JSON.stringify(state.components));
    }
  };

  const saveProject = () => {
    if (currentProject.value) {
      currentProject.value.updatedAt = new Date().toISOString();
      // Here you would typically save to backend
      console.log("Saving project:", currentProject.value);
      isDirty.value = false;
    }
  };

  const loadProject = (projectData) => {
    currentProject.value = projectData;
    segments.value = projectData.segments || {};
    components.value = projectData.components || {};
    activeModule.value = projectData.activeModule || "track-editor";
    activeSegment.value =
      projectData.activeSegment || Object.keys(segments.value)[0];
    isDirty.value = false;
  };

  const exportProject = (format = "json") => {
    const exportData = {
      project: currentProject.value,
      segments: segments.value,
      components: components.value,
      metadata: {
        exportedAt: new Date().toISOString(),
        format,
        version: "1.0.0",
      },
    };

    return exportData;
  };

  return {
    currentProject,
    activeModule,
    activeSegment,
    segments,
    components,
    selectedComponent,
    canvasHistory,
    historyIndex,
    isDirty,
    currentSegment,
    canUndo,
    canRedo,
    modules,
    componentTypes,
    createProject,
    setActiveModule,
    setActiveSegment,
    addSegment,
    removeSegment,
    addComponent,
    updateComponent,
    removeComponent,
    selectComponent,
    saveToHistory,
    undo,
    redo,
    saveProject,
    loadProject,
    exportProject,
  };
});
