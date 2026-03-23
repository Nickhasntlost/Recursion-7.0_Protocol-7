import { useState, useRef, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { aiAssistantService } from '../../services/aiAssistant'
import { useNavigate } from 'react-router-dom'
import ReactMarkdown from 'react-markdown'
import remarkGfm from 'remark-gfm'

import { toast } from 'react-toastify';
export default function AIChatBuilder() {
  const [messages, setMessages] = useState([
    { role: 'assistant', content: "Hello! I'm your Utsova AI curator. What kind of event are you looking to organize today?" }
  ])
  const [input, setInput] = useState('')
  const [conversationId, setConversationId] = useState(null)
  const [venueSuggestions, setVenueSuggestions] = useState([])
  const [isLoading, setIsLoading] = useState(false)
  const [conversations, setConversations] = useState([])
  const [isSidebarOpen, setIsSidebarOpen] = useState(false)
  const [extractedData, setExtractedData] = useState(null)
  
  const navigate = useNavigate()
  const messagesEndRef = useRef(null)

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }

  useEffect(() => {
    scrollToBottom()
  }, [messages])

  // Load conversations on mount
  useEffect(() => {
    loadConversations()
    // Optional: Load last active conversation from local storage
    const existingConvId = localStorage.getItem('current_conversation_id')
    if (existingConvId) {
      loadConversationHistory(existingConvId)
    }
  }, [])

  const loadConversations = async () => {
    try {
      const data = await aiAssistantService.getConversations()
      setConversations(data || [])
    } catch (error) {
      console.error('Failed to load conversations:', error)
    }
  }

  const loadConversationHistory = async (convId) => {
    try {
      setIsLoading(true)
      const data = await aiAssistantService.getConversationHistory(convId)
      
      setConversationId(convId)
      setMessages(data.messages?.map(msg => ({
        role: msg.role,
        content: msg.content
      })) || [])
      
      if (data.extracted_data) {
        setExtractedData(data.extracted_data)
      }
      setVenueSuggestions([]) // Reset venue suggestions or load from somewhere if API provides
      localStorage.setItem('current_conversation_id', convId)
      setIsSidebarOpen(false)
    } catch (error) {
      console.error('Failed to load history:', error)
      startNewConversation()
    } finally {
      setIsLoading(false)
    }
  }

  const startNewConversation = () => {
    setMessages([
      { role: 'assistant', content: "Hello! I'm your Utsova AI curator. What kind of event are you looking to organize today?" }
    ])
    setConversationId(null)
    setVenueSuggestions([])
    setExtractedData(null)
    localStorage.removeItem('current_conversation_id')
    setIsSidebarOpen(false)
  }

  const sendMessage = async () => {
    if (!input.trim() || isLoading) return

    const userMessage = input.trim()
    setInput('')
    setMessages(prev => [...prev, { role: 'user', content: userMessage }])
    setIsLoading(true)

    try {
      const response = await aiAssistantService.chat(userMessage, conversationId)

      if (!conversationId && response.conversation_id) {
        setConversationId(response.conversation_id)
        localStorage.setItem('current_conversation_id', response.conversation_id)
        loadConversations() // Refresh sidebar list
      }

      setMessages(prev => [...prev, {
        role: 'assistant',
        content: response.assistant_message
      }])

      if (response.venue_suggestions?.length > 0) {
        setVenueSuggestions(response.venue_suggestions)
      }
      if (response.extracted_data) {
        setExtractedData(response.extracted_data)
      }
    } catch (error) {
      console.error('Chat error:', error)
      setMessages(prev => [...prev, {
        role: 'assistant',
        content: 'I encountered an error. Please try again.',
        isError: true
      }])
    } finally {
      setIsLoading(false)
    }
  }

  const handleCreateEvent = async (venueId) => {
    try {
      setIsLoading(true)
      const response = await aiAssistantService.createEvent(conversationId, venueId)
      
      if (response.next_action === 'payment') {
        navigate(`/payment/${response.event_id}`) // or checkout route
      } else {
        navigate(`/dashboard/events`)
      }
    } catch (error) {
      console.error('Event creation failed:', error)
      toast.error(error.message || 'Failed to create event')
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="flex h-[700px] bg-surface-container-lowest rounded-3xl border border-outline-variant/20 overflow-hidden relative">
      
      {/* Sidebar / History Panel */}
      <AnimatePresence>
        {isSidebarOpen && (
          <>
            {/* Overlay for mobile */}
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsSidebarOpen(false)}
              className="absolute inset-0 bg-black/20 z-20 md:hidden"
            />
            
            <motion.div 
              initial={{ x: '-100%' }}
              animate={{ x: 0 }}
              exit={{ x: '-100%' }}
              transition={{ type: 'spring', damping: 25, stiffness: 200 }}
              className="absolute md:relative z-30 w-72 h-full bg-surface-container-low border-r border-outline-variant/20 flex flex-col"
            >
              <div className="p-4 border-b border-outline-variant/20 flex items-center justify-between">
                <h3 className="font-bold text-on-surface">Chat History</h3>
                <button onClick={() => setIsSidebarOpen(false)} className="md:hidden text-on-surface-variant">
                  <span className="material-symbols-outlined text-[20px]">close</span>
                </button>
              </div>
              
              <div className="p-4 overflow-y-auto flex-1 space-y-2 no-scrollbar">
                <button 
                  onClick={startNewConversation}
                  className="w-full text-left p-3 rounded-2xl bg-primary/10 text-primary font-medium hover:bg-primary/20 transition-colors flex items-center gap-2"
                >
                  <span className="material-symbols-outlined text-[18px]">add</span>
                  New Conversation
                </button>
                
                {conversations.map(conv => (
                  <button
                    key={conv.id}
                    onClick={() => loadConversationHistory(conv.id)}
                    className={`w-full text-left p-3 rounded-2xl transition-colors text-sm ${
                      conversationId === conv.id 
                        ? 'bg-secondary-container text-on-secondary-container font-semibold' 
                        : 'hover:bg-surface-container-highest text-on-surface-variant'
                    }`}
                  >
                    <div className="flex items-center gap-2 mb-1">
                      <span className="material-symbols-outlined text-[16px]">chat_bubble</span>
                      <span className="truncate">{conv.extracted_data?.title || 'Event Planning'}</span>
                    </div>
                    <div className="text-xs opacity-70 ml-6">
                      {new Date(conv.created_at).toLocaleDateString()}
                    </div>
                  </button>
                ))}
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>

      {/* Main Chat Area */}
      <div className="flex-1 flex flex-col min-w-0 relative">
        <div className="p-6 border-b border-outline-variant/20 bg-surface-container-lowest/70 backdrop-blur-xl sticky top-0 z-10 flex items-center gap-4">
          <button 
            onClick={() => setIsSidebarOpen(!isSidebarOpen)}
            className="p-2 rounded-full hover:bg-surface-container-high transition-colors text-on-surface-variant flex items-center justify-center"
          >
            <span className="material-symbols-outlined">{isSidebarOpen ? 'menu_open' : 'menu'}</span>
          </button>
          <div>
            <h2 className="text-xl font-black font-[family-name:var(--font-family-headline)]">AI Assistant</h2>
            <p className="text-sm text-on-surface-variant mt-1">
              {extractedData?.title ? `Planning: ${extractedData.title}` : "Let's craft your event experience"}
            </p>
          </div>
        </div>

        <div className="flex-1 overflow-y-auto p-6 space-y-6 no-scrollbar">
          {messages.map((msg, idx) => (
            <motion.div
              key={idx}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
            >
              <div
                className={`max-w-[80%] p-5 rounded-3xl text-sm font-medium leading-relaxed ${
                  msg.role === 'user'
                    ? 'bg-primary text-on-primary rounded-br-sm'
                    : msg.isError
                    ? 'bg-error-container text-on-error-container rounded-bl-sm'
                    : 'bg-surface-container-low text-on-surface rounded-bl-sm prose prose-sm dark:prose-invert max-w-none'
                }`}
              >
                {msg.role === 'assistant' ? (
                  <ReactMarkdown remarkPlugins={[remarkGfm]}>
                    {msg.content}
                  </ReactMarkdown>
                ) : (
                  msg.content
                )}
              </div>
            </motion.div>
          ))}

          {isLoading && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="flex justify-start"
            >
              <div className="bg-surface-container-low text-on-surface-variant p-5 rounded-3xl rounded-bl-sm flex gap-2">
                <span className="w-2 h-2 bg-on-surface-variant rounded-full animate-bounce"></span>
                <span className="w-2 h-2 bg-on-surface-variant rounded-full animate-bounce delay-75"></span>
                <span className="w-2 h-2 bg-on-surface-variant rounded-full animate-bounce delay-150"></span>
              </div>
            </motion.div>
          )}

          {venueSuggestions.length > 0 && (
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="mt-6 border-t border-outline-variant/20 pt-6"
            >
              <h3 className="text-sm font-bold uppercase tracking-widest text-on-surface-variant mb-4">
                Suggested Venues
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {venueSuggestions.map(venue => (
                  <div key={venue.id} className="bg-surface p-4 rounded-3xl border border-outline-variant/20 flex flex-col">
                    {venue.images && venue.images[0] && (
                      <img src={venue.images[0]} alt={venue.name} className="w-full h-32 object-cover rounded-2xl mb-4" />
                    )}
                    <h4 className="font-bold mb-1">{venue.name}</h4>
                    <p className="text-xs text-on-surface-variant mb-4 flex-1">
                      {venue.city} • Capacity: {venue.capacity}
                    </p>
                    <button 
                      onClick={() => handleCreateEvent(venue.id)}
                      className="w-full py-3 rounded-full bg-secondary-container text-on-secondary-fixed font-bold text-sm hover:brightness-110 transition-all"
                    >
                      Select & Create Event
                    </button>
                  </div>
                ))}
              </div>
            </motion.div>
          )}
          <div ref={messagesEndRef} />
        </div>

        <div className="p-4 bg-surface-container-lowest border-t border-outline-variant/20">
          <div className="relative flex items-center">
            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && sendMessage()}
              placeholder="E.g., I want to organize a tech conference in NY..."
              className="w-full pl-6 pr-14 py-4 rounded-full bg-surface-container-low border border-transparent focus:border-secondary-container/50 outline-none transition-all font-medium text-sm"
            />
            <button
              onClick={sendMessage}
              disabled={!input.trim() || isLoading}
              className="absolute right-2 p-2 rounded-full bg-primary text-on-primary hover:scale-105 disabled:opacity-50 disabled:hover:scale-100 transition-all flex items-center justify-center"
            >
              <span className="material-symbols-outlined text-[20px]">arrow_upward</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
