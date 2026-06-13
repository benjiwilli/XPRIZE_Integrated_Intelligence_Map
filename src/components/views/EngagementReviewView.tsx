import React, { useState, useMemo } from "react";
import { EcosystemEntity, EngagementRecord, EvidenceStatus } from "../../types";
import { SYNTHETIC_ENGAGEMENTS } from "../../data/syntheticData";
import { 
  CheckCircle, 
  XCircle, 
  FileText, 
  Mail, 
  TrendingUp, 
  ShieldAlert, 
  ThumbsUp, 
  Calendar, 
  User, 
  UserCheck, 
  HelpCircle,
  Building,
  Activity
} from "lucide-react";

const Sparkline = ({ currentScore, entityId }: { currentScore: number, entityId: string }) => {
  const history = useMemo(() => {
    let score = currentScore;
    const historyData = [score];
    const seed = entityId.charCodeAt(0) + entityId.charCodeAt(entityId.length - 1);
    
    for (let i = 1; i <= 4; i++) {
       const drop = ((seed * i) % 12) + 1; 
       score = Math.max(10, score - drop);
       historyData.unshift(score);
    }
    return historyData;
  }, [currentScore, entityId]);

  const min = Math.max(0, Math.min(...history) - 10);
  const max = Math.min(100, Math.max(...history) + 10);
  const width = 100;
  const height = 24;
  const range = max - min === 0 ? 1 : max - min;

  const points = history.map((val, i) => {
     const x = (i / (history.length - 1)) * width;
     const y = height - ((val - min) / range) * height;
     return `${x},${y}`;
  }).join(' L ');

  const areaPath = `M 0,${height} L ${points} L ${width},${height} Z`;
  const endY = height - ((currentScore - min) / range) * height;

  return (
    <div className="flex flex-col">
      <div className="flex justify-between items-center text-[9px] text-white/40 font-mono uppercase mb-1">
         <span className="flex items-center space-x-1"><Activity className="w-2.5 h-2.5 text-[#3b82f6]" /> <span>Score Trend</span></span>
         <span className="text-[#3b82f6] font-bold">{currentScore} pts</span>
      </div>
      <svg width={width} height={height} className="overflow-visible">
        <defs>
          <linearGradient id={`grad-${entityId}`} x1="0" x2="0" y1="0" y2="1">
             <stop offset="0%" stopColor="#3b82f6" stopOpacity="0.25" />
             <stop offset="100%" stopColor="#3b82f6" stopOpacity="0" />
          </linearGradient>
        </defs>
        <path d={areaPath} fill={`url(#grad-${entityId})`} />
        <path d={`M ${points}`} fill="none" stroke="#3b82f6" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
        <circle cx={width} cy={endY} r="2.5" fill="#15151c" stroke="#3b82f6" strokeWidth="1.5" />
      </svg>
      <div className="flex justify-between items-center text-[8px] text-white/30 font-mono mt-0.5">
        <span>T-4 sessions</span>
        <span>Latest</span>
      </div>
    </div>
  );
};

interface EngagementReviewViewProps {
  entities: EcosystemEntity[];
  onEvidenceApproved: (entityId: string) => void;
  onEvidenceNeeded: (entityId: string) => void;
}

export default function EngagementReviewView({
  entities,
  onEvidenceApproved,
  onEvidenceNeeded
}: EngagementReviewViewProps) {
  const [records, setRecords] = useState<EngagementRecord[]>(SYNTHETIC_ENGAGEMENTS);

  // Status mapping
  const resolveEvidenceStatusColor = (status: EvidenceStatus) => {
    switch (status) {
      case "report_ready": return "bg-emerald-500/10 text-emerald-400 border-emerald-500/30";
      case "human_reviewed": return "bg-blue-500/10 text-blue-450 border-blue-500/30";
      case "needs_evidence": return "bg-red-500/10 text-red-400 border-red-500/30";
      default: return "bg-white/5 text-white/40 border-white/10";
    }
  };

  const handleUpdateStatus = (recordId: string, entityId: string, approved: boolean) => {
    // Local review state
    setRecords(prev => prev.map(rec => {
      if (rec.id === recordId) {
        return {
          ...rec,
          evidenceStatus: approved ? "report_ready" : "needs_evidence"
        } as EngagementRecord;
      }
      return rec;
    }));

    // Parent score & status updates
    if (approved) {
      onEvidenceApproved(entityId);
    } else {
      onEvidenceNeeded(entityId);
    }
  };

  return (
    <div className="space-y-6 select-none animate-fade-in p-6">
      
      {/* View Intro */}
      <div className="bg-[#15151c] border border-white/10 rounded-xl p-5 space-y-2">
        <h2 className="text-sm font-bold font-mono tracking-widest text-[#c5a059] uppercase flex items-center space-x-2">
          <UserCheck className="w-4.5 h-4.5" />
          <span>Ecosystem Engagement & Submission Review</span>
        </h2>
        <p className="text-xs text-white/70 leading-relaxed max-w-2xl">
          Translate incoming notes, events, emails, and researcher attachments into structured pipeline telemetry. Human operators must review notes to approve evidence badges or mark them for immediate follow-up loops.
        </p>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
        
        {/* Main interactive list of records */}
        <div className="xl:col-span-2 space-y-4">
          <h3 className="text-xs font-bold font-mono uppercase tracking-wider text-white/40 pb-1.5 border-b border-white/10">Submissions & Session Records</h3>
          
          <div className="space-y-4">
            {records.map((rec) => {
              const matchedEntity = entities.find(e => e.id === rec.entityId);
              return (
                <div key={rec.id} className="bg-[#15151c]/60 border border-white/10 rounded-xl p-5 space-y-4 hover:border-[#c5a059]/30 transition-all shadow-lg">
                  {/* Row 1: Header */}
                  <div className="flex items-start justify-between">
                    <div className="flex items-start space-x-6">
                      <div className="space-y-1">
                        <span className="flex items-center space-x-1">
                          <span className="text-xs font-bold font-display text-white uppercase">{matchedEntity?.name || "Ref Node"}</span>
                          <span className="text-[10px] text-white/40 font-mono">({rec.owner})</span>
                        </span>
                        <h4 className="text-xs font-semibold text-[#c5a059]">{rec.title}</h4>
                      </div>
                      
                      {matchedEntity && (
                        <div className="hidden sm:block">
                          <Sparkline currentScore={matchedEntity.priorityScore} entityId={matchedEntity.id} />
                          {matchedEntity.evidenceCount > 0 && (
                            <div className="mt-2 flex flex-col space-y-1">
                              <div className="flex justify-between items-center text-[8px] font-mono uppercase text-white/50">
                                <span>Validation Confidence</span>
                                <span>{Math.round((matchedEntity.approvedEvidenceCount / matchedEntity.evidenceCount) * 100)}%</span>
                              </div>
                              <div className="h-1 w-full bg-white/10 rounded-full overflow-hidden">
                                <div 
                                  className="h-full bg-emerald-400" 
                                  style={{ width: `${(matchedEntity.approvedEvidenceCount / matchedEntity.evidenceCount) * 100}%` }}
                                />
                              </div>
                            </div>
                          )}
                        </div>
                      )}
                    </div>
                    <span className={`px-2 py-0.5 rounded text-[9px] font-mono font-bold uppercase border ${resolveEvidenceStatusColor(rec.evidenceStatus)}`}>
                      {rec.evidenceStatus.replace("_", " ")}
                    </span>
                  </div>

                  {/* Mobile-only Sparkline underneath header to prevent squishing */}
                  {matchedEntity && (
                    <div className="block sm:hidden pb-2 mb-2 border-b border-white/5">
                      <Sparkline currentScore={matchedEntity.priorityScore} entityId={matchedEntity.id} />
                      {matchedEntity.evidenceCount > 0 && (
                        <div className="mt-2 flex flex-col space-y-1">
                          <div className="flex justify-between items-center text-[8px] font-mono uppercase text-white/50">
                            <span>Validation Confidence</span>
                            <span>{Math.round((matchedEntity.approvedEvidenceCount / matchedEntity.evidenceCount) * 100)}%</span>
                          </div>
                          <div className="h-1 w-full bg-white/10 rounded-full overflow-hidden">
                            <div 
                              className="h-full bg-emerald-400" 
                              style={{ width: `${(matchedEntity.approvedEvidenceCount / matchedEntity.evidenceCount) * 100}%` }}
                            />
                          </div>
                        </div>
                      )}
                    </div>
                  )}

                  {/* Row 2: Note content */}
                  <p className="text-xs text-white/70 bg-white/5 p-3 rounded border border-white/5 leading-relaxed font-sans">
                    {rec.notes}
                  </p>

                  {/* Follow ups checklist */}
                  {rec.extractedFollowUps.length > 0 && (
                    <div className="space-y-1.5">
                      <span className="text-[10px] font-mono uppercase tracking-wider text-white/40 block font-sans">Extracted Follow-Up Triggers:</span>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-[11px] text-white/70">
                        {rec.extractedFollowUps.map((task, idx) => (
                          <div key={idx} className="flex items-center space-x-1.5 bg-black/40 p-1.5 rounded border border-white/5">
                            <span className="w-1.5 h-1.5 rounded-full bg-[#3b82f6]"></span>
                            <span className="truncate">{task}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Actions buttons */}
                  <div className="pt-3 border-t border-white/5 flex items-center justify-between">
                    <div className="flex items-center space-x-1 text-[10px] text-white/40 font-mono">
                      <Calendar className="w-3.5 h-3.5" />
                      <span>Received: {rec.date}</span>
                    </div>

                    <div className="flex items-center space-x-2">
                      <button
                        onClick={() => handleUpdateStatus(rec.id, rec.entityId, false)}
                        className={`px-3 py-1 text-[10px] font-bold uppercase rounded border tracking-wider flex items-center space-x-1 cursor-pointer transition-all ${
                          rec.evidenceStatus === "needs_evidence"
                            ? "bg-red-500/20 text-red-400 border-red-500/50"
                            : "bg-white/5 hover:bg-white/10 border-white/10 text-white/70"
                        }`}
                      >
                        <XCircle className="w-3.5 h-3.5" />
                        <span>Needs Evidence</span>
                      </button>

                      <button
                        onClick={() => handleUpdateStatus(rec.id, rec.entityId, true)}
                        className={`px-3 py-1 text-[10px] font-bold uppercase rounded border tracking-wider flex items-center space-x-1 cursor-pointer transition-all ${
                          rec.evidenceStatus === "report_ready"
                            ? "bg-emerald-500/20 text-emerald-400 border-emerald-500/50"
                            : "bg-white/5 hover:bg-white/10 border-white/10 text-white/70"
                        }`}
                      >
                        <CheckCircle className="w-3.5 h-3.5" />
                        <span>Approve Badge</span>
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Right sidebar info */}
        <div className="space-y-6">
          <h3 className="text-xs font-bold font-mono uppercase tracking-wider text-white/40 pb-1.5 border-b border-white/10">Review Analytics</h3>
          
          <div className="bg-[#15151c] rounded-lg border border-white/10 p-4 space-y-4">
            <h4 className="text-xs font-bold text-white uppercase tracking-wider font-mono">Review Pipeline Benchmarks</h4>
            
            <div className="space-y-3 text-xs text-white/70">
              <div className="flex items-center justify-between">
                <span>Active reviewer assignment:</span>
                <span className="font-semibold text-white">Hub Coordinator</span>
              </div>
              <div className="flex items-center justify-between">
                <span>Completed audits:</span>
                <span className="font-mono text-emerald-400 font-bold">14 entities</span>
              </div>
              <div className="flex items-center justify-between">
                <span>Average inspection latency:</span>
                <span className="font-mono">1.8 days</span>
              </div>
            </div>

            <div className="p-3 bg-white/5 rounded border border-white/5 text-[10px] text-white/40 leading-relaxed font-sans">
              <strong>Procedural Standard:</strong> Approving submissions triggers automatic score increments. Changing status to "Needs Evidence" flags the associated node on the main Map interface for visual tracking.
            </div>
          </div>

          <div className="bg-[#15151c] rounded-lg border border-white/10 p-4 space-y-4">
            <div className="flex justify-between items-center">
              <h4 className="text-xs font-bold text-white uppercase tracking-wider font-mono">Readiness Projection</h4>
              <TrendingUp className="w-3.5 h-3.5 text-[#3b82f6]" />
            </div>
            <p className="text-[10px] text-white/40 mt-1">Estimated demo readiness projection. For workflow illustration only.</p>
            
            <div className="space-y-3 mt-4">
              {entities
                .filter(e => e.readinessStage !== "prize_ready" && e.readinessStage !== "validated")
                .sort((a,b) => b.priorityScore - a.priorityScore)
                .slice(0, 4)
                .map((entity) => {
                  const required = 6;
                  const current = Math.min(entity.approvedEvidenceCount, required);
                  const remaining = required - current;
                  // synthetic velocity: 1 approval every 1-3 weeks depending on score
                  const weeksPerApproval = Math.max(1, 4 - Math.floor(entity.priorityScore / 25));
                  const estimatedWeeks = remaining * weeksPerApproval;
                  
                  return (
                    <div key={entity.id} className="bg-[#0a0a0c] p-2.5 border border-white/5 rounded">
                      <div className="flex justify-between items-center mb-1">
                        <span className="text-[11px] font-bold text-white truncate w-40" title={entity.name}>{entity.name}</span>
                        <span className="text-[10px] text-[#3b82f6] font-mono whitespace-nowrap">~{estimatedWeeks} weeks</span>
                      </div>
                      <div className="flex justify-between items-center text-[9px] text-white/50 font-mono mb-1.5">
                        <span>{current} / {required} approved</span>
                      </div>
                      <div className="h-1 bg-white/5 rounded-full overflow-hidden">
                        <div className="h-full bg-[#3b82f6]" style={{ width: `${(current/required)*100}%` }}></div>
                      </div>
                    </div>
                  );
                })}
            </div>
          </div>
        </div>

      </div>
    </div>
  );
}
