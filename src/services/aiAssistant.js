import api from './api';

export const aiAssistantService = {
  chat: async (message, conversationId = null) => {
    try {
      const response = await api.post('/ai-assistant/chat', {
        message,
        conversation_id: conversationId
      });
      return response.data;
    } catch (error) {
      throw error.response?.data?.detail || 'Chat failed';
    }
  },

  createEvent: async (conversationId, venueId) => {
    try {
      const response = await api.post(
        `/ai-assistant/${conversationId}/create-event`, 
        { venue_id: venueId }
      );
      return response.data;
    } catch (error) {
      throw error.response?.data?.detail || 'Event creation failed';
    }
  },

  getConversations: async () => {
    try {
      const response = await api.get('/ai-assistant/conversations');
      return response.data;
    } catch (error) {
      throw error.response?.data?.detail || 'Failed to load conversations';
    }
  },

  getConversationHistory: async (conversationId) => {
    try {
      const response = await api.get(
        `/ai-assistant/conversations/${conversationId}/history`
      );
      return response.data;
    } catch (error) {
      throw error.response?.data?.detail || 'Failed to load conversation history';
    }
  }
};
