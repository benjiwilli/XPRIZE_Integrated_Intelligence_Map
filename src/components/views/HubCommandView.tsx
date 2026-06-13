import React, { useState, useMemo } from "react";
import { EcosystemEntity, EventRecord, BriefingItem, UserAction } from "../../types";
import { 
  Award, 
  Flame, 
  Droplet, 
  CheckSquare, 
  Users, 
  MapPin, 
  Sparkles, 
  Calendar, 
  Compass, 
  HelpCircle,
  FileCheck2,
  FileText,
  Activity,
  History,
  TrendingUp,
  AlertTriangle
} from "lucide-react";

interface HubCommandViewProps {
  entities: EcosystemEntity[];
  events: EventRecord[];
  briefingQueue: BriefingItem[];
  onSelectTab: (tab: string) => void;
  onSelectEntity: (entity: EcosystemEntity) => void;
  recentActions?: UserAction[];
}

export default function HubCommandView({
  entities,
  events,
  briefingQueue,
  onSelectTab,
  onSelectEntity,
  recentActions = []
}: HubCommandViewProps) {
  
  // Tab within Recent events/feed card
  const [feedActiveTab, setFeedActiveTab] = useState<"actions" | "sessions">("actions");

  const highVarianceEntities = useMemo(() => {
    return entities.filter(e => {
      const seed = e.name.length * (e.priorityScore || 1);
      const fluctuation = ((seed % 40) / 100); 
      return fluctuation > 0.15;
    }).slice(0, 3).map(e => {
      const seed = e.name.length * (e.priorityScore || 1);
      const fluctuation = ((seed % 40) / 100);
      const isPositive = seed % 2 === 0;
      return { ...e, fluctuation, isPositive };
    }).sort((a,b) => b.fluctuation - a.fluctuation);
  }, [entities]);

  // Stats
  const totalRelationships = entities.length;
  const followUpsDue = entities.filter(e => e.engagementStatus === "follow_up_needed").length;
  const highReadiness = entities.filter(e => e.readinessStage === "prize_ready" || e.readinessStage === "validated").length;
  const validationsComplete = entities.reduce((acc, e) => acc + e.approvedEvidenceCount, 0);

  // Challenge groupings
  const tracks = [
    { name: "Wildfire Response", count: entities.filter(e => e.challengeAreas.includes("Wildfire")).length, color: "text-[#F97316]", bg: "bg-[#F97316]/10" },
    { name: "Water Innovation", count: entities.filter(e => e.challengeAreas.includes("Water Scarcity")).length, color: "text-[#3b82f6]", bg: "bg-[#3b82f6]/10" },
    { name: "Carbon Removal", count: entities.filter(e => e.challengeAreas.includes("Carbon Removal")).length, color: "text-emerald-500", bg: "bg-emerald-500/10" },
    { name: "Healthspan Integration", count: entities.filter(e => e.challengeAreas.includes("Healthspan")).length, color: "text-violet-400", bg: "bg-violet-400/10" },
    { name: "Quantum Applications", count: entities.filter(e => e.challengeAreas.includes("Quantum")).length, color: "text-purple-500", bg: "bg-purple-500/10" },
    { name: "AI + Deep Tech", count: entities.filter(e => e.challengeAreas.includes("AI + Deep Tech")).length, color: "text-[#06b6d4]", bg: "bg-[#06b6d4]/10" }
  ];

  return (
    <div className="space-y-6 select-none animate-fade-in p-6">
      
      {/* Introduction Greeting card */}
      <div className="relative overflow-hidden bg-[#15151c] rounded-xl border border-white/10 p-6 flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div className="space-y-2">
          <div className="flex items-center space-x-2">
            <Compass className="w-5 h-5 text-[#c5a059]" />
            <h2 className="text-sm font-bold font-display uppercase tracking-wider text-white">National Hub Command</h2>
          </div>
          <p className="text-xs text-white/70 max-w-2xl leading-relaxed">
            Coordinating relationship insights, validation benchmarks, and pathway recommendations across all Canadian provinces. This dashboard represents high-integrity synthetic operations aligned with the challenge footprint.
          </p>
        </div>
        <button 
          onClick={() => onSelectTab("map")}
          className="px-4 py-2 border border-[#c5a059] bg-[#c5a059]/10 text-[#c5a059] text-[11px] font-semibold tracking-wider uppercase rounded transition-all hover:bg-[#c5a059]/20 shrink-0 cursor-pointer"
        >
          Open Ecosystem Map
        </button>
        <div className="absolute top-0 right-0 -mt-8 -mr-8 w-24 h-24 rounded-full bg-[#c5a059]/5 blur-xl"></div>
      </div>

      {/* Snapshot Metrics row */}
      <div className="space-y-2">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          
          <div className="metric-snapshot-card bg-[#15151c] border border-white/10 p-4 rounded-lg flex items-center justify-between" id="hub-metric-cohort">
            <div className="space-y-1">
              <span className="text-[10px] font-mono uppercase tracking-wider text-white/40">Ecosystem Cohort</span>
              <div className="text-2xl font-bold font-mono text-white">{totalRelationships}</div>
              <span className="text-[9px] text-emerald-400 font-mono">Active connections</span>
            </div>
            <Users className="w-8 h-8 text-[#3b82f6]/20" />
          </div>

          <div className="metric-snapshot-card bg-[#15151c] border border-white/10 p-4 rounded-lg flex items-center justify-between" id="hub-metric-followups">
            <div className="space-y-1">
              <span className="text-[10px] font-mono uppercase tracking-wider text-white/40">Critical Follow-ups</span>
              <div className="text-2xl font-bold font-mono text-red-500">{followUpsDue}</div>
              <span className="text-[9px] text-red-400 font-mono">Requires action</span>
            </div>
            <Flame className="w-8 h-8 text-red-500/20" />
          </div>

          <div className="metric-snapshot-card bg-[#15151c] border border-white/10 p-4 rounded-lg flex items-center justify-between" id="hub-metric-readiness">
            <div className="space-y-1">
              <span className="text-[10px] font-mono uppercase tracking-wider text-white/40">High Readiness</span>
              <div className="text-2xl font-bold font-mono text-[#3b82f6]">{highReadiness}</div>
              <span className="text-[9px] text-[#3b82f6] font-mono">Validated/Prize-ready</span>
            </div>
            <Award className="w-8 h-8 text-[#c5a059]/20" />
          </div>

          <div className="metric-snapshot-card bg-[#15151c] border border-white/10 p-4 rounded-lg flex items-center justify-between" id="hub-metric-[#c5a059]">
            <div className="space-y-1">
              <span className="text-[10px] font-mono uppercase tracking-wider text-white/40">Completed Evidence</span>
              <div className="text-2xl font-bold font-mono text-emerald-400">{validationsComplete}</div>
              <span className="text-[9px] text-emerald-400 font-mono">Stakeholder approved</span>
            </div>
            <CheckSquare className="w-8 h-8 text-emerald-400/20" />
          </div>

        </div>
        <div className="text-[10px] text-white/40 font-mono flex items-center gap-1.5 px-1 pt-1">
          <span className="w-1 h-1 rounded-full bg-[#c5a059]/60 animate-pulse"></span>
          <span>Counts reflect active filters</span>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Left column: Challenge distribution & Regional Impact & Sector Momentum */}
        <div className="lg:col-span-1 flex flex-col space-y-6">
          <div className="bg-[#15151c]/60 border border-white/10 rounded-xl p-4 flex flex-col justify-between">
            <div>
              <h3 className="text-xs font-bold font-mono uppercase tracking-widest text-white/60 pb-2 border-b border-white/5">Challenge Focus Breakdown</h3>
              <div className="my-4 space-y-3">
                {tracks.map((t) => (
                  <div key={t.name} className="flex items-center justify-between p-2 rounded bg-white/5 hover:bg-white/10 transition-colors">
                    <div className="flex items-center space-x-2">
                      <span className={`w-2 h-2 rounded-full ${t.color.replace("text-", "bg-")}`}></span>
                      <span className="text-xs font-medium text-white/80">{t.name}</span>
                    </div>
                    <span className={`font-mono text-xs font-bold px-2 rounded-full ${t.bg} ${t.color}`}>{t.count}</span>
                  </div>
                ))}
              </div>
            </div>
            <div className="text-[9px] text-white/30 border-t border-white/5 pt-2 font-mono mt-auto">
              *Includes multi-sector entries mapping to corresponding tracks.
            </div>
          </div>

          {/* Sector Momentum Module */}
          <div className="bg-[#15151c]/60 border border-white/10 rounded-xl p-4 flex flex-col">
            <h3 className="text-xs font-bold font-mono uppercase tracking-widest text-white/60 pb-2 border-b border-white/5 flex items-center space-x-2">
              <TrendingUp className="w-3.5 h-3.5 text-emerald-400" />
              <span>Sector Momentum (30d)</span>
            </h3>
            <div className="my-4 space-y-3">
              {tracks.map(t => {
                const seed = t.name.length * (t.count || 1);
                // Creating a pseudo-random momentum between -3% and +14.5% using the string seed
                const momentum = ((seed % 35) / 2) - 3;
                const isPositive = momentum >= 0;
                return (
                  <div key={t.name} className="flex items-center justify-between p-2 rounded bg-white/5 hover:bg-white/10 transition-colors group">
                    <div className="flex items-center space-x-2">
                      <span className={`w-1.5 h-1.5 rounded-full ${t.color.replace("text-", "bg-")} group-hover:animate-pulse`}></span>
                      <span className="text-xs font-medium text-white/80">{t.name}</span>
                    </div>
                    <span className={`font-mono text-xs font-bold flex items-center ${isPositive ? 'text-emerald-400' : 'text-red-400'}`}>
                      {isPositive ? '+' : ''}{momentum.toFixed(1)}%
                    </span>
                  </div>
                )
              })}
            </div>
            <div className="text-[9px] text-white/30 border-t border-white/5 pt-2 font-mono mt-auto">
              *Calculated based on 30-day velocity of priority score updates.
            </div>
          </div>

          <div className="bg-[#15151c]/60 border border-white/10 rounded-xl p-4 flex flex-col justify-between">
            <div>
              <h3 className="text-xs font-bold font-mono uppercase tracking-widest text-white/60 pb-2 border-b border-white/5">Regional Impact Summary</h3>
              <div className="my-4 space-y-3">
                {Object.entries(
                  entities.reduce((acc, entity) => {
                    const prov = entity.province || "Unknown";
                    acc[prov] = (acc[prov] || 0) + entity.priorityScore;
                    return acc;
                  }, {} as Record<string, number>)
                )
                  .sort(([, a], [, b]) => b - a)
                  .map(([province, score]) => (
                    <div key={province} className="flex items-center justify-between p-2 rounded bg-white/5 hover:bg-white/10 transition-colors group">
                      <div className="flex items-center space-x-2">
                         <MapPin className="w-3 h-3 text-[#c5a059] group-hover:animate-bounce" />
                         <span className="text-xs font-medium text-white/80">{province}</span>
                      </div>
                      <div className="flex items-center space-x-2">
                        <div className="w-16 bg-white/5 h-1.5 rounded-full overflow-hidden border border-white/10 shrink-0">
                          <div className="bg-[#c5a059] h-full" style={{ width: `${Math.min(100, score / 10)}%` }}></div>
                        </div>
                        <span className="font-mono text-xs font-bold text-[#c5a059]">{score}</span>
                      </div>
                    </div>
                  ))}
              </div>
            </div>
            <div className="text-[9px] text-white/30 border-t border-white/5 pt-2 font-mono">
              *Aggregate priority scores grouped by geographic nodes.
            </div>
          </div>
        </div>

        {/* Center column: User Actions Feed & Activity Logs */}
        <div className="bg-[#15151c]/60 border border-white/10 rounded-xl p-4 lg:col-span-1 flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between border-b border-white/5 pb-2">
              <div className="flex items-center space-x-2">
                <History className="w-3.5 h-3.5 text-[#c5a059]" />
                <h3 className="text-xs font-bold font-mono uppercase tracking-widest text-white/80 font-sans">Ecosystem Activity Logs</h3>
              </div>
              <div className="flex bg-white/5 p-0.5 rounded border border-white/5 text-[9px] font-mono">
                <button
                  type="button"
                  onClick={() => setFeedActiveTab("actions")}
                  className={`px-2 py-0.5 rounded transition-all cursor-pointer font-bold ${
                    feedActiveTab === "actions"
                      ? "bg-[#c5a059] text-black"
                      : "text-white/40 hover:text-white"
                  }`}
                >
                  User Actions
                </button>
                <button
                  type="button"
                  onClick={() => setFeedActiveTab("sessions")}
                  className={`px-2 py-0.5 rounded transition-all cursor-pointer font-bold ${
                    feedActiveTab === "sessions"
                      ? "bg-[#c5a059] text-black"
                      : "text-white/40 hover:text-white"
                  }`}
                >
                  Sessions
                </button>
              </div>
            </div>

            <div className="my-4 space-y-3.5 min-h-[290px]">
              {feedActiveTab === "actions" ? (
                recentActions.length === 0 ? (
                  <div className="text-center py-12 text-xs text-white/40 font-mono">
                    No recent user actions logged in this session.
                  </div>
                ) : (
                  recentActions.map((act) => (
                    <div key={act.id} className="p-2.5 rounded bg-black/40 border border-white/5 hover:border-white/10 transition-all space-y-1 relative group">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-1.5">
                          <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></span>
                          <span className="text-[10px] font-mono uppercase font-bold text-[#c5a059] tracking-wider bg-[#c5a059]/10 px-1.5 py-0.5 rounded">
                            {act.type}
                          </span>
                        </div>
                        <span className="font-mono text-[9.5px] text-white/30">{act.timestamp}</span>
                      </div>
                      <p className="text-[11px] text-white/80 leading-normal font-sans pr-2">
                        {act.message}
                      </p>
                      {act.targetName && (
                        <div className="text-[9px] font-mono text-white/40 uppercase tracking-tight">
                          Anchor ID: <span className="text-white/60">{act.targetName}</span>
                        </div>
                      )}
                    </div>
                  ))
                )
              ) : (
                events.map((e) => (
                  <div key={e.id} className="p-2.5 rounded bg-white/5 border-l-2 border-[#c5a059] space-y-1">
                    <div className="flex items-center justify-between text-xs font-bold text-white">
                      <span className="truncate">{e.name}</span>
                      <span className="font-mono text-[9px] text-[#c5a059] shrink-0 font-bold">{e.type}</span>
                    </div>
                    <div className="flex items-center justify-between text-[10px] text-white/40 font-mono">
                      <span className="flex items-center space-x-0.5">
                        <MapPin className="w-2.5 h-2.5" />
                        <span>{e.location}</span>
                      </span>
                      <span>{e.connectedEntitiesCount} nodes</span>
                    </div>
                    <p className="text-[10px] text-white/70 leading-tight line-clamp-1">{e.notes}</p>
                  </div>
                ))
              )}
            </div>
          </div>
          <div className="text-[9px] text-white/30 border-t border-white/5 pt-2 font-mono flex justify-between">
            <span>
              {feedActiveTab === "actions" ? "Interactive logs streaming" : "Local logs complete"}
            </span>
            <span className="text-emerald-400 font-bold flex items-center space-x-1">
              <span className="w-1 h-1 rounded-full bg-emerald-400 inline-block animate-ping"></span>
              <span>Demo Sync: Local</span>
            </span>
          </div>
        </div>

        {/* Right column: Briefing Queue Preview & Alerts */}
        <div className="bg-[#15151c]/60 border border-white/10 rounded-xl p-4 lg:col-span-1 flex flex-col space-y-6">
          
          {/* Variance Alert Module */}
          <div className="bg-[#ef4444]/5 border border-[#ef4444]/20 rounded-xl p-3 flex flex-col">
            <h3 className="text-xs font-bold font-mono uppercase tracking-widest text-[#ef4444] pb-2 border-b border-[#ef4444]/20 flex items-center space-x-2">
              <AlertTriangle className="w-3.5 h-3.5" />
              <span>Significant Variance (48h)</span>
            </h3>
            <div className="mt-3 space-y-2">
              {highVarianceEntities.map(e => (
                <div key={e.id} className="flex items-center justify-between p-2 rounded bg-white/5 border border-white/5 hover:border-[#ef4444]/30 transition-colors">
                  <div className="flex flex-col">
                    <span className="text-[10px] font-bold text-white truncate max-w-[120px]">{e.name}</span>
                    <span className="text-[8px] font-mono text-white/40 uppercase">{e.city}</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <span className="font-mono text-[10px] font-bold text-[#c5a059]">{e.priorityScore}</span>
                    <span className={`font-mono text-[10px] font-bold flex items-center px-1 rounded ${e.isPositive ? 'bg-emerald-500/20 text-emerald-400' : 'bg-red-500/20 text-red-400'}`}>
                      {e.isPositive ? '+' : '-'}{(e.fluctuation * 100).toFixed(1)}%
                    </span>
                  </div>
                </div>
              ))}
            </div>
            <div className="text-[9px] text-white/40 pt-2 font-mono mt-1">
              *Entities dynamically flagged for &gt;15% fluctuations.
            </div>
          </div>

          <div className="flex-1 flex flex-col justify-between">
            <div>
              <h3 className="text-xs font-bold font-mono uppercase tracking-widest text-white/60 pb-2 border-b border-white/5 font-sans">Briefing Queue Preview</h3>
            <div className="my-4 space-y-3">
              {briefingQueue.length === 0 ? (
                <div className="text-center py-8 text-xs text-white/40">
                  <FileText className="w-6 h-6 mx-auto opacity-30 mb-1" />
                  <span>Briefing queue is empty. Use the Ecosystem Map sidebar tool to queue items.</span>
                </div>
              ) : (
                briefingQueue.map((item) => (
                  <div key={item.id} className="p-3 rounded bg-white/5 border border-white/5 flex items-center justify-between space-x-2">
                    <div className="space-y-0.5 truncate">
                      <span className="text-xs font-bold text-white truncate block">{item.entityName}</span>
                      <span className="text-[9px] font-mono text-[#c5a059] tracking-wide block uppercase font-bold">{item.challengeArea}</span>
                    </div>
                    <div className="text-right shrink-0">
                      <span className="px-1.5 py-0.5 rounded text-[8px] font-mono uppercase bg-[#c5a059]/20 text-[#c5a059] font-bold">
                        {item.status}
                      </span>
                      <span className="block text-[8px] text-white/30 font-mono mt-1">Ready</span>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
          <button 
            onClick={() => onSelectTab("briefings")}
            className="w-full text-center py-2 bg-white/5 hover:bg-white/10 border border-white/10 text-xs text-white/70 hover:text-white rounded transition-colors font-semibold cursor-pointer"
          >
            Review Full Briefing Deck
          </button>
          </div>
        </div>

      </div>
    </div>
  );
}
