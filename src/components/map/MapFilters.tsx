import React from "react";
import { 
  ChallengeArea, 
  EntityType, 
  EcosystemEntity 
} from "../../types";
import { 
  X, 
  Filter, 
  Flame, 
  Droplet, 
  Leaf, 
  Heart, 
  Binary, 
  Fingerprint, 
  ChevronDown, 
  RotateCcw,
  Sparkle
} from "lucide-react";

interface MapFiltersProps {
  entities: EcosystemEntity[]; // To compute counts dynamically
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

export default function MapFilters({
  entities,
  activeFilters,
  setFilters,
  onResetFilters
}: MapFiltersProps) {
  
  // Calculate dynamic count helper
  const countForField = (field: keyof EcosystemEntity, value: any) => {
    return entities.filter(e => {
      if (field === "challengeAreas") {
        return (e.challengeAreas as string[]).includes(value);
      }
      return e[field] === value;
    }).length;
  };

  const challengeOptions: ChallengeArea[] = [
    "Wildfire",
    "Water Scarcity",
    "Carbon Removal",
    "Healthspan",
    "Quantum",
    "AI + Deep Tech"
  ];

  const typeOptions: { id: EntityType; label: string }[] = [
    { id: "startup", label: "Startups" },
    { id: "researcher", label: "Researchers" },
    { id: "university_lab", label: "University Labs" },
    { id: "funder", label: "Funders" },
    { id: "partner", label: "Partners" },
    { id: "event", label: "Events" }
  ];

  const statusOptions = [
    { id: "new", label: "New" },
    { id: "contacted", label: "Contacted" },
    { id: "qualified", label: "Qualified" },
    { id: "active", label: "Active" },
    { id: "follow_up_needed", label: "Follow-up Needed" }
  ];

  const readinessOptions = [
    { id: "research", label: "Research" },
    { id: "prototype", label: "Prototype" },
    { id: "pilot", label: "Pilot" },
    { id: "validated", label: "Validated" },
    { id: "prize_ready", label: "Prize-ready" }
  ];

  const ownerOptions = [
    "Hub Engagement Lead",
    "Research Lead",
    "Partner Lead",
    "Events Lead",
    "Briefing Lead"
  ];

  const evidenceOptions = [
    { id: "needs_evidence", label: "Needs Evidence" },
    { id: "evidence_added", label: "Evidence Added" },
    { id: "human_reviewed", label: "Human Reviewed" },
    { id: "report_ready", label: "Report Ready" }
  ];

  // Toggles item inside array
  const toggleSelection = (key: string, value: string) => {
    setFilters((prev: any) => {
      const isSelected = prev[key].includes(value);
      const updated = isSelected 
        ? prev[key].filter((item: any) => item !== value)
        : [...prev[key], value];
      return { ...prev, [key]: updated };
    });
  };

  const activeFiltersCount = 
    activeFilters.challengeAreas.length +
    activeFilters.types.length +
    activeFilters.statuses.length +
    activeFilters.readiness.length +
    activeFilters.owners.length +
    activeFilters.evidence.length;

  return (
    <div className="w-[280px] bg-[#0e0e12] border-r border-white/10 p-4 flex flex-col h-full overflow-y-auto shrink-0 select-none">
      {/* Sidebar Header */}
      <div className="flex items-center justify-between pb-4 mb-4 border-b border-white/10">
        <div className="flex items-center space-x-2">
          <Filter className="w-3.5 h-3.5 text-[#c5a059]" />
          <h2 className="text-xs font-bold font-mono tracking-[0.18em] text-white uppercase">Filters</h2>
          {activeFiltersCount > 0 && (
            <span className="bg-[#c5a059]/15 text-[#c5a059] text-[9px] font-mono font-bold px-1.5 py-0.5 rounded-full border border-[#c5a059]/30 leading-none">
              {activeFiltersCount}
            </span>
          )}
        </div>
        {activeFiltersCount > 0 && (
          <button 
            onClick={onResetFilters}
            className="text-[9px] text-white/45 hover:text-[#c5a059] flex items-center space-x-1 font-semibold uppercase tracking-wider cursor-pointer transition-colors"
          >
            <RotateCcw className="w-3 h-3" />
            <span>Reset All</span>
          </button>
        )}
      </div>

      <div className="space-y-5 flex-grow text-white">
        {/* Dynamic Challenge Area Filters */}
        <div>
          <div className="flex items-center justify-between text-[11px] font-mono tracking-wider font-semibold text-white/40 uppercase pb-2 mb-2 border-b border-white/5">
            <span>Challenge Area</span>
          </div>
          <div className="space-y-1">
            {challengeOptions.map(area => {
              const isSelected = activeFilters.challengeAreas.includes(area);
              const count = countForField("challengeAreas", area);
              return (
                <button
                  key={area}
                  onClick={() => toggleSelection("challengeAreas", area)}
                  className={`w-full flex items-center justify-between text-left text-xs py-1.5 px-2 rounded transition-all cursor-pointer ${
                    isSelected 
                      ? "bg-[#15151c] border border-[#c5a059]/45 text-white shadow-inner" 
                      : "text-white/70 hover:bg-[#15151c] hover:text-white border border-transparent"
                  }`}
                >
                  <div className="flex items-center space-x-2 truncate">
                    <span className={`w-2 h-2 rounded-full ${
                      area === "Wildfire" ? "bg-[#F97316]" :
                      area === "Water Scarcity" ? "bg-[#3b82f6]" :
                      area === "Carbon Removal" ? "bg-emerald-500" :
                      area === "Healthspan" ? "bg-violet-400" :
                      area === "Quantum" ? "bg-purple-500" :
                      "bg-[#06b6d4]"
                    }`}></span>
                    <span className="truncate">{area}</span>
                  </div>
                  <span className="text-[10px] font-mono text-white/45 bg-white/5 px-1.5 py-0.5 rounded leading-none">
                    {count}
                  </span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Entity Type Filters */}
        <div>
          <div className="flex items-center justify-between text-[11px] font-mono tracking-wider font-semibold text-white/40 uppercase pb-2 mb-2 border-b border-white/5">
            <span>Entity Type</span>
          </div>
          <div className="space-y-1">
            {typeOptions.map(opt => {
              const isSelected = activeFilters.types.includes(opt.id);
              const count = entities.filter(e => e.type === opt.id).length;
              return (
                <button
                  key={opt.id}
                  onClick={() => toggleSelection("types", opt.id)}
                  className={`w-full flex items-center justify-between text-left text-xs py-1.5 px-2 rounded transition-all cursor-pointer ${
                    isSelected 
                      ? "bg-[#15151c] border border-[#c5a059]/45 text-white" 
                      : "text-white/70 hover:bg-[#15151c] hover:text-white border border-transparent"
                  }`}
                >
                  <span className="truncate">{opt.label}</span>
                  <span className="text-[10px] font-mono text-white/45 bg-white/5 px-1.5 py-0.5 rounded leading-none">{count}</span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Engagement Status */}
        <div>
          <div className="flex items-center justify-between text-[11px] font-mono tracking-wider font-semibold text-white/40 uppercase pb-2 mb-2 border-b border-white/5">
            <span>Engagement Status</span>
          </div>
          <div className="space-y-1">
            {statusOptions.map(opt => {
              const isSelected = activeFilters.statuses.includes(opt.id);
              const count = entities.filter(e => e.engagementStatus === opt.id).length;
              return (
                <button
                  key={opt.id}
                  onClick={() => toggleSelection("statuses", opt.id)}
                  className={`w-full flex items-center justify-between text-left text-xs py-1.5 px-2 rounded transition-all cursor-pointer ${
                    isSelected 
                      ? "bg-[#15151c] border border-[#c5a059]/45 text-white" 
                      : "text-white/70 hover:bg-[#15151c] hover:text-white border border-transparent"
                  }`}
                >
                  <div className="flex items-center space-x-1.5 truncate">
                    <span className={`w-1.5 h-1.5 rounded-full ${
                      opt.id === "follow_up_needed" ? "bg-red-500 animate-pulse" :
                      opt.id === "qualified" ? "bg-emerald-500" :
                      opt.id === "active" ? "bg-teal-450" :
                      "bg-zinc-400"
                    }`}></span>
                    <span className="truncate">{opt.label}</span>
                  </div>
                  <span className="text-[10px] font-mono text-white/45 bg-white/5 px-1.5 py-0.5 rounded leading-none">{count}</span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Readiness Stage */}
        <div>
          <div className="flex items-center justify-between text-[11px] font-mono tracking-wider font-semibold text-white/40 uppercase pb-2 mb-2 border-b border-white/5">
            <span>Readiness Stage</span>
          </div>
          <div className="space-y-1">
            {readinessOptions.map(opt => {
              const isSelected = activeFilters.readiness.includes(opt.id);
              const count = entities.filter(e => e.readinessStage === opt.id).length;
              return (
                <button
                  key={opt.id}
                  onClick={() => toggleSelection("readiness", opt.id)}
                  className={`w-full flex items-center justify-between text-left text-xs py-1.5 px-2 rounded transition-all cursor-pointer ${
                    isSelected 
                      ? "bg-[#15151c] border border-[#c5a059]/40 text-white" 
                      : "text-white/70 hover:bg-[#15151c] hover:text-white border border-transparent"
                  }`}
                >
                  <span className="capitalize truncate">{opt.label}</span>
                  <span className="text-[10px] font-mono text-white/45 bg-white/5 px-1.5 py-0.5 rounded leading-none">{count}</span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Relationship Owner */}
        <div>
          <div className="flex items-center justify-between text-[11px] font-mono tracking-wider font-semibold text-white/40 uppercase pb-2 mb-2 border-b border-white/5">
            <span>Relationship Owner</span>
          </div>
          <div className="space-y-1">
            {ownerOptions.map(owner => {
              const isSelected = activeFilters.owners.includes(owner);
              const count = entities.filter(e => e.relationshipOwner === owner).length;
              return (
                <button
                  key={owner}
                  onClick={() => toggleSelection("owners", owner)}
                  className={`w-full flex items-center justify-between text-left text-xs py-1.5 px-2 rounded transition-all cursor-pointer ${
                    isSelected 
                      ? "bg-[#15151c] border border-[#c5a059]/45 text-white" 
                      : "text-white/70 hover:bg-[#15151c] hover:text-white border border-transparent"
                  }`}
                >
                  <span className="truncate">{owner.replace(" Lead", "")}</span>
                  <span className="text-[10px] font-mono text-white/45 bg-white/5 px-1.5 py-0.5 rounded leading-none">{count}</span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Evidence Status */}
        <div>
          <div className="flex items-center justify-between text-[11px] font-mono tracking-wider font-semibold text-white/40 uppercase pb-2 mb-2 border-b border-white/5">
            <span>Evidence Status</span>
          </div>
          <div className="space-y-1">
            {evidenceOptions.map(opt => {
              const isSelected = activeFilters.evidence.includes(opt.id);
              const count = entities.filter(e => e.evidenceStatus === opt.id).length;
              return (
                <button
                  key={opt.id}
                  onClick={() => toggleSelection("evidence", opt.id)}
                  className={`w-full flex items-center justify-between text-left text-xs py-1.5 px-2 rounded transition-all cursor-pointer ${
                    isSelected 
                      ? "bg-[#15151c] border border-[#c5a059]/45 text-white" 
                      : "text-white/70 hover:bg-[#15151c] hover:text-white border border-transparent"
                  }`}
                >
                  <span className="capitalize truncate">{opt.label}</span>
                  <span className="text-[10px] font-mono text-white/45 bg-white/5 px-1.5 py-0.5 rounded leading-none">{count}</span>
                </button>
              );
            })}
          </div>
        </div>
      </div>

      {/* Static sidebar footer displaying current synthetic node statistics */}
      <div className="pt-4 mt-6 border-t border-white/10 text-[10px] text-white/40 font-mono flex flex-col space-y-1">
        <div className="flex justify-between">
          <span>Active Nodes:</span>
          <span className="text-[#c5a059] font-bold">{entities.length}</span>
        </div>
        <div className="flex justify-between">
          <span>Target Areas:</span>
          <span>6 tracks</span>
        </div>
        <p className="text-[9px] text-white/30 pt-1 leading-normal italic">
          Calgary Anchor, Calgary Area
        </p>
      </div>
    </div>
  );
}
