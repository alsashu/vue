import { saveAs } from "file-saver";
import html2canvas from "html2canvas";
import { jsPDF } from "jspdf";

export const exportService = {
  // Export as JSON
  exportAsJSON(data, filename = "railway-design.json") {
    const json = JSON.stringify(data, null, 2);
    const blob = new Blob([json], { type: "application/json" });
    saveAs(blob, filename);
  },

  // Export as SVG
  async exportAsSVG(canvasElement, filename = "railway-design.svg") {
    try {
      // Get SVG from Konva stage
      const svgData = canvasElement.toDataURL({
        pixelRatio: 2,
        mimeType: "image/svg+xml",
      });

      // Convert to blob and save
      const response = await fetch(svgData);
      const blob = await response.blob();
      saveAs(blob, filename);
    } catch (error) {
      console.error("SVG export failed:", error);
      throw new Error("Failed to export as SVG");
    }
  },

  // Export as PDF
  async exportAsPDF(
    canvasElement,
    filename = "railway-design.pdf",
    options = {}
  ) {
    try {
      const { format = "a4", orientation = "landscape", margin = 10 } = options;

      // Create canvas from element
      const canvas = await html2canvas(canvasElement, {
        scale: 2,
        backgroundColor: "#ffffff",
      });

      const imgData = canvas.toDataURL("image/png");
      const pdf = new jsPDF(orientation, "mm", format);

      // Calculate dimensions
      const pdfWidth = pdf.internal.pageSize.getWidth();
      const pdfHeight = pdf.internal.pageSize.getHeight();
      const imgWidth = pdfWidth - margin * 2;
      const imgHeight = (canvas.height * imgWidth) / canvas.width;

      let heightLeft = imgHeight;
      let position = margin;

      // Add first page
      pdf.addImage(imgData, "PNG", margin, position, imgWidth, imgHeight);
      heightLeft -= pdfHeight - margin * 2;

      // Add additional pages if needed
      while (heightLeft >= 0) {
        position = heightLeft - imgHeight + margin;
        pdf.addPage();
        pdf.addImage(imgData, "PNG", margin, position, imgWidth, imgHeight);
        heightLeft -= pdfHeight - margin * 2;
      }

      pdf.save(filename);
    } catch (error) {
      console.error("PDF export failed:", error);
      throw new Error("Failed to export as PDF");
    }
  },

  // Export as PNG
  async exportAsPNG(canvasElement, filename = "railway-design.png") {
    try {
      const canvas = await html2canvas(canvasElement, {
        scale: 2,
        backgroundColor: "#ffffff",
      });

      canvas.toBlob((blob) => {
        saveAs(blob, filename);
      }, "image/png");
    } catch (error) {
      console.error("PNG export failed:", error);
      throw new Error("Failed to export as PNG");
    }
  },

  // Export as RailML
  exportAsRailML(designData, filename = "railway-design.railml") {
    const railmlData = this.generateRailML(designData);
    const blob = new Blob([railmlData], { type: "application/xml" });
    saveAs(blob, filename);
  },

  // Generate RailML XML structure
  generateRailML(designData) {
    const { project, segments, components } = designData;

    let railml = `<?xml version="1.0" encoding="UTF-8"?>
<railML version="3.1" xmlns="https://www.railml.org/schemas/3.1" xmlns:dc="http://purl.org/dc/elements/1.1/">
  <metadata>
    <dc:title>${project.name}</dc:title>
    <dc:creator>Railway Design Tool</dc:creator>
    <dc:date>${new Date().toISOString()}</dc:date>
    <dc:description>${project.description || ""}</dc:description>
  </metadata>
  
  <common id="co_01">
    <organizationalUnits>
      <infrastructureManager id="im_01" name="Railway Infrastructure Manager"/>
    </organizationalUnits>
  </common>
  
  <infrastructure id="inf_01">
    <topology>
      <netElements>`;

    // Add net elements (tracks, switches, etc.)
    Object.values(components).forEach((component, index) => {
      if (component.type === "track") {
        railml += `
        <netElement id="ne_${String(index + 1).padStart(2, "0")}" length="${
          component.length || 100
        }">
          <relation ref="line_${component.id}"/>
        </netElement>`;
      }
    });

    railml += `
      </netElements>
      
      <netRelations>`;

    // Add relations between elements
    Object.values(components).forEach((component, index) => {
      if (component.connections) {
        component.connections.forEach((connection, connIndex) => {
          railml += `
        <netRelation id="nr_${String(index + 1).padStart(2, "0")}_${connIndex}" 
                    navigability="Both" positionOnA="1" positionOnB="0">
          <elementA ref="ne_${String(index + 1).padStart(2, "0")}"/>
          <elementB ref="ne_${String(connection.targetId).padStart(2, "0")}"/>
        </netRelation>`;
        });
      }
    });

    railml += `
      </netRelations>
    </topology>
    
    <geometry>
      <lines>`;

    // Add geometric lines
    Object.values(components).forEach((component, index) => {
      if (component.type === "track" && component.geometry) {
        railml += `
        <line id="line_${component.id}" length="${component.length || 100}">
          <linearGeometry>
            <coordinates>
              <coord x="${component.geometry.start.x}" y="${
          component.geometry.start.y
        }"/>
              <coord x="${component.geometry.end.x}" y="${
          component.geometry.end.y
        }"/>
            </coordinates>
          </linearGeometry>
        </line>`;
      }
    });

    railml += `
      </lines>
    </geometry>
    
    <functionalInfrastructure>
      <signals>`;

    // Add signals
    Object.values(components).forEach((component) => {
      if (component.type === "signal") {
        railml += `
        <signal id="sig_${component.id}" name="${component.name || "Signal"}" 
                type="${component.signalType || "main"}" function="${
          component.function || "entry"
        }">
          <spotLocation netElementRef="ne_01" applicationDirection="both" pos="0.5"/>
        </signal>`;
      }
    });

    railml += `
      </signals>
      
      <switches>`;

    // Add switches
    Object.values(components).forEach((component) => {
      if (component.type === "switch") {
        railml += `
        <switch id="sw_${component.id}" name="${component.name || "Switch"}" 
                type="${component.switchType || "ordinarySwitch"}">
          <spotLocation netElementRef="ne_01" applicationDirection="both" pos="0.5"/>
        </switch>`;
      }
    });

    railml += `
      </switches>
    </functionalInfrastructure>
  </infrastructure>
  
  <rollingstock id="rs_01">
    <!-- Rolling stock definitions would go here -->
  </rollingstock>
  
  <timetable id="tt_01">
    <!-- Timetable information would go here -->
  </timetable>
  
</railML>`;

    return railml;
  },

  // Import from file
  async importFromFile(file) {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();

      reader.onload = (e) => {
        try {
          const content = e.target.result;

          if (file.name.endsWith(".json")) {
            const data = JSON.parse(content);
            resolve({ type: "json", data });
          } else if (
            file.name.endsWith(".railml") ||
            file.name.endsWith(".xml")
          ) {
            // Parse RailML - simplified parser
            const data = this.parseRailML(content);
            resolve({ type: "railml", data });
          } else {
            reject(new Error("Unsupported file format"));
          }
        } catch (error) {
          reject(new Error("Failed to parse file: " + error.message));
        }
      };

      reader.onerror = () => reject(new Error("Failed to read file"));
      reader.readAsText(file);
    });
  },

  // Simple RailML parser (basic implementation)
  parseRailML(xmlContent) {
    // This is a simplified parser - in production, you'd use a proper XML parser
    const parser = new DOMParser();
    const xmlDoc = parser.parseFromString(xmlContent, "text/xml");

    const project = {
      name:
        xmlDoc.querySelector("dc\\:title, title")?.textContent ||
        "Imported Project",
      description:
        xmlDoc.querySelector("dc\\:description, description")?.textContent ||
        "",
      importedAt: new Date().toISOString(),
    };

    const components = {};
    const segments = {
      "imported-segment": {
        id: "imported-segment",
        name: "Imported Design",
        components: [],
      },
    };

    // Parse net elements (simplified)
    const netElements = xmlDoc.querySelectorAll("netElement");
    netElements.forEach((element, index) => {
      const componentId = `imported-${index}`;
      components[componentId] = {
        id: componentId,
        type: "track",
        name: `Track ${index + 1}`,
        length: parseFloat(element.getAttribute("length")) || 100,
        position: { x: index * 100, y: 100 },
        imported: true,
      };
      segments["imported-segment"].components.push(componentId);
    });

    return { project, segments, components };
  },
};
