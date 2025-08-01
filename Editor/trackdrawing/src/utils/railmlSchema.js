// utils/railmlSchema.js - RailML schema validation and utilities

export class RailMLValidator {
  constructor() {
    this.version = "3.1";
    this.namespace = "https://www.railml.org/schemas/3.1";
  }

  // Validate a complete RailML document
  validateRailMLDocument(railmlData) {
    const errors = [];
    const warnings = [];

    try {
      const parsed =
        typeof railmlData === "string" ? JSON.parse(railmlData) : railmlData;

      // Check root structure
      if (!parsed.railml) {
        errors.push("Missing required 'railml' root element");
        return { isValid: false, errors, warnings };
      }

      const railml = parsed.railml;

      // Validate version
      if (!railml.version) {
        warnings.push("Missing version information");
      } else if (railml.version !== this.version) {
        warnings.push(
          `Version mismatch: expected ${this.version}, got ${railml.version}`
        );
      }

      // Validate namespace
      if (!railml.xmlns) {
        warnings.push("Missing XML namespace declaration");
      }

      // Validate infrastructure
      if (railml.infrastructure) {
        this.validateInfrastructure(railml.infrastructure, errors, warnings);
      } else {
        warnings.push("No infrastructure data found");
      }

      // Validate metadata
      if (railml.metadata) {
        this.validateMetadata(railml.metadata, errors, warnings);
      }

      return {
        isValid: errors.length === 0,
        errors,
        warnings,
      };
    } catch (error) {
      errors.push(`JSON parsing error: ${error.message}`);
      return { isValid: false, errors, warnings };
    }
  }

  // Validate infrastructure section
  validateInfrastructure(infrastructure, errors, warnings) {
    if (!infrastructure.id) {
      errors.push("Infrastructure missing required 'id' attribute");
    }

    if (!infrastructure.name) {
      warnings.push("Infrastructure missing 'name' attribute");
    }

    // Validate tracks
    if (infrastructure.tracks) {
      this.validateTracks(infrastructure.tracks, errors, warnings);
    }

    // Validate functional infrastructure (components)
    if (infrastructure.functionalInfrastructure) {
      this.validateFunctionalInfrastructure(
        infrastructure.functionalInfrastructure,
        errors,
        warnings
      );
    }

    // Validate topology
    if (infrastructure.topology) {
      this.validateTopology(infrastructure.topology, errors, warnings);
    }

    // Validate geometry
    if (infrastructure.geometry) {
      this.validateGeometry(infrastructure.geometry, errors, warnings);
    }
  }

  // Validate tracks array
  validateTracks(tracks, errors, warnings) {
    if (!Array.isArray(tracks)) {
      errors.push("Tracks must be an array");
      return;
    }

    tracks.forEach((track, index) => {
      if (!track.id) {
        errors.push(`Track ${index}: missing required 'id' attribute`);
      }

      if (!track.geometry) {
        errors.push(`Track ${track.id || index}: missing geometry information`);
      } else {
        this.validateTrackGeometry(
          track.geometry,
          track.id || index,
          errors,
          warnings
        );
      }

      if (typeof track.length !== "number" || track.length < 0) {
        warnings.push(`Track ${track.id || index}: invalid or missing length`);
      }
    });
  }

  // Validate track geometry
  validateTrackGeometry(geometry, trackId, errors, warnings) {
    if (!geometry.coordinates) {
      errors.push(`Track ${trackId}: missing coordinates in geometry`);
      return;
    }

    if (!Array.isArray(geometry.coordinates)) {
      errors.push(`Track ${trackId}: coordinates must be an array`);
      return;
    }

    if (geometry.coordinates.length < 2) {
      warnings.push(
        `Track ${trackId}: track should have at least 2 coordinate points`
      );
    }

    // Validate coordinate format
    geometry.coordinates.forEach((coord, index) => {
      if (!Array.isArray(coord) || coord.length < 2) {
        errors.push(
          `Track ${trackId}: invalid coordinate format at index ${index}`
        );
      }
    });

    if (geometry.type && geometry.type !== "LineString") {
      warnings.push(
        `Track ${trackId}: unexpected geometry type '${geometry.type}', expected 'LineString'`
      );
    }
  }

  // Validate functional infrastructure (components)
  validateFunctionalInfrastructure(components, errors, warnings) {
    if (!Array.isArray(components)) {
      errors.push("Functional infrastructure must be an array");
      return;
    }

    const validComponentTypes = ["signal", "switch", "station", "platform"];

    components.forEach((component, index) => {
      if (!component.id) {
        errors.push(`Component ${index}: missing required 'id' attribute`);
      }

      if (!component.type) {
        errors.push(
          `Component ${
            component.id || index
          }: missing required 'type' attribute`
        );
      } else if (!validComponentTypes.includes(component.type)) {
        warnings.push(
          `Component ${component.id || index}: unknown type '${component.type}'`
        );
      }

      if (!component.position) {
        errors.push(
          `Component ${component.id || index}: missing position information`
        );
      } else {
        this.validateComponentPosition(
          component.position,
          component.id || index,
          errors,
          warnings
        );
      }

      // Type-specific validation
      this.validateComponentProperties(component, errors, warnings);
    });
  }

  // Validate component position
  validateComponentPosition(position, componentId, errors, warnings) {
    if (typeof position.x !== "number") {
      errors.push(`Component ${componentId}: position.x must be a number`);
    }

    if (typeof position.y !== "number") {
      errors.push(`Component ${componentId}: position.y must be a number`);
    }

    // Validate geographic coordinates if present
    if (position.coordinate) {
      if (
        typeof position.coordinate.latitude !== "number" ||
        position.coordinate.latitude < -90 ||
        position.coordinate.latitude > 90
      ) {
        errors.push(`Component ${componentId}: invalid latitude in coordinate`);
      }

      if (
        typeof position.coordinate.longitude !== "number" ||
        position.coordinate.longitude < -180 ||
        position.coordinate.longitude > 180
      ) {
        errors.push(
          `Component ${componentId}: invalid longitude in coordinate`
        );
      }
    }
  }

  // Validate component-specific properties
  validateComponentProperties(component, errors, warnings) {
    const componentId = component.id || "unknown";

    switch (component.type) {
      case "signal":
        this.validateSignalProperties(component, componentId, errors, warnings);
        break;
      case "switch":
        this.validateSwitchProperties(component, componentId, errors, warnings);
        break;
      case "station":
        this.validateStationProperties(
          component,
          componentId,
          errors,
          warnings
        );
        break;
      case "platform":
        this.validatePlatformProperties(
          component,
          componentId,
          errors,
          warnings
        );
        break;
    }
  }

  // Validate signal-specific properties
  validateSignalProperties(signal, componentId, errors, warnings) {
    if (signal.properties) {
      const validAspects = [
        "red",
        "yellow",
        "green",
        "off",
        "danger",
        "caution",
        "clear",
      ];

      if (
        signal.properties.aspect &&
        !validAspects.includes(signal.properties.aspect)
      ) {
        warnings.push(
          `Signal ${componentId}: unknown aspect '${signal.properties.aspect}'`
        );
      }

      if (
        signal.properties.signalType &&
        !["main", "distant", "shunting", "repeater"].includes(
          signal.properties.signalType
        )
      ) {
        warnings.push(
          `Signal ${componentId}: unknown signal type '${signal.properties.signalType}'`
        );
      }
    }
  }

  // Validate switch-specific properties
  validateSwitchProperties(switchComponent, componentId, errors, warnings) {
    if (switchComponent.properties) {
      const validStates = ["normal", "reverse"];

      if (
        switchComponent.properties.state &&
        !validStates.includes(switchComponent.properties.state)
      ) {
        warnings.push(
          `Switch ${componentId}: unknown state '${switchComponent.properties.state}'`
        );
      }

      if (
        switchComponent.properties.switchType &&
        !["simple", "english", "diamond", "doubleSlip"].includes(
          switchComponent.properties.switchType
        )
      ) {
        warnings.push(
          `Switch ${componentId}: unknown switch type '${switchComponent.properties.switchType}'`
        );
      }
    }
  }

  // Validate station-specific properties
  validateStationProperties(station, componentId, errors, warnings) {
    if (station.properties) {
      if (
        station.properties.stationType &&
        !["passenger", "freight", "junction", "depot"].includes(
          station.properties.stationType
        )
      ) {
        warnings.push(
          `Station ${componentId}: unknown station type '${station.properties.stationType}'`
        );
      }

      if (
        station.properties.platforms &&
        !Array.isArray(station.properties.platforms)
      ) {
        errors.push(`Station ${componentId}: platforms must be an array`);
      }
    }
  }

  // Validate platform-specific properties
  validatePlatformProperties(platform, componentId, errors, warnings) {
    if (platform.properties) {
      if (
        platform.properties.length &&
        (typeof platform.properties.length !== "number" ||
          platform.properties.length <= 0)
      ) {
        warnings.push(`Platform ${componentId}: invalid length property`);
      }

      if (
        platform.properties.height &&
        (typeof platform.properties.height !== "number" ||
          platform.properties.height <= 0)
      ) {
        warnings.push(`Platform ${componentId}: invalid height property`);
      }
    }
  }

  // Validate topology section
  validateTopology(topology, errors, warnings) {
    if (topology.nodes && !Array.isArray(topology.nodes)) {
      errors.push("Topology nodes must be an array");
    }

    if (topology.edges && !Array.isArray(topology.edges)) {
      errors.push("Topology edges must be an array");
    }

    if (topology.connections && !Array.isArray(topology.connections)) {
      errors.push("Topology connections must be an array");
    }

    // Validate nodes
    if (topology.nodes) {
      topology.nodes.forEach((node, index) => {
        if (!node.id) {
          errors.push(
            `Topology node ${index}: missing required 'id' attribute`
          );
        }

        if (!node.position) {
          errors.push(
            `Topology node ${node.id || index}: missing position information`
          );
        }

        if (!node.type) {
          warnings.push(
            `Topology node ${node.id || index}: missing type information`
          );
        }
      });
    }

    // Validate edges
    if (topology.edges) {
      topology.edges.forEach((edge, index) => {
        if (!edge.id) {
          errors.push(
            `Topology edge ${index}: missing required 'id' attribute`
          );
        }

        if (!edge.trackId) {
          warnings.push(
            `Topology edge ${edge.id || index}: missing trackId reference`
          );
        }
      });
    }
  }

  // Validate geometry section
  validateGeometry(geometry, errors, warnings) {
    if (!geometry.coordinateSystem) {
      warnings.push("Missing coordinate system specification");
    }

    if (!geometry.bounds) {
      warnings.push("Missing geometry bounds information");
    } else {
      const bounds = geometry.bounds;
      if (
        typeof bounds.minX !== "number" ||
        typeof bounds.minY !== "number" ||
        typeof bounds.maxX !== "number" ||
        typeof bounds.maxY !== "number"
      ) {
        errors.push(
          "Invalid bounds specification - all bounds must be numbers"
        );
      }

      if (bounds.minX >= bounds.maxX || bounds.minY >= bounds.maxY) {
        errors.push(
          "Invalid bounds specification - min values must be less than max values"
        );
      }
    }

    if (
      geometry.scale &&
      (typeof geometry.scale !== "number" || geometry.scale <= 0)
    ) {
      warnings.push("Invalid or missing scale specification");
    }
  }

  // Validate metadata section
  validateMetadata(metadata, errors, warnings) {
    if (metadata.exportInfo) {
      const exportInfo = metadata.exportInfo;

      if (!exportInfo.version) {
        warnings.push("Missing export version information");
      }

      if (!exportInfo.timestamp) {
        warnings.push("Missing export timestamp");
      } else {
        // Validate ISO 8601 timestamp format
        const timestampRegex =
          /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}(\.\d{3})?Z?$/;
        if (!timestampRegex.test(exportInfo.timestamp)) {
          warnings.push("Invalid timestamp format - should be ISO 8601");
        }
      }

      if (exportInfo.canvasDimensions) {
        const dims = exportInfo.canvasDimensions;
        if (typeof dims.width !== "number" || typeof dims.height !== "number") {
          errors.push("Invalid canvas dimensions specification");
        }
      }
    }
  }

  // Generate validation report
  generateValidationReport(validationResult) {
    let report = "RailML Validation Report\n";
    report += "=".repeat(50) + "\n\n";

    report += `Status: ${validationResult.isValid ? "VALID" : "INVALID"}\n`;
    report += `Errors: ${validationResult.errors.length}\n`;
    report += `Warnings: ${validationResult.warnings.length}\n\n`;

    if (validationResult.errors.length > 0) {
      report += "ERRORS:\n";
      report += "-".repeat(20) + "\n";
      validationResult.errors.forEach((error, index) => {
        report += `${index + 1}. ${error}\n`;
      });
      report += "\n";
    }

    if (validationResult.warnings.length > 0) {
      report += "WARNINGS:\n";
      report += "-".repeat(20) + "\n";
      validationResult.warnings.forEach((warning, index) => {
        report += `${index + 1}. ${warning}\n`;
      });
      report += "\n";
    }

    if (validationResult.isValid) {
      report += "✅ Document is valid according to RailML schema guidelines.\n";
    } else {
      report += "❌ Document contains errors that need to be addressed.\n";
    }

    return report;
  }

  // Get RailML schema information
  getSchemaInfo() {
    return {
      version: this.version,
      namespace: this.namespace,
      supportedElements: {
        infrastructure: {
          tracks: "Railway track segments with geometry",
          functionalInfrastructure:
            "Railway components (signals, switches, etc.)",
          topology: "Network topology with nodes, edges, and connections",
          geometry: "Coordinate system and spatial bounds",
        },
        metadata: {
          exportInfo: "Export metadata including version and timestamps",
          canvasDimensions: "Original canvas size information",
        },
      },
      validComponentTypes: ["signal", "switch", "station", "platform"],
      validSignalAspects: [
        "red",
        "yellow",
        "green",
        "off",
        "danger",
        "caution",
        "clear",
      ],
      validSwitchStates: ["normal", "reverse"],
    };
  }

  // Convert validation errors to user-friendly messages
  formatValidationErrors(validationResult) {
    const formatted = {
      errors: [],
      warnings: [],
      summary: {
        isValid: validationResult.isValid,
        errorCount: validationResult.errors.length,
        warningCount: validationResult.warnings.length,
      },
    };

    validationResult.errors.forEach((error) => {
      formatted.errors.push({
        type: "error",
        message: error,
        severity: "high",
      });
    });

    validationResult.warnings.forEach((warning) => {
      formatted.warnings.push({
        type: "warning",
        message: warning,
        severity: "medium",
      });
    });

    return formatted;
  }
}

// Export additional RailML utilities
export class RailMLUtils {
  // Convert pixel coordinates to geographic coordinates using a simple projection
  static pixelToGeo(x, y, bounds, geoReference) {
    const { minX, minY, maxX, maxY } = bounds;
    const { latMin, latMax, lonMin, lonMax } = geoReference || {
      latMin: 0,
      latMax: 0.001,
      lonMin: 0,
      lonMax: 0.001,
    };

    const normalizedX = (x - minX) / (maxX - minX);
    const normalizedY = (y - minY) / (maxY - minY);

    return {
      latitude: latMin + normalizedY * (latMax - latMin),
      longitude: lonMin + normalizedX * (lonMax - lonMin),
      elevation: 0,
    };
  }

  // Calculate track statistics
  static calculateTrackStatistics(tracks) {
    return {
      totalTracks: tracks.length,
      totalLength: tracks.reduce((sum, track) => sum + (track.length || 0), 0),
      averageLength:
        tracks.length > 0
          ? tracks.reduce((sum, track) => sum + (track.length || 0), 0) /
            tracks.length
          : 0,
      shortestTrack: Math.min(...tracks.map((track) => track.length || 0)),
      longestTrack: Math.max(...tracks.map((track) => track.length || 0)),
    };
  }

  // Calculate component statistics
  static calculateComponentStatistics(components) {
    const stats = {};

    components.forEach((component) => {
      const type = component.type || "unknown";
      stats[type] = (stats[type] || 0) + 1;
    });

    return {
      totalComponents: components.length,
      byType: stats,
      mostCommonType: Object.keys(stats).reduce(
        (a, b) => (stats[a] > stats[b] ? a : b),
        "none"
      ),
    };
  }

  // Generate RailML compliant IDs
  static generateRailMLId(type, index) {
    const timestamp = Date.now().toString(36);
    return `${type}_${index}_${timestamp}`;
  }

  // Validate coordinate reference system
  static validateCRS(crs) {
    const validCRS = [
      "EPSG:4326", // WGS84
      "EPSG:3857", // Web Mercator
      "pixel", // Pixel coordinates
      "local", // Local coordinate system
    ];

    return validCRS.includes(crs);
  }

  // Convert between different coordinate systems
  static convertCoordinates(coordinates, fromCRS, toCRS) {
    // This is a simplified conversion - in production, use a proper projection library
    if (fromCRS === toCRS) {
      return coordinates;
    }

    // Simple conversions for demonstration
    if (fromCRS === "pixel" && toCRS === "EPSG:4326") {
      return coordinates.map((coord) => [
        coord[0] / 100000, // Simple scaling
        coord[1] / 100000,
      ]);
    }

    // Return original coordinates if conversion is not implemented
    console.warn(
      `Coordinate conversion from ${fromCRS} to ${toCRS} not implemented`
    );
    return coordinates;
  }

  // Generate sample RailML structure
  static generateSampleRailML() {
    return {
      railml: {
        version: "3.1",
        xmlns: "https://www.railml.org/schemas/3.1",
        created: new Date().toISOString(),
        creator: "Railway Design Tool",
        infrastructure: {
          id: "sample_infrastructure",
          name: "Sample Railway Design",
          tracks: [
            {
              id: "track_1",
              name: "Main Line",
              length: 1000.0,
              geometry: {
                coordinates: [
                  [0, 0],
                  [1000, 0],
                ],
                type: "LineString",
              },
            },
          ],
          functionalInfrastructure: [
            {
              id: "signal_1",
              type: "signal",
              name: "Entry Signal",
              position: {
                x: 100,
                y: 50,
                coordinate: {
                  latitude: 0.0001,
                  longitude: 0.001,
                  elevation: 0,
                },
              },
              properties: {
                aspect: "red",
                signalType: "main",
              },
            },
          ],
          topology: {
            nodes: [],
            edges: [],
            connections: [],
          },
          geometry: {
            coordinateSystem: "pixel",
            bounds: {
              minX: 0,
              minY: 0,
              maxX: 1200,
              maxY: 800,
            },
            scale: 1,
            unit: "px",
          },
        },
        metadata: {
          exportInfo: {
            version: "1.0.0",
            timestamp: new Date().toISOString(),
            canvasDimensions: {
              width: 1200,
              height: 800,
            },
          },
        },
      },
    };
  }
}
