const fs = require('fs');
let code = fs.readFileSync('src/pages/dashboard/AutomationPage.jsx', 'utf-8');

// 1. Add click handler
code = code.replace('// Show menu', 'setActiveEditNode(node)');

// 2. Add deploy logic before return (
const returnIdx = code.indexOf('return (\\n    <div className=\"relative');
if (returnIdx !== -1) {
  const handlerCode = \
  const handleEmailDeploy = async () => {
    try {
      setIsEmailDeploying(true);
      setEmailLogs(prev => [...prev, '[System] Initiating deployment sequence...']);
      
      const storageNode = nodes.find(n => n.type === 'storage');
      const llmNode = nodes.find(n => n.type === 'auto_awesome');
      const mailNode = nodes.find(n => n.type === 'mail');

      if (!storageNode?.data?.setup || !llmNode?.data?.setup || !mailNode?.data?.setup) {
        toast.error('All nodes must be configured first');
        return;
      }

      setEmailLogs(prev => [...prev, '[Database] Creating campaign and extracting users...']);
      const campaignUserRes = await createCampaign(storageNode.data.target_audience);
      const { campaignId, usersExtracted, emailsList } = campaignUserRes.data;
      setEmailLogs(prev => [...prev, \\\[Database] Success: Found \ users\\\]);
      setCampaignData(campaignUserRes.data);

      setEmailLogs(prev => [...prev, \\\[AI] Generating customized templates for subject: "\"...\\\]);
      const emailRes = await generateEmail(campaignId, llmNode.data.subject, llmNode.data.prompt);
      const { templateHtml } = emailRes.data;
      setEmailHtml(templateHtml);
      setEmailLogs(prev => [...prev, '[AI] Template generated successfully']);

      setEmailLogs(prev => [...prev, '[Preview] Preparing final content...']);
      const previewRes = await previewEmail(campaignId);
      setPreviewData(previewRes.data.preview);
      setEmailLogs(prev => [...prev, '[System] Awaiting user confirmation to send...']);
      
      setActiveEditNode({...mailNode, __previewReady: true});

    } catch (err) {
      console.error(err);
      toast.error('Deployment failed: ' + (err.response?.data?.error || err.message));
      setEmailLogs(prev => [...prev, '[Error] Process aborted due to error']);
    } finally {
      setIsEmailDeploying(false);
    }
  };

\;
  code = code.slice(0, returnIdx) + handlerCode + code.slice(returnIdx);
}

// 3. Add Modal Render logic at the end
const endIdx = code.lastIndexOf('</div>');
if (endIdx !== -1) {
  const modalCode = \
      {/* Node Config Modals */}
      <AnimatePresence>
        {activeEditNode && (
          <div className=\"fixed inset-0 bg-black/60 z-[100] flex items-center justify-center p-4\">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className=\"bg-surface rounded-2xl w-full max-w-lg border border-outline-variant/30 shadow-2xl overflow-hidden\"
            >
              <div className=\"p-6\">
                <div className=\"flex items-center justify-between mb-4\">
                  <div className=\"flex items-center gap-3\">
                    <div className={\\\w-10 h-10 rounded-xl flex items-center justify-center \\\\}>
                      <span className=\"material-symbols-outlined text-white\">{activeEditNode.icon}</span>
                    </div>
                    <div>
                      <h3 className=\"text-lg font-bold text-on-surface\">Configure {activeEditNode.label}</h3>
                      <p className=\"text-sm text-on-surface-variant\">Set up parameters for this node</p>
                    </div>
                  </div>
                  <button onClick={() => setActiveEditNode(null)} className=\"text-on-surface-variant hover:text-on-surface\">
                    <span className=\"material-symbols-outlined\">close</span>
                  </button>
                </div>

                {/* Storage Config */}
                {activeEditNode.type === 'storage' && (
                  <div className=\"space-y-4\">
                    <div>
                      <label className=\"block text-sm font-medium text-on-surface-variant mb-1\">Target Audience</label>
                      <input 
                        type=\"text\" 
                        className=\"w-full bg-surface-variant border border-outline-variant/30 rounded-xl px-4 py-2 text-on-surface\" 
                        placeholder=\"e.g., event delegates, attendees\"
                        defaultValue={activeEditNode.data?.target_audience || ''}
                        id=\"target_audience\"
                      />
                    </div>
                    <div className=\"flex justify-end gap-3 mt-6\">
                      <button onClick={() => setActiveEditNode(null)} className=\"px-4 py-2 rounded-full font-medium text-on-surface-variant\">Cancel</button>
                      <button 
                        onClick={() => {
                          const val = document.getElementById('target_audience').value;
                          setNodes(nodes.map(n => n.id === activeEditNode.id ? { ...n, data: { setup: true, target_audience: val, recipients: Math.floor(Math.random() * 50) + 10 } } : n));
                          setActiveEditNode(null);
                        }} 
                        className=\"px-4 py-2 bg-blue-700 text-white rounded-full font-bold\"
                      >Save Configuration</button>
                    </div>
                  </div>
                )}

                {/* AI / LLM Config */}
                {activeEditNode.type === 'auto_awesome' && (
                  <div className=\"space-y-4\">
                    <div>
                      <label className=\"block text-sm font-medium text-on-surface-variant mb-1\">Email Subject Template</label>
                      <input 
                        type=\"text\" 
                        className=\"w-full bg-surface-variant border border-outline-variant/30 rounded-xl px-4 py-2 text-on-surface\" 
                        placeholder=\"e.g., Thank you for attending {{event_name}}\"
                        defaultValue={activeEditNode.data?.subject || ''}
                        id=\"subject_template\"
                      />
                    </div>
                    <div>
                      <label className=\"block text-sm font-medium text-on-surface-variant mb-1\">Generation Prompt</label>
                      <textarea 
                        className=\"w-full bg-surface-variant border border-outline-variant/30 rounded-xl px-4 py-2 text-on-surface h-32\" 
                        placeholder=\"Instructions for the LLM to write the email body...\"
                        defaultValue={activeEditNode.data?.prompt || ''}
                        id=\"generation_prompt\"
                      ></textarea>
                    </div>
                    <div className=\"flex justify-end gap-3 mt-6\">
                      <button onClick={() => setActiveEditNode(null)} className=\"px-4 py-2 rounded-full font-medium text-on-surface-variant\">Cancel</button>
                      <button 
                        onClick={() => {
                          const subj = document.getElementById('subject_template').value;
                          const prompt = document.getElementById('generation_prompt').value;
                          setNodes(nodes.map(n => n.id === activeEditNode.id ? { ...n, data: { setup: true, subject: subj, prompt: prompt } } : n));
                          setActiveEditNode(null);
                        }} 
                        className=\"px-4 py-2 bg-blue-600 text-white rounded-full font-bold\"
                      >Save Configuration</button>
                    </div>
                  </div>
                )}

                {/* Mail Config / Deploy */}
                {activeEditNode.type === 'mail' && (
                  <div className=\"space-y-4\">
                    {!activeEditNode.__previewReady ? (
                      <>
                        <div className=\"bg-surface-variant rounded-xl p-4\">
                          <p className=\"text-sm text-on-surface-variant\">Clicking deploy will trigger the pipeline: extract users, generate emails, and await preview.</p>
                        </div>
                        
                        {emailLogs.length > 0 && (
                          <div className=\"bg-black text-green-400 font-mono text-xs p-3 rounded-lg h-32 overflow-y-auto\">
                            {emailLogs.map((log, i) => <div key={i}>{log}</div>)}
                          </div>
                        )}

                        <div className=\"flex justify-end gap-3 mt-6\">
                          <button onClick={() => setActiveEditNode(null)} className=\"px-4 py-2 rounded-full font-medium text-on-surface-variant\">Cancel</button>
                          <button 
                            disabled={isEmailDeploying}
                            onClick={() => {
                              // Mark setup as true first
                              setNodes(nodes.map(n => n.id === activeEditNode.id ? { ...n, data: { ...n.data, setup: true } } : n));
                              handleEmailDeploy();
                            }} 
                            className=\"px-4 py-2 bg-secondary-container text-on-secondary-container rounded-full font-bold disabled:opacity-50 flex items-center gap-2\"
                          >
                            {isEmailDeploying ? <span className=\"material-symbols-outlined animate-spin\">sync</span> : <span className=\"material-symbols-outlined\">rocket_launch</span>}
                            {isEmailDeploying ? 'Deploying...' : 'Start Email Pipeline'}
                          </button>
                        </div>
                      </>
                    ) : (
                      <>
                        {/* Preview State */}
                        <div className=\"bg-surface-variant rounded-xl p-4 mb-4\">
                          <h4 className=\"font-bold text-on-surface mb-2\">Preview Generated</h4>
                          <p className=\"text-sm text-on-surface-variant\">Email generation complete. Preview the sample below and confirm to send.</p>
                        </div>
                        
                        <div className=\"w-full aspect-video border-2 border-outline-variant/30 rounded-xl overflow-hidden bg-white\">
                          {emailHtml ? (
                            <iframe srcDoc={emailHtml} className=\"w-full h-full\" />
                          ) : (
                            <div className=\"w-full h-full flex flex-col items-center justify-center bg-surface text-on-surface-variant\">
                                <span className=\"material-symbols-outlined text-[48px] opacity-20 mb-4\">mail</span>
                                <p>Preview content resolving...</p>
                            </div>
                          )}
                        </div>

                        <div className=\"flex justify-end gap-3 mt-6\">
                          <button onClick={() => setActiveEditNode(null)} className=\"px-4 py-2 rounded-full font-medium text-on-surface-variant\">Cancel</button>
                          <button 
                            disabled={isEmailDeploying}
                            onClick={async () => {
                               try {
                                  setIsEmailDeploying(true);
                                  await sendCampaign(campaignData.campaignId);
                                  toast.success('Campaign dispatched successfully!');
                                  setActiveEditNode(null);
                               } catch (e) {
                                  toast.error('Dispatch failed');
                               } finally {
                                  setIsEmailDeploying(false);
                               }
                            }} 
                            className=\"px-4 py-2 bg-emerald-600 text-white rounded-full font-bold flex items-center gap-2\"
                          >
                            <span className=\"material-symbols-outlined\">send</span> Send to {campaignData?.usersExtracted || 0} Recipients
                          </button>
                        </div>
                      </>
                    )}
                  </div>
                )}
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
\;
  code = code.slice(0, endIdx) + modalCode + code.slice(endIdx);
}

fs.writeFileSync('src/pages/dashboard/AutomationPage.jsx', code);
console.log('Update Complete.');