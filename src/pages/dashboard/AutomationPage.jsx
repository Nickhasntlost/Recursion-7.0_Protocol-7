import { useState, useRef } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { toast } from 'react-toastify'
import api from '../../services/api'
import { aiAssistantService } from '../../services/aiAssistant'

const nodeTemplates = [
  { id: 'mail', label: 'Email', icon: 'mail', color: 'bg-secondary-container', textColor: 'text-[#1A1D00]' },
  { id: 'chat', label: 'WhatsApp', icon: 'chat', color: 'bg-zinc-800', textColor: 'text-secondary-container' },
  { id: 'telegram', label: 'Telegram', icon: 'send', color: 'bg-sky-600', textColor: 'text-white' },
  { id: 'auto_awesome', label: 'LLM (AI)', icon: 'auto_awesome', color: 'bg-blue-600', textColor: 'text-white' },
  { id: 'event', label: 'Event', icon: 'event', color: 'bg-purple-600', textColor: 'text-white' },
  { id: 'schedule', label: 'Delay', icon: 'schedule', color: 'bg-amber-600', textColor: 'text-white' },
  { id: 'filter_alt', label: 'Filter', icon: 'filter_alt', color: 'bg-emerald-600', textColor: 'text-white' },
  { id: 'storage', label: 'Database', icon: 'storage', color: 'bg-blue-700', textColor: 'text-white' },
  { id: 'notifications', label: 'Slack', icon: 'notifications', color: 'bg-cyan-600', textColor: 'text-white' },
]

const DEFAULT_TELEGRAM_CHAT_ID = '8775934169'
const DEFAULT_TELEGRAM_BOT_TOKEN = String(import.meta.env.VITE_TELEGRAM_BOT_TOKEN || '').trim()
const DEFAULT_TEST_EMAIL = 'dongardivedeepak17@gmail.com'
const GOOGLE_API_KEY = String(import.meta.env.VITE_GOOGLE_API_KEY || 'AIzaSyDbT8BlGEVVLT7f3L8-CiQ3cTkWxqqRJsw').trim()
const GOOGLE_CLIENT_ID = String(import.meta.env.VITE_GOOGLE_CLIENT_ID || '1026870439773-nq24b4laar8jgopeibhctptff7gf4ni3.apps.googleusercontent.com').trim()
const GMAIL_SEND_SCOPE = 'https://www.googleapis.com/auth/gmail.send'

export default function AutomationPage() {
  const canvasRef = useRef(null)
  const [nodes, setNodes] = useState([])
  const [connections, setConnections] = useState([])
  const [draggedTemplate, setDraggedTemplate] = useState(null)
  const [connectingFrom, setConnectingFrom] = useState(null)
  const [tempLine, setTempLine] = useState(null)
  const [zoom, setZoom] = useState(100)
  const [expandedSidebar, setExpandedSidebar] = useState(false)
  const [showDeployModal, setShowDeployModal] = useState(false)
  const [deployMode, setDeployMode] = useState('telegram')
  const [telegramBotToken, setTelegramBotToken] = useState(() => {
    return localStorage.getItem('utsova-telegram-token') || DEFAULT_TELEGRAM_BOT_TOKEN
  })
  const [telegramChatId, setTelegramChatId] = useState(() => {
    return localStorage.getItem('utsova-telegram-chat-id') || DEFAULT_TELEGRAM_CHAT_ID
  })
  const [telegramMessage, setTelegramMessage] = useState('Hello from Utsova automation flow!')
  const [recentChatIds, setRecentChatIds] = useState([])
  const [emailRecipient, setEmailRecipient] = useState(() => localStorage.getItem('utsova-email-recipient') || DEFAULT_TEST_EMAIL)
  const [emailPurpose, setEmailPurpose] = useState('')
  const [emailSubject, setEmailSubject] = useState('')
  const [emailBody, setEmailBody] = useState('')
  const [resolvedEmailRecipients, setResolvedEmailRecipients] = useState([])
  const [isGeneratingEmail, setIsGeneratingEmail] = useState(false)
  const [isFetchingChats, setIsFetchingChats] = useState(false)
  const [isDeploying, setIsDeploying] = useState(false)
  const sidebarHoverRef = useRef(null)
  const hoverTimeoutRef = useRef(null)

  const hasTelegramNode = nodes.some((node) => node.type === 'telegram')
  const hasMailNode = nodes.some((node) => node.type === 'mail')
  const hasLlmNode = nodes.some((node) => node.type === 'auto_awesome')
  const hasTelegramAndLlm = hasTelegramNode && hasLlmNode
  const hasMailAndLlm = hasMailNode && hasLlmNode

  const hasConnectionBetweenTypes = (firstType, secondType) => {
    return connections.some((connection) => {
      const fromNode = nodes.find((node) => node.id === connection.from)
      const toNode = nodes.find((node) => node.id === connection.to)
      if (!fromNode || !toNode) return false

      return (
        (fromNode.type === firstType && toNode.type === secondType) ||
        (fromNode.type === secondType && toNode.type === firstType)
      )
    })
  }

  const hasMailLlmConnection = hasConnectionBetweenTypes('mail', 'auto_awesome')

  const normalizeChatId = (value) => {
    const raw = String(value || '').trim()
    if (!raw) return ''

    // Allow users to paste t.me links and convert them to @chatusername.
    const linkMatch = raw.match(/(?:https?:\/\/)?t\.me\/([^/?#\s]+)/i)
    if (linkMatch?.[1]) {
      return `@${linkMatch[1].replace(/^@/, '')}`
    }

    return raw
  }

  const parseChatIds = (rawValue) => {
    const raw = String(rawValue || '')
    const extracted = raw.match(/-?\d{5,}|@[a-zA-Z0-9_]{5,}|(?:https?:\/\/)?t\.me\/[a-zA-Z0-9_]{5,}/g) || []

    const tokens = extracted.length > 0 ? extracted : raw.split(/[\n,\s]+/)

    return Array.from(new Set(tokens.map((item) => normalizeChatId(item)).filter(Boolean)))
  }

  const mapTelegramErrorMessage = (description, chatId) => {
    const text = String(description || '').toLowerCase()
    const label = chatId ? ` for ${chatId}` : ''

    if (text.includes('unauthorized') || text.includes('invalid token') || text.includes('bot token')) {
      return 'Telegram bot token is invalid or expired. Generate a new token from @BotFather, update it here, and retry.'
    }

    if (text.includes('chat not found')) {
      return `Chat not found${label}. Use a valid numeric chat ID (recommended via Fetch Recent Chats after sending /start to your bot), or for public channels use @channelusername.`
    }

    if (text.includes('bot was blocked by the user')) {
      return `Bot was blocked${label}. Unblock the bot and send /start, then try again.`
    }

    if (text.includes('not enough rights')) {
      return `Bot lacks permission${label}. Add the bot to the chat/channel and grant posting rights.`
    }

    return description || 'Telegram request failed'
  }

  const isTelegramUnauthorizedError = (description) => {
    const text = String(description || '').toLowerCase()
    return text.includes('unauthorized') || text.includes('invalid token') || text.includes('bot token')
  }

  const clearStoredTelegramToken = () => {
    localStorage.removeItem('utsova-telegram-token')
    setTelegramBotToken(DEFAULT_TELEGRAM_BOT_TOKEN)
  }

  const ensureTelegramBotAuthorized = async (token) => {
    const response = await fetch(`https://api.telegram.org/bot${token}/getMe`)
    const data = await response.json()

    if (!response.ok || !data?.ok) {
      const description = data?.description || 'Telegram authorization failed'
      if (isTelegramUnauthorizedError(description)) {
        clearStoredTelegramToken()
      }
      throw new Error(mapTelegramErrorMessage(description))
    }
  }

  const extractChatIdsFromUpdates = (updates) => {
    const ids = (updates || [])
      .flatMap((update) => [
        update?.message?.chat?.id,
        update?.edited_message?.chat?.id,
        update?.channel_post?.chat?.id,
        update?.edited_channel_post?.chat?.id,
        update?.my_chat_member?.chat?.id,
        update?.chat_member?.chat?.id,
        update?.chat_join_request?.chat?.id,
        update?.callback_query?.message?.chat?.id,
      ])
      .filter(Boolean)
      .map((id) => String(id))

    return Array.from(new Set(ids))
  }

  const fetchDiscoveredChatIds = async (token) => {
    const endpoint = new URL(`https://api.telegram.org/bot${token}/getUpdates`)
    endpoint.searchParams.set('allowed_updates', JSON.stringify([
      'message',
      'edited_message',
      'channel_post',
      'edited_channel_post',
      'my_chat_member',
      'chat_member',
      'chat_join_request',
      'callback_query',
    ]))

    const response = await fetch(endpoint.toString())
    const data = await response.json()

    if (!response.ok || !data?.ok) {
      throw new Error(data?.description || 'Failed to fetch Telegram chats')
    }

    return extractChatIdsFromUpdates(data.result || [])
  }

  const sendTelegramMessage = async (token, chatId, text) => {
    const response = await fetch(`https://api.telegram.org/bot${token}/sendMessage`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        chat_id: chatId,
        text,
        parse_mode: 'HTML',
      }),
    })

    const data = await response.json()
    if (!response.ok || !data?.ok) {
      throw new Error(mapTelegramErrorMessage(data?.description, chatId))
    }
  }

  const buildFallbackEmailDraft = (purposeText) => {
    const cleanPurpose = String(purposeText || 'general update').trim()
    return {
      subject: `Update regarding ${cleanPurpose}`,
      body: `Hello,\n\nI hope you are doing well. This is a quick update regarding ${cleanPurpose}.\n\nHere are the key points:\n- Objective: ${cleanPurpose}\n- Next step: Please review and reply with your availability/feedback.\n\nThank you,\nUtsova Automation`,
    }
  }

  const pickRandom = (items) => items[Math.floor(Math.random() * items.length)]

  const buildRandomSubject = (purposeText) => {
    const raw = String(purposeText || '').trim()
    const fallbackTopic = 'your upcoming event'
    const stopwords = new Set(['the', 'and', 'with', 'from', 'that', 'this', 'have', 'your', 'about', 'into', 'will'])
    const tokens = raw
      .toLowerCase()
      .replace(/[^a-z0-9\s]/g, ' ')
      .split(/\s+/)
      .filter((word) => word.length > 3 && !stopwords.has(word))

    const topic = tokens.slice(0, 3).join(' ') || raw || fallbackTopic
    const templates = [
      `Important update: ${topic}`,
      `Action required regarding ${topic}`,
      `Latest announcement for ${topic}`,
      `Please review: ${topic}`,
      `New details about ${topic}`,
    ]

    return pickRandom(templates)
  }

  const normalizeEmail = (value) => String(value || '').trim().toLowerCase()

  const isValidEmail = (value) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(normalizeEmail(value))

  const extractEmailsFromRecords = (records) => {
    if (!Array.isArray(records)) return []

    const emails = records
      .flatMap((entry) => [
        entry?.email,
        entry?.user_email,
        entry?.attendee_email,
        entry?.contact_email,
        entry?.user?.email,
        entry?.attendee?.email,
        entry?.customer?.email,
      ])
      .map(normalizeEmail)
      .filter((email) => isValidEmail(email))

    return Array.from(new Set(emails))
  }

  const asArrayFromResponse = (data) => {
    if (Array.isArray(data)) return data
    if (Array.isArray(data?.items)) return data.items
    if (Array.isArray(data?.results)) return data.results
    if (Array.isArray(data?.data)) return data.data
    if (Array.isArray(data?.bookings)) return data.bookings
    if (Array.isArray(data?.attendees)) return data.attendees
    return []
  }

  const fetchRegisteredEmails = async () => {
    const endpoints = [
      '/bookings',
      '/bookings/all',
      '/dashboard/bookings',
      '/attendees',
      '/events/bookings',
    ]

    for (let index = 0; index < endpoints.length; index += 1) {
      try {
        const response = await api.get(endpoints[index])
        const list = asArrayFromResponse(response.data)
        const emails = extractEmailsFromRecords(list)
        if (emails.length > 0) {
          return emails
        }
      } catch {
        // Try next endpoint.
      }
    }

    return []
  }

  const parseAIDraft = (rawText, purposeText) => {
    const fallback = buildFallbackEmailDraft(purposeText)
    const text = String(rawText || '').trim()
    if (!text) return fallback

    const tryParseDraftJson = (source) => {
      const candidate = String(source || '').trim()
      if (!candidate) return null

      // Try direct JSON first.
      try {
        const parsed = JSON.parse(candidate)
        if (parsed?.subject && parsed?.body) {
          return {
            subject: String(parsed.subject).trim(),
            body: String(parsed.body).trim(),
          }
        }
      } catch {
        // Ignore and try extracting object from surrounding text.
      }

      const firstBrace = candidate.indexOf('{')
      const lastBrace = candidate.lastIndexOf('}')
      if (firstBrace === -1 || lastBrace === -1 || lastBrace <= firstBrace) {
        return null
      }

      const objectText = candidate.slice(firstBrace, lastBrace + 1)
      try {
        const parsed = JSON.parse(objectText)
        if (parsed?.subject && parsed?.body) {
          return {
            subject: String(parsed.subject).trim(),
            body: String(parsed.body).trim(),
          }
        }
      } catch {
        return null
      }

      return null
    }

    // Prefer JSON from fenced code block when present.
    const fencedJson = text.match(/```(?:json)?\s*([\s\S]*?)```/i)?.[1]
    const parsedFromFence = tryParseDraftJson(fencedJson)
    if (parsedFromFence) return parsedFromFence

    const parsedFromText = tryParseDraftJson(text)
    if (parsedFromText) return parsedFromText

    const withoutCodeBlocks = text.replace(/```[\s\S]*?```/g, '').trim()
    const withoutChecklist = withoutCodeBlocks.split(/\n\s*\*\*Still need:\*\*|\n\s*Still need:/i)[0].trim()
    const withoutLeadIn = withoutChecklist
      .replace(/^(?:i['’]?m\s+so\s+sorry[\s\S]*?email:\s*)/i, '')
      .replace(/^(?:here['’]?s\s+a\s+draft[\s\S]*?email:\s*)/i, '')
      .trim()

    const subjectMatch = withoutLeadIn.match(/subject\s*[:\-]\s*(.+)/i)
    const bodyMatch = withoutLeadIn.match(/body\s*[:\-]\s*([\s\S]+)/i)
    const bodyFromDear = withoutLeadIn.match(/(Dear[\s\S]*)/i)?.[1]?.trim()

    return {
      subject: subjectMatch?.[1]?.trim() || fallback.subject,
      body: bodyMatch?.[1]?.trim() || bodyFromDear || withoutLeadIn || fallback.body,
    }
  }

  const generateEmailDraft = async (purposeText) => {
    const prompt = [
      'Draft a professional email for this purpose:',
      purposeText,
      'Return ONLY valid JSON with keys "subject" and "body".',
      'Do not include markdown, code fences, commentary, checklist, or extra text.',
      'Keep it concise and actionable.'
    ].join('\n')

    try {
      const response = await aiAssistantService.chat(prompt)
      const aiText = response?.assistant_message || response?.message || response?.reply || ''
      return parseAIDraft(aiText, purposeText)
    } catch {
      return buildFallbackEmailDraft(purposeText)
    }
  }

  const sendEmailViaApi = async ({ to, recipients, subject, body, purpose }) => {
    const recipientList = Array.isArray(recipients) && recipients.length > 0
      ? recipients.map(normalizeEmail).filter((email) => isValidEmail(email))
      : [normalizeEmail(to)].filter((email) => isValidEmail(email))

    if (recipientList.length === 0) {
      throw new Error('No valid recipients available for email broadcast.')
    }

    if (!GOOGLE_API_KEY || !GOOGLE_CLIENT_ID) {
      throw new Error('Google email API credentials are missing. Set VITE_GOOGLE_API_KEY and VITE_GOOGLE_CLIENT_ID.')
    }

    const loadGoogleIdentityScript = async () => {
      if (window.google?.accounts?.oauth2) return

      await new Promise((resolve, reject) => {
        const existing = document.getElementById('google-identity-script')
        if (existing) {
          existing.addEventListener('load', resolve, { once: true })
          existing.addEventListener('error', () => reject(new Error('Failed to load Google Identity script')), { once: true })
          return
        }

        const script = document.createElement('script')
        script.id = 'google-identity-script'
        script.src = 'https://accounts.google.com/gsi/client'
        script.async = true
        script.defer = true
        script.onload = resolve
        script.onerror = () => reject(new Error('Failed to load Google Identity script'))
        document.head.appendChild(script)
      })
    }

    const requestAccessToken = async () => {
      await loadGoogleIdentityScript()

      return new Promise((resolve, reject) => {
        const tokenClient = window.google.accounts.oauth2.initTokenClient({
          client_id: GOOGLE_CLIENT_ID,
          scope: GMAIL_SEND_SCOPE,
          callback: (response) => {
            if (response?.error || !response?.access_token) {
              reject(new Error(response?.error_description || response?.error || 'Google OAuth failed'))
              return
            }
            resolve(response.access_token)
          },
        })

        tokenClient.requestAccessToken({ prompt: '' })
      })
    }

    const encodeBase64Url = (value) => {
      return btoa(unescape(encodeURIComponent(value))).replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/g, '')
    }

    const buildRawEmail = (recipient) => {
      return [
        `To: ${recipient}`,
        `Subject: ${subject}`,
        'Content-Type: text/plain; charset="UTF-8"',
        '',
        body,
        '',
        `Purpose: ${purpose}`,
      ].join('\r\n')
    }

    const accessToken = await requestAccessToken()

    for (let index = 0; index < recipientList.length; index += 1) {
      const recipient = recipientList[index]
      const raw = encodeBase64Url(buildRawEmail(recipient))

      const response = await fetch(`https://gmail.googleapis.com/gmail/v1/users/me/messages/send?key=${GOOGLE_API_KEY}`, {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${accessToken}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ raw }),
      })

      if (!response.ok) {
        const data = await response.json().catch(() => ({}))
        const message = data?.error?.message || 'Unknown Gmail API error'
        throw new Error(`Gmail API request failed (${response.status}): ${message}`)
      }
    }

    return { sent: recipientList.length }
  }

  const fetchRecentTelegramChats = async () => {
    const token = telegramBotToken.trim()

    if (!token) {
      toast.error('Enter Telegram bot token first.')
      return
    }

    setIsFetchingChats(true)
    try {
      await ensureTelegramBotAuthorized(token)
      const ids = await fetchDiscoveredChatIds(token)

      setRecentChatIds(ids)
      if (ids.length > 0) {
        setTelegramChatId(ids.join(', '))
        toast.success(`Loaded ${ids.length} chat ID(s).`)
      } else {
        toast.info('No chats found yet. Send a message to your bot first, then retry.')
      }
    } catch (error) {
      if (isTelegramUnauthorizedError(error?.message)) {
        clearStoredTelegramToken()
      }
      toast.error(mapTelegramErrorMessage(error?.message || 'Failed to fetch recent chats'))
    } finally {
      setIsFetchingChats(false)
    }
  }

  const handleDeployTelegramFlow = async () => {
    if (!hasTelegramAndLlm) {
      toast.error('Add both Telegram and LLM nodes before deploying.')
      return
    }

    if (!telegramBotToken.trim()) {
      toast.error('Enter Telegram bot token.')
      return
    }

    const chatIds = Array.from(new Set([DEFAULT_TELEGRAM_CHAT_ID, ...parseChatIds(telegramChatId)]))

    if (!telegramMessage.trim()) {
      toast.error('Enter a message to send.')
      return
    }

    setIsDeploying(true)
    try {
      const token = telegramBotToken.trim()
      const message = telegramMessage.trim()

      await ensureTelegramBotAuthorized(token)

      localStorage.setItem('utsova-telegram-token', token)
      localStorage.setItem('utsova-telegram-chat-id', telegramChatId.trim())

      let successCount = 0
      const failedRecipients = []

      for (let index = 0; index < chatIds.length; index += 1) {
        const chatId = chatIds[index]

        try {
          await sendTelegramMessage(token, chatId, message)
          successCount += 1
        } catch (error) {
          failedRecipients.push({
            chatId,
            reason: mapTelegramErrorMessage(error?.message, chatId),
          })
        }
      }

      // Fallback: if manual IDs failed (commonly due to wrong ID), retry with discovered chats.
      if (successCount === 0 && failedRecipients.length > 0) {
        const hasChatNotFound = failedRecipients.some((item) =>
          String(item.reason || '').toLowerCase().includes('chat not found')
        )

        if (hasChatNotFound) {
          const discoveredIds = await fetchDiscoveredChatIds(token)
          const retryIds = discoveredIds.filter((id) => !chatIds.includes(id))

          for (let index = 0; index < retryIds.length; index += 1) {
            try {
              await sendTelegramMessage(token, retryIds[index], message)
              successCount += 1
            } catch {
              // Ignore secondary fallback failures and preserve original failure reason.
            }
          }

          if (successCount > 0) {
            toast.info('Manual chat ID failed, but message was sent using discovered recent chats.')
          }
        }
      }

      if (successCount === 0 && failedRecipients.length > 0) {
        throw new Error(failedRecipients[0].reason)
      }

      if (failedRecipients.length > 0) {
        toast.warn(`Sent to ${successCount} chat(s), failed for ${failedRecipients.length}.`)
      } else {
        toast.success(`Telegram message sent to ${successCount} chat(s).`)
      }

      if (successCount > 0) {
        setShowDeployModal(false)
      }
    } catch (error) {
      if (isTelegramUnauthorizedError(error?.message)) {
        clearStoredTelegramToken()
      }
      toast.error(mapTelegramErrorMessage(error?.message || 'Failed to send Telegram message'))
    } finally {
      setIsDeploying(false)
    }
  }

  const handleGenerateEmailDraft = async () => {
    if (!emailPurpose.trim()) {
      toast.error('Enter the purpose of the email first.')
      return
    }

    setIsGeneratingEmail(true)
    try {
      const draft = await generateEmailDraft(emailPurpose.trim())
      setEmailSubject(draft.subject)
      setEmailBody(draft.body)
      toast.success('Email draft generated.')
    } catch {
      toast.error('Unable to generate email draft right now.')
    } finally {
      setIsGeneratingEmail(false)
    }
  }

  const handleDeployEmailFlow = async () => {
    if (!hasMailAndLlm) {
      toast.error('Add both Email and LLM nodes before deploying.')
      return
    }

    if (!hasMailLlmConnection) {
      toast.error('Connect Email node with LLM node before deploying.')
      return
    }

    if (!emailRecipient.trim()) {
      toast.error('Enter recipient email.')
      return
    }

    if (!emailPurpose.trim()) {
      toast.error('Enter the purpose of the email.')
      return
    }

    setIsDeploying(true)
    try {
      localStorage.setItem('utsova-email-recipient', emailRecipient.trim())

      let subject = emailSubject.trim()
      let body = emailBody.trim()
      let recipients = []

      const fetchedRegistrantEmails = await fetchRegisteredEmails()
      if (fetchedRegistrantEmails.length > 0) {
        recipients = fetchedRegistrantEmails
      }

      if (isValidEmail(emailRecipient.trim())) {
        recipients = Array.from(new Set([normalizeEmail(emailRecipient.trim()), ...recipients]))
      }

      if (recipients.length === 0) {
        throw new Error('No registered user emails found. Please connect bookings/attendees email API and retry.')
      }

      setResolvedEmailRecipients(recipients)

      if (!subject || !body) {
        const draft = await generateEmailDraft(emailPurpose.trim())
        subject = draft.subject || ''
        body = draft.body
        setEmailSubject(subject)
        setEmailBody(body)
      }

      subject = buildRandomSubject(`${emailPurpose.trim()} ${subject}`)
      setEmailSubject(subject)

      await sendEmailViaApi({
        to: emailRecipient.trim(),
        recipients,
        subject,
        body,
        purpose: emailPurpose.trim(),
      })
      toast.success(`Email broadcast sent to ${recipients.length} recipient(s).`)

      setShowDeployModal(false)
    } catch (error) {
      toast.error(error?.message || 'Failed to deploy email automation')
    } finally {
      setIsDeploying(false)
    }
  }

  const handleOpenDeployModal = () => {
    if (hasMailAndLlm) {
      setDeployMode('email')
      setShowDeployModal(true)
      return
    }

    setDeployMode('telegram')
    setShowDeployModal(true)
  }

  // Handle drag start from sidebar
  const handleDragStart = (template) => {
    setDraggedTemplate(template)
  }

  // Handle drag over canvas
  const handleDragOver = (e) => {
    e.preventDefault()
  }

  // Handle drop on canvas
  const handleDrop = (e) => {
    e.preventDefault()
    if (!draggedTemplate || !canvasRef.current) return

    const rect = canvasRef.current.getBoundingClientRect()
    const x = e.clientX - rect.left
    const y = e.clientY - rect.top

    const newNode = {
      id: `${draggedTemplate.id}-${Date.now()}`,
      type: draggedTemplate.id,
      label: draggedTemplate.label,
      icon: draggedTemplate.icon,
      color: draggedTemplate.color,
      textColor: draggedTemplate.textColor,
      x,
      y,
      width: 320,
      height: 160,
    }

    setNodes([...nodes, newNode])
    setDraggedTemplate(null)
  }

  // Handle node drag
  const handleNodeMouseDown = (e, nodeId) => {
    if (e.button !== 0) return // Only left click
    e.preventDefault()

    const node = nodes.find((n) => n.id === nodeId)
    if (!node) return

    const canvasRect = canvasRef.current.getBoundingClientRect()
    let startX = e.clientX - canvasRect.left
    let startY = e.clientY - canvasRect.top

    const handleMouseMove = (moveEvent) => {
      const deltaX = moveEvent.clientX - canvasRect.left - startX
      const deltaY = moveEvent.clientY - canvasRect.top - startY

      setNodes((prevNodes) =>
        prevNodes.map((n) =>
          n.id === nodeId ? { ...n, x: n.x + deltaX, y: n.y + deltaY } : n
        )
      )

      startX = moveEvent.clientX - canvasRect.left
      startY = moveEvent.clientY - canvasRect.top
    }

    const handleMouseUp = () => {
      document.removeEventListener('mousemove', handleMouseMove)
      document.removeEventListener('mouseup', handleMouseUp)
    }

    document.addEventListener('mousemove', handleMouseMove)
    document.addEventListener('mouseup', handleMouseUp)
  }

  // Handle connection start
  const handleOutputPortMouseDown = (nodeId) => {
    setConnectingFrom(nodeId)
  }

  // Handle connection end
  const handleInputPortMouseDown = (targetId) => {
    if (!connectingFrom || connectingFrom === targetId) {
      setConnectingFrom(null)
      return
    }

    const existingConnection = connections.find(
      (c) => c.from === connectingFrom && c.to === targetId
    )

    if (!existingConnection) {
      setConnections([...connections, { from: connectingFrom, to: targetId }])
    }

    setConnectingFrom(null)
  }

  // Handle canvas mouse move for connection line
  const handleCanvasMouseMove = (e) => {
    if (connectingFrom && canvasRef.current) {
      const fromNode = nodes.find((n) => n.id === connectingFrom)
      if (fromNode) {
        const rect = canvasRef.current.getBoundingClientRect()
        const x = e.clientX - rect.left
        const y = e.clientY - rect.top

        setTempLine({
          x1: fromNode.x + fromNode.width / 2,
          y1: fromNode.y + fromNode.height,
          x2: x,
          y2: y,
        })
      }
    }
  }

  // Handle canvas mouse leave
  const handleCanvasMouseLeave = () => {
    if (connectingFrom) {
      setConnectingFrom(null)
      setTempLine(null)
    }
  }

  // Handle sidebar hover - expand after 3 seconds
  const handleSidebarHoverEnter = () => {
    hoverTimeoutRef.current = setTimeout(() => {
      setExpandedSidebar(true)
    }, 3000)
  }

  const handleSidebarHoverLeave = () => {
    if (hoverTimeoutRef.current) {
      clearTimeout(hoverTimeoutRef.current)
    }
  }

  return (
    <div className="relative w-full h-[calc(100vh-64px)] overflow-hidden" style={{
      backgroundColor: '#0a0a0a',
      backgroundImage: 'radial-gradient(#262626 1px, transparent 1px)',
      backgroundSize: '32px 32px',
    }}>
      {/* Decorative Blobs */}
      <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-secondary-container/10 blur-[120px] rounded-full pointer-events-none" />
      <div className="absolute bottom-1/3 right-1/4 w-64 h-64 bg-secondary-container/5 blur-[100px] rounded-full pointer-events-none" />

      {/* SVG for connections - render under nodes */}
      <svg
        className="absolute inset-0 z-10 pointer-events-none"
        width="100%"
        height="100%"
      >
        {/* Existing connections */}
        {connections.map((conn, idx) => {
          const fromNode = nodes.find((n) => n.id === conn.from)
          const toNode = nodes.find((n) => n.id === conn.to)
          
          if (!fromNode || !toNode) return null

          const x1 = fromNode.x + fromNode.width / 2
          const y1 = fromNode.y + fromNode.height
          const x2 = toNode.x + toNode.width / 2
          const y2 = toNode.y

          const midY = (y1 + y2) / 2

          return (
            <g key={`conn-${idx}`}>
              <defs>
                <marker
                  id={`arrowhead-${idx}`}
                  markerWidth="10"
                  markerHeight="10"
                  refX="9"
                  refY="3"
                  orient="auto"
                >
                  <polygon points="0 0, 10 3, 0 6" fill="#DFEB72" />
                </marker>
              </defs>
              <path
                d={`M ${x1} ${y1} C ${x1} ${midY}, ${x2} ${midY}, ${x2} ${y2}`}
                stroke="#DFEB72"
                strokeWidth="2"
                fill="none"
                markerEnd={`url(#arrowhead-${idx})`}
                strokeLinecap="round"
                className="drop-shadow-lg"
              />
            </g>
          )
        })}

        {/* Temporary connection line while dragging */}
        {tempLine && (
          <line
            x1={tempLine.x1}
            y1={tempLine.y1}
            x2={tempLine.x2}
            y2={tempLine.y2}
            stroke="#DFEB72"
            strokeWidth="2"
            strokeDasharray="5,5"
            opacity="0.6"
          />
        )}
      </svg>

      {/* Canvas */}
      <div
        ref={canvasRef}
        onDragOver={handleDragOver}
        onDrop={handleDrop}
        onMouseMove={handleCanvasMouseMove}
        onMouseLeave={handleCanvasMouseLeave}
        className="relative w-full h-full z-20 cursor-grab active:cursor-grabbing overflow-auto"
      >
        <AnimatePresence>
          {nodes.map((node) => (
            <motion.div
              key={node.id}
              layout
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.8, opacity: 0 }}
              transition={{ type: 'spring', damping: 20, stiffness: 300 }}
              className="absolute"
              style={{
                left: node.x,
                top: node.y,
              }}
              onMouseDown={(e) => handleNodeMouseDown(e, node.id)}
            >
              <motion.div
                whileHover={{ scale: 1.02 }}
                transition={{ duration: 0.2 }}
                className="relative w-80 bg-gradient-to-br from-zinc-900/90 to-black/90 p-6 rounded-lg shadow-2xl border border-zinc-700/50 hover:border-secondary-container/30 transition-all group backdrop-blur-xl"
              >
                {/* Node Header */}
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-3">
                    <div className={`w-10 h-10 rounded-full flex items-center justify-center ${node.color} ${node.textColor}`}>
                      <span className={`material-symbols-outlined ${node.textColor}`} style={{ fontVariationSettings: "'FILL' 1" }}>
                        {node.icon}
                      </span>
                    </div>
                    <div>
                      <h3 className="font-headline font-bold text-on-surface-variant text-sm">{node.label}</h3>
                      <p className="text-[10px] text-secondary-container uppercase tracking-widest font-bold">{node.type || 'Component'}</p>
                    </div>
                  </div>
                  <motion.button
                    whileHover={{ scale: 1.1 }}
                    onClick={(e) => {
                      e.stopPropagation()
                      // Show menu
                    }}
                    className="opacity-0 group-hover:opacity-100 text-on-surface-variant hover:text-secondary-container transition-all"
                  >
                    <span className="material-symbols-outlined text-[20px]">more_vert</span>
                  </motion.button>
                </div>

                {/* Divider */}
                <div className="h-[2px] w-full bg-outline-variant/30 rounded-full mb-3" />

                {/* Stats */}
                <div className="flex items-center justify-between text-[11px] text-on-surface-variant">
                  <span className="flex items-center gap-1">
                    <span className="material-symbols-outlined text-[14px] text-secondary-container">send</span> <span className="text-secondary-container font-bold">1.2k Sent</span>
                  </span>
                  <span className="flex items-center gap-1">
                    <span className="material-symbols-outlined text-[14px] text-secondary-container">visibility</span> <span className="text-secondary-container font-bold">84% Open</span>
                  </span>
                </div>

                {/* Connection Ports */}
                <div
                  className="absolute -top-3 left-1/2 -translate-x-1/2 w-6 h-6 bg-emerald-500 rounded-full border-2 border-black cursor-pointer hover:scale-125 transition-transform"
                  onMouseDown={() => handleInputPortMouseDown(node.id)}
                  title="Input"
                />

                <div
                  className="absolute -bottom-3 left-1/2 -translate-x-1/2 w-6 h-6 bg-secondary-container rounded-full border-2 border-black cursor-pointer hover:scale-125 transition-transform"
                  onMouseDown={() => handleOutputPortMouseDown(node.id)}
                  title="Output"
                />
              </motion.div>
            </motion.div>
          ))}
        </AnimatePresence>

        {/* Empty State */}
        {nodes.length === 0 && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="absolute inset-0 flex items-center justify-center pointer-events-none"
          >
            <div className="text-center">
              <span className="material-symbols-outlined text-6xl text-zinc-600 mb-4 block">
                auto_awesome
              </span>
              <h2 className="text-2xl font-bold text-zinc-400 mb-2">
                Build Your Automation
              </h2>
              <p className="text-zinc-500 max-w-md">
                Drag components from the right sidebar to create your workflow
              </p>
            </div>
          </motion.div>
        )}
      </div>

      {/* Right Sidebar - Pill Style */}
      <motion.aside
        initial={{ x: 100 }}
        animate={{ x: 0 }}
        className="fixed right-6 top-32 z-30"
        ref={sidebarHoverRef}
      >
        <AnimatePresence mode="wait">
          {!expandedSidebar ? (
            <motion.div
              key="collapsed"
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9 }}
              transition={{ delay: 0.2 }}
              className="w-16 rounded-full py-6 flex flex-col items-center gap-4 bg-white/80 dark:bg-zinc-900/80 backdrop-blur-2xl shadow-[0_32px_64px_rgba(0,0,0,0.08)] border border-zinc-700/30"
              onMouseEnter={handleSidebarHoverEnter}
              onMouseLeave={handleSidebarHoverLeave}
            >
              {nodeTemplates.slice(0, 4).map((template, idx) => (
                <motion.button
                  key={template.id}
                  draggable
                  onDragStart={() => handleDragStart(template)}
                  whileHover={{ scale: 1.15, backgroundColor: 'rgba(255,255,255,0.1)' }}
                  whileTap={{ scale: 0.9 }}
                  className={`p-2.5 rounded-full transition-all relative group ${
                    idx === 1
                      ? 'bg-secondary-container text-on-secondary-fixed'
                      : 'text-zinc-400 dark:text-zinc-500 hover:bg-zinc-100 dark:hover:bg-zinc-800'
                  }`}
                  title={template.label}
                >
                  <span className="material-symbols-outlined text-[16px]">
                    {template.icon}
                  </span>

                  {/* Tooltip on hover */}
                  <motion.div
                    initial={{ opacity: 0, x: -10 }}
                    whileHover={{ opacity: 1, x: -55 }}
                    className="absolute left-0 top-1/2 -translate-y-1/2 bg-black/90 px-3 py-2 rounded text-white text-xs font-bold whitespace-nowrap pointer-events-none"
                  >
                    {template.label}
                  </motion.div>
                </motion.button>
              ))}
            </motion.div>
          ) : (
            <motion.div
              key="expanded"
              initial={{ opacity: 0, x: 100 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 100 }}
              transition={{ type: 'spring', damping: 25, stiffness: 300 }}
              className="w-72 bg-gradient-to-b from-zinc-900/95 to-black/95 backdrop-blur-xl border border-zinc-800 rounded-2xl shadow-2xl overflow-hidden"
            >
              {/* Header */}
              <div className="p-4 border-b border-zinc-800 flex items-center justify-between">
                <h3 className="text-xs font-black uppercase tracking-[0.2em] text-secondary-container">
                  Components
                </h3>
                <motion.button
                  whileHover={{ scale: 1.1 }}
                  whileTap={{ scale: 0.9 }}
                  onClick={() => setExpandedSidebar(false)}
                  className="p-1.5 hover:bg-zinc-800 rounded-full transition-all text-zinc-400 hover:text-white"
                >
                  <span className="material-symbols-outlined text-[18px]">close</span>
                </motion.button>
              </div>

              {/* Components Grid */}
              <div className="p-4 max-h-[calc(100vh-200px)] overflow-y-auto space-y-2">
                {nodeTemplates.map((template) => (
                  <motion.div
                    key={template.id}
                    draggable
                    onDragStart={() => handleDragStart(template)}
                    whileHover={{ scale: 1.02, x: 4 }}
                    whileTap={{ scale: 0.98 }}
                    className="p-3 bg-zinc-800/50 hover:bg-zinc-700/70 border border-zinc-700 rounded-lg cursor-grab active:cursor-grabbing transition-all group"
                  >
                    <div className="flex items-center gap-3">
                      <div className={`w-9 h-9 rounded-lg flex items-center justify-center text-white flex-shrink-0 ${template.color}`}>
                        <span className="material-symbols-outlined text-[16px]">
                          {template.icon}
                        </span>
                      </div>
                      <div>
                        <p className="text-sm font-bold text-on-surface-variant">
                          {template.label}
                        </p>
                        <p className="text-xs text-secondary-container">
                          Drag to canvas
                        </p>
                      </div>
                    </div>
                  </motion.div>
                ))}
              </div>

              {/* Stats */}
              <div className="p-4 border-t border-zinc-800 bg-zinc-900/50">
                <p className="text-xs font-bold text-secondary-container mb-3">
                  WORKFLOW STATS
                </p>
                <div className="space-y-2 text-[11px]">
                  <div className="flex justify-between">
                    <span className="text-on-surface-variant">Nodes</span>
                    <span className="font-bold text-secondary-container">{nodes.length}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-on-surface-variant">Connections</span>
                    <span className="font-bold text-secondary-container">
                      {connections.length}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-on-surface-variant">Zoom Level</span>
                    <span className="font-bold text-secondary-container">{zoom}%</span>
                  </div>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.aside>

      {/* Bottom Left - Collaborators */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
        className="fixed bottom-8 left-8 flex items-center gap-4 z-30 bg-zinc-900/80 dark:bg-zinc-900/80 backdrop-blur-xl px-6 py-4 rounded-full border border-zinc-700/30"
      >
        <div className="flex -space-x-3">
          <div className="w-8 h-8 rounded-full border-2 border-black bg-zinc-700 overflow-hidden">
            <img
              className="w-full h-full object-cover"
              src="https://lh3.googleusercontent.com/aida-public/AB6AXuApvvedZw0o3YYfpN4cRmq3BmuvO7YZ7ANQ4cPVD8BUotpSMwhYLlt9Czn_UXcY8KdMzp87HFP3eQMbBIujhexB4eUr6JGW80C0jtHr4_2WeuoyDSLImDFDqUnwIkjP3O6C9unvSU0aLCsGiYhRVHyV3ZJyst-pfBMNO56XDeKc8j2ctLbuF9KZQxquzpaKI8pSfH7gPAUskUua6Gg2llie6yC2xULhs3LEcVH7jYADDl2vghsAtqysOYYLwKCaAeDvtIgRAI7GQjI"
              alt="Team member"
            />
          </div>
          <div className="w-8 h-8 rounded-full border-2 border-black bg-zinc-700 overflow-hidden">
            <img
              className="w-full h-full object-cover"
              src="https://lh3.googleusercontent.com/aida-public/AB6AXuCmpMrTdzCgNUEv2SfOyYuzSwHRihX8Q-h4k3U9JWEDV8aIAxDiJVCNaRUbMgeOqV8hNR_jbhHW2JxXrXft0abQy_aJpNy3ffIf1Mdkw_EyoGxh19FzF42bLp4EAvhxw47kZ9KLZkFgxoZyyzf8m_sLIBvpxK0gSWotfFsDkyrIuslwo9MVu3NpymQmt0HVDYQ4dIBFQwAk42RBBXMP7o3NGPIaAkoB32_YhBdBFZLfFF-slRjJicxW8iJ14v27VclzEDc2YFZ8sqk"
              alt="Team member"
            />
          </div>
          <div className="w-8 h-8 rounded-full border-2 border-black bg-secondary-container flex items-center justify-center text-[10px] font-bold text-black">
            +4
          </div>
        </div>
        <div className="h-4 w-[1px] bg-zinc-700" />
        <span className="text-xs text-zinc-400 font-medium">
          Collaborating on <span className="text-white">Summer Gala</span>
        </span>
      </motion.div>

      {/* Bottom Right - Zoom Controls */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
        className="fixed bottom-8 right-8 flex items-center gap-3 z-30"
      >
        <div className="flex items-center gap-1 bg-zinc-900/80 backdrop-blur-xl p-2 rounded-full border border-zinc-700/30">
          <button
            onClick={() => setZoom(Math.max(50, zoom - 10))}
            className="p-2 text-zinc-400 hover:text-white transition-colors"
          >
            <span className="material-symbols-outlined">remove</span>
          </button>
          <span className="text-[10px] font-bold text-zinc-500 px-2 uppercase tracking-tighter w-12 text-center">
            {zoom}%
          </span>
          <button
            onClick={() => setZoom(Math.min(200, zoom + 10))}
            className="p-2 text-zinc-400 hover:text-white transition-colors"
          >
            <span className="material-symbols-outlined">add</span>
          </button>
        </div>

        <motion.button
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          className="px-6 py-3 bg-zinc-800 hover:bg-zinc-700 text-white rounded-full font-bold text-sm transition-all border border-zinc-700/50"
        >
          Save Draft
        </motion.button>
        <motion.button
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          onClick={handleOpenDeployModal}
          className="px-6 py-3 bg-secondary-container text-on-secondary-fixed rounded-full font-bold text-sm hover:opacity-90 transition-all"
        >
          Deploy
        </motion.button>
      </motion.div>

      <AnimatePresence>
        {showDeployModal && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => !isDeploying && setShowDeployModal(false)}
              className="fixed inset-0 z-40 bg-black/50 backdrop-blur-sm"
            />

            <motion.div
              initial={{ opacity: 0, y: 30, scale: 0.96 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 30, scale: 0.96 }}
              className="fixed z-50 left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-[92%] max-w-xl rounded-2xl border border-zinc-700 bg-zinc-950 p-6 text-on-surface"
            >
              <h3 className="text-lg font-black mb-2">{deployMode === 'email' ? 'Deploy Email Automation' : 'Deploy Telegram Automation'}</h3>
              <p className="text-sm text-zinc-400 mb-6">
                {deployMode === 'email'
                  ? 'Add Email and LLM nodes, define purpose, generate draft, and send to recipient.'
                  : 'Add Telegram and LLM nodes, then send a test message directly to Telegram.'}
              </p>

              <div className="grid grid-cols-1 gap-4 mb-5">
                {deployMode === 'email' ? (
                  <>
                    <div className="rounded-xl border border-zinc-700 bg-zinc-900/60 p-3 text-xs text-zinc-300 flex items-center justify-between">
                      <span>Email node</span>
                      <span className={hasMailNode ? 'text-green-400 font-bold' : 'text-red-400 font-bold'}>{hasMailNode ? 'Ready' : 'Missing'}</span>
                    </div>
                    <div className="rounded-xl border border-zinc-700 bg-zinc-900/60 p-3 text-xs text-zinc-300 flex items-center justify-between">
                      <span>Email ↔ LLM connection</span>
                      <span className={hasMailLlmConnection ? 'text-green-400 font-bold' : 'text-red-400 font-bold'}>{hasMailLlmConnection ? 'Ready' : 'Missing'}</span>
                    </div>
                  </>
                ) : (
                  <div className="rounded-xl border border-zinc-700 bg-zinc-900/60 p-3 text-xs text-zinc-300 flex items-center justify-between">
                    <span>Telegram node</span>
                    <span className={hasTelegramNode ? 'text-green-400 font-bold' : 'text-red-400 font-bold'}>{hasTelegramNode ? 'Ready' : 'Missing'}</span>
                  </div>
                )}
                <div className="rounded-xl border border-zinc-700 bg-zinc-900/60 p-3 text-xs text-zinc-300 flex items-center justify-between">
                  <span>LLM node</span>
                  <span className={hasLlmNode ? 'text-green-400 font-bold' : 'text-red-400 font-bold'}>{hasLlmNode ? 'Ready' : 'Missing'}</span>
                </div>
              </div>

              {deployMode === 'email' ? (
                <div className="space-y-4">
                  <div>
                    <label className="block text-xs font-bold uppercase tracking-widest text-zinc-400 mb-2">Recipient Email</label>
                    <input
                      value={emailRecipient}
                      onChange={(event) => setEmailRecipient(event.target.value)}
                      placeholder="user@example.com"
                      className="w-full rounded-xl border border-zinc-700 bg-zinc-900 px-4 py-3 text-sm outline-none focus:border-secondary-container"
                      disabled={isDeploying}
                    />
                    <p className="mt-2 text-[11px] text-zinc-500">Broadcast targets registered users from API. Gmail OAuth popup will request send permission.</p>
                    {resolvedEmailRecipients.length > 0 && (
                      <p className="mt-1 text-[11px] text-zinc-400">Last recipient set size: {resolvedEmailRecipients.length}</p>
                    )}
                  </div>
                  <div>
                    <label className="block text-xs font-bold uppercase tracking-widest text-zinc-400 mb-2">Purpose Of Email</label>
                    <textarea
                      value={emailPurpose}
                      onChange={(event) => setEmailPurpose(event.target.value)}
                      rows={3}
                      placeholder="Example: Invite attendees for the Summer Gala with CTA to confirm by Friday"
                      className="w-full rounded-xl border border-zinc-700 bg-zinc-900 px-4 py-3 text-sm outline-none focus:border-secondary-container resize-none"
                      disabled={isDeploying}
                    />
                    <div className="mt-2 flex items-center gap-2">
                      <button
                        type="button"
                        onClick={handleGenerateEmailDraft}
                        className="px-3 py-1.5 rounded-full text-xs font-bold bg-zinc-800 text-zinc-200 hover:bg-zinc-700 disabled:opacity-50"
                        disabled={isDeploying || isGeneratingEmail}
                      >
                        {isGeneratingEmail ? 'Drafting...' : 'Generate Draft'}
                      </button>
                    </div>
                  </div>
                  <div>
                    <label className="block text-xs font-bold uppercase tracking-widest text-zinc-400 mb-2">Subject</label>
                    <input
                      value={emailSubject}
                      onChange={(event) => setEmailSubject(event.target.value)}
                      placeholder="Email subject"
                      className="w-full rounded-xl border border-zinc-700 bg-zinc-900 px-4 py-3 text-sm outline-none focus:border-secondary-container"
                      disabled={isDeploying}
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold uppercase tracking-widest text-zinc-400 mb-2">Drafted Email Body</label>
                    <textarea
                      value={emailBody}
                      onChange={(event) => setEmailBody(event.target.value)}
                      rows={6}
                      placeholder="Generated email content will appear here"
                      className="w-full rounded-xl border border-zinc-700 bg-zinc-900 px-4 py-3 text-sm outline-none focus:border-secondary-container resize-none"
                      disabled={isDeploying}
                    />
                  </div>
                </div>
              ) : (
                <div className="space-y-4">
                  <div>
                    <label className="block text-xs font-bold uppercase tracking-widest text-zinc-400 mb-2">Telegram Bot Token</label>
                    <input
                      value={telegramBotToken}
                      onChange={(event) => setTelegramBotToken(event.target.value)}
                      placeholder="123456789:ABC..."
                      className="w-full rounded-xl border border-zinc-700 bg-zinc-900 px-4 py-3 text-sm outline-none focus:border-secondary-container"
                      disabled={isDeploying}
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold uppercase tracking-widest text-zinc-400 mb-2">Telegram Chat ID</label>
                    <input
                      value={telegramChatId}
                      onChange={(event) => setTelegramChatId(event.target.value)}
                      placeholder="e.g. 123456789, -100987654321 or one per line"
                      className="w-full rounded-xl border border-zinc-700 bg-zinc-900 px-4 py-3 text-sm outline-none focus:border-secondary-container"
                      disabled={isDeploying}
                    />
                    <p className="mt-2 text-[11px] text-zinc-500">
                      Default user ID {DEFAULT_TELEGRAM_CHAT_ID} is always included during send.
                    </p>
                    <div className="mt-2 flex items-center gap-2">
                      <button
                        type="button"
                        onClick={fetchRecentTelegramChats}
                        className="px-3 py-1.5 rounded-full text-xs font-bold bg-zinc-800 text-zinc-200 hover:bg-zinc-700 disabled:opacity-50"
                        disabled={isDeploying || isFetchingChats}
                      >
                        {isFetchingChats ? 'Fetching...' : 'Fetch Recent Chats'}
                      </button>
                      {recentChatIds.length > 0 && (
                        <span className="text-[11px] text-zinc-400">Found: {recentChatIds.length}</span>
                      )}
                    </div>
                  </div>
                  <div>
                    <label className="block text-xs font-bold uppercase tracking-widest text-zinc-400 mb-2">Text Message</label>
                    <textarea
                      value={telegramMessage}
                      onChange={(event) => setTelegramMessage(event.target.value)}
                      rows={4}
                      placeholder="Type the test message"
                      className="w-full rounded-xl border border-zinc-700 bg-zinc-900 px-4 py-3 text-sm outline-none focus:border-secondary-container resize-none"
                      disabled={isDeploying}
                    />
                  </div>
                </div>
              )}

              <div className="mt-6 flex justify-end gap-3">
                <button
                  onClick={() => setShowDeployModal(false)}
                  className="px-4 py-2 rounded-full text-sm font-bold bg-zinc-800 text-zinc-200"
                  disabled={isDeploying}
                >
                  Cancel
                </button>
                <button
                  onClick={deployMode === 'email' ? handleDeployEmailFlow : handleDeployTelegramFlow}
                  className="px-5 py-2 rounded-full text-sm font-bold bg-secondary-container text-on-secondary-fixed disabled:opacity-50"
                  disabled={isDeploying || (deployMode === 'email' ? !hasMailAndLlm : !hasTelegramAndLlm)}
                >
                  {isDeploying ? (deployMode === 'email' ? 'Sending Email...' : 'Sending...') : 'Deploy & Send'}
                </button>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  )
}
