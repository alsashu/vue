// utils/exportUtils.js - Export utilities for canvas design
import { RailMLValidator, RailMLUtils } from "./railmlSchema.js";

export class ExportUtils {
  constructor(trackStore, stageRef) {
    this.trackStore = trackStore;
    this.stageRef = stageRef;
    this.railMLValidator = new RailMLValidator();
  }

  // Export canvas as SVG
  async exportToSVG() {
    try {
      const stage = this.stageRef.value?.getNode();
      if (!stage) {
        throw new Error("Stage reference not available");
      }

      // Get stage dimensions
      const width = stage.width();
      const height = stage.height();

      // Create SVG structure
      let svgContent = `<?xml version="1.0" encoding="UTF-8"?>
<svg width="${width}" height="${height}" xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink">
  <defs>
    <style>
      .track { stroke-linecap: round; stroke-linejoin: round; fill: none; }
      .component-text { font-family: Arial, sans-serif; text-anchor: middle; }
      .selection-indicator { fill: none; stroke-dasharray: 5,5; }
    </style>
  </defs>
  <g id="railway-design">
`;

      // Add background/grid if needed
      svgContent += this.generateGridSVG(width, height);

      // Export tracks
      svgContent += this.generateTracksSVG();

      // Export components
      svgContent += this.generateComponentsSVG();

      svgContent += `
  </g>
</svg>`;

      return svgContent;
    } catch (error) {
      console.error("Error exporting to SVG:", error);
      throw error;
    }
  }

  // Export canvas as PDF using jsPDF
  async exportToPDF() {
    try {
      const stage = this.stageRef.value?.getNode();
      const width = stage?.width() || 1200;
      const height = stage?.height() || 800;

      // Load jsPDF from CDN
      let jsPDF;
      try {
        // Try to load jsPDF if not already available
        if (typeof window.jsPDF === "undefined") {
          await this.loadJsPDF();
        }
        jsPDF = window.jsPDF;
      } catch (loadError) {
        console.warn("Could not load jsPDF from CDN, using fallback method");
        return await this.exportToPDFCanvas();
      }

      // Calculate PDF dimensions (convert to mm)
      const pdfWidth = Math.min(width * 0.264583, 297); // A4 width max
      const pdfHeight = Math.min(height * 0.264583, 210); // A4 height max

      // Create PDF
      const pdf = new jsPDF({
        orientation: width > height ? "landscape" : "portrait",
        unit: "mm",
        format: "a4",
      });

      // Add title and metadata
      pdf.setFontSize(16);
      pdf.text("Railway Design Export", 20, 20);
      pdf.setFontSize(10);
      pdf.text(`Exported on: ${new Date().toLocaleString()}`, 20, 30);
      pdf.text(
        `Tracks: ${this.trackStore.tracks.length}, Components: ${this.trackStore.components.length}`,
        20,
        35
      );
      pdf.text(`Canvas Size: ${width}×${height} pixels`, 20, 40);

      // Draw content
      await this.drawPDFContent(pdf, pdfWidth, pdfHeight);

      return pdf;
    } catch (error) {
      console.error("Error exporting to PDF:", error);
      throw error;
    }
  }

  // Load jsPDF library dynamically
  async loadJsPDF() {
    return new Promise((resolve, reject) => {
      if (typeof window.jsPDF !== "undefined") {
        resolve(window.jsPDF);
        return;
      }

      const script = document.createElement("script");
      script.src =
        "https://cdnjs.cloudflare.com/ajax/libs/jspdf/2.5.1/jspdf.umd.min.js";
      script.onload = () => {
        if (window.jsPDF) {
          resolve(window.jsPDF);
        } else {
          reject(new Error("jsPDF failed to load"));
        }
      };
      script.onerror = () => reject(new Error("Failed to load jsPDF script"));
      document.head.appendChild(script);
    });
  }

  // Fallback PDF export using canvas
  async exportToPDFCanvas() {
    try {
      const stage = this.stageRef.value?.getNode();
      if (!stage) {
        throw new Error("Stage not available for canvas export");
      }

      // Create a simple text-based PDF as fallback
      const pdfContent = this.generateTextBasedPDF();

      // Create a data URL for download
      const blob = new Blob([pdfContent], { type: "text/plain" });
      const url = URL.createObjectURL(blob);

      return {
        save: (filename) => {
          const link = document.createElement("a");
          link.href = url;
          link.download = filename.replace(".pdf", ".txt");
          document.body.appendChild(link);
          link.click();
          document.body.removeChild(link);
          URL.revokeObjectURL(url);
        },
      };
    } catch (error) {
      console.error("Fallback PDF export failed:", error);
      throw error;
    }
  }

  // Generate text-based representation as PDF fallback
  generateTextBasedPDF() {
    let content = "RAILWAY DESIGN EXPORT\n";
    content += "=".repeat(50) + "\n\n";
    content += `Export Date: ${new Date().toLocaleString()}\n`;
    content += `Canvas Size: ${this.getCanvasDimensions().width}×${
      this.getCanvasDimensions().height
    }\n\n`;

    content += `TRACKS (${this.trackStore.tracks.length}):\n`;
    content += "-".repeat(30) + "\n";
    this.trackStore.tracks.forEach((track, index) => {
      content += `Track ${index + 1}:\n`;
      content += `  ID: ${track.id}\n`;
      content += `  Color: ${track.color || "#333333"}\n`;
      content += `  Length: ${this.calculateTrackLength(track.points).toFixed(
        2
      )} px\n`;
      content += `  Points: ${track.points.length / 2}\n\n`;
    });

    content += `COMPONENTS (${this.trackStore.components.length}):\n`;
    content += "-".repeat(30) + "\n";
    this.trackStore.components.forEach((component, index) => {
      content += `Component ${index + 1}:\n`;
      content += `  ID: ${component.id}\n`;
      content += `  Type: ${component.type}\n`;
      content += `  Name: ${component.name || "Unnamed"}\n`;
      content += `  Position: (${component.position?.x || 0}, ${
        component.position?.y || 0
      })\n\n`;
    });

    content += "\nNOTE: This is a simplified text export.\n";

    return content;
  }

  // Export design data as RailML-compliant JSON
  exportToRailML(options = {}) {
    try {
      const railmlData = {
        railml: {
          version: "3.1",
          xmlns: "https://www.railml.org/schemas/3.1",
          created: new Date().toISOString(),
          creator: "Railway Design Tool",
          infrastructure: {
            id: options.infrastructureId || `infrastructure_${Date.now()}`,
            name: options.infrastructureName || "Exported Railway Design",
            tracks: this.convertTracksToRailML(),
            functionalInfrastructure: this.convertComponentsToRailML(),
            topology: this.generateTopology(),
            geometry: this.generateGeometry(),
          },
          metadata: {
            exportInfo: {
              version: "1.0.0",
              timestamp: new Date().toISOString(),
              canvasDimensions: this.getCanvasDimensions(),
              totalTracks: this.trackStore.tracks.length,
              totalComponents: this.trackStore.components.length,
              trackStatistics: RailMLUtils.calculateTrackStatistics(
                this.trackStore.tracks
              ),
              componentStatistics: RailMLUtils.calculateComponentStatistics(
                this.trackStore.components
              ),
            },
            validation: this.validateExportData(),
          },
        },
      };

      const jsonString = JSON.stringify(railmlData, null, 2);

      // Validate the generated RailML
      if (options.validate !== false) {
        const validationResult =
          this.railMLValidator.validateRailMLDocument(jsonString);
        railmlData.railml.metadata.validationResult = validationResult;
      }

      return JSON.stringify(railmlData, null, 2);
    } catch (error) {
      console.error("Error exporting to RailML:", error);
      throw error;
    }
  }

  // Helper methods for SVG generation
  generateGridSVG(width, height, gridSize = 20) {
    let gridSVG = '<g id="grid" opacity="0.3">\n';

    // Vertical lines
    for (let x = 0; x <= width; x += gridSize) {
      gridSVG += `  <line x1="${x}" y1="0" x2="${x}" y2="${height}" stroke="#ddd" stroke-width="0.5"/>\n`;
    }

    // Horizontal lines
    for (let y = 0; y <= height; y += gridSize) {
      gridSVG += `  <line x1="0" y1="${y}" x2="${width}" y2="${y}" stroke="#ddd" stroke-width="0.5"/>\n`;
    }

    gridSVG += "</g>\n";
    return gridSVG;
  }

  generateTracksSVG() {
    let tracksSVG = '<g id="tracks">\n';

    this.trackStore.tracks.forEach((track, index) => {
      const points = track.points.join(" ");
      tracksSVG += `  <polyline class="track" 
        id="track-${track.id}" 
        points="${points}" 
        stroke="${track.color || "#333333"}" 
        stroke-width="${track.strokeWidth || 4}"/>\n`;
    });

    tracksSVG += "</g>\n";
    return tracksSVG;
  }

  generateComponentsSVG() {
    let componentsSVG = '<g id="components">\n';

    this.trackStore.components.forEach((component) => {
      const x = component.position?.x || 0;
      const y = component.position?.y || 0;
      const rotation = component.rotation || 0;

      componentsSVG += `  <g id="component-${component.id}" transform="translate(${x},${y}) rotate(${rotation})">\n`;
      componentsSVG += this.generateComponentSVG(component);
      componentsSVG += "  </g>\n";
    });

    componentsSVG += "</g>\n";
    return componentsSVG;
  }

  generateComponentSVG(component) {
    switch (component.type) {
      case "signal":
        return this.generateSignalSVG(component);
      case "switch":
        return this.generateSwitchSVG(component);
      case "station":
        return this.generateStationSVG(component);
      case "platform":
        return this.generatePlatformSVG(component);
      default:
        return this.generateGenericComponentSVG(component);
    }
  }

  generateSignalSVG(component) {
    const color = this.getSignalColor(
      component.aspect || component.state || "red"
    );
    return `
    <line x1="0" y1="0" x2="0" y2="-40" stroke="#666666" stroke-width="3"/>
    <circle cx="0" cy="-35" r="8" fill="${color}" stroke="#333" stroke-width="1"/>
    <text x="10" y="-30" class="component-text" font-size="10" fill="#333">${
      component.signalNumber || component.name || "S1"
    }</text>
`;
  }

  generateSwitchSVG(component) {
    const color = component.state === "normal" ? "#00ff00" : "#ff9900";
    return `
    <rect x="-15" y="-8" width="30" height="16" fill="#666666" stroke="#333" stroke-width="2" rx="4"/>
    <circle cx="0" cy="0" r="6" fill="${color}" stroke="#333" stroke-width="1"/>
    <text x="0" y="20" class="component-text" font-size="8" fill="#333">${
      component.name || "SW"
    }</text>
`;
  }

  generateStationSVG(component) {
    const color = component.color || "#0066cc";
    return `
    <rect x="-30" y="-20" width="60" height="40" fill="${color}" stroke="#333" stroke-width="2" rx="4"/>
    <polygon points="-35,-20 0,-35 35,-20" fill="#8B4513" stroke="#333" stroke-width="2"/>
    <text x="0" y="-5" class="component-text" font-size="10" fill="white" font-weight="bold">${
      component.name || "Station"
    }</text>
`;
  }

  generatePlatformSVG(component) {
    const color = component.color || "#999999";
    return `
    <rect x="-40" y="-8" width="80" height="16" fill="${color}" stroke="#333" stroke-width="1"/>
    <line x1="-40" y1="-8" x2="40" y2="-8" stroke="#ffff00" stroke-width="2"/>
    <line x1="-30" y1="8" x2="-30" y2="15" stroke="#666" stroke-width="2"/>
    <line x1="0" y1="8" x2="0" y2="15" stroke="#666" stroke-width="2"/>
    <line x1="30" y1="8" x2="30" y2="15" stroke="#666" stroke-width="2"/>
    <text x="0" y="0" class="component-text" font-size="8" fill="#333">${
      component.name || "Platform"
    }</text>
`;
  }

  generateGenericComponentSVG(component) {
    const color = component.color || "#cccccc";
    const type = component.type ? component.type.charAt(0).toUpperCase() : "?";
    return `
    <rect x="-15" y="-15" width="30" height="30" fill="${color}" stroke="#333" stroke-width="1" rx="4"/>
    <text x="0" y="5" class="component-text" font-size="14" fill="#333">${type}</text>
`;
  }

  // Helper methods for PDF generation
  async drawPDFContent(pdf, pdfWidth, pdfHeight) {
    const stage = this.stageRef.value?.getNode();
    const canvasWidth = stage?.width() || 1200;
    const canvasHeight = stage?.height() || 800;

    // Calculate scaling to fit content in PDF
    const scaleX = (pdfWidth - 40) / canvasWidth; // Leave 20mm margin on each side
    const scaleY = (pdfHeight - 60) / canvasHeight; // Leave margins for header and footer
    const scale = Math.min(scaleX, scaleY, 0.5); // Max scale of 0.5 for readability

    const offsetX = 20; // Left margin
    const offsetY = 50; // Top margin (below header)

    try {
      // Set drawing properties
      pdf.setLineWidth(0.5);

      // Draw tracks
      this.trackStore.tracks.forEach((track) => {
        const points = track.points;
        if (points.length >= 4) {
          // Set track color (convert hex to RGB)
          const color = this.hexToRgb(track.color || "#333333");
          pdf.setDrawColor(color.r, color.g, color.b);
          pdf.setLineWidth((track.strokeWidth || 4) * scale);

          // Draw track as series of lines
          for (let i = 0; i < points.length - 2; i += 2) {
            const x1 = points[i] * scale + offsetX;
            const y1 = points[i + 1] * scale + offsetY;
            const x2 = points[i + 2] * scale + offsetX;
            const y2 = points[i + 3] * scale + offsetY;

            pdf.line(x1, y1, x2, y2);
          }
        }
      });

      // Draw components
      pdf.setDrawColor(0, 0, 0);
      pdf.setFillColor(200, 200, 200);
      pdf.setLineWidth(0.3);

      this.trackStore.components.forEach((component) => {
        const x = (component.position?.x || 0) * scale + offsetX;
        const y = (component.position?.y || 0) * scale + offsetY;

        // Draw component based on type
        switch (component.type) {
          case "signal":
            // Draw signal as circle with line
            pdf.line(x, y, x, y - 8);
            pdf.circle(x, y - 6, 2, "FD");
            pdf.setFontSize(6);
            pdf.text(component.name || "S", x + 3, y - 4);
            break;

          case "switch":
            // Draw switch as rectangle
            pdf.rect(x - 3, y - 2, 6, 4, "FD");
            pdf.setFontSize(6);
            pdf.text(component.name || "SW", x - 2, y + 6);
            break;

          case "station":
            // Draw station as larger rectangle
            pdf.rect(x - 6, y - 4, 12, 8, "FD");
            pdf.setFontSize(6);
            pdf.text(component.name || "Station", x - 5, y + 10);
            break;

          case "platform":
            // Draw platform as elongated rectangle
            pdf.rect(x - 8, y - 2, 16, 4, "FD");
            pdf.setFontSize(6);
            pdf.text(component.name || "Platform", x - 6, y + 8);
            break;

          default:
            // Generic component
            pdf.circle(x, y, 2, "FD");
            pdf.setFontSize(6);
            pdf.text(component.type || "?", x + 3, y);
        }
      });

      // Add footer with statistics
      const footerY = pdfHeight - 20;
      pdf.setFontSize(8);
      pdf.text(
        `Design Statistics: ${this.trackStore.tracks.length} tracks, ${this.trackStore.components.length} components`,
        20,
        footerY
      );
      pdf.text(
        `Total Track Length: ${this.trackStore.tracks
          .reduce(
            (sum, track) => sum + this.calculateTrackLength(track.points),
            0
          )
          .toFixed(0)} px`,
        20,
        footerY + 5
      );
    } catch (drawError) {
      console.warn("Error drawing PDF content:", drawError);
      // Add fallback text if drawing fails
      pdf.setFontSize(12);
      pdf.text("Error rendering design graphics", offsetX, offsetY);
      pdf.text(
        "Please use SVG export for full visual representation",
        offsetX,
        offsetY + 10
      );
    }
  }

  // Helper function to convert hex color to RGB
  hexToRgb(hex) {
    const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
    return result
      ? {
          r: parseInt(result[1], 16),
          g: parseInt(result[2], 16),
          b: parseInt(result[3], 16),
        }
      : { r: 51, g: 51, b: 51 }; // Default dark gray
  }

  // Helper methods for RailML conversion
  convertTracksToRailML() {
    return this.trackStore.tracks.map((track, index) => ({
      id: track.id || `track_${index}`,
      name: track.name || `Track ${index + 1}`,
      length: this.calculateTrackLength(track.points),
      geometry: {
        coordinates: this.pointsToCoordinates(track.points),
        type: "LineString",
      },
      visualProperties: {
        color: track.color || "#333333",
        strokeWidth: track.strokeWidth || 4,
      },
      createdAt: track.createdAt || new Date().toISOString(),
    }));
  }

  convertComponentsToRailML() {
    return this.trackStore.components.map((component, index) => ({
      id: component.id || `component_${index}`,
      type: component.type,
      name: component.name || `${component.type} ${index + 1}`,
      position: {
        x: component.position?.x || 0,
        y: component.position?.y || 0,
        coordinate: this.pixelToGeoCoordinate(
          component.position?.x || 0,
          component.position?.y || 0
        ),
      },
      rotation: component.rotation || 0,
      properties: this.getComponentProperties(component),
      createdAt: component.createdAt || new Date().toISOString(),
    }));
  }

  generateTopology() {
    // Generate basic topology information
    return {
      nodes: this.generateTopologyNodes(),
      edges: this.generateTopologyEdges(),
      connections: this.generateConnections(),
    };
  }

  generateGeometry() {
    const stage = this.stageRef.value?.getNode();
    return {
      coordinateSystem: "pixel",
      bounds: {
        minX: 0,
        minY: 0,
        maxX: stage?.width() || 1200,
        maxY: stage?.height() || 800,
      },
      scale: 1,
      unit: "px",
    };
  }

  // Utility helper methods
  getSignalColor(aspect) {
    const colors = {
      red: "#ff0000",
      yellow: "#ffff00",
      green: "#00ff00",
      off: "#666666",
      danger: "#ff0000",
      caution: "#ffff00",
      clear: "#00ff00",
    };
    return colors[aspect] || colors.red;
  }

  calculateTrackLength(points) {
    let length = 0;
    for (let i = 0; i < points.length - 2; i += 2) {
      const dx = points[i + 2] - points[i];
      const dy = points[i + 3] - points[i + 1];
      length += Math.sqrt(dx * dx + dy * dy);
    }
    return Math.round(length * 100) / 100; // Round to 2 decimal places
  }

  pointsToCoordinates(points) {
    const coordinates = [];
    for (let i = 0; i < points.length; i += 2) {
      coordinates.push([points[i], points[i + 1]]);
    }
    return coordinates;
  }

  pixelToGeoCoordinate(x, y) {
    // Convert pixel coordinates to geographic coordinates
    // This is a simplified conversion - in real applications you'd use proper projection
    return {
      latitude: 0.0 + y / 10000, // Simplified conversion
      longitude: 0.0 + x / 10000,
      elevation: 0,
    };
  }

  getComponentProperties(component) {
    const baseProperties = {
      type: component.type,
      name: component.name,
      id: component.id,
    };

    switch (component.type) {
      case "signal":
        return {
          ...baseProperties,
          aspect: component.aspect || component.state || "red",
          signalNumber: component.signalNumber,
          signalType: component.signalType || "main",
        };
      case "switch":
        return {
          ...baseProperties,
          state: component.state || "normal",
          switchType: component.switchType || "simple",
        };
      case "station":
        return {
          ...baseProperties,
          stationType: component.stationType || "passenger",
          platforms: component.platforms || [],
        };
      case "platform":
        return {
          ...baseProperties,
          length: component.length || 80,
          height: component.height || 1.2,
        };
      default:
        return baseProperties;
    }
  }

  generateTopologyNodes() {
    // Generate nodes from track endpoints and component positions
    const nodes = [];
    let nodeId = 0;

    // Add nodes from track endpoints
    this.trackStore.tracks.forEach((track) => {
      const points = track.points;
      if (points.length >= 4) {
        // Start point
        nodes.push({
          id: `node_${nodeId++}`,
          position: { x: points[0], y: points[1] },
          type: "trackEnd",
        });
        // End point
        nodes.push({
          id: `node_${nodeId++}`,
          position: {
            x: points[points.length - 2],
            y: points[points.length - 1],
          },
          type: "trackEnd",
        });
      }
    });

    // Add nodes from components
    this.trackStore.components.forEach((component) => {
      nodes.push({
        id: `node_${nodeId++}`,
        position: component.position,
        type: "component",
        componentId: component.id,
        componentType: component.type,
      });
    });

    return nodes;
  }

  generateTopologyEdges() {
    // Generate edges from tracks
    return this.trackStore.tracks.map((track, index) => ({
      id: `edge_track_${index}`,
      trackId: track.id,
      type: "track",
      length: this.calculateTrackLength(track.points),
    }));
  }

  generateConnections() {
    // This would analyze spatial relationships between components and tracks
    // For now, return empty array - in a real implementation, you'd analyze
    // which components are near which tracks
    return [];
  }

  getCanvasDimensions() {
    const stage = this.stageRef.value?.getNode();
    return {
      width: stage?.width() || 1200,
      height: stage?.height() || 800,
    };
  }

  // Download helper methods
  downloadFile(content, filename, mimeType) {
    const blob = new Blob([content], { type: mimeType });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = filename;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  }

  async downloadSVG(filename = "railway-design.svg") {
    const svgContent = await this.exportToSVG();
    this.downloadFile(svgContent, filename, "image/svg+xml");
  }

  async downloadPDF(filename = "railway-design.pdf") {
    try {
      const pdf = await this.exportToPDF();
      if (pdf && typeof pdf.save === "function") {
        pdf.save(filename);
      } else {
        throw new Error("PDF generation failed");
      }
    } catch (error) {
      console.warn("PDF export failed, trying alternative method:", error);
      // Fallback to canvas-based export
      await this.downloadCanvasAsPDF(filename);
    }
  }

  // Alternative PDF export using canvas rendering
  async downloadCanvasAsPDF(filename = "railway-design.pdf") {
    try {
      const stage = this.stageRef.value?.getNode();
      if (!stage) {
        throw new Error("Stage not available");
      }

      // Convert stage to data URL
      const dataURL = stage.toDataURL({
        mimeType: "image/png",
        quality: 1,
        pixelRatio: 2, // Higher resolution
      });

      // Create a simple HTML page that can be printed as PDF
      const htmlContent = this.generatePrintableHTML(dataURL);

      // Open in new window for printing
      const printWindow = window.open("", "_blank");
      printWindow.document.write(htmlContent);
      printWindow.document.close();

      // Auto-trigger print dialog after a short delay
      setTimeout(() => {
        printWindow.print();
      }, 1000);

      return { success: true, method: "print-dialog" };
    } catch (error) {
      console.error("Canvas PDF export failed:", error);
      throw error;
    }
  }

  // Generate printable HTML for PDF export
  generatePrintableHTML(canvasDataURL) {
    const stats = this.getDesignStatistics();

    return `
<!DOCTYPE html>
<html>
<head>
    <title>Railway Design Export</title>
    <style>
        @page {
            size: A4;
            margin: 1cm;
        }
        body {
            font-family: Arial, sans-serif;
            margin: 0;
            padding: 20px;
        }
        .header {
            text-align: center;
            margin-bottom: 20px;
            border-bottom: 2px solid #333;
            padding-bottom: 10px;
        }
        .header h1 {
            margin: 0;
            color: #333;
        }
        .metadata {
            font-size: 12px;
            color: #666;
            margin: 10px 0;
        }
        .design-image {
            text-align: center;
            margin: 20px 0;
        }
        .design-image img {
            max-width: 100%;
            max-height: 60vh;
            border: 1px solid #ddd;
        }
        .statistics {
            display: grid;
            grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
            gap: 10px;
            margin-top: 20px;
            font-size: 12px;
        }
        .stat-item {
            background: #f5f5f5;
            padding: 10px;
            border-radius: 4px;
        }
        .stat-label {
            font-weight: bold;
            color: #333;
        }
        .stat-value {
            color: #666;
        }
        @media print {
            .no-print { display: none; }
            body { print-color-adjust: exact; }
        }
    </style>
</head>
<body>
    <div class="header">
        <h1>Railway Design Export</h1>
        <div class="metadata">
            <div>Exported on: ${new Date().toLocaleString()}</div>
            <div>Canvas Size: ${this.getCanvasDimensions().width} × ${
      this.getCanvasDimensions().height
    } pixels</div>
        </div>
    </div>
    
    <div class="design-image">
        <img src="${canvasDataURL}" alt="Railway Design" />
    </div>
    
    <div class="statistics">
        <div class="stat-item">
            <div class="stat-label">Total Tracks</div>
            <div class="stat-value">${stats.totalTracks}</div>
        </div>
        <div class="stat-item">
            <div class="stat-label">Total Track Length</div>
            <div class="stat-value">${stats.totalLength.toFixed(2)} px</div>
        </div>
        <div class="stat-item">
            <div class="stat-label">Components</div>
            <div class="stat-value">${stats.totalComponents}</div>
        </div>
        <div class="stat-item">
            <div class="stat-label">Signals</div>
            <div class="stat-value">${stats.componentsByType.signals || 0}</div>
        </div>
        <div class="stat-item">
            <div class="stat-label">Switches</div>
            <div class="stat-value">${
              stats.componentsByType.switches || 0
            }</div>
        </div>
        <div class="stat-item">
            <div class="stat-label">Stations</div>
            <div class="stat-value">${
              stats.componentsByType.stations || 0
            }</div>
        </div>
        <div class="stat-item">
            <div class="stat-label">Platforms</div>
            <div class="stat-value">${
              stats.componentsByType.platforms || 0
            }</div>
        </div>
        <div class="stat-item">
            <div class="stat-label">Export Method</div>
            <div class="stat-value">Canvas Print</div>
        </div>
    </div>
    
    <div class="no-print" style="margin-top: 30px; text-align: center; color: #666;">
        <p>Use your browser's print function (Ctrl+P or Cmd+P) to save as PDF</p>
        <button onclick="window.print()" style="padding: 10px 20px; background: #007bff; color: white; border: none; border-radius: 4px; cursor: pointer;">
            Print / Save as PDF
        </button>
    </div>
</body>
</html>
    `;
  }

  // Get comprehensive design statistics
  getDesignStatistics() {
    const totalLength = this.trackStore.tracks.reduce(
      (sum, track) => sum + this.calculateTrackLength(track.points),
      0
    );

    const componentsByType = {};
    this.trackStore.components.forEach((component) => {
      const type = component.type + "s"; // pluralize
      componentsByType[type] = (componentsByType[type] || 0) + 1;
    });

    return {
      totalTracks: this.trackStore.tracks.length,
      totalLength,
      totalComponents: this.trackStore.components.length,
      componentsByType,
      averageTrackLength:
        this.trackStore.tracks.length > 0
          ? totalLength / this.trackStore.tracks.length
          : 0,
    };
  }

  downloadRailML(filename = "railway-design.railml.json", options = {}) {
    const railmlContent = this.exportToRailML(options);
    this.downloadFile(railmlContent, filename, "application/json");
  }

  // Validate export data quality
  validateExportData() {
    const issues = [];
    const suggestions = [];

    // Check for empty design
    if (this.trackStore.tracks.length === 0) {
      issues.push("No tracks found in design");
    }

    if (this.trackStore.components.length === 0) {
      suggestions.push(
        "Consider adding railway components (signals, switches, etc.)"
      );
    }

    // Check for very short tracks
    const shortTracks = this.trackStore.tracks.filter(
      (track) => this.calculateTrackLength(track.points) < 10
    );
    if (shortTracks.length > 0) {
      suggestions.push(
        `${shortTracks.length} track(s) are very short (< 10 pixels)`
      );
    }

    // Check for isolated components
    const isolatedComponents = this.trackStore.components.filter(
      (component) => {
        const nearestTrack = this.trackStore.findNearestTrackPoint(
          component.position?.x || 0,
          component.position?.y || 0
        );
        return !nearestTrack || nearestTrack.distance > 50;
      }
    );

    if (isolatedComponents.length > 0) {
      suggestions.push(
        `${isolatedComponents.length} component(s) are not near any tracks`
      );
    }

    return {
      issues,
      suggestions,
      quality: issues.length === 0 ? "good" : "needs_attention",
    };
  }

  // Generate comprehensive validation report
  generateValidationReport(railmlData) {
    const validationResult =
      this.railMLValidator.validateRailMLDocument(railmlData);
    return this.railMLValidator.generateValidationReport(validationResult);
  }

  // Export with validation report
  async downloadRailMLWithReport(filename = "railway-design.railml.json") {
    const railmlContent = this.exportToRailML({ validate: true });
    const parsed = JSON.parse(railmlContent);

    // Generate validation report
    const report = this.generateValidationReport(railmlContent);

    // Create a ZIP file with both JSON and validation report
    // Note: In a real implementation, you might want to use a library like JSZip
    const reportFilename = filename.replace(".json", "-validation-report.txt");

    // Download the JSON file
    this.downloadFile(railmlContent, filename, "application/json");

    // Download the validation report
    setTimeout(() => {
      this.downloadFile(report, reportFilename, "text/plain");
    }, 1000);
  }
}
