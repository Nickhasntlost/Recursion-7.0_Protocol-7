const fs = require('fs');
let code = fs.readFileSync('src/pages/dashboard/AutomationPage.jsx', 'utf-8');

const statsRegex = /\{/\* Stats \*/\}[\\s\\S]*?\{/\* Connection Ports \*/\}/;

const dynamicStats = \{/* Node Body Details */}
                <div className="text-[11px] text-on-surface-variant flex flex-col gap-1 w-full justify-center">
                  {node.type === 'storage' ? (
                    node.data?.setup ? (
                      <span className="flex items-center gap-1 font-bold text-secondary-container">
                        <span className="material-symbols-outlined text-[14px]">group</span> Target: {node.data.target_audience} ({node.data.recipients} found)
                      </span>
                    ) : (
                      <span className="opacity-50 italic">Storage unconfigured. Click to setup.</span>
                    )
                  ) : node.type === 'auto_awesome' ? (
                    node.data?.setup ? (
                      <span className="flex items-center gap-1 font-bold text-secondary-container truncate w-48 block">
                        <span className="material-symbols-outlined text-[14px]">subject</span> "{node.data.subject}"
                      </span>
                    ) : (
                      <span className="opacity-50 italic">AI unconfigured. Click to setup.</span>
                    )
                  ) : node.type === 'mail' ? (
                      <div className="flex items-center justify-between w-full">
                        <span className="flex items-center gap-1">
                          <span className="material-symbols-outlined text-[14px] text-secondary-container">send</span> 
                          <span className="text-secondary-container font-bold">{node.data?.setup ? 'Ready' : isEmailDeploying ? 'Sending...' : 'Pending'}</span>
                        </span>
                        {emailLogs.length > 0 && <span className="text-blue-400 font-bold truncate ml-2">Click logs</span>}
                      </div>
                  ) : (
                      <div className="flex items-center justify-between w-full">
                         <span className="flex items-center gap-1">
                           <span className="material-symbols-outlined text-[14px] text-secondary-container">send</span> <span className="text-secondary-container font-bold">1.2k Sent</span>
                         </span>
                         <span className="flex items-center gap-1">
                           <span className="material-symbols-outlined text-[14px] text-secondary-container">visibility</span> <span className="text-secondary-container font-bold">84% Open</span>
                         </span>
                      </div>
                  )}
                </div>

                {/* Connection Ports */}\;

code = code.replace(statsRegex, dynamicStats);

fs.writeFileSync('src/pages/dashboard/AutomationPage.jsx', code);
