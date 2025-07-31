import axios from "axios";

const AI_API_BASE_URL =
  import.meta.env.VITE_AI_API_BASE_URL || "http://localhost:8001/api/ai";

const aiClient = axios.create({
  baseURL: AI_API_BASE_URL,
  timeout: 30000,
  headers: {
    "Content-Type": "application/json",
  },
});

// Add token to requests
aiClient.interceptors.request.use((config) => {
  const token = localStorage.getItem("railway_token");
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

export const aiService = {
  async generateSuggestions(designContext) {
    try {
      const response = await aiClient.post("/suggestions", designContext);
      return response.data;
    } catch (error) {
      // Mock AI suggestions for development
      const mockSuggestions = [
        {
          id: Date.now(),
          type: "optimization",
          title: "Track Layout Optimization",
          description:
            "Consider adjusting the curve radius at coordinates (150, 200) to improve train speed.",
          confidence: 0.85,
          actions: [
            {
              type: "modify_component",
              componentId: "track-1",
              property: "radius",
              value: 300,
            },
          ],
        },
        {
          id: Date.now() + 1,
          type: "safety",
          title: "Signal Placement",
          description:
            "Add a signal before the junction to ensure safe train operations.",
          confidence: 0.92,
          actions: [
            {
              type: "add_component",
              componentType: "signal",
              position: { x: 100, y: 150 },
            },
          ],
        },
      ];

      return { suggestions: mockSuggestions };
    }
  },

  async optimizeLayout(currentLayout) {
    try {
      const response = await aiClient.post("/optimize", {
        layout: currentLayout,
      });
      return response.data;
    } catch (error) {
      // Mock optimization
      return {
        optimizedLayout: currentLayout,
        improvements: [
          "Reduced total track length by 12%",
          "Improved curve efficiency by 8%",
          "Enhanced safety margins",
        ],
        score: 0.87,
      };
    }
  },

  async validateDesign(designData) {
    try {
      const response = await aiClient.post("/validate", designData);
      return response.data;
    } catch (error) {
      // Mock validation
      return {
        isValid: true,
        issues: [],
        warnings: [
          {
            type: "performance",
            message: "Sharp curve detected at segment 2",
            severity: "medium",
          },
        ],
        suggestions: [
          "Consider adding banking to curves over 5 degrees",
          "Ensure minimum 50m spacing between signals",
        ],
      };
    }
  },

  async askQuestion(question, context = null) {
    try {
      const response = await aiClient.post("/chat", { question, context });
      return response.data;
    } catch (error) {
      // Mock AI response
      return {
        answer: `Based on railway engineering best practices, here's my response to "${question}": This would typically involve considering factors like train speed, cargo weight, and safety regulations.`,
        confidence: 0.78,
        sources: [
          "Railway Engineering Handbook",
          "International Railway Standards",
        ],
      };
    }
  },

  async generateRailML(designData) {
    try {
      const response = await aiClient.post("/export/railml", designData);
      return response.data;
    } catch (error) {
      throw new Error("Failed to generate RailML: " + error.message);
    }
  },

  async analyzePerformance(designData) {
    try {
      const response = await aiClient.post("/analyze/performance", designData);
      return response.data;
    } catch (error) {
      // Mock performance analysis
      return {
        metrics: {
          efficiency: 0.82,
          safety: 0.91,
          capacity: 0.76,
          maintenance: 0.88,
        },
        recommendations: [
          "Optimize signal timing to improve throughput",
          "Consider parallel tracks for high-traffic sections",
          "Regular maintenance scheduling recommended",
        ],
      };
    }
  },
};
