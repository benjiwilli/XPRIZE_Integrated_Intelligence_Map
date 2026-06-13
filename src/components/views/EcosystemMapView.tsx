import React, { useState, useMemo } from "react";
import { 
  EcosystemEntity, 
  RelationshipEdge, 
  MapLens, 
  ChallengeArea, 
  EntityType 
} from "../../types";
import MapFilters from "../map/MapFilters";
import EcosystemMapCanvas from "../map/EcosystemMapCanvas";
import SelectedEntityPanel from "../map/SelectedEntityPanel";
import { 
  BarChart, 
  Flame, 
  Droplet, 
  Award, 
  Layers, 
  Clock, 
  TrendingUp, 
  Compass, 
  Cpu, 
  Search, 
  EyeOff, 
  Sparkles,
  Zap,
  Star,
  Activity,
  Heart,
  X
} from "lucide-react";

interface EcosystemMapViewProps {
  entities: EcosystemEntity[];
  edges: RelationshipEdge[];
  selectedEntity: EcosystemEntity | null;
  onSelectEntity: (entity: EcosystemEntity) => void;
  onAddToBriefingQueue: (entity: EcosystemEntity) => void;
  activeLens: MapLens;
  setActiveLens: (lens: MapLens) => void;
  activeFilters: {
    challengeAreas: ChallengeArea[];
    types: EntityType[];
    statuses: string[];
    readiness: string[];
    owners: string[];
    evidence: string[];
  };
  setFilters: React.Dispatch<React.SetStateAction<any>>;
  onResetFilters: () => void;
}

export default function EcosystemMapView({
  entities,
  edges,
  selectedEntity,
  onSelectEntity,
  onAddToBriefingQueue,
  activeLens,
  setActiveLens,
  activeFilters,
  setFilters,
  onResetFilters
}: EcosystemMapViewProps) {
  
  const [rightPanelTab, setRightPanelTab] = useState<"metrics" | "ranking" | "insights" | "entities">("metrics");
  const [searchQuery, setSearchQuery] = useState("");
  const [isMapPulsing, setIsMapPulsing] = useState(false);
  const [pulseCountdown, setPulseCountdown] = useState(0);

  // States for comparing multi-selected entities
  const [compareEntityIds, setCompareEntityIds] = useState<string[]>([]);
  const [showCompareMode, setShowCompareMode] = useState(false);

  const handleToggleCompare = (id: string) => {
    setCompareEntityIds(prev => (
      prev.includes(id) ? prev.filter(x => x !== id) : [...prev, id]
    ));
  };

  const compareEntities = useMemo(() => {
    return entities.filter(e => compareEntityIds.includes(e.id));
  }, [entities, compareEntityIds]);

  React.useEffect(() => {
    let interval: any;
    if (isMapPulsing && pulseCountdown > 0) {
      interval = setInterval(() => {
        setPulseCountdown((prev) => {
          if (prev <= 1) {
            setIsMapPulsing(false);
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [isMapPulsing, pulseCountdown]);

  const handlePulseMap = () => {
    setIsMapPulsing(true);
    setPulseCountdown(5);
  };

  // Lens buttons list
  const lenses: { id: MapLens; label: string }[] = [
    { id: "all_activity", label: "All Activity" },
    { id: "follow_up_needed", label: "Follow-up Needed" },
    { id: "high_readiness", label: "High-Readiness" },
    { id: "challenge_gaps", label: "Challenge Gaps" },
    { id: "partner_network", label: "Partner Network" },
    { id: "event_aftermath", label: "Event Aftermath" },
    { id: "report_ready_evidence", label: "Report-Ready Evidence" }
  ];

  // Perform fully unified reactive filtering for coordinates, listings, and metric counts
  const filteredEntities = useMemo(() => {
    return entities.filter(e => {
      // 1. Sidebar filters
      if (activeFilters.challengeAreas.length > 0) {
        const matchesChallenge = e.challengeAreas.some(area => activeFilters.challengeAreas.includes(area));
        if (!matchesChallenge) return false;
      }
      if (activeFilters.types.length > 0) {
        if (!activeFilters.types.includes(e.type)) return false;
      }
      if (activeFilters.statuses.length > 0) {
        if (!activeFilters.statuses.includes(e.engagementStatus)) return false;
      }
      if (activeFilters.readiness.length > 0) {
        if (!activeFilters.readiness.includes(e.readinessStage)) return false;
      }
      if (activeFilters.owners.length > 0) {
        if (!activeFilters.owners.includes(e.relationshipOwner)) return false;
      }
      if (activeFilters.evidence.length > 0) {
        if (!activeFilters.evidence.includes(e.evidenceStatus)) return false;
      }
      
      // 2. Map Lens filtering / highlights
      if (activeLens === "follow_up_needed") {
        return e.engagementStatus === "follow_up_needed";
      }
      if (activeLens === "high_readiness") {
        return e.readinessStage === "prize_ready" || e.readinessStage === "validated";
      }
      if (activeLens === "report_ready_evidence") {
        return e.evidenceCount >= 6;
      }
      if (activeLens === "partner_network") {
        return e.type === "partner" || e.type === "funder";
      }

      return true;
    });
  }, [entities, activeFilters, activeLens]);

  // Derived metrics based on filtered set
  const stats = useMemo(() => {
    const totalCount = filteredEntities.length;
    const followUps = filteredEntities.filter(e => e.engagementStatus === "follow_up_needed").length;
    const highReady = filteredEntities.filter(e => e.readinessStage === "prize_ready" || e.readinessStage === "validated").length;
    const reportReady = filteredEntities.filter(e => e.evidenceCount >= 6).length;
    const partnerCount = filteredEntities.filter(e => e.type === "partner" || e.type === "funder").length;

    // Challenge tracks counts
    const tracksCounts = {
      Wildfire: filteredEntities.filter(e => e.challengeAreas.includes("Wildfire")).length,
      Water: filteredEntities.filter(e => e.challengeAreas.includes("Water Scarcity")).length,
      Carbon: filteredEntities.filter(e => e.challengeAreas.includes("Carbon Removal")).length,
      Health: filteredEntities.filter(e => e.challengeAreas.includes("Healthspan")).length,
      Quantum: filteredEntities.filter(e => e.challengeAreas.includes("Quantum")).length,
      DeepTech: filteredEntities.filter(e => e.challengeAreas.includes("AI + Deep Tech")).length
    };

    return {
      totalCount,
      followUps,
      highReady,
      reportReady,
      partnerCount,
      tracksCounts
    };
  }, [filteredEntities]);

  // Derived, real values for the bottom summary strip (no hardcoded counts)
  const bottomSummary = useMemo(() => {
    const trackLabels: Record<string, string> = {
      Wildfire: "Wildfire Response",
      Water: "Water Innovation",
      Carbon: "Carbon Removal",
      Health: "Healthspan",
      Quantum: "Quantum Apps",
      DeepTech: "AI + Deep Tech"
    };
    const topTrack = Object.entries(stats.tracksCounts).reduce(
      (best, [key, count]) => (count > best.count ? { key, count } : best),
      { key: "Water", count: -1 }
    );

    // Most active province across the filtered set
    const provinceCounts: Record<string, number> = {};
    filteredEntities.forEach(e => {
      if (e.province) provinceCounts[e.province] = (provinceCounts[e.province] || 0) + 1;
    });
    const topProvince = Object.entries(provinceCounts).reduce(
      (best, [name, count]) => (count > best.count ? { name, count } : best),
      { name: "—", count: 0 }
    );

    return {
      topClusterLabel: trackLabels[topTrack.key] || "Water Innovation",
      topClusterCount: Math.max(topTrack.count, 0),
      topProvince: topProvince.name,
      topProvinceCount: topProvince.count,
      criticalActions: stats.followUps,
      prizeReady: stats.highReady,
      reportReady: stats.reportReady
    };
  }, [stats, filteredEntities]);

  // Filter entities according to search within the tab
  const searchedEntitiesTab = useMemo(() => {
    if (!searchQuery) return entities;
    const q = searchQuery.toLowerCase();
    return entities.filter(e => e.name.toLowerCase().includes(q) || e.city.toLowerCase().includes(q));
  }, [entities, searchQuery]);

  const hasSelectedFilters = useMemo(() => {
    return (
      activeFilters.challengeAreas.length > 0 ||
      activeFilters.types.length > 0 ||
      activeFilters.statuses.length > 0 ||
      activeFilters.readiness.length > 0 ||
      activeFilters.owners.length > 0 ||
      activeFilters.evidence.length > 0
    );
  }, [activeFilters]);

  return (
    <div className="flex flex-col xl:flex-row flex-grow h-full overflow-hidden select-none animate-fade-in bg-[#0a0a0c]">
      
      {/* 3. Left Filter Sidebar */}
      <MapFilters
        entities={entities}
        activeFilters={activeFilters}
        setFilters={setFilters}
        onResetFilters={onResetFilters}
      />

      {/* Center Zone + Bottom Summary strip */}
      <div className="flex-grow flex flex-col p-4 space-y-4 overflow-y-auto">
        
        {/* Horizontal Opportunity Lens bar near map Controls */}
        <div className="map-controls-panel bg-gradient-to-b from-[#16161e] to-[#101015] border border-white/[0.08] p-2 rounded-xl flex flex-wrap items-center gap-1 shadow-[0_4px_24px_-12px_rgba(0,0,0,0.8)]">
          <span className="flex items-center gap-1.5 text-[9px] font-mono uppercase tracking-[0.16em] text-white/45 font-bold px-2 py-1 shrink-0">
            <Compass className="w-3.5 h-3.5 text-[#c5a059]" />
            Ecosystem Lens
          </span>
          <div className="w-px h-5 bg-white/10 mx-0.5 shrink-0"></div>
          {lenses.map((lens) => (
            <button
              key={lens.id}
              onClick={() => setActiveLens(lens.id)}
              className={`px-3 py-1 text-[11px] font-semibold tracking-wide rounded border transition-all cursor-pointer flex items-center space-x-1.5 ${
                activeLens === lens.id
                  ? "bg-[#c5a059]/20 border-[#c5a059]/60 text-[#c5a059] shadow-[0_0_8px_rgba(197,160,89,0.1)]"
                  : "bg-transparent hover:bg-white/5 border-transparent text-white/60 hover:text-white"
              }`}
            >
              {activeLens === lens.id && (
                <span className="w-1.5 h-1.5 rounded-full bg-[#c5a059] inline-block animate-pulse shrink-0"></span>
              )}
              <span>{lens.label}</span>
            </button>
          ))}

          {hasSelectedFilters && (
            <button
              onClick={onResetFilters}
              id="clear-filters-chip"
              className="px-2.5 py-1 bg-red-500/10 hover:bg-red-500/20 text-red-400 border border-red-500/20 text-[10px] font-mono uppercase tracking-wider rounded-full flex items-center space-x-1 transition-all cursor-pointer hover:shadow-lg hover:shadow-red-500/5 animate-fade-in"
            >
              <span className="w-1.5 h-1.5 rounded-full bg-red-400 shrink-0"></span>
              <span>Clear Filters</span>
              <span className="text-[9.5px] opacity-70 ml-0.5 font-bold leading-none">×</span>
            </button>
          )}

          <div className="w-px h-5 bg-white/10 mx-1 shrink-0"></div>

          {compareEntityIds.length >= 1 && (
            <button
              type="button"
              onClick={() => {
                setShowCompareMode(!showCompareMode);
              }}
              className={`px-3 py-1 text-[11px] font-bold tracking-wide rounded border transition-all cursor-pointer flex items-center space-x-1.5 ${
                showCompareMode
                  ? "bg-[#c5a059] border-[#c5a059] text-black"
                  : "bg-[#c5a059]/20 hover:bg-[#c5a059]/30 border-[#c5a059]/50 text-[#c5a059]"
              }`}
              title="Compare multi-selected nodes side-by-side"
            >
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 inline-block animate-pulse"></span>
              <span>Compare ({compareEntityIds.length})</span>
            </button>
          )}
          
          <button
            type="button"
            onClick={handlePulseMap}
            disabled={isMapPulsing}
            className={`md:ml-auto px-3 py-1 text-[11px] font-bold tracking-wide rounded border transition-all cursor-pointer flex items-center space-x-1.5 ${
              isMapPulsing
                ? "bg-amber-500/20 border-amber-500/60 text-amber-500 animate-pulse cursor-not-allowed"
                : "bg-[#c5a059] hover:bg-[#c5a059]/95 border-[#c5a059] text-black shadow-md hover:shadow-lg"
            }`}
          >
            <Zap className={`w-3.5 h-3.5 ${isMapPulsing ? "animate-bounce" : ""}`} />
            <span>{isMapPulsing ? `Pulsing density (${pulseCountdown}s)` : "Pulse Map density"}</span>
          </button>
        </div>

        {/* Selected Filter Chips */}
        {(activeFilters.challengeAreas.length > 0 || activeFilters.types.length > 0 || activeFilters.statuses.length > 0 || activeFilters.readiness.length > 0 || activeFilters.owners.length > 0 || activeFilters.evidence.length > 0) && (
          <div className="flex flex-wrap items-center gap-2 mt-2 mb-1">
            <span className="text-[10px] text-white/40 font-mono uppercase mr-1">Active Filters:</span>
            
            {activeFilters.challengeAreas.map(filter => (
              <span key={filter} className="flex items-center space-x-1 bg-[#15151c] text-white/80 border border-white/10 px-2 py-0.5 rounded text-[10px] font-mono">
                <span>{filter}</span>
                <button 
                  onClick={() => setFilters((prev: any) => ({ ...prev, challengeAreas: prev.challengeAreas.filter((item: any) => item !== filter) })) }
                  className="hover:text-red-400 text-white/50 cursor-pointer transition-colors pt-0.5"
                >
                  <X className="w-3 h-3" />
                </button>
              </span>
            ))}
            
            {activeFilters.types.map(filter => (
              <span key={filter} className="flex items-center space-x-1 bg-[#15151c] text-white/80 border border-white/10 px-2 py-0.5 rounded text-[10px] font-mono">
                <span className="capitalize">{filter.replace("_", " ")}</span>
                <button 
                  onClick={() => setFilters((prev: any) => ({ ...prev, types: prev.types.filter((item: any) => item !== filter) })) }
                  className="hover:text-red-400 text-white/50 cursor-pointer transition-colors pt-0.5"
                >
                  <X className="w-3 h-3" />
                </button>
              </span>
            ))}
            
            {activeFilters.statuses.map(filter => (
              <span key={filter} className="flex items-center space-x-1 bg-[#15151c] text-white/80 border border-white/10 px-2 py-0.5 rounded text-[10px] font-mono">
                <span className="capitalize">{filter.replace("_", " ")}</span>
                <button 
                  onClick={() => setFilters((prev: any) => ({ ...prev, statuses: prev.statuses.filter((item: any) => item !== filter) })) }
                  className="hover:text-red-400 text-white/50 cursor-pointer transition-colors pt-0.5"
                >
                  <X className="w-3 h-3" />
                </button>
              </span>
            ))}
            
            {activeFilters.readiness.map(filter => (
              <span key={filter} className="flex items-center space-x-1 bg-[#15151c] text-white/80 border border-white/10 px-2 py-0.5 rounded text-[10px] font-mono">
                <span className="capitalize">{filter.replace("_", " ")}</span>
                <button 
                  onClick={() => setFilters((prev: any) => ({ ...prev, readiness: prev.readiness.filter((item: any) => item !== filter) })) }
                  className="hover:text-red-400 text-white/50 cursor-pointer transition-colors pt-0.5"
                >
                  <X className="w-3 h-3" />
                </button>
              </span>
            ))}

            {activeFilters.owners.map(filter => (
              <span key={filter} className="flex items-center space-x-1 bg-[#15151c] text-white/80 border border-white/10 px-2 py-0.5 rounded text-[10px] font-mono">
                <span className="capitalize">{filter.replace("_", " ")}</span>
                <button 
                  onClick={() => setFilters((prev: any) => ({ ...prev, owners: prev.owners.filter((item: any) => item !== filter) })) }
                  className="hover:text-red-400 text-white/50 cursor-pointer transition-colors pt-0.5"
                >
                  <X className="w-3 h-3" />
                </button>
              </span>
            ))}
            
            {activeFilters.evidence.map(filter => (
              <span key={filter} className="flex items-center space-x-1 bg-[#15151c] text-white/80 border border-white/10 px-2 py-0.5 rounded text-[10px] font-mono">
                <span className="capitalize">{filter.replace("_", " ")}</span>
                <button 
                  onClick={() => setFilters((prev: any) => ({ ...prev, evidence: prev.evidence.filter((item: any) => item !== filter) })) }
                  className="hover:text-red-400 text-white/50 cursor-pointer transition-colors pt-0.5"
                >
                  <X className="w-3 h-3" />
                </button>
              </span>
            ))}
            
            <button 
               onClick={onResetFilters} 
               className="text-[10px] font-mono text-red-400 hover:text-red-300 ml-2 cursor-pointer transition-colors uppercase font-bold tracking-wider"
            >
               Clear All
            </button>
          </div>
        )}

        {/* 4. Center Map Canvas OR Strategic Comparative Analytical Matrix */}
        {showCompareMode ? (
          <div className="flex-grow bg-[#0e0e12] border border-[#c5a059]/30 rounded-xl p-5 flex flex-col space-y-4 min-h-[500px] animate-fade-in relative shadow-lg">
            <div className="flex justify-between items-center border-b border-white/10 pb-3">
              <div>
                <h3 className="text-sm font-bold text-white uppercase tracking-wider font-mono flex items-center space-x-2">
                  <span className="w-2.5 h-2.5 rounded bg-amber-500 animate-pulse"></span>
                  <span>Ecosystem Comparative Analytical Matrix</span>
                </h3>
                <p className="text-[10px] text-white/50 font-mono mt-0.5">
                  Side-by-side benchmarking of relative priority weights, technical readiness stages, and verification parameters.
                </p>
              </div>
              
              <div className="flex space-x-2">
                <button
                  type="button"
                  onClick={() => {
                    setCompareEntityIds([]);
                    setShowCompareMode(false);
                  }}
                  className="px-3 py-1.25 border border-white/10 hover:border-white/20 text-white/65 hover:text-white text-[10px] font-mono uppercase tracking-wide rounded cursor-pointer transition-colors"
                >
                  Clear Selection
                </button>
                <button
                  type="button"
                  onClick={() => setShowCompareMode(false)}
                  className="px-3 py-1.25 bg-[#c5a059]/15 hover:bg-[#c5a059]/25 text-[#c5a059] border border-[#c5a059]/30 text-[10px] font-mono uppercase tracking-wide rounded cursor-pointer font-bold transition-all"
                >
                  Return to Map View
                </button>
              </div>
            </div>

            {compareEntities.length === 0 ? (
              <div className="flex-grow flex flex-col items-center justify-center text-center py-24 space-y-3">
                <Layers className="w-12 h-12 text-[#c5a059]/30 animate-pulse" />
                <div>
                  <span className="text-sm font-bold text-white block">No nodes registered for comparison</span>
                  <span className="text-xs text-white/55 max-w-sm block mt-1">
                    Please checklist nodes in the "Ecosystem Directory" tab, leader ranking tab, or select nodes directly on the map.
                  </span>
                </div>
              </div>
            ) : (
              <div className="flex-grow overflow-x-auto">
                <table className="w-full text-left border-collapse min-w-[700px] text-xs">
                  <thead>
                    <tr className="border-b border-white/10">
                      <th className="p-3 text-[10px] uppercase font-mono tracking-wider text-white/40 w-1/5">Comparative Metrics</th>
                      {compareEntities.map((ent) => (
                        <th key={ent.id} className="p-3 w-1/5 border-l border-white/5 bg-white/[0.01]">
                          <div className="flex items-start justify-between">
                            <div className="truncate flex-grow">
                              <span className="font-extrabold text-[#c5a059] text-xs block uppercase truncate hover:text-[#c5a059]/90" title={ent.name}>
                                {ent.name}
                              </span>
                              <span className="text-[10px] text-white/40 block font-mono">{ent.city}, {ent.province}</span>
                            </div>
                            <button
                              type="button"
                              onClick={() => handleToggleCompare(ent.id)}
                              className="text-white/30 hover:text-red-400 text-xs font-bold p-1 cursor-pointer transition-colors shrink-0"
                              title="Discard from comparison matrix"
                            >
                              ✕
                            </button>
                          </div>
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    <tr className="border-b border-white/5 bg-white/[0.01] hover:bg-white/[0.03] transition-colors">
                      <td className="p-3 font-mono font-bold text-white/60">Challenge Track</td>
                      {compareEntities.map((ent) => (
                        <td key={ent.id} className="p-3 border-l border-white/5 bg-white/[0.01]">
                          <div className="flex flex-wrap gap-1">
                            {ent.challengeAreas.map((area) => (
                              <span key={area} className="px-1.5 py-0.5 rounded text-[8.5px] font-mono uppercase bg-[#c5a059]/10 text-[#c5a059] border border-[#c5a059]/10 font-bold">
                                {area}
                              </span>
                            ))}
                          </div>
                        </td>
                      ))}
                    </tr>
                    <tr className="border-b border-white/5 hover:bg-white/[0.03] transition-colors">
                      <td className="p-3 font-mono font-bold text-white/60">Priority Weighting</td>
                      {compareEntities.map((ent) => (
                        <td key={ent.id} className="p-3 border-l border-white/5 bg-white/[0.01]">
                          <div className="flex items-center space-x-2">
                            <span className="font-mono text-xs font-extrabold text-[#c5a059] bg-[#c5a059]/10 px-1.5 py-0.5 rounded">
                              {ent.priorityScore}
                            </span>
                            <div className="w-16 bg-white/5 h-1.5 rounded-full overflow-hidden border border-white/10 shrink-0">
                              <div className="bg-[#c5a059] h-full" style={{ width: `${ent.priorityScore}%` }}></div>
                            </div>
                          </div>
                        </td>
                      ))}
                    </tr>
                    <tr className="border-b border-white/5 bg-white/[0.01] hover:bg-white/[0.03] transition-colors">
                      <td className="p-3 font-mono font-bold text-white/60">Readiness Stage</td>
                      {compareEntities.map((ent) => (
                        <td key={ent.id} className="p-3 border-l border-white/5 bg-white/[0.01] capitalize font-mono text-[#3b82f6] font-bold">
                          {ent.readinessStage}
                        </td>
                      ))}
                    </tr>
                    <tr className="border-b border-white/5 hover:bg-white/[0.03] transition-colors">
                      <td className="p-3 font-mono font-bold text-white/60">Evidence Count</td>
                      {compareEntities.map((ent) => (
                        <td key={ent.id} className="p-3 border-l border-white/5 bg-white/[0.01] font-mono text-emerald-400 font-bold">
                          {ent.approvedEvidenceCount} / {ent.evidenceCount}
                          <span className="text-[9px] text-white/30 font-normal ml-1">approved</span>
                        </td>
                      ))}
                    </tr>
                    <tr className="border-b border-white/5 bg-white/[0.01] hover:bg-white/[0.03] transition-colors">
                      <td className="p-3 font-mono font-bold text-white/60">Engagement Status</td>
                      {compareEntities.map((ent) => (
                        <td key={ent.id} className="p-3 border-l border-white/5 bg-white/[0.01]">
                          <span className={`px-2 py-0.5 rounded text-[9px] font-mono uppercase font-semibold border ${
                            ent.engagementStatus === 'qualified' ? 'bg-emerald-500/15 text-emerald-400 border-emerald-500/20' :
                            ent.engagementStatus === 'follow_up_needed' ? 'bg-red-500/15 text-red-400 border-red-500/20' :
                            'bg-[#c5a059]/15 text-[#c5a059] border-[#c5a059]/20'
                          }`}>
                            {ent.engagementStatus.replace("_", " ")}
                          </span>
                        </td>
                      ))}
                    </tr>
                    <tr className="border-b border-white/5 hover:bg-white/[0.03] transition-colors">
                      <td className="p-3 font-mono font-bold text-white/60">Relationship Owner</td>
                      {compareEntities.map((ent) => (
                        <td key={ent.id} className="p-3 border-l border-white/5 bg-white/[0.01] text-white/80 font-mono">
                          {ent.relationshipOwner}
                        </td>
                      ))}
                    </tr>
                    <tr className="hover:bg-white/[0.03] transition-colors">
                      <td className="p-3 font-mono font-bold text-white/60">Summary Profile</td>
                      {compareEntities.map((ent) => (
                        <td key={ent.id} className="p-3 border-l border-white/5 bg-white/[0.01] text-[10px] text-white/60 italic leading-relaxed max-w-[220px]">
                          {ent.summary}
                        </td>
                      ))}
                    </tr>
                  </tbody>
                </table>
              </div>
            )}
          </div>
        ) : (
          <EcosystemMapCanvas
            entities={filteredEntities}
            edges={edges}
            selectedEntity={selectedEntity}
            onSelectEntity={onSelectEntity}
            activeLens={activeLens}
            activeFilters={activeFilters}
            isMapPulsing={isMapPulsing}
            onAddToBriefingQueue={onAddToBriefingQueue}
            onResetFilters={onResetFilters}
          />
        )}

        {/* 6. Bottom summary strip — live derived intelligence */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">

          {/* Top Cluster */}
          <div className="group relative overflow-hidden bg-gradient-to-b from-[#16161e] to-[#101015] p-3.5 rounded-xl border border-white/[0.07] flex items-center gap-3 transition-all duration-200 hover:border-[#3b82f6]/30 hover:shadow-[0_8px_28px_-12px_rgba(59,130,246,0.45)]">
            <span className="absolute left-0 top-0 h-full w-[3px] bg-[#3b82f6]/70"></span>
            <div className="p-2.5 rounded-lg bg-[#3b82f6]/10 text-[#3b82f6] ring-1 ring-inset ring-[#3b82f6]/20 shrink-0 transition-transform duration-200 group-hover:scale-105">
              <Droplet className="w-4 h-4" />
            </div>
            <div className="min-w-0">
              <span className="text-[8px] font-mono text-white/40 uppercase tracking-[0.14em] block">Top Cluster</span>
              <span className="text-sm font-bold text-white block truncate leading-tight">{bottomSummary.topClusterLabel}</span>
              <span className="text-[10px] text-[#3b82f6] font-mono font-semibold flex items-center gap-1">
                <span className="tabular-nums">{bottomSummary.topClusterCount}</span> entities active
              </span>
            </div>
          </div>

          {/* Active Region */}
          <div className="group relative overflow-hidden bg-gradient-to-b from-[#16161e] to-[#101015] p-3.5 rounded-xl border border-white/[0.07] flex items-center gap-3 transition-all duration-200 hover:border-[#c5a059]/30 hover:shadow-[0_8px_28px_-12px_rgba(197,160,89,0.45)]">
            <span className="absolute left-0 top-0 h-full w-[3px] bg-[#c5a059]/70"></span>
            <div className="p-2.5 rounded-lg bg-[#c5a059]/10 text-[#c5a059] ring-1 ring-inset ring-[#c5a059]/20 shrink-0 transition-transform duration-200 group-hover:scale-105">
              <Compass className="w-4 h-4" />
            </div>
            <div className="min-w-0">
              <span className="text-[8px] font-mono text-white/40 uppercase tracking-[0.14em] block">Most Active Region</span>
              <span className="text-sm font-bold text-white block truncate leading-tight">{bottomSummary.topProvince}</span>
              <span className="text-[10px] text-[#c5a059] font-mono font-semibold">
                <span className="tabular-nums">{bottomSummary.topProvinceCount}</span> entities synchronized
              </span>
            </div>
          </div>

          {/* Critical Action */}
          <div className="group relative overflow-hidden bg-gradient-to-b from-[#1a1316] to-[#101015] p-3.5 rounded-xl border border-red-500/15 flex items-center gap-3 transition-all duration-200 hover:border-red-500/40 hover:shadow-[0_8px_28px_-12px_rgba(239,68,68,0.5)]">
            <span className="absolute left-0 top-0 h-full w-[3px] bg-red-500/80 animate-pulse"></span>
            <div className="p-2.5 rounded-lg bg-red-500/10 text-red-400 ring-1 ring-inset ring-red-500/25 shrink-0 transition-transform duration-200 group-hover:scale-105">
              <Flame className="w-4 h-4" />
            </div>
            <div className="min-w-0">
              <span className="text-[8px] font-mono text-white/40 uppercase tracking-[0.14em] block">Action Priority</span>
              <span className="text-sm font-bold text-red-400 block uppercase leading-tight">Critical Action</span>
              <span className="text-[10px] text-red-400 font-mono font-semibold">
                <span className="tabular-nums">{bottomSummary.criticalActions}</span> require response
              </span>
            </div>
          </div>

          {/* Prize Readiness */}
          <div className="group relative overflow-hidden bg-gradient-to-b from-[#16161e] to-[#101015] p-3.5 rounded-xl border border-white/[0.07] flex items-center gap-3 transition-all duration-200 hover:border-emerald-500/30 hover:shadow-[0_8px_28px_-12px_rgba(16,185,129,0.45)]">
            <span className="absolute left-0 top-0 h-full w-[3px] bg-emerald-500/70"></span>
            <div className="p-2.5 rounded-lg bg-emerald-500/10 text-emerald-400 ring-1 ring-inset ring-emerald-500/20 shrink-0 transition-transform duration-200 group-hover:scale-105">
              <Award className="w-4 h-4" />
            </div>
            <div className="min-w-0">
              <span className="text-[8px] font-mono text-white/40 uppercase tracking-[0.14em] block">Validation Stage</span>
              <span className="text-sm font-bold text-white block leading-tight">Prize Readiness</span>
              <span className="text-[10px] text-emerald-400 font-mono font-semibold">
                <span className="tabular-nums">{bottomSummary.prizeReady}</span> high-readiness teams
              </span>
            </div>
          </div>

        </div>

      </div>

      {/* 5. Right Metrics and selected-entity insight panel */}
      <div className="w-full xl:w-[380px] shrink-0 bg-gradient-to-b from-[#0e0e12] to-[#0a0a0c] border-l border-white/10 p-4 overflow-y-auto space-y-4">

        {/* Panel heading */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="w-1.5 h-1.5 rounded-full bg-[#c5a059] shadow-[0_0_8px_rgba(197,160,89,0.6)] animate-pulse"></span>
            <h2 className="text-[11px] font-bold font-mono tracking-[0.18em] text-white uppercase">Intelligence</h2>
          </div>
          <span className="text-[9px] font-mono text-white/35 uppercase tracking-wider">Live</span>
        </div>

        {/* Metric tabs */}
        <div className="flex bg-[#0a0a0c] border border-white/[0.07] rounded-lg p-1 select-none font-mono text-[10px] font-bold tracking-wider uppercase">
          {(["metrics", "ranking", "insights", "entities"] as const).map(tab => (
            <button
              key={tab}
              onClick={() => setRightPanelTab(tab)}
              className={`flex-grow text-center py-1.5 rounded-md transition-all cursor-pointer ${
                rightPanelTab === tab
                  ? "bg-[#c5a059]/15 text-[#c5a059] shadow-[inset_0_0_0_1px_rgba(197,160,89,0.3)]"
                  : "text-white/40 hover:text-white/75 hover:bg-white/[0.03]"
              }`}
            >
              {tab}
            </button>
          ))}
        </div>

        {/* METRICS Selected Tab Content */}
        {rightPanelTab === "metrics" && (
          <div className="space-y-4">
            
            {/* Main snapshot card */}
            <div className="bg-[#15151c] border border-white/10 p-4 rounded-lg relative overflow-hidden">
              <div className="space-y-1 relative z-10">
                <span className="text-[9px] font-mono uppercase tracking-wider text-white/40 font-bold block">
                  Canada Hub Snapshot — Active Lens
                </span>
                
                {/* Large indicator number */}
                <div className="flex items-baseline space-x-1">
                  <span className="text-4xl font-extrabold font-mono text-white tracking-tighter">
                    {stats.totalCount}
                  </span>
                  <span className="text-[10px] text-white/40 font-mono uppercase">Nodes</span>
                </div>
                
                <span className="text-xs font-semibold text-white/70 block">
                  Active ecosystem relationships
                </span>
                <p className="text-[10px] text-white/30 mt-1 leading-normal italic">
                  Synthetic data — structured from events, outreach, and relationship memory
                </p>
                
                {/* Visual mini SVG sparkline matching mockup */}
                <div className="h-6 w-full mt-2 opacity-80 border-t border-dashed border-white/5 pt-2 flex items-center justify-between">
                  <span className="text-[9px] text-white/50 font-mono font-bold tracking-wider">Sync Trend:</span>
                  <svg className="w-24 h-4 stroke-[#3b82f6] stroke-2 fill-none overflow-visible">
                    <path d="M 0 10 Q 15 2, 30 14 T 60 4 T 90 12" />
                  </svg>
                </div>
              </div>
              <div className="absolute top-0 right-0 -mt-6 -mr-6 w-20 h-20 rounded-full bg-[#3b82f6]/5 blur-lg"></div>
            </div>

            {/* Metric cards grid */}
            <div className="space-y-2">
              <div className="grid grid-cols-2 gap-3 select-none">

                <div className="metric-snapshot-card group relative overflow-hidden bg-[#0a0a0c] border border-white/[0.07] p-3 rounded-lg text-xs space-y-1 transition-colors hover:border-red-500/30" id="side-metric-followups">
                  <span className="absolute right-2 top-2 w-1.5 h-1.5 rounded-full bg-red-500/70"></span>
                  <span className="text-[9px] text-white/40 font-mono uppercase tracking-wider block">Follow-ups Due</span>
                  <span className="text-2xl font-bold font-mono text-white block tabular-nums leading-none">{stats.followUps}</span>
                  <span className="text-[8px] text-red-400 font-mono block uppercase tracking-wide">Action overdue</span>
                </div>

                <div className="metric-snapshot-card group relative overflow-hidden bg-[#0a0a0c] border border-white/[0.07] p-3 rounded-lg text-xs space-y-1 transition-colors hover:border-emerald-500/30" id="side-metric-readiness">
                  <span className="absolute right-2 top-2 w-1.5 h-1.5 rounded-full bg-emerald-500/70"></span>
                  <span className="text-[9px] text-white/40 font-mono uppercase tracking-wider block">High Readiness</span>
                  <span className="text-2xl font-bold font-mono text-white block tabular-nums leading-none">{stats.highReady}</span>
                  <span className="text-[8px] text-emerald-400 font-mono block uppercase tracking-wide">Prize candidate</span>
                </div>

                <div className="metric-snapshot-card group relative overflow-hidden bg-[#0a0a0c] border border-white/[0.07] p-3 rounded-lg text-xs space-y-1 transition-colors hover:border-[#3b82f6]/30" id="side-metric-evidence">
                  <span className="absolute right-2 top-2 w-1.5 h-1.5 rounded-full bg-[#3b82f6]/70"></span>
                  <span className="text-[9px] text-white/40 font-mono uppercase tracking-wider block">Evidence Badge</span>
                  <span className="text-2xl font-bold font-mono text-white block tabular-nums leading-none">{stats.reportReady}</span>
                  <span className="text-[8px] text-[#3b82f6] font-mono block uppercase tracking-wide">Report-ready</span>
                </div>

                <div className="metric-snapshot-card group relative overflow-hidden bg-[#0a0a0c] border border-white/[0.07] p-3 rounded-lg text-xs space-y-1 transition-colors hover:border-purple-500/30" id="side-metric-partners">
                  <span className="absolute right-2 top-2 w-1.5 h-1.5 rounded-full bg-purple-500/70"></span>
                  <span className="text-[9px] text-white/40 font-mono uppercase tracking-wider block">Partners Synced</span>
                  <span className="text-2xl font-bold font-mono text-white block tabular-nums leading-none">{stats.partnerCount}</span>
                  <span className="text-[8px] text-purple-400 font-mono block uppercase tracking-wide">Syncing network</span>
                </div>

              </div>
              <div className="text-[9px] text-white/40 font-mono flex items-center gap-1.5 px-0.5 pt-0.5">
                <span className="w-1 h-1 rounded-full bg-[#c5a059]/60 animate-pulse"></span>
                <span>Counts reflect active filters</span>
              </div>
            </div>

            {/* Challenge Coverage tracking cards */}
            <div className="bg-[#0a0a0c] border border-white/5 p-3 rounded-lg space-y-3">
              <h4 className="text-[9px] font-mono uppercase tracking-wider text-white/45 font-bold pb-1.5 border-b border-white/5">Challenge Coverage</h4>
              
              <div className="space-y-2 text-[11px]">
                
                 {/* Wildfire */}
                <div className="space-y-1">
                  <div className="flex justify-between font-mono text-[9.5px]">
                    <span className="text-[#F97316] font-bold uppercase">Wildfire Response</span>
                    <span className="font-semibold text-white">{stats.totalCount > 0 ? Math.round((stats.tracksCounts.Wildfire / stats.totalCount) * 100) : 0}%</span>
                  </div>
                  <div className="h-1.5 bg-white/[0.06] rounded-full overflow-hidden">
                    <div className="h-full bg-[#F97316] rounded-full" style={{ width: `${stats.totalCount > 0 ? Math.round((stats.tracksCounts.Wildfire / stats.totalCount) * 100) : 0}%` }}></div>
                  </div>
                </div>

                {/* Water Scarcity */}
                <div className="space-y-1">
                  <div className="flex justify-between font-mono text-[9.5px]">
                    <span className="text-[#3b82f6] font-bold uppercase">Water Scarcity</span>
                    <span className="font-semibold text-white">{stats.totalCount > 0 ? Math.round((stats.tracksCounts.Water / stats.totalCount) * 100) : 0}%</span>
                  </div>
                  <div className="h-1.5 bg-white/[0.06] rounded-full overflow-hidden">
                    <div className="h-full bg-[#3b82f6] rounded-full" style={{ width: `${stats.totalCount > 0 ? Math.round((stats.tracksCounts.Water / stats.totalCount) * 100) : 0}%` }}></div>
                  </div>
                </div>

                {/* Carbon Removal */}
                <div className="space-y-1">
                  <div className="flex justify-between font-mono text-[9.5px]">
                    <span className="text-emerald-500 font-bold uppercase">Carbon Removal</span>
                    <span className="font-semibold text-white">{stats.totalCount > 0 ? Math.round((stats.tracksCounts.Carbon / stats.totalCount) * 100) : 0}%</span>
                  </div>
                  <div className="h-1.5 bg-white/[0.06] rounded-full overflow-hidden">
                    <div className="h-full bg-emerald-500 rounded-full" style={{ width: `${stats.totalCount > 0 ? Math.round((stats.tracksCounts.Carbon / stats.totalCount) * 100) : 0}%` }}></div>
                  </div>
                </div>

                {/* Healthspan */}
                <div className="space-y-1">
                  <div className="flex justify-between font-mono text-[9.5px]">
                    <span className="text-violet-400 font-bold uppercase">Healthspan Integration</span>
                    <span className="font-semibold text-white">{stats.totalCount > 0 ? Math.round((stats.tracksCounts.Health / stats.totalCount) * 100) : 0}%</span>
                  </div>
                  <div className="h-1.5 bg-white/[0.06] rounded-full overflow-hidden">
                    <div className="h-full bg-violet-400 rounded-full" style={{ width: `${stats.totalCount > 0 ? Math.round((stats.tracksCounts.Health / stats.totalCount) * 100) : 0}%` }}></div>
                  </div>
                </div>

                {/* Quantum */}
                <div className="space-y-1">
                  <div className="flex justify-between font-mono text-[9.5px]">
                    <span className="text-purple-500 font-bold uppercase">Quantum Apps</span>
                    <span className="font-semibold text-white">{stats.totalCount > 0 ? Math.round((stats.tracksCounts.Quantum / stats.totalCount) * 100) : 0}%</span>
                  </div>
                  <div className="h-1.5 bg-white/[0.06] rounded-full overflow-hidden">
                    <div className="h-full bg-purple-500 rounded-full" style={{ width: `${stats.totalCount > 0 ? Math.round((stats.tracksCounts.Quantum / stats.totalCount) * 100) : 0}%` }}></div>
                  </div>
                </div>

                {/* Deep Tech */}
                <div className="space-y-1">
                  <div className="flex justify-between font-mono text-[9.5px]">
                    <span className="text-[#06b6d4] font-bold uppercase">AI + Deep Tech</span>
                    <span className="font-semibold text-white">{stats.totalCount > 0 ? Math.round((stats.tracksCounts.DeepTech / stats.totalCount) * 100) : 0}%</span>
                  </div>
                  <div className="h-1.5 bg-white/[0.06] rounded-full overflow-hidden">
                    <div className="h-full bg-[#06b6d4] rounded-full" style={{ width: `${stats.totalCount > 0 ? Math.round((stats.tracksCounts.DeepTech / stats.totalCount) * 100) : 0}%` }}></div>
                  </div>
                </div>

              </div>
              <p className="text-[10px] text-white/30 italic font-mono pt-2 border-t border-white/5">Counts reflect active filters and selected lens.</p>
            </div>

            {/* Selected Node Panel */}
            <SelectedEntityPanel
              entity={selectedEntity}
              allEntities={entities}
              onAddToBriefingQueue={onAddToBriefingQueue}
              isComparing={selectedEntity ? compareEntityIds.includes(selectedEntity.id) : false}
              onToggleCompare={selectedEntity ? () => handleToggleCompare(selectedEntity.id) : undefined}
            />

          </div>
        )}

        {/* RANKING Tab Content */}
        {rightPanelTab === "ranking" && (
          <div className="space-y-3">
            <h4 className="text-[10px] font-mono uppercase text-white/45 font-bold border-b border-white/10 pb-1.5">National Strategic Priority Leaders</h4>
            <div className="space-y-2">
              {entities.slice(0, 7).sort((a,b) => b.priorityScore - a.priorityScore).map((e, idx) => (
                <div 
                  key={e.id}
                  onClick={() => onSelectEntity(e)}
                  className="bg-[#0a0a0c] border border-white/5 p-2.5 rounded-lg flex items-center justify-between hover:border-[#c5a059]/30 cursor-pointer text-xs"
                >
                  <div className="flex items-center space-x-2">
                    <span className="font-mono text-[10px] font-bold text-[#c5a059]">0{idx+1}</span>
                    <div>
                      <span className="font-bold text-white block">{e.name}</span>
                      <span className="text-[9px] text-white/40 uppercase font-mono">{e.city}, {e.province}</span>
                    </div>
                  </div>
                  <span className="font-mono text-xs font-bold text-[#c5a059] bg-[#c5a059]/15 px-1.5 py-0.5 rounded border border-[#c5a059]/20">
                    {e.priorityScore}
                  </span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* INSIGHTS Tab Content */}
        {rightPanelTab === "insights" && (
          <div className="space-y-3">
            <h4 className="text-[10px] font-mono uppercase text-white/45 font-bold border-b border-white/10 pb-1.5">Regional Strategic Intelligence</h4>
            <div className="space-y-3 text-xs text-white/75">
              <div className="p-3 bg-[#15151c] rounded-lg border-l-2 border-[#c5a059]">
                <h5 className="font-bold text-[#c5a059] font-mono text-[10px] uppercase">Calgary Corridor Capacity</h5>
                <p className="mt-1 leading-relaxed text-[11px] text-white/70">
                  High concentration of Water systems and rapid wildfire models nearby Calgary Hub Anchor. Perfect baseline for secondary pilot integration decks.
                </p>
              </div>

              <div className="p-3 bg-[#15151c] rounded-lg border-l-2 border-[#3b82f6]">
                <h5 className="font-bold text-[#3b82f6] font-mono text-[10px] uppercase">Waterloo Quantum Density</h5>
                <p className="mt-1 leading-relaxed text-[11px] text-white/70">
                  Exceptional priority weightings observed in Waterloo optics cores. Candidate platforms suggest post-quantum defense breakthrough potential.
                </p>
              </div>

              <div className="p-3 bg-[#15151c] rounded-lg border-l-2 border-purple-500">
                <h5 className="font-bold text-purple-400 font-mono text-[10px] uppercase">Sub-Arctic Adaptation</h5>
                <p className="mt-1 leading-relaxed text-[11px] text-white/70">
                  Adapting standard desalination cells for deep permafrost freeze. Gaps remain in validation files, requiring direct, localized research follow-ups.
                </p>
              </div>
            </div>
          </div>
        )}

        {/* ENTITIES Tab Content */}
        {rightPanelTab === "entities" && (
          <div className="space-y-3">
            <h4 className="text-[10px] font-mono uppercase text-white/45 font-bold border-b border-white/10 pb-1.5">Ecosystem Directory Index</h4>
            
            <div className="relative">
              <input
                type="text"
                placeholder="Search index..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full bg-[#0a0a0c] text-xs text-white p-2 pl-8 rounded-lg border border-white/10 focus:outline-none focus:border-[#c5a059]/50"
              />
              <Search className="w-3.5 h-3.5 text-white/40 absolute left-2.5 top-2.5" />
            </div>

            <div className="space-y-2 max-h-[360px] overflow-y-auto pr-1 text-white">
              {searchedEntitiesTab.map((e) => {
                const isComparingThis = compareEntityIds.includes(e.id);
                return (
                  <div
                    key={e.id}
                    className={`p-2 rounded border cursor-pointer text-xs flex justify-between items-center transition-all ${
                      selectedEntity?.id === e.id
                        ? "bg-[#15151c] border-[#c5a059]/60 text-white"
                        : "bg-[#0a0a0c] border-white/5 hover:border-white/10 text-white/70"
                    }`}
                  >
                    <div className="flex items-center space-x-2.5 truncate flex-grow">
                      <input
                        type="checkbox"
                        checked={isComparingThis}
                        id={`check-dir-${e.id}`}
                        onChange={(ev) => {
                          ev.stopPropagation();
                          handleToggleCompare(e.id);
                        }}
                        className="w-3.5 h-3.5 rounded border-white/20 bg-zinc-900 text-[#c5a059] focus:ring-0 checked:bg-[#c5a059] checked:border-[#c5a059] cursor-pointer"
                        title="Toggle side-by-side comparative registry"
                      />
                      <div className="truncate flex-grow" onClick={() => onSelectEntity(e)}>
                        <span className="font-bold block truncate">{e.name}</span>
                        <span className="text-[10px] text-white/40 font-mono uppercase">{e.city}, {e.province}</span>
                      </div>
                    </div>
                    <span 
                      onClick={() => onSelectEntity(e)}
                      className="text-[10px] font-mono font-bold text-[#c5a059] shrink-0 px-1.5 py-0.5 bg-[#c5a059]/10 rounded border border-[#c5a059]/10"
                    >
                      {e.priorityScore}
                    </span>
                  </div>
                );
              })}
            </div>
          </div>
        )}

      </div>

    </div>
  );
}
