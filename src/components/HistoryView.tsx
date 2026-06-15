import React, { useState, useMemo } from 'react';
import type { CompletedHackathon } from '../lib/completedHacks';

interface HistoryViewProps {
  completedHacks: CompletedHackathon[];
}

export const HistoryView: React.FC<HistoryViewProps> = ({ completedHacks }) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedHackId, setSelectedHackId] = useState<string>(completedHacks[0]?.id || 'ethglobal-ny-2026');
  const [openFaqs, setOpenFaqs] = useState<Record<number, boolean>>({});

  const filteredHacks = useMemo(() => {
    return completedHacks.filter(h => 
      h.projectName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      h.eventName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      h.objective.toLowerCase().includes(searchQuery.toLowerCase())
    );
  }, [completedHacks, searchQuery]);

  const activeHack = useMemo(() => {
    return completedHacks.find(h => h.id === selectedHackId) || completedHacks[0];
  }, [completedHacks, selectedHackId]);

  const toggleFaq = (index: number) => {
    setOpenFaqs(prev => ({
      ...prev,
      [index]: !prev[index]
    }));
  };

  const handleExportJson = (hack: CompletedHackathon) => {
    const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(hack, null, 2));
    const downloadAnchor = document.createElement('a');
    downloadAnchor.setAttribute("href", dataStr);
    downloadAnchor.setAttribute("download", `hack_record_${hack.id}.json`);
    document.body.appendChild(downloadAnchor);
    downloadAnchor.click();
    downloadAnchor.remove();
  };

  // Calculate dynamic quality rating based on checklist completion
  const healthScore = useMemo(() => {
    if (!activeHack) return 0;
    const completedLength = activeHack.completedTasks?.length || 0;
    if (completedLength === 0) return 60; // baseline score
    return Math.min(98, 60 + Math.round((completedLength / 8) * 38));
  }, [activeHack]);

  return (
    <div className="flex-1 overflow-hidden flex flex-col p-lg gap-lg relative">
      <div className="scanline"></div>
      
      {/* Page Title Section */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-end gap-4 shrink-0">
        <div>
          <h2 className="font-headline-lg text-headline-lg text-on-surface uppercase tracking-tight">Archive Repository</h2>
          <p className="font-code-sm text-code-sm text-on-surface-variant">NODE: ALCHM-HIST-V4 // TOTAL_RECORDS: {completedHacks.length}</p>
        </div>
        <div className="flex gap-sm">
          <div className="relative border border-outline-variant bg-black/40 px-3 py-1.5 flex items-center">
            <span className="material-symbols-outlined text-[16px] text-on-surface-variant mr-2">search</span>
            <input
              type="text"
              placeholder="FILTER_TAGS..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="bg-transparent text-[11px] font-label-caps text-on-surface outline-none border-none p-0 focus:ring-0 w-36 placeholder:text-outline-variant"
            />
          </div>
          {activeHack && (
            <button 
              onClick={() => handleExportJson(activeHack)}
              className="bg-primary hover:bg-primary-container text-on-primary-container font-label-caps text-label-caps px-md py-sm flex items-center gap-xs active:scale-95 duration-75 cursor-pointer"
            >
              <span className="material-symbols-outlined text-[18px]">download</span>
              EXPORT JSON RECORD
            </button>
          )}
        </div>
      </div>

      {/* Dashboard Grid */}
      <div className="grid grid-cols-12 gap-lg flex-1 overflow-hidden min-h-0">
        
        {/* Left Section: Archived List */}
        <section className="col-span-12 lg:col-span-4 flex flex-col gap-md overflow-hidden h-full">
          <div className="glass-panel flex-1 flex flex-col overflow-hidden">
            <div className="p-md border-b border-outline-variant/40 flex justify-between items-center bg-surface-container-low">
              <span className="font-label-caps text-label-caps text-primary">CHRONOLOGICAL_LOG</span>
              <span className="material-symbols-outlined text-primary text-[18px]">sort</span>
            </div>
            
            <div className="flex-1 overflow-y-auto custom-scrollbar p-sm space-y-sm">
              {filteredHacks.length === 0 ? (
                <div className="text-center font-code-sm text-[12px] text-on-surface-variant py-8">
                  NO RECORDS FOUND
                </div>
              ) : (
                filteredHacks.map((hack) => {
                  const isActive = hack.id === selectedHackId;
                  const hackScore = hack.completedTasks ? Math.min(98, 60 + Math.round((hack.completedTasks.length / 8) * 38)) : 88;
                  return (
                    <div
                      key={hack.id}
                      onClick={() => setSelectedHackId(hack.id)}
                      className={`p-md border transition-all cursor-pointer group ${
                        isActive 
                          ? 'bg-primary/10 border-primary/50' 
                          : 'border-outline-variant/40 hover:border-secondary/60 bg-surface-container-low'
                      }`}
                    >
                      <div className="flex justify-between items-start mb-sm">
                        <h3 className={`font-headline-md text-[18px] transition-colors ${isActive ? 'text-primary' : 'text-on-surface group-hover:text-secondary'}`}>
                          {hack.eventName}
                        </h3>
                        <span className={`font-code-sm text-code-sm ${isActive ? 'text-primary' : 'text-on-surface-variant'}`}>
                          {hackScore}/100
                        </span>
                      </div>
                      <div className="space-y-xs">
                        <div className="flex justify-between font-label-caps text-[10px] text-on-surface-variant">
                          <span>DATE</span>
                          <span className="text-on-surface">{hack.dates.split(',')[0]}</span>
                        </div>
                        <div className="flex justify-between font-label-caps text-[10px] text-on-surface-variant">
                          <span>PROJECT</span>
                          <span className="text-secondary truncate max-w-[150px]">{hack.projectName}</span>
                        </div>
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          </div>
        </section>

        {/* Right Section: Detailed Retrospective Sheet */}
        <section className="col-span-12 lg:col-span-8 overflow-hidden h-full">
          {activeHack ? (
            <div className="glass-panel h-full flex flex-col overflow-y-auto custom-scrollbar">
              
              {/* Hero Detail Header */}
              <div className="relative h-48 w-full shrink-0">
                <img 
                  className="w-full h-full object-cover opacity-40 grayscale hover:grayscale-0 transition-all duration-700" 
                  alt="Futuristic data center"
                  src="https://lh3.googleusercontent.com/aida-public/AB6AXuB_obGuWGDpTcRNLzYX3K94C9HTYDDHcuIWw_1dLGmC1rGg8LfyDQ3RaYQV9qbF1pEMUcTLh-AQf_jSQqkiKZNESpR0zXiksfB82FELqpK3xKLETB9B_2nrcGYnskoacycSa2pVkjLCecSbGEVLGRL-27tB2M8mOAHVDOXQcWGllU3VRuPYYGrwci_0HTZxfclWDshwZt4RHPa9qG5xxvHK0J6ntI01c9J8EdsgbseMv1K3e_FZv8xRwZPHslOc_5oQeAQSkk0Pj2Q"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-[#0a1420] to-transparent"></div>
                <div className="absolute bottom-md left-md">
                  <div className="flex items-center gap-sm mb-xs">
                    <span className="bg-primary/20 text-primary border border-primary/40 px-xs py-[2px] font-label-caps text-[10px]">
                      VERIFIED_RECORD
                    </span>
                    <span className="bg-secondary/20 text-secondary border border-secondary/40 px-xs py-[2px] font-label-caps text-[10px]">
                      {activeHack.track.toUpperCase()}
                    </span>
                  </div>
                  <h2 className="font-headline-lg text-[40px] text-on-surface leading-none uppercase">
                    {activeHack.projectName}
                  </h2>
                </div>
              </div>

              {/* Main Information Panel */}
              <div className="p-lg grid grid-cols-1 md:grid-cols-3 gap-lg">
                
                {/* Column 1: Overview & Stack */}
                <div className="md:col-span-1 space-y-lg">
                  <div>
                    <h4 className="font-label-caps text-label-caps text-primary mb-sm border-l-2 border-primary pl-sm">OBJECTIVE</h4>
                    <p className="font-body-md text-sm text-on-surface-variant leading-relaxed">
                      {activeHack.objective}
                    </p>
                  </div>
                  
                  <div>
                    <h4 className="font-label-caps text-label-caps text-secondary mb-sm border-l-2 border-secondary pl-sm">TECH_STACK</h4>
                    <div className="flex flex-wrap gap-xs">
                      <span className="bg-surface-container-highest px-sm py-xs font-code-sm text-code-sm text-on-surface border border-outline-variant/40">
                        {activeHack.stack.language}
                      </span>
                      <span className="bg-surface-container-highest px-sm py-xs font-code-sm text-code-sm text-on-surface border border-outline-variant/40">
                        {activeHack.stack.framework}
                      </span>
                      <span className="bg-surface-container-highest px-sm py-xs font-code-sm text-code-sm text-on-surface border border-outline-variant/40">
                        {activeHack.stack.database}
                      </span>
                      <span className="bg-surface-container-highest px-sm py-xs font-code-sm text-code-sm text-on-surface border border-outline-variant/40">
                        {activeHack.stack.cssEngine}
                      </span>
                    </div>
                  </div>

                  <div>
                    <h4 className="font-label-caps text-label-caps text-tertiary-container mb-sm border-l-2 border-tertiary-container pl-sm">TELEMETRY</h4>
                    <div className="space-y-sm">
                      <div className="flex items-center gap-md">
                        <div className="w-12 h-12 relative flex items-center justify-center">
                          <svg className="w-full h-full -rotate-90">
                            <circle className="text-surface-container-highest" cx="24" cy="24" fill="transparent" r="20" stroke="currentColor" stroke-width="4"></circle>
                            <circle 
                              className="text-primary progress-glow transition-all" 
                              cx="24" 
                              cy="24" 
                              fill="transparent" 
                              r="20" 
                              stroke="currentColor" 
                              strokeDasharray="125.6" 
                              strokeDashoffset={125.6 - (125.6 * healthScore) / 100}
                              strokeWidth="4"
                            ></circle>
                          </svg>
                          <span className="absolute font-code-sm text-[10px] text-primary">{healthScore}%</span>
                        </div>
                        <span className="font-label-caps text-[10px] text-on-surface-variant">QUALITY_RATING</span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Column 2 & 3: Accomplishments & Checklist */}
                <div className="md:col-span-2 space-y-lg">
                  
                  {/* Key Accomplishments */}
                  <div>
                    <h4 className="font-label-caps text-label-caps text-primary mb-md border-b border-outline-variant/40 pb-xs">KEY_ACCOMPLISHMENTS</h4>
                    <ul className="space-y-sm">
                      {activeHack.accomplishments.map((acc, index) => (
                        <li key={index} className="flex items-start gap-sm group">
                          <span className="material-symbols-outlined text-primary group-hover:scale-125 transition-transform text-sm mt-0.5">
                            workspace_premium
                          </span>
                          <p className="font-body-md text-sm text-on-surface">{acc}</p>
                        </li>
                      ))}
                    </ul>
                  </div>

                  {/* Checklist Breakdown */}
                  <div>
                    <h4 className="font-label-caps text-label-caps text-secondary mb-md border-b border-outline-variant/40 pb-xs">TASK_CHECKLIST_STATUS</h4>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-md max-h-[160px] overflow-y-auto pr-1 custom-scrollbar">
                      {activeHack.completedTasks.map((task, index) => (
                        <div key={task.id || index} className="flex items-center gap-sm bg-surface-container-high p-sm border-l-2 border-primary">
                          <span className="material-symbols-outlined text-primary text-sm" style={{ fontVariationSettings: "'FILL' 1" }}>
                            check_circle
                          </span>
                          <span className="font-code-sm text-[11px] text-on-surface truncate" title={task.label}>
                            {task.label}
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Retrospective Q&A Analysis */}
                  {activeHack.faqs && activeHack.faqs.length > 0 && (
                    <div>
                      <h4 className="font-label-caps text-label-caps text-on-surface-variant mb-md border-b border-outline-variant/40 pb-xs">RETROSPECTIVE_ANALYSIS</h4>
                      <div className="space-y-sm">
                        {activeHack.faqs.map((faq, index) => {
                          const isOpen = !!openFaqs[index];
                          return (
                            <div key={index} className="border border-outline-variant/40 overflow-hidden">
                              <button 
                                className="w-full text-left p-md flex justify-between items-center bg-surface-container hover:bg-surface-variant transition-colors"
                                onClick={() => toggleFaq(index)}
                              >
                                <span className="font-label-caps text-[10px] text-on-surface">{faq.question.toUpperCase()}</span>
                                <span className={`material-symbols-outlined transform transition-transform text-sm ${isOpen ? 'rotate-180' : ''}`}>
                                  expand_more
                                </span>
                              </button>
                              {isOpen && (
                                <div className="p-md bg-surface-container-low border-t border-outline-variant/20 font-body-md text-xs text-on-surface-variant italic leading-relaxed">
                                  "{faq.answer}"
                                </div>
                              )}
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  )}

                  {/* Custom specs if available */}
                  {activeHack.features && activeHack.features.length > 0 && (
                    <div>
                      <h4 className="font-label-caps text-label-caps text-on-surface-variant mb-md border-b border-outline-variant/40 pb-xs">CORE_SPECIFICATIONS</h4>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                        {activeHack.features.map((feat, index) => (
                          <div key={index} className="border border-outline-variant/40 bg-surface-container p-3">
                            <div className="font-label-caps text-[10px] text-on-surface">{feat.label.toUpperCase()}</div>
                            <p className="font-body-md text-[11px] text-on-surface-variant mt-1">{feat.prompt}</p>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                </div>

              </div>

            </div>
          ) : (
            <div className="glass-panel h-full flex items-center justify-center p-lg">
              <p className="font-code-sm text-[12px] text-on-surface-variant">SELECT A RECORD TO DISPLAY TELEMETRY DETAIL SHEET</p>
            </div>
          )}
        </section>

      </div>
    </div>
  );
};
