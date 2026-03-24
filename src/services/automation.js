import api from './api'

// Step 1: Create Campaign & Extract Recipients
export const createCampaign = async (campaignName, targetAudience, emailContext, eventId = null) => {
  const response = await api.post('/automation/campaigns', {
    campaign_name: campaignName,
    target_audience: targetAudience, // "users" | "volunteers" | "both"
    event_id: eventId,
    email_context: emailContext
  })
  return response.data
}

// Step 2: Generate Email with Groq AI
export const generateEmail = async (campaignId, emailSubject) => {
  const response = await api.post(`/automation/campaigns/${campaignId}/generate-email`, {
    email_subject: emailSubject
  })
  return response.data
}

// Step 3: Preview Email
export const previewEmail = async (campaignId) => {
  const response = await api.get(`/automation/campaigns/${campaignId}/preview`)
  return response.data
}

// Step 4: Send Campaign
export const sendCampaign = async (campaignId) => {
  const response = await api.post(`/automation/campaigns/${campaignId}/send`)
  return response.data
}

// Get all campaigns
export const getCampaigns = async () => {
  const response = await api.get('/automation/campaigns')
  return response.data
}

// Get campaign details
export const getCampaignDetails = async (campaignId) => {
  const response = await api.get(`/automation/campaigns/${campaignId}`)
  return response.data
}

// Delete campaign
export const deleteCampaign = async (campaignId) => {
  const response = await api.delete(`/automation/campaigns/${campaignId}`)
  return response.data
}
