import api from './api';

/**
 * Event Service - Handles all event-related API calls
 * Following DESIGN.md specifications
 */

export const eventService = {
  /**
   * Get all events with optional filters
   * @param {Object} filters - { category, status, city, search }
   * @returns {Promise<Array>} List of events
   */
  getAllEvents: async (filters = {}) => {
    try {
      const params = new URLSearchParams();

      if (filters.category) params.append('category', filters.category);
      if (filters.status) params.append('status', filters.status);
      if (filters.city) params.append('city', filters.city);
      if (filters.search) params.append('search', filters.search);

      const response = await api.get(`/events?${params.toString()}`);
      return response.data;
    } catch (error) {
      console.error('Error fetching events:', error);
      throw error.response?.data?.detail || 'Failed to fetch events';
    }
  },

  /**
   * Get single event by ID
   * @param {string} eventId - Event ID
   * @returns {Promise<Object>} Event details
   */
  getEventById: async (eventId) => {
    try {
      const response = await api.get(`/events/${eventId}`);
      return response.data;
    } catch (error) {
      console.error('Error fetching event:', error);
      throw error.response?.data?.detail || 'Failed to fetch event details';
    }
  },

  /**
   * Get events by category
   * @param {string} category - concert, sports, conference, etc.
   * @returns {Promise<Array>} List of events in category
   */
  getEventsByCategory: async (category) => {
    try {
      const response = await api.get(`/events?category=${category}&status=published`);
      return response.data;
    } catch (error) {
      console.error('Error fetching category events:', error);
      throw error.response?.data?.detail || 'Failed to fetch events';
    }
  },

  /**
   * Search events
   * @param {string} query - Search query
   * @returns {Promise<Array>} Search results
   */
  searchEvents: async (query) => {
    try {
      const response = await api.get(`/events?search=${query}&status=published`);
      return response.data;
    } catch (error) {
      console.error('Error searching events:', error);
      throw error.response?.data?.detail || 'Search failed';
    }
  },

  /**
   * Create new event (manual)
   * @param {Object} eventData - Event data
   * @returns {Promise<Object>} Created event 
   */
  createEvent: async (eventData) => {
    try {
      const response = await api.post('/events', eventData);
      return response.data;
    } catch (error) {
      console.error('Error creating event:', error);
      throw error.response?.data?.detail || 'Failed to create event';
    }
  }
};
