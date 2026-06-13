import React from "react";
import { EcosystemEntity } from "../../types";
import { 
  Plus, 
  MapPin, 
  Award, 
  ChevronRight, 
  TrendingUp, 
  FileCheck,
  Zap,
  Building
} from "lucide-react";

interface PipelineViewProps {
  entities: EcosystemEntity[];
  onSelectEntity: (entity: EcosystemEntity) => void;
  onSelectTab: (tab: string) => void;
}

export default function PipelineView({
  entities,
  onSelectEntity,
  onSelectTab
}: PipelineViewProps) {
  
  // Columns definition
  const columns = [
    { title: "New Discovery", id: "new", description: "Uncontacted entries from scraping or events", color: "border-t-zinc-600" },
    { title: "Contacted", id: "contacted", description: "First outreach initiated", color: "border-t-[#c5a059]" },
    { title: "Qualified Team", id: "qualified", description: "Meets technical criteria parameters", color: "border-t-emerald-500" },
    { title: "Active Validation", id: "active", description: "Engaged in collaborative audits", color: "border-t-cyan-500" },
    { title: "Briefing Ready", id: "briefing_ready", description: "Highest priority readiness nodes", color: "border-t-[#3b82f6]" }
  ];

  // Map entities to stages
  const getStageEntities = (colId: string) => {
    return entities.filter(e => {
      if (colId === "briefing_ready") {
        return e.readinessStage === "prize_ready" || e.readinessStage === "validated";
      }
      // If it's ready, don't show duplicates in previous columns
      if (e.readinessStage === "prize_ready" || e.readinessStage === "validated") {
        return false;
      }
      return e.engagementStatus === colId;
    });
  };

  const handleCardClick = (entity: EcosystemEntity) => {
    onSelectEntity(entity);
    onSelectTab("map"); // redirect to map view where detail node will be displayed
  };

  return (
    <div className="space-y-6 select-none animate-fade-in p-6">
      
      {/* Overview Block */}
      <div className="bg-[#15151c] border border-white/10 rounded-xl p-5 space-y-2">
        <h2 className="text-sm font-bold font-mono tracking-widest text-[#c5a059] uppercase flex items-center space-x-2">
          <TrendingUp className="w-4.5 h-4.5" />
          <span>Ecosystem Relationship Pipeline</span>
        </h2>
        <p className="text-xs text-white/70 leading-relaxed max-w-2xl">
          Track individual team progress through consecutive validation stages: from new discoveries through active audits and up to briefing-ready candidates. Click any card to inspect geographic telemetry.
        </p>
      </div>

      {/* Kanban Board Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 xl:grid-cols-5 gap-4 overflow-x-auto pb-4">
        {columns.map((col) => {
          const colEntities = getStageEntities(col.id);
          return (
            <div 
              key={col.id} 
              className="bg-[#0a0a0c] rounded-xl border border-white/10 flex flex-col min-w-[240px] h-[580px] hover:border-white/20 transition-all shadow-inner"
            >
              {/* Column Header */}
              <div className={`p-3 border-t-4 rounded-t-xl ${col.color} bg-white/5 border-b border-white/5`}>
                <div className="flex items-center justify-between">
                  <h3 className="text-xs font-bold text-white truncate font-sans">{col.title}</h3>
                  <span className="font-mono text-[10px] bg-black/40 text-white/40 px-1.5 py-0.5 rounded-full font-bold">
                    {colEntities.length}
                  </span>
                </div>
                <p className="text-[10px] text-white/30 leading-tight mt-1 line-clamp-1">{col.description}</p>
              </div>

              {/* Column Cards Bucket */}
              <div className="flex-grow overflow-y-auto p-2.5 space-y-3.5">
                {colEntities.length === 0 ? (
                  <div className="text-center py-12 text-white/30 text-[10px] italic border border-dashed border-white/5 rounded-lg font-sans">
                    No matching entities
                  </div>
                ) : (
                  colEntities.map((entity) => {
                    const iconColor = 
                      entity.challengeAreas[0] === "Wildfire" ? "text-[#F97316]" :
                      entity.challengeAreas[0] === "Water Scarcity" ? "text-[#3b82f6]" :
                      entity.challengeAreas[0] === "Carbon Removal" ? "text-emerald-500" :
                      entity.challengeAreas[0] === "Healthspan" ? "text-violet-400" :
                      "text-purple-500";

                    return (
                      <div
                        key={entity.id}
                        onClick={() => handleCardClick(entity)}
                        className="bg-[#15151c]/60 hover:bg-[#15151c] border border-white/5 hover:border-[#c5a059]/30 p-3 rounded-lg cursor-pointer transition-all space-y-2.5 group relative shadow-md"
                      >
                        {/* Title and score indicator */}
                        <div className="flex justify-between items-start space-x-1">
                          <span className="text-xs font-bold text-white group-hover:text-[#c5a059] transition-colors leading-snug line-clamp-2">
                            {entity.name}
                          </span>
                          <span className="text-[10px] font-mono font-bold text-[#c5a059] bg-[#c5a059]/10 border border-[#c5a059]/30 px-1 py-0.5 rounded leading-none shrink-0" title="Ecosystem fit weight">
                            {entity.priorityScore}
                          </span>
                        </div>

                        {/* Location and fit descriptors */}
                        <div className="flex items-center justify-between text-[10px] text-white/40 font-mono">
                          <div className="flex items-center space-x-0.5">
                            <MapPin className="w-3 h-3 text-[#c5a059]" />
                            <span className="truncate max-w-[100px]">{entity.city}</span>
                          </div>
                          <span className={`font-semibold ${iconColor}`}>{entity.challengeAreas[0]}</span>
                        </div>

                        {/* Readiness Tag */}
                        <div className="flex justify-between items-center text-[10px] pt-2 border-t border-white/5 text-white/30 font-sans">
                          <span className="capitalize">{entity.readinessStage}</span>
                          <span className="font-mono text-[9px] text-emerald-400 flex items-center space-x-0.5 font-bold">
                            <FileCheck className="w-3 h-3" />
                            <span>{entity.approvedEvidenceCount}/{entity.evidenceCount}</span>
                          </span>
                        </div>

                        {/* Hover arrow signifier */}
                        <div className="absolute right-1 bottom-1 opacity-0 group-hover:opacity-100 transition-opacity">
                          <ChevronRight className="w-3 h-3 text-[#c5a059]" />
                        </div>
                      </div>
                    );
                  })
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
