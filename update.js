const fs = require('fs');
let code = fs.readFileSync('src/pages/dashboard/AutomationPage.jsx', 'utf-8');

// 1. Imports
const importIdx = code.indexOf('import { toast }');
if (importIdx !== -1) {
    code = code.slice(0, importIdx) + \"import { createCampaign, generateEmail, sendCampaign } from '../../services/automation'\\n\" + code.slice(importIdx);
}

// 2. States inside AutomationPage
const stateRegex = /const \[isDeploying, setIsDeploying\] = useState\(false\)/;
const newStates = \
  const [activeEditNode, setActiveEditNode] = useState(null)
  const [campaignData, setCampaignData] = useState(null)
  const [emailHtml, setEmailHtml] = useState('')
  const [emailLogs, setEmailLogs] = useState([])
  const [isEmailDeploying, setIsEmailDeploying] = useState(false)
\;
code = code.replace(stateRegex, \"const [isDeploying, setIsDeploying] = useState(false)\\n\" + newStates);

// 3. Deploy button logic: if nodes contain storage, llm, mail, then open a custom email deploy logic instead of telegram
const btnRegex = /onClick=\{\(\) => setShowDeployModal\(true\)\}/;
const modifiedDeployBtn = \onClick={() => {
    const hasEmailFlow = nodes.some(n => n.type === 'storage') && nodes.some(n => n.type === 'auto_awesome') && nodes.some(n => n.type === 'mail');
    if (hasEmailFlow) {
        handleEmailDeploy();
    } else {
        setShowDeployModal(true);
    }
}}\;
code = code.replace(btnRegex, modifiedDeployBtn);

// 4. Implement handleEmailDeploy
const deployFuncStr = \
  const handleEmailDeploy = async () => {
    if (!campaignData?.id) {
        toast.error('Campaign not ready. Please configure the Database node first.');
        return;
    }
    setIsEmailDeploying(true);
    toast.info('Starting Email Flow Deploy...');
    
    // Animate lines to show flowing
    const svgLines = document.querySelectorAll('.flow-path');
    svgLines.forEach(line => line.classList.add('flowing'));

    try {
        const result = await sendCampaign(campaignData.id);
        toast.success(result.message || 'Campaign sent successfully!');
        setEmailLogs(result.logs || []);
    } catch (e) {
        toast.error('Failed to send campaign');
        console.error(e);
    } finally {
        setIsEmailDeploying(false);
        svgLines.forEach(line => line.classList.remove('flowing'));
    }
  }

  // Update node data helper
  const updateNodeData = (nodeId, dataUpdate) => {
    setNodes(prev => prev.map(n => n.id === nodeId ? { ...n, data: { ...n.data, ...dataUpdate } } : n));
  }
\;
code = code.replace(/const handleDeployTelegramFlow/, deployFuncStr + '\\n\\n  const handleDeployTelegramFlow');

// 5. Connect Edit click
code = code.replace(
    /onClick=\{\(e\) => \{\\s+e\.stopPropagation\(\)\\s+\/\/ Show menu\\s+\}\}/g,
    \onClick={(e) => {
        e.stopPropagation();
        setActiveEditNode(node.id);
    }}\
);

// 6. SVG flow path
code = code.replace(/<path\\s+key=\{conn\.id\}/, \"<path key={conn.id} className='flow-path'\");
code = code.replace(/strokeDasharray=\"5,5\"/, \"strokeDasharray='5,5' style={{ animation: 'flow 1s linear infinite', animationPlayState: 'paused' }}\");
// We need to alter css directly or just add a global style tag at the top
code = code.replace(\"return (\", \"return (\\n    <>\\n    <style>{\\n      @keyframes flow {\\n        from { stroke-dashoffset: 10; }\\n        to { stroke-dashoffset: 0; }\\n      }\\n      .flowing {\\n        stroke: #22d3ee !important;\\n        animation-play-state: running !important;\\n      }\\n    }</style>\");
code = code.replace(/\\s+\\)\\s+\\}\\s*$/, \"\\n    </>\\n  )\\n}\");


// 7. Modals
const modals = \
        {/* Email Automation Modals */}
        <AnimatePresence>
          {activeEditNode && (
            <>
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                onClick={() => setActiveEditNode(null)}
                className="fixed inset-0 z-40 bg-black/50 backdrop-blur-sm"
              />
              <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.95 }}
                className="fixed z-50 left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 bg-zinc-900 border border-zinc-700 p-6 rounded-2xl w-full max-w-md shadow-2xl overflow-y-auto max-h-[80vh]"
              >
                {nodes.find(n => n.id === activeEditNode)?.type === 'storage' && (
                  <div>
                    <h3 className="text-xl font-bold mb-4">Database Configuration</h3>
                    <p className="text-sm text-zinc-400 mb-4">Select the target audience for your campaign.</p>
                    <select
                      className="w-full bg-zinc-800 border border-zinc-700 rounded-lg p-3 text-white mb-4 outline-none"
                      onChange={(e) => updateNodeData(activeEditNode, { target_audience: e.target.value })}
                      defaultValue={nodes.find(n => n.id === activeEditNode)?.data?.target_audience || 'users'}
                    >
                      <option value="users">Registered Users</option>
                      <option value="volunteers">Volunteers</option>
                      <option value="both">Both</option>
                    </select>
                    <button
                      onClick={async () => {
                         const aud = nodes.find(n => n.id === activeEditNode)?.data?.target_audience || 'users';
                         toast.info('Extracting recipients...');
                         try {
                           const res = await createCampaign({ target_audience: aud, email_context: 'Exciting news from Utsova!' });
                           setCampaignData(res);
                           updateNodeData(activeEditNode, { setup: true, recipients: res.total_recipients });
                           toast.success(\Found \ recipients.\);
                         } catch(e) {
                           toast.error('Failed to create campaign');
                         }
                         setActiveEditNode(null);
                      }}
                      className="w-full bg-secondary-container text-on-secondary-fixed py-2 rounded-full font-bold"
                    >Save & Extract</button>
                  </div>
                )}

                {nodes.find(n => n.id === activeEditNode)?.type === 'auto_awesome' && (
                  <div>
                    <h3 className="text-xl font-bold mb-4">Generate Email (AI)</h3>
                    <input
                      type="text"
                      placeholder="Email Subject"
                      className="w-full bg-zinc-800 border border-zinc-700 rounded-lg p-3 text-white mb-4 outline-none"
                      defaultValue={nodes.find(n => n.id === activeEditNode)?.data?.subject || ''}
                      onChange={(e) => updateNodeData(activeEditNode, { subject: e.target.value })}
                    />
                    <button
                      onClick={async () => {
                         const subj = nodes.find(n => n.id === activeEditNode)?.data?.subject || 'Exciting Updates!';
                         if (!campaignData?.id) return toast.error('Configure Database node first.');
                         try {
                           const res = await generateEmail(campaignData.id, subj);
                           setEmailHtml(res.generated_email_html);
                           updateNodeData(activeEditNode, { setup: true });
                           toast.success('Email generated successfully!');
                         } catch(e) {
                           toast.error('Failed to generate email');
                         }
                      }}
                      className="w-full bg-blue-600 text-white py-2 rounded-full font-bold mb-4"
                    >Generate with AI</button>

                    {emailHtml && (
                        <div className="bg-zinc-800 p-2 rounded-xl border border-zinc-700 mb-4 h-64 overflow-auto">
                            <iframe srcDoc={emailHtml} className="w-full h-full bg-white rounded-lg pointer-events-none" />
                        </div>
                    )}
                  </div>
                )}

                {nodes.find(n => n.id === activeEditNode)?.type === 'mail' && (
                  <div>
                    <h3 className="text-xl font-bold mb-4">Email Deployment Logs</h3>
                    <div className="bg-zinc-950 p-4 rounded-xl border border-zinc-800 h-64 overflow-y-auto font-mono text-xs text-secondary-container space-y-2">
                        {emailLogs.length === 0 ? <span className="opacity-50">No logs yet...</span> : emailLogs.map((log, i) => <div key={i}>{log}</div>)}
                    </div>
                  </div>
                )}
              </motion.div>
            </>
          )}
        </AnimatePresence>
\

code = code.replace(/<AnimatePresence>\\s+\{showDeployModal/, modals + \"\\n\\n        <AnimatePresence>\\n        {showDeployModal\");

fs.writeFileSync('src/pages/dashboard/AutomationPage.jsx', code);
console.log('Update script prepared.');
