import api from './api';

export const volunteerService = {
  // Upload Excel
  async uploadExcel(eventId, file) {
    const formData = new FormData();
    formData.append('file', file);

    const response = await api.post(
      `/volunteers/${eventId}/upload-excel`,
      formData,
      {
        headers: {
          'Content-Type': 'multipart/form-data'
        }
      }
    );
    return response.data;
  },

  // Create single volunteer
  async create(eventId, volunteerData) {
    const response = await api.post(`/volunteers/${eventId}`, {
      name: volunteerData.name,
      email: volunteerData.email,
      phone: volunteerData.phone,
      role: volunteerData.role,
      skills: volunteerData.skills,
      availability: volunteerData.availability,
      emergency_contact_name: volunteerData.emergencyContactName,
      emergency_contact_phone: volunteerData.emergencyContactPhone,
      notes: volunteerData.notes,
      special_requirements: volunteerData.specialRequirements
    });
    return response.data;
  },

  // Get event volunteers
  async getEventVolunteers(eventId, status = null) {
    const params = new URLSearchParams();
    if (status) params.append('status', status);
    
    const response = await api.get(`/volunteers/${eventId}?${params}`);
    return response.data;
  },

  // Update volunteer
  async update(volunteerId, updates) {
    const response = await api.patch(`/volunteers/${volunteerId}`, updates);
    return response.data;
  },

  // Check-in / Check-out
  async checkInVolunteer(volunteerId, checkIn) {
    const response = await api.post(
      `/volunteers/${volunteerId}/check-in`,
      { check_in: checkIn }
    );
    return response.data;
  },

  // Delete volunteer
  async delete(volunteerId) {
    await api.delete(`/volunteers/${volunteerId}`);
  }
};
