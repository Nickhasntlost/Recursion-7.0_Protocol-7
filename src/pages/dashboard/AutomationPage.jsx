import { useState, useRef } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { toast } from 'react-toastify'
import { createCampaign, generateEmail, sendCampaign } from '../../services/automation'


const nodeTemplates = [
  { id: 'storage', label: 'Database', icon: 'storage', color: 'bg-secondary-container', textColor: 'text-[#1A1D00]', description: 'Extract target recipients' },
  { id: 'auto_awesome', label: 'LLM (AI)', icon: 'auto_awesome', color: 'bg-secondary-container', textColor: 'text-[#1A1D00]', description: 'Generate email with AI' },
  { id: 'mail', label: 'Email', icon: 'mail', color: 'bg-secondary-container', textColor: 'text-[#1A1D00]', description: 'Deploy email campaign' },
]

export default function AutomationPage() {
  const canvasRef = useRef(null)
  const [nodes, setNodes] = useState([])
  const [connections, setConnections] = useState([])
  const [draggedTemplate, setDraggedTemplate] = useState(null)
  const [connectingFrom, setConnectingFrom] = useState(null)
  const [tempLine, setTempLine] = useState(null)
  const [zoom, setZoom] = useState(100)


  const [activeEditNode, setActiveEditNode] = useState(null)

  // Database node state
  const [audienceType, setAudienceType] = useState('users')
  const [emailContext, setEmailContext] = useState('')
  const [recipientCount, setRecipientCount] = useState(0)

  // LLM node state
  const [emailSubject, setEmailSubject] = useState('')
  const [generatedHtml, setGeneratedHtml] = useState('')


  const [recipientPreview, setRecipientPreview] = useState([])
  const [isGenerating, setIsGenerating] = useState(false)
  const [showPreview, setShowPreview] = useState(false)

  // Email node state
  const [isDeploying, setIsDeploying] = useState(false)
  const [deploymentLogs, setDeploymentLogs] = useState([])
  const [showLogs, setShowLogs] = useState(false)
  const [flowingAnimation, setFlowingAnimation] = useState(false)
  const [campaignName, setCampaignName] = useState('')
  const [campaignId, setCampaignId] = useState(null)


  const hasDatabase = nodes.some((node) => node.type === 'storage')
  const hasLLM = nodes.some((node) => node.type === 'auto_awesome')
  const hasEmail = nodes.some((node) => node.type === 'mail')
  const allNodesConfigured = nodes.every(node => node.data?.configured)
  const canDeploy = hasDatabase && hasLLM && hasEmail && allNodesConfigured

  // Handle Database configuration
  const handleDatabaseConfig = async () => {
    if (!emailContext.trim()) {
      toast.error('Please enter email context')
      return
    }

    try {
      const name = `Email Campaign ${new Date().toLocaleDateString()}`

      const response = await createCampaign(
        name,
        audienceType,
        emailContext,
        null // event_id
      )

      setCampaignId(response.id)
      setCampaignName(response.campaign_name)
      setRecipientCount(response.total_recipients)

      // Store initial logs
      if (response.logs && response.logs.length > 0) {
        setDeploymentLogs(response.logs.map(log => ({
          time: Date.now(),
          message: log,
          status: 'info'
        })))
      }

      // Update node as configured
      setNodes(prev => prev.map(n =>
        n.type === 'storage' ? {
          ...n,
          data: {
            configured: true,
            audienceType,
            recipientCount: response.total_recipients
          }
        } : n
      ))

      // Auto-connect to LLM node
      const llmNode = nodes.find(n => n.type === 'auto_awesome')
      const dbNode = nodes.find(n => n.type === 'storage')
      if (llmNode && dbNode) {
        setConnections(prev => [...prev, { from: dbNode.id, to: llmNode.id }])
      }

      setActiveEditNode(null)
      toast.success(`Campaign created with ${response.total_recipients} recipients`)
    } catch (error) {
      console.error('Campaign creation error:', error)
      toast.error(error.response?.data?.detail || 'Failed to create campaign')
    }
  }

  // Handle LLM email generation
  const handleGenerateEmail = async () => {
    if (!emailSubject.trim()) {
      toast.error('Please enter an email subject')
      return
    }

    if (!campaignId) {
      toast.error('Please configure database first')
      return
    }

    setIsGenerating(true)
    try {
      const response = await generateEmail(campaignId, emailSubject)

      if (response.success) {
        setGeneratedHtml(response.generated_email_html)
        setRecipientPreview(response.recipient_preview || [])
        setShowPreview(true)

        // Update node as configured
        setNodes(prev => prev.map(n =>
          n.type === 'auto_awesome' ? {
            ...n,
            data: {
              configured: true,
              emailSubject: response.email_subject,
              generatedHtml: response.generated_email_html
            }
          } : n
        ))

        toast.success(response.message || 'Email generated successfully!')
      }
    } catch (error) {
      console.error('Email generation error:', error)
      toast.error(error.response?.data?.detail || 'Failed to generate email')
    } finally {
      setIsGenerating(false)
    }
  }

  // Handle accepting generated email
  const handleAcceptEmail = () => {
    setShowPreview(false)
    setActiveEditNode(null)

    // Auto-connect to Email node
    const llmNode = nodes.find(n => n.type === 'auto_awesome')
    const emailNode = nodes.find(n => n.type === 'mail')
    if (llmNode && emailNode) {
      setConnections(prev => [...prev, { from: llmNode.id, to: emailNode.id }])
    }

    // Mark email node as ready
    setNodes(prev => prev.map(n =>
      n.type === 'mail' ? { ...n, data: { configured: true } } : n
    ))

    toast.success('Email ready for deployment!')
  }

  // Handle campaign deployment
  const handleDeployCampaign = async () => {
    if (!canDeploy) {
      toast.error('Please configure all nodes before deploying')
      return
    }

    if (!campaignId) {
      toast.error('No campaign ID found')
      return
    }

    setIsDeploying(true)
    setFlowingAnimation(true)
    setDeploymentLogs([])

    try {
      const response = await sendCampaign(campaignId)

      if (response.success) {
        // Parse logs and add them progressively
        const logs = response.logs || []

        logs.forEach((logMessage, idx) => {
          setTimeout(() => {
            setDeploymentLogs(prev => [...prev, {
              time: Date.now(),
              message: logMessage,
              status: logMessage.includes('[ERROR]') ? 'error' :
                      logMessage.includes('[OK]') || logMessage.includes('sent') ? 'success' :
                      'info'
            }])
          }, idx * 100)
        })

        // Final completion
        setTimeout(() => {
          setIsDeploying(false)
          setFlowingAnimation(false)
          toast.success(response.message || `Campaign sent! ${response.emails_sent} emails sent, ${response.emails_failed} failed.`)
        }, logs.length * 100 + 500)
      }
    } catch (error) {
      console.error('Deployment error:', error)
      setIsDeploying(false)
      setFlowingAnimation(false)
      toast.error(error.response?.data?.detail || 'Failed to send campaign')
    }
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
                strokeWidth="3"
                fill="none"
                markerEnd={`url(#arrowhead-${idx})`}
                strokeLinecap="round"
                className="drop-shadow-lg"
              />
              {/* Flowing animation during deployment */}
              {flowingAnimation && (
                <>
                  <motion.circle
                    r="5"
                    fill="#DFEB72"
                    initial={{ offsetDistance: "0%" }}
                    animate={{ offsetDistance: "100%" }}
                    transition={{
                      duration: 2,
                      repeat: Infinity,
                      ease: "linear",
                      delay: idx * 0.2
                    }}
                  >
                    <animateMotion
                      dur="2s"
                      repeatCount="indefinite"
                      path={`M ${x1} ${y1} C ${x1} ${midY}, ${x2} ${midY}, ${x2} ${y2}`}
                    />
                  </motion.circle>
                  <motion.circle
                    r="3"
                    fill="#DFEB72"
                    opacity="0.6"
                    initial={{ offsetDistance: "0%" }}
                    animate={{ offsetDistance: "100%" }}
                    transition={{
                      duration: 2,
                      repeat: Infinity,
                      ease: "linear",
                      delay: idx * 0.2 + 0.5
                    }}
                  >
                    <animateMotion
                      dur="2s"
                      repeatCount="indefinite"
                      path={`M ${x1} ${y1} C ${x1} ${midY}, ${x2} ${midY}, ${x2} ${y2}`}
                    />
                  </motion.circle>
                </>
              )}
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
                      setActiveEditNode(node)
                    }}
                    className="opacity-0 group-hover:opacity-100 text-on-surface-variant hover:text-secondary-container transition-all"
                  >
                    <span className="material-symbols-outlined text-[20px]">more_vert</span>
                  </motion.button>
                </div>

                {/* Divider */}
                <div className="h-[2px] w-full bg-outline-variant/30 rounded-full mb-3" />

                {/* Node Body Details */}
                <div className="text-[11px] text-on-surface-variant flex flex-col gap-1 w-full justify-center">
                  {node.type === 'storage' ? (
                    node.data?.configured ? (
                      <div className="space-y-1">
                        <span className="flex items-center gap-1 font-bold text-secondary-container">
                          <span className="material-symbols-outlined text-[14px]">group</span>
                          {node.data.recipientCount} recipients
                        </span>
                        <span className="text-zinc-500 text-[10px]">Target: {node.data.audienceType}</span>
                      </div>
                    ) : (
                      <span className="opacity-50 italic">Click to configure database</span>
                    )
                  ) : node.type === 'auto_awesome' ? (
                    node.data?.configured ? (
                      <div className="space-y-1">
                        <span className="flex items-center gap-1 font-bold text-secondary-container">
                          <span className="material-symbols-outlined text-[14px]">auto_awesome</span>
                          Email generated
                        </span>
                        <span className="text-zinc-500 text-[10px] truncate w-56 block">"{node.data.emailSubject}"</span>
                      </div>
                    ) : (
                      <span className="opacity-50 italic">Click to generate email</span>
                    )
                  ) : node.type === 'mail' ? (
                    <div className="flex items-center justify-between w-full">
                      <span className="flex items-center gap-1">
                        <span className="material-symbols-outlined text-[14px] text-secondary-container">
                          {isDeploying ? 'sync' : 'mail'}
                        </span>
                        <span className="text-secondary-container font-bold">
                          {node.data?.configured ? (isDeploying ? 'Sending...' : 'Ready to deploy') : 'Awaiting config'}
                        </span>
                      </span>
                      {deploymentLogs.length > 0 && (
                        <button
                          onClick={(e) => {
                            e.stopPropagation()
                            setShowLogs(true)
                          }}
                          className="text-secondary-container font-bold text-[10px] hover:underline"
                        >
                          Logs ({deploymentLogs.length})
                        </button>
                      )}
                    </div>
                  ) : (
                    <span className="opacity-50 italic">Component ready</span>
                  )}
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
                Build Your Email Campaign
              </h2>
              <p className="text-zinc-500 max-w-md">
                Drag Database → LLM → Email components to create your automation workflow
              </p>
            </div>
          </motion.div>
        )}
      </div>

      {/* Right Sidebar - Email Automation Components */}
      <motion.aside
        initial={{ x: 100, opacity: 0 }}
        animate={{ x: 0, opacity: 1 }}
        transition={{ delay: 0.2 }}
        className="fixed right-6 top-32 z-30 w-80 bg-gradient-to-b from-zinc-900/95 to-black/95 backdrop-blur-xl border border-zinc-700 rounded-3xl shadow-2xl overflow-hidden"
      >
        {/* Header */}
        <div className="p-6 border-b border-zinc-700">
          <h3 className="text-xs font-black uppercase tracking-[0.2em] text-secondary-container mb-1">
            Email Automation
          </h3>
          <p className="text-xs text-zinc-400">Drag components to canvas</p>
        </div>

        {/* Components */}
        <div className="p-5 space-y-3">
          {nodeTemplates.map((template) => (
            <motion.div
              key={template.id}
              draggable
              onDragStart={() => handleDragStart(template)}
              whileHover={{ scale: 1.03, x: 4 }}
              whileTap={{ scale: 0.97 }}
              className="p-4 bg-zinc-800/60 hover:bg-zinc-800 border-2 border-zinc-700 hover:border-secondary-container/50 rounded-2xl cursor-grab active:cursor-grabbing transition-all group"
            >
              <div className="flex items-center gap-4">
                <div className={`w-12 h-12 rounded-xl flex items-center justify-center flex-shrink-0 ${template.color}`}>
                  <span className={`material-symbols-outlined text-[22px] ${template.textColor}`}>
                    {template.icon}
                  </span>
                </div>
                <div className="flex-1">
                  <p className="text-sm font-bold text-zinc-100 mb-1">
                    {template.label}
                  </p>
                  <p className="text-xs text-zinc-400">
                    {template.description}
                  </p>
                </div>
                <span className="material-symbols-outlined text-zinc-600 group-hover:text-secondary-container transition-colors">
                  drag_indicator
                </span>
              </div>
            </motion.div>
          ))}
        </div>

        {/* Stats */}
        <div className="p-5 border-t border-zinc-700 bg-zinc-900/60">
          <p className="text-xs font-bold text-secondary-container mb-4 uppercase tracking-widest">
            Workflow Stats
          </p>
          <div className="space-y-3 text-xs">
            <div className="flex justify-between items-center">
              <span className="text-zinc-400">Nodes Deployed</span>
              <span className="font-black text-lg text-secondary-container">{nodes.length}/3</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-zinc-400">Connections</span>
              <span className="font-black text-lg text-secondary-container">{connections.length}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-zinc-400">Status</span>
              <span className={`font-bold text-xs px-3 py-1 rounded-full ${
                canDeploy ? 'bg-secondary-container/20 text-secondary-container' : 'bg-zinc-800 text-zinc-400'
              }`}>
                {canDeploy ? 'Ready' : 'Setup Required'}
              </span>
            </div>
          </div>
        </div>
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
          onClick={handleDeployCampaign}
          disabled={!canDeploy || isDeploying}
          className="px-6 py-3 bg-secondary-container text-on-secondary-fixed rounded-full font-bold text-sm hover:opacity-90 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
        >
          {isDeploying ? (
            <>
              <motion.span
                animate={{ rotate: 360 }}
                transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                className="material-symbols-outlined text-[18px]"
              >
                sync
              </motion.span>
              Deploying...
            </>
          ) : (
            <>
              <span className="material-symbols-outlined text-[18px]">rocket_launch</span>
              Deploy
            </>
          )}
        </motion.button>
      </motion.div>

      {/* Node Configuration Modals */}
      <AnimatePresence>
        {activeEditNode && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setActiveEditNode(null)}
              className="fixed inset-0 z-40 bg-black/60 backdrop-blur-sm"
            />

            <motion.div
              initial={{ opacity: 0, y: 30, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 30, scale: 0.95 }}
              onClick={(e) => e.stopPropagation()}
              className="fixed z-50 left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-[92%] max-w-2xl rounded-3xl border border-zinc-700 bg-zinc-950 overflow-hidden max-h-[85vh] overflow-y-auto"
            >
              {/* Database Configuration */}
              {activeEditNode.type === 'storage' && (
                <div className="p-8">
                  <div className="flex items-center gap-4 mb-6">
                    <div className="w-14 h-14 rounded-full bg-secondary-container flex items-center justify-center">
                      <span className="material-symbols-outlined text-2xl text-on-secondary-fixed">storage</span>
                    </div>
                    <div>
                      <h3 className="text-2xl font-black font-[family-name:var(--font-family-headline)]">Configure Database</h3>
                      <p className="text-sm text-zinc-400">Select your target audience</p>
                    </div>
                  </div>

                  <div className="space-y-6">
                    <div>
                      <label className="block text-sm font-bold mb-3 text-zinc-300">Target Audience</label>
                      <div className="grid grid-cols-3 gap-3">
                        {[
                          { value: 'users', label: 'Users', desc: 'All registered users' },
                          { value: 'volunteers', label: 'Volunteers', desc: 'All volunteers' },
                          { value: 'both', label: 'Both', desc: 'Users & Volunteers' }
                        ].map((type) => (
                          <button
                            key={type.value}
                            onClick={() => setAudienceType(type.value)}
                            className={`p-4 rounded-2xl border-2 transition-all text-center ${
                              audienceType === type.value
                                ? 'border-secondary-container bg-secondary-container/20'
                                : 'border-zinc-700 hover:border-secondary-container/50'
                            }`}
                          >
                            <p className="font-bold text-sm text-zinc-200">{type.label}</p>
                            <p className="text-xs text-zinc-500 mt-1">{type.desc}</p>
                          </button>
                        ))}
                      </div>
                    </div>

                    <div>
                      <label className="block text-sm font-bold mb-3 text-zinc-300">Email Context</label>
                      <textarea
                        value={emailContext}
                        onChange={(e) => setEmailContext(e.target.value)}
                        placeholder="e.g., Send update about our new exciting events happening next month. Include information about special discounts for early bookings."
                        className="w-full p-4 rounded-2xl bg-zinc-900 border-2 border-zinc-700 focus:border-secondary-container outline-none font-medium text-zinc-100 transition-all resize-none"
                        rows="4"
                      />
                      <p className="text-xs text-zinc-500 mt-2">Describe what this email campaign is about</p>
                    </div>

                    <div className="flex items-center justify-between p-5 rounded-2xl bg-zinc-900/60 border border-zinc-700">
                      <span className="text-sm font-bold text-zinc-300">Recipients</span>
                      <span className="text-3xl font-black text-secondary-container">
                        {recipientCount > 0 ? recipientCount.toLocaleString() : '---'}
                      </span>
                    </div>

                    <button
                      onClick={handleDatabaseConfig}
                      disabled={!emailContext.trim()}
                      className="w-full p-4 rounded-2xl bg-secondary-container text-on-secondary-fixed font-bold hover:scale-[1.02] active:scale-[0.98] transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      Create Campaign
                    </button>
                  </div>
                </div>
              )}

              {/* LLM Configuration */}
              {activeEditNode.type === 'auto_awesome' && !showPreview && (
                <div className="p-8">
                  <div className="flex items-center gap-4 mb-6">
                    <div className="w-14 h-14 rounded-full bg-secondary-container flex items-center justify-center">
                      <span className="material-symbols-outlined text-2xl text-on-secondary-fixed">auto_awesome</span>
                    </div>
                    <div>
                      <h3 className="text-2xl font-black font-[family-name:var(--font-family-headline)]">AI Email Generator</h3>
                      <p className="text-sm text-zinc-400">Powered by Groq LLM</p>
                    </div>
                  </div>

                  <div className="space-y-6">
                    <div>
                      <label className="block text-sm font-bold mb-3 text-zinc-300">Email Subject</label>
                      <input
                        type="text"
                        value={emailSubject}
                        onChange={(e) => setEmailSubject(e.target.value)}
                        placeholder="e.g., Exclusive Summer Festival - Early Bird Discount!"
                        className="w-full p-4 rounded-2xl bg-zinc-900 border-2 border-zinc-700 focus:border-secondary-container outline-none font-medium text-zinc-100 transition-all"
                      />
                    </div>

                    <button
                      onClick={handleGenerateEmail}
                      disabled={isGenerating || !emailSubject.trim()}
                      className="w-full p-4 rounded-2xl bg-secondary-container text-on-secondary-fixed font-bold hover:scale-[1.02] active:scale-[0.98] transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-3"
                    >
                      {isGenerating ? (
                        <>
                          <motion.span
                            animate={{ rotate: 360 }}
                            transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                            className="material-symbols-outlined"
                          >
                            sync
                          </motion.span>
                          Generating with AI...
                        </>
                      ) : (
                        <>
                          <span className="material-symbols-outlined">auto_awesome</span>
                          Generate Email
                        </>
                      )}
                    </button>
                  </div>
                </div>
              )}

              {/* Email Preview */}
              {activeEditNode.type === 'auto_awesome' && showPreview && (
                <div className="p-8">
                  <div className="flex items-center gap-4 mb-6">
                    <div className="w-14 h-14 rounded-full bg-secondary-container flex items-center justify-center">
                      <span className="material-symbols-outlined text-2xl text-on-secondary-fixed">preview</span>
                    </div>
                    <div>
                      <h3 className="text-2xl font-black font-[family-name:var(--font-family-headline)]">Email Preview</h3>
                      <p className="text-sm text-zinc-400">Review AI-generated content</p>
                    </div>
                  </div>

                  <div className="space-y-5">
                    <div className="p-5 rounded-2xl bg-zinc-900/60 border border-zinc-700">
                      <p className="text-xs font-bold text-zinc-400 mb-2">SUBJECT LINE</p>
                      <p className="font-bold text-lg text-zinc-100">{emailSubject}</p>
                    </div>

                    {recipientPreview && recipientPreview.length > 0 && (
                      <div className="p-5 rounded-2xl bg-zinc-900/60 border border-zinc-700">
                        <p className="text-xs font-bold text-zinc-400 mb-3">WILL BE SENT TO {recipientCount} RECIPIENTS</p>
                        <div className="flex flex-wrap gap-2">
                          {recipientPreview.slice(0, 5).map((email, idx) => (
                            <span key={idx} className="text-xs bg-zinc-800 px-3 py-1 rounded-full text-zinc-300">
                              {email}
                            </span>
                          ))}
                          {recipientPreview.length > 5 && (
                            <span className="text-xs bg-secondary-container/20 px-3 py-1 rounded-full text-secondary-container font-bold">
                              +{recipientPreview.length - 5} more
                            </span>
                          )}
                        </div>
                      </div>
                    )}

                    <div className="border-2 border-zinc-700 rounded-2xl overflow-hidden">
                      <div className="bg-zinc-900 p-3 border-b border-zinc-700 flex items-center justify-between">
                        <p className="text-xs font-bold text-zinc-400">EMAIL PREVIEW (HTML)</p>
                        <span className="text-xs text-secondary-container font-bold">Generated by AI</span>
                      </div>
                      <div className="p-8 bg-white max-h-96 overflow-y-auto">
                        <div dangerouslySetInnerHTML={{ __html: generatedHtml }} />
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <button
                        onClick={() => {
                          setShowPreview(false)
                          setGeneratedHtml('')
                          setEmailSubject('')
                          setRecipientPreview([])
                        }}
                        className="p-4 rounded-2xl bg-zinc-800 hover:bg-zinc-700 font-bold text-zinc-200 transition-all"
                      >
                        Regenerate
                      </button>
                      <button
                        onClick={handleAcceptEmail}
                        className="p-4 rounded-2xl bg-secondary-container text-on-secondary-fixed font-bold hover:scale-[1.02] active:scale-[0.98] transition-all"
                      >
                        Accept & Continue
                      </button>
                    </div>
                  </div>
                </div>
              )}

              {/* Email Node Info */}
              {activeEditNode.type === 'mail' && (
                <div className="p-8">
                  <div className="flex items-center gap-4 mb-6">
                    <div className="w-14 h-14 rounded-full bg-secondary-container flex items-center justify-center">
                      <span className="material-symbols-outlined text-2xl text-on-secondary-fixed">mail</span>
                    </div>
                    <div>
                      <h3 className="text-2xl font-black font-[family-name:var(--font-family-headline)]">Email Deployment</h3>
                      <p className="text-sm text-zinc-400">
                        {canDeploy ? 'Campaign ready to send' : 'Complete setup first'}
                      </p>
                    </div>
                  </div>

                  <div className="space-y-5">
                    {/* Setup Progress Checklist */}
                    <div className="p-5 rounded-2xl bg-zinc-900/60 border border-zinc-700">
                      <p className="text-xs font-bold text-zinc-400 mb-3">SETUP PROGRESS</p>
                      <div className="space-y-2">
                        <div className="flex items-center gap-3">
                          <div className={`w-5 h-5 rounded-full flex items-center justify-center ${
                            nodes.find(n => n.type === 'storage')?.data?.configured
                              ? 'bg-secondary-container'
                              : 'bg-zinc-700'
                          }`}>
                            {nodes.find(n => n.type === 'storage')?.data?.configured && (
                              <span className="material-symbols-outlined text-[14px] text-on-secondary-fixed">check</span>
                            )}
                          </div>
                          <span className={`text-sm ${
                            nodes.find(n => n.type === 'storage')?.data?.configured
                              ? 'text-zinc-200 font-bold'
                              : 'text-zinc-500'
                          }`}>
                            Database configured ({recipientCount} recipients)
                          </span>
                        </div>
                        <div className="flex items-center gap-3">
                          <div className={`w-5 h-5 rounded-full flex items-center justify-center ${
                            nodes.find(n => n.type === 'auto_awesome')?.data?.configured
                              ? 'bg-secondary-container'
                              : 'bg-zinc-700'
                          }`}>
                            {nodes.find(n => n.type === 'auto_awesome')?.data?.configured && (
                              <span className="material-symbols-outlined text-[14px] text-on-secondary-fixed">check</span>
                            )}
                          </div>
                          <span className={`text-sm ${
                            nodes.find(n => n.type === 'auto_awesome')?.data?.configured
                              ? 'text-zinc-200 font-bold'
                              : 'text-zinc-500'
                          }`}>
                            {nodes.find(n => n.type === 'auto_awesome')?.data?.configured
                              ? `Email generated: "${emailSubject}"`
                              : 'Email generation pending - Click LLM node'}
                          </span>
                        </div>
                        <div className="flex items-center gap-3">
                          <div className={`w-5 h-5 rounded-full flex items-center justify-center ${
                            canDeploy ? 'bg-secondary-container' : 'bg-zinc-700'
                          }`}>
                            {canDeploy && (
                              <span className="material-symbols-outlined text-[14px] text-on-secondary-fixed">check</span>
                            )}
                          </div>
                          <span className={`text-sm ${
                            canDeploy ? 'text-zinc-200 font-bold' : 'text-zinc-500'
                          }`}>
                            Ready to deploy
                          </span>
                        </div>
                      </div>
                    </div>

                    {campaignName && (
                      <div className="p-5 rounded-2xl bg-zinc-900/60 border border-zinc-700">
                        <p className="text-xs font-bold text-zinc-400 mb-2">CAMPAIGN NAME</p>
                        <p className="font-bold text-zinc-100">{campaignName}</p>
                      </div>
                    )}

                    <div className="p-5 rounded-2xl bg-zinc-900/60 border border-zinc-700 space-y-3">
                      <div className="flex items-center justify-between">
                        <span className="text-sm font-bold text-zinc-300">Total Recipients</span>
                        <span className="text-2xl font-black text-secondary-container">{recipientCount.toLocaleString()}</span>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-sm font-bold text-zinc-300">Target Audience</span>
                        <span className="text-sm font-bold text-zinc-300 capitalize">{audienceType}</span>
                      </div>
                      {emailSubject && (
                        <div className="flex items-center justify-between">
                          <span className="text-sm font-bold text-zinc-300">Email Subject</span>
                          <span className="text-sm font-bold text-zinc-300 truncate max-w-[200px]">{emailSubject}</span>
                        </div>
                      )}
                      <div className="flex items-center justify-between pt-3 border-t border-zinc-700">
                        <span className="text-sm font-bold text-zinc-300">Status</span>
                        <span className={`text-sm font-bold px-3 py-1 rounded-full ${
                          canDeploy ? 'bg-secondary-container/20 text-secondary-container' : 'bg-red-500/20 text-red-400'
                        }`}>
                          {canDeploy ? 'Ready to Deploy' : 'Setup Incomplete'}
                        </span>
                      </div>
                    </div>

                    {canDeploy && (
                      <div className="p-4 rounded-2xl bg-secondary-container/10 border border-secondary-container/30">
                        <p className="text-sm text-zinc-300 flex items-start gap-2">
                          <span className="material-symbols-outlined text-secondary-container text-[18px] mt-0.5">info</span>
                          <span>Click the <strong className="text-secondary-container">"Deploy"</strong> button at the bottom right to send your campaign to all recipients.</span>
                        </p>
                      </div>
                    )}

                    {deploymentLogs.length > 0 && (
                      <button
                        onClick={() => {
                          setActiveEditNode(null)
                          setShowLogs(true)
                        }}
                        className="w-full p-4 rounded-2xl bg-zinc-800 hover:bg-zinc-700 font-bold text-zinc-200 transition-all flex items-center justify-center gap-2"
                      >
                        <span className="material-symbols-outlined text-[18px]">terminal</span>
                        View Deployment Logs ({deploymentLogs.length})
                      </button>
                    )}

                    <button
                      onClick={() => setActiveEditNode(null)}
                      className="w-full p-4 rounded-2xl bg-zinc-800 hover:bg-zinc-700 font-bold text-zinc-200 transition-all"
                    >
                      Close
                    </button>
                  </div>
                </div>
              )}
            </motion.div>
          </>
        )}
      </AnimatePresence>

      {/* Deployment Logs Modal */}
      <AnimatePresence>
        {showLogs && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setShowLogs(false)}
              className="fixed inset-0 z-40 bg-black/60 backdrop-blur-sm"
            />

            <motion.div
              initial={{ opacity: 0, y: 30, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 30, scale: 0.95 }}
              onClick={(e) => e.stopPropagation()}
              className="fixed z-50 left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-[92%] max-w-3xl rounded-3xl border border-zinc-700 bg-zinc-950 overflow-hidden"
            >
              <div className="p-8">
                <div className="flex items-center justify-between mb-6">
                  <div className="flex items-center gap-4">
                    <div className="w-14 h-14 rounded-full bg-secondary-container flex items-center justify-center">
                      <span className="material-symbols-outlined text-2xl text-on-secondary-fixed">terminal</span>
                    </div>
                    <div>
                      <h3 className="text-2xl font-black font-[family-name:var(--font-family-headline)]">Deployment Logs</h3>
                      <p className="text-sm text-zinc-400">Real-time campaign progress</p>
                    </div>
                  </div>
                  <button
                    onClick={() => setShowLogs(false)}
                    className="p-2 hover:bg-zinc-800 rounded-full transition-all"
                  >
                    <span className="material-symbols-outlined text-zinc-400">close</span>
                  </button>
                </div>

                <div className="space-y-3 max-h-96 overflow-y-auto bg-black/40 rounded-2xl p-4 border border-zinc-800">
                  {deploymentLogs.map((log, idx) => (
                    <motion.div
                      key={idx}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: idx * 0.05 }}
                      className="flex items-start gap-3 p-3 rounded-xl bg-zinc-900/60"
                    >
                      <span className={`material-symbols-outlined text-[20px] ${
                        log.status === 'success' ? 'text-secondary-container' :
                        log.status === 'error' ? 'text-red-500' :
                        'text-zinc-400'
                      }`}>
                        {log.status === 'success' ? 'check_circle' :
                         log.status === 'error' ? 'error' :
                         'info'}
                      </span>
                      <div className="flex-1">
                        <p className="text-sm font-medium text-zinc-200">{log.message}</p>
                        <p className="text-xs text-zinc-500 mt-1">
                          {new Date(log.time).toLocaleTimeString()}
                        </p>
                      </div>
                    </motion.div>
                  ))}
                </div>

                <div className="mt-6 flex justify-end gap-3">
                  <button
                    onClick={() => setDeploymentLogs([])}
                    className="px-5 py-3 rounded-full text-sm font-bold bg-zinc-800 text-zinc-200 hover:bg-zinc-700 transition-all"
                  >
                    Clear Logs
                  </button>
                  <button
                    onClick={() => setShowLogs(false)}
                    className="px-5 py-3 rounded-full text-sm font-bold bg-secondary-container text-on-secondary-fixed hover:scale-[1.02] active:scale-[0.98] transition-all"
                  >
                    Close
                  </button>
                </div>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  )
}
