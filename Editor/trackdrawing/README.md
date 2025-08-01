# trackdrawing

This template should help get you started developing with Vue 3 in Vite.

## Recommended IDE Setup

[VSCode](https://code.visualstudio.com/) + [Volar](https://marketplace.visualstudio.com/items?itemName=Vue.volar) (and disable Vetur).

## Customize configuration

See [Vite Configuration Reference](https://vite.dev/config/).

## Project Setup

```sh
npm install
```

### Compile and Hot-Reload for Development

```sh
npm run dev
```

### Compile and Minify for Production

```sh
npm run build
```

# Railway Canvas Export Features

This document explains how to integrate and use the comprehensive export functionality for the railway design canvas.

## Features Overview

The export system provides three main export formats:

1. **SVG Export** - Vector graphics for scalable visual representation
2. **PDF Export** - Document format for sharing and printing
3. **RailML JSON Export** - Industry-standard railway markup language

## Installation & Setup

### 1. Add Export Utilities

Place the export utility files in your project:

```
src/
├── utils/
│   ├── exportUtils.js
│   └── railmlSchema.js
├── components/
│   ├── DrawingCanvas.vue (updated)
│   └── RailComponent.vue (existing)
└── stores/
    └── trackStore.js (existing)
```

### 2. Import Dependencies

The export system uses these external libraries:

```javascript
// For PDF generation
import { jsPDF } from "https://cdnjs.cloudflare.com/ajax/libs/jspdf/2.5.1/jspdf.umd.min.js";

// Optional: For advanced ZIP file creation
// import JSZip from 'jszip'
```

### 3. Update Your Canvas Component

Replace your existing `DrawingCanvas.vue` with the updated version that includes export functionality.

## Usage

### Basic Export Operations

```javascript
import { ExportUtils } from "@/utils/exportUtils";
import { useTrackStore } from "@/stores/trackStore";

// Initialize export utilities
const trackStore = useTrackStore();
const stage = ref(null); // Your Konva stage reference
const exportUtils = new ExportUtils(trackStore, stage);

// Export as SVG
await exportUtils.downloadSVG("my-railway-design.svg");

// Export as PDF
await exportUtils.downloadPDF("my-railway-design.pdf");

// Export as RailML JSON
await exportUtils.downloadRailML("my-railway-design.railml.json");
```

### Advanced Export Options

```javascript
// Export RailML with custom options
const railmlOptions = {
  infrastructureId: "my_custom_infrastructure_id",
  infrastructureName: "Main Line Railway",
  validate: true, // Include validation in export
};

await exportUtils.downloadRailML("custom-design.railml.json", railmlOptions);

// Export with validation report
await exportUtils.downloadRailMLWithReport(
  "design-with-validation.railml.json"
);
```

### Programmatic Export (No Download)

```javascript
// Get export content as strings
const svgContent = await exportUtils.exportToSVG();
const railmlContent = exportUtils.exportToRailML();
const pdfDocument = await exportUtils.exportToPDF();

// Process the content programmatically
console.log("SVG Length:", svgContent.length);
console.log("RailML Data:", JSON.parse(railmlContent));
```

## RailML Export Structure

The RailML export follows industry standards and includes:

### Infrastructure Data

```json
{
  "railml": {
    "version": "3.1",
    "infrastructure": {
      "tracks": [
        {
          "id": "track_1",
          "name": "Track 1",
          "length": 1250.5,
          "geometry": {
            "coordinates": [
              [0, 100],
              [500, 100],
              [1000, 200]
            ],
            "type": "LineString"
          },
          "visualProperties": {
            "color": "#333333",
            "strokeWidth": 4
          }
        }
      ],
      "functionalInfrastructure": [
        {
          "id": "signal_1",
          "type": "signal",
          "name": "Entry Signal",
          "position": {
            "x": 150,
            "y": 80,
            "coordinate": {
              "latitude": 0.0015,
              "longitude": 0.008,
              "elevation": 0
            }
          },
          "properties": {
            "aspect": "red",
            "signalType": "main",
            "signalNumber": "S1"
          }
        }
      ]
    }
  }
}
```

### Validation and Quality Checks

The export system includes automatic validation:

- **Schema Validation**: Ensures RailML compliance
- **Data Quality Checks**: Identifies potential issues
- **Component Validation**: Verifies component properties
- **Geometry Validation**: Checks coordinate validity

## Export UI Integration

### Toolbar Integration

The updated `DrawingCanvas.vue` includes an export dropdown in the toolbar:

```html
<div class="export-tools">
  <div class="dropdown">
    <button class="dropdown-toggle" @click="toggleExportDropdown">
      Export ▼
    </button>
    <div v-if="showExportDropdown" class="dropdown-menu">
      <button @click="exportSVG">Export as SVG</button>
      <button @click="exportPDF">Export as PDF</button>
      <button @click="exportRailML">Export as RailML JSON</button>
      <button @click="showExportPreview = true">Preview Export Data</button>
    </div>
  </div>
</div>
```

### Export Preview Modal

Users can preview export data before downloading:

- **Statistics Tab**: Shows design metrics and component counts
- **SVG Tab**: Preview of SVG export content (truncated)
- **RailML Tab**: Preview of RailML JSON structure (truncated)

### Progress Indicators

Export operations show progress with loading spinners and status messages.

## Validation System

### RailML Schema Validation

```javascript
import { RailMLValidator } from "@/utils/railmlSchema";

const validator = new RailMLValidator();
const validationResult = validator.validateRailMLDocument(railmlData);

if (validationResult.isValid) {
  console.log("✅ RailML document is valid");
} else {
  console.log("❌ Validation errors:", validationResult.errors);
  console.log("⚠️ Warnings:", validationResult.warnings);
}
```

### Custom Validation Rules

You can extend validation with custom rules:

```javascript
// Example: Validate minimum track length
const validateTrackLengths = (tracks) => {
  const warnings = [];
  tracks.forEach((track) => {
    if (track.length < 50) {
      warnings.push(`Track ${track.id} is very short (${track.length}px)`);
    }
  });
  return warnings;
};
```

## File Format Details

### SVG Export Features

- Vector graphics with proper scaling
- Separate layers for tracks, components, and grid
- CSS styling for consistent appearance
- Embedded metadata and structure

### PDF Export Features

- Automatic scaling to fit page
- Title and metadata header
- Design statistics summary
- Simplified representation optimized for printing

### RailML JSON Features

- Full RailML 3.1 compliance
- Geographic coordinate conversion
- Topology analysis
- Component relationship mapping
- Comprehensive metadata

## Troubleshooting

### Common Issues

1. **Stage Reference Not Available**

   ```javascript
   // Ensure stage is mounted before creating ExportUtils
   watch(stage, (newStage) => {
     if (newStage) {
       exportUtils = new ExportUtils(trackStore, stage);
     }
   });
   ```

2. **Export Fails with Large Designs**
   ```javascript
   // For very large designs, consider chunking or compression
   const railmlContent = exportUtils.exportToRailML()
   if (railmlContent.length > 1000000) { //
   ```
