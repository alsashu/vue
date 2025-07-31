import { defineStore } from "pinia";
import { ref, computed } from "vue";
import { aiService } from "@services/aiService";

export const useAiStore = defineStore("ai", () => {
  const suggestions = ref([]);
  const isGenerating = ref(false);
  const error = ref(null);
  const chatHistory = ref([]);
  const aiEnabled = ref(true);

  // Computed
  const hasSuggestions = computed(() => suggestions.value.length > 0);
  const latestSuggestion = computed(
    () => suggestions.value[suggestions.value.length - 1] || null
  );

  // Actions
  const generateDesignSuggestions = async (designContext) => {
    try {
      isGenerating.value = true;
      error.value = null;

      const response = await aiService.generateSuggestions({
        context: designContext,
        module: designContext.activeModule,
        components: designContext.components,
        constraints: designContext.constraints || {},
      });

      suggestions.value = response.suggestions || [];

      // Add to chat history
      chatHistory.value.push({
        id: Date.now(),
        type: "ai-suggestion",
        content: response,
        timestamp: new Date().toISOString(),
      });

      return response;
    } catch (err) {
      error.value = err.message;
      throw err;
    } finally {
      isGenerating.value = false;
    }
  };

  const optimizeLayout = async (currentLayout) => {
    try {
      isGenerating.value = true;
      error.value = null;

      const response = await aiService.optimizeLayout(currentLayout);

      return response;
    } catch (err) {
      error.value = err.message;
      throw err;
    } finally {
      isGenerating.value = false;
    }
  };

  const validateDesign = async (designData) => {
    try {
      const response = await aiService.validateDesign(designData);

      // Add validation results to chat
      chatHistory.value.push({
        id: Date.now(),
        type: "validation",
        content: response,
        timestamp: new Date().toISOString(),
      });

      return response;
    } catch (err) {
      error.value = err.message;
      throw err;
    }
  };

  const askAiQuestion = async (question, context = null) => {
    try {
      isGenerating.value = true;
      error.value = null;

      // Add user question to chat
      chatHistory.value.push({
        id: Date.now(),
        type: "user-question",
        content: question,
        timestamp: new Date().toISOString(),
      });

      const response = await aiService.askQuestion(question, context);

      // Add AI response to chat
      chatHistory.value.push({
        id: Date.now(),
        type: "ai-response",
        content: response,
        timestamp: new Date().toISOString(),
      });

      return response;
    } catch (err) {
      error.value = err.message;
      throw err;
    } finally {
      isGenerating.value = false;
    }
  };

  const applySuggestion = (suggestionId) => {
    const suggestion = suggestions.value.find((s) => s.id === suggestionId);
    if (suggestion) {
      return suggestion.actions || [];
    }
    return [];
  };

  const dismissSuggestion = (suggestionId) => {
    suggestions.value = suggestions.value.filter((s) => s.id !== suggestionId);
  };

  const clearSuggestions = () => {
    suggestions.value = [];
  };

  const clearChatHistory = () => {
    chatHistory.value = [];
  };

  const toggleAi = () => {
    aiEnabled.value = !aiEnabled.value;
  };

  const clearError = () => {
    error.value = null;
  };

  return {
    suggestions,
    isGenerating,
    error,
    chatHistory,
    aiEnabled,
    hasSuggestions,
    latestSuggestion,
    generateDesignSuggestions,
    optimizeLayout,
    validateDesign,
    askAiQuestion,
    applySuggestion,
    dismissSuggestion,
    clearSuggestions,
    clearChatHistory,
    toggleAi,
    clearError,
  };
});
