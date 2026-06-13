import React, { useState, useEffect, useMemo } from "react";
import { EcosystemEntity, ChallengeArea } from "../../types";
import { generateAIDrafts, SYNTHETIC_ENTITIES } from "../../data/syntheticData";
import { 
  Building, 
  MapPin, 
  Award, 
  Trash2, 
  Plus, 
  CheckCircle, 
  Sparkles, 
  FileText, 
  Mail, 
  HelpCircle, 
  Copy, 
  Check, 
  User, 
  BookOpen,
  Activity
} from "lucide-react";

interface SelectedEntityPanelProps {
  entity: EcosystemEntity | null;
  allEntities?: EcosystemEntity[];
  onAddToBriefingQueue: (entity: EcosystemEntity) => void;
  isComparing?: boolean;
  onToggleCompare?: () => void;
}

export default function SelectedEntityPanel({
  entity,
  allEntities,
  onAddToBriefingQueue,
  isComparing = false,
  onToggleCompare
}: SelectedEntityPanelProps) {
  const [activeDraft, setActiveDraft] = useState<{ title: string; content: string } | null>(null);
  const [activeDraftType, setActiveDraftType] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);
  const [whyThisMattersText, setWhyThisMattersText] = useState<string>("");
  const [loadingWhyThisMatters, setLoadingWhyThisMatters] = useState(false);

  // Network Density & Related Entities calculation (within 200km radius)
  const { relatedCount, densityScore, nearbyEntities } = useMemo(() => {
    if (!entity) return { relatedCount: 0, densityScore: 0, nearbyEntities: [] };
    
    const targetList = allEntities || SYNTHETIC_ENTITIES || [];
    
    // Haversine formula in KM
    const getDistanceInKm = (lat1: number, lon1: number, lat2: number, lon2: number) => {
      const R = 6371; // Earth default radius in km
      const dLat = ((lat2 - lat1) * Math.PI) / 180;
      const dLon = ((lon2 - lon1) * Math.PI) / 180;
      const a =
        Math.sin(dLat / 2) * Math.sin(dLat / 2) +
        Math.cos((lat1 * Math.PI) / 180) *
          Math.cos((lat2 * Math.PI) / 180) *
          Math.sin(dLon / 2) *
          Math.sin(dLon / 2);
      const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
      return R * c;
    };

    const currentLat = entity.latitude || 0;
    const currentLng = entity.longitude || 0;

    if (currentLat === 0) {
      return { relatedCount: 0, densityScore: 12, nearbyEntities: [] };
    }

    const filtered = targetList.filter((other) => {
      if (other.id === entity.id) return false;
      const otherLat = other.latitude || 0;
      const otherLng = other.longitude || 0;
      if (otherLat === 0) return false;

      // Related if they share at least one challengeArea
      const sharesChallenge = other.challengeAreas.some((area) =>
        entity.challengeAreas.includes(area)
      );
      if (!sharesChallenge) return false;

      const dist = getDistanceInKm(currentLat, currentLng, otherLat, otherLng);
      return dist <= 200;
    });

    // Compute dynamic density score: base 15, +25 per nearby related node, capped at 100
    const calculatedScore = Math.min(100, 15 + filtered.length * 25);

    return {
      relatedCount: filtered.length,
      densityScore: calculatedScore,
      nearbyEntities: filtered
    };
  }, [entity, allEntities]);

  // Clear drafts and load "Why This Matters" whenever selected entity shifts
  useEffect(() => {
    setActiveDraft(null);
    setActiveDraftType(null);
    setCopied(false);
    
    if (!entity) {
      setWhyThisMattersText("");
      return;
    }
    
    setLoadingWhyThisMatters(true);
    setWhyThisMattersText("");
    
    fetch("/api/why-this-matters", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ entity })
    })
      .then(res => res.json())
      .then(data => {
        setWhyThisMattersText(data.content || "No summary available.");
      })
      .catch(err => {
        console.error("Failed to load Why This Matters:", err);
        setWhyThisMattersText("Failed to generate storytelling summary.");
      })
      .finally(() => {
        setLoadingWhyThisMatters(false);
      });
  }, [entity]);

  const triggerAIDraft = async (type: "summary" | "missing" | "followup" | "briefing") => {
    if (!entity) return;
    
    // Set a loading state
    setActiveDraftType(type);
    setActiveDraft({ title: "Thinking...", content: "Connecting to secure local server backend..." });
    setCopied(false);

    try {
      const prompt = `Generate a ${type} for an entity named ${entity.name} in the challenge area ${entity.challengeAreas.join(", ")}. It is located in ${entity.city}, ${entity.province}. The readiness stage is ${entity.readinessStage} and it has ${entity.approvedEvidenceCount} out of ${entity.evidenceCount} approved pieces of evidence.`;
      
      const response = await fetch("/api/draft", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ prompt })
      });
      
      const data = await response.json();
      
      let title = "";
      if (type === "summary") title = `Challenge Fit: ${entity.name}`;
      if (type === "missing") title = `Missing Evidence: ${entity.name}`;
      if (type === "followup") title = `Follow-Up Plan: ${entity.name}`;
      if (type === "briefing") title = `Briefing Entry Template for ${entity.name}`;
      
      setActiveDraft({ title, content: data.content || JSON.stringify(data) });
      
      if (type === "briefing") {
        onAddToBriefingQueue(entity);
      }
    } catch (e: any) {
      setActiveDraft({ title: "Error", content: "Failed to reach server backend: " + e.message });
    }
  };

  const copyToClipboard = () => {
    if (!activeDraft) return;
    navigator.clipboard.writeText(activeDraft.content);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  if (!entity) {
    return (
      <div className="bg-[#15151c] rounded-lg border border-white/10 p-6 flex flex-col items-center justify-center text-center h-[260px] select-none">
        <Building className="w-8 h-8 text-white/20 mb-3" />
        <p className="text-xs text-white/80 font-medium">No Entity Selected</p>
        <p className="text-[10px] text-white/40 mt-1 max-w-[200px]">
          Hover or click on any node across Canada to populate active ecosystem intelligence.
        </p>
      </div>
    );
  }

  return (
    <div className="selected-entity-panel bg-[#15151c] rounded-lg border border-white/10 p-4 flex flex-col space-y-4">
      {/* Entity Header Block */}
      <div className="flex items-start justify-between">
        <div className="space-y-1.5 flex-grow">
          <div className="flex items-center space-x-2">
            <h3 className="text-sm font-bold text-white uppercase tracking-wide leading-tight">{entity.name}</h3>
            <span className={`px-2 py-0.5 rounded text-[9px] font-mono font-bold uppercase shrink-0 border ${
              entity.engagementStatus === "qualified" ? "bg-emerald-500/10 text-emerald-400 border-emerald-500/30" :
              entity.engagementStatus === "follow_up_needed" ? "bg-red-500/10 text-red-400 border border-red-500/30" :
              entity.engagementStatus === "active" ? "bg-teal-400/10 text-teal-400 border-teal-400/30" :
              "bg-zinc-500/10 text-zinc-400 border-zinc-500/30"
            }`}>
              {entity.engagementStatus.replace("_", " ")}
            </span>
          </div>
          <div className="flex items-center text-[10px] text-white/50 font-mono uppercase tracking-wider space-x-1.5">
            <span className="capitalize">{entity.type.replace("_", " ")}</span>
            <span>•</span>
            <span className="flex items-center space-x-0.5">
              <MapPin className="w-3 h-3 text-[#c5a059]" />
              <span>{entity.city}, {entity.province}</span>
            </span>
          </div>
          {onToggleCompare && (
            <button
              type="button"
              onClick={onToggleCompare}
              className={`mt-2 px-2 py-0.5 rounded text-[9px] font-mono font-bold tracking-wider uppercase transition-all flex items-center space-x-1 cursor-pointer border ${
                isComparing
                  ? "bg-[#c5a059] border-[#c5a059] text-black hover:bg-[#c5a059]/95"
                  : "bg-white/5 border-white/10 text-white/60 hover:border-[#c5a059]/40 hover:text-[#c5a059]"
              }`}
            >
              <span>{isComparing ? "✓ In Matrix" : "+ Compare"}</span>
            </button>
          )}
        </div>

        {/* Priority Score circular badge layout mimicking the mockup */}
        <div className="relative shrink-0 flex items-center justify-center w-12 h-12 rounded-full border-2 border-[#c5a059]/30 bg-[#0a0a0c]" title="Relative Hub Priority Weight">
          <div className="text-center">
            <span className="text-sm font-bold font-mono text-[#c5a059] tracking-tighter">{entity.priorityScore}</span>
            <span className="block text-[7px] text-white/40 font-mono uppercase tracking-widest">Score</span>
          </div>
          <div className="absolute inset-0 rounded-full border border-dashed border-[#c5a059]/10 animate-spin" style={{ animationDuration: "25s" }}></div>
        </div>
      </div>

      {/* Structured tactical indicators key-value list mimicking the mockup layout */}
      <div className="bg-[#0a0a0c] rounded border border-white/5 p-3 space-y-2 text-xs select-none">
        
        <div className="flex justify-between py-0.5 border-b border-white/5">
          <span className="text-white/40">Location</span>
          <span className="font-medium text-white/90">{entity.city}, {entity.province}</span>
        </div>

        <div className="flex justify-between py-0.5 border-b border-white/5">
          <span className="text-white/40">Challenge Fit</span>
          <span className="font-semibold text-[#c5a059]">{entity.challengeAreas.join(", ")}</span>
        </div>

        <div className="flex justify-between py-0.5 border-b border-white/5">
          <span className="text-white/40">Readiness Stage</span>
          <span className="font-medium capitalize text-[#3b82f6]">{entity.readinessStage}</span>
        </div>

        <div className="flex justify-between py-0.5 border-b border-white/5">
          <span className="text-white/40">Relationship Owner</span>
          <span className="font-medium text-white/70">{entity.relationshipOwner}</span>
        </div>

        <div className="flex justify-between py-0.5 border-b border-white/5">
          <span className="text-white/40">Next Action</span>
          <span className="font-medium text-white/90 italic truncate max-w-[160px]" title={entity.nextAction}>
            {entity.nextAction || "N/A"}
          </span>
        </div>

        <div className="flex justify-between py-0.5 border-b border-white/5 pb-2">
          <span className="text-white/40">Evidence Validations</span>
          <span className="font-mono text-emerald-400">{entity.approvedEvidenceCount} / {entity.evidenceCount} approved</span>
        </div>

        {/* Network Density (within 200km) */}
        <div className="pt-2 mt-1 space-y-1.5 border-t border-white/5">
          <div className="flex justify-between items-center">
            <span className="text-white/40 flex items-center space-x-1">
              <Activity className="w-3 h-3 text-[#c5a059]" />
              <span>Network Density Score</span>
            </span>
            <span className="font-mono font-bold text-[#c5a059]" id="network-density-score">{densityScore}%</span>
          </div>
          <div className="h-2 bg-white/5 rounded-full overflow-hidden w-full relative border border-white/5">
            <div 
              className="h-full bg-gradient-to-r from-amber-500/80 to-[#c5a059] rounded-full transition-all duration-500" 
              style={{ width: `${densityScore}%` }}
            ></div>
          </div>
          <div className="flex justify-between text-[9px] text-white/50 font-mono">
            <span>{relatedCount} sharing sectors within 200km</span>
            <span className="uppercase text-[8px] font-bold tracking-wide">
              {densityScore >= 75 ? "Ultra-dense Hub" : densityScore >= 40 ? "Connected Node" : "Emergent Hub"}
            </span>
          </div>
        </div>
      </div>

      {/* 'Why This Matters' Storytelling Callout Box */}
      <div className="bg-[#c5a059]/5 border border-[#c5a059]/20 rounded-lg p-3 space-y-1.5 animate-fade-in text-xs">
        <div className="flex items-center space-x-1.5 text-[#c5a059] font-bold text-[10px] uppercase tracking-wider">
          <Sparkles className="w-3.5 h-3.5" />
          <span>Why This Matters</span>
        </div>
        {loadingWhyThisMatters ? (
          <div className="flex items-center space-x-2 py-1.5">
            <span className="w-1.5 h-1.5 rounded-full bg-[#c5a059] animate-ping shrink-0"></span>
            <span className="text-[10px] text-white/40 font-mono">Synthesizing insights...</span>
          </div>
        ) : (
          <p className="text-[10.5px] text-white/80 leading-relaxed font-sans whitespace-pre-line">
            {whyThisMattersText}
          </p>
        )}
      </div>

      {/* AI actions trigger cards - compact 2x2 grid identical to instructions */}
      <div>
        <h4 className="text-[10px] font-mono tracking-wider font-semibold text-white/40 uppercase pb-2 mb-2 border-b border-white/5">Intel Assist (Human-Reviewed Outlines)</h4>
        <div className="grid grid-cols-2 gap-2">
          
          <button 
            onClick={() => triggerAIDraft("summary")}
            className={`flex items-center space-x-1.5 p-2 rounded text-left transition-all border text-xs cursor-pointer ${
              activeDraftType === "summary"
                ? "bg-[#c5a059]/20 border-[#c5a059]/50 text-[#c5a059]"
                : "bg-white/5 hover:bg-white/10 border-white/10 text-white/70 hover:text-white"
            }`}
          >
            <Sparkles className="w-3.5 h-3.5 text-[#c5a059]" />
            <span className="leading-snug truncate">Summarize Challenge Fit</span>
          </button>

          <button 
            onClick={() => triggerAIDraft("missing")}
            className={`flex items-center space-x-1.5 p-2 rounded text-left transition-all border text-xs cursor-pointer ${
              activeDraftType === "missing"
                ? "bg-[#c5a059]/20 border-[#c5a059]/50 text-[#c5a059]"
                : "bg-white/5 hover:bg-white/10 border-white/10 text-white/70 hover:text-white"
            }`}
          >
            <HelpCircle className="w-3.5 h-3.5 text-zinc-400" />
            <span className="leading-snug truncate">Show Missing Evidence</span>
          </button>

          <button 
            onClick={() => triggerAIDraft("followup")}
            className={`flex items-center space-x-1.5 p-2 rounded text-left transition-all border text-xs cursor-pointer ${
              activeDraftType === "followup"
                ? "bg-[#c5a059]/20 border-[#c5a059]/50 text-[#c5a059]"
                : "bg-white/5 hover:bg-white/10 border-white/10 text-white/70 hover:text-white"
            }`}
          >
            <Mail className="w-3.5 h-3.5 text-[#3b82f6]" />
            <span className="leading-snug truncate">Draft Follow-Up Layout</span>
          </button>

          <button 
            onClick={() => triggerAIDraft("briefing")}
            className={`flex items-center space-x-1.5 p-2 rounded text-left transition-all border text-xs cursor-pointer ${
              activeDraftType === "briefing"
                ? "bg-[#c5a059]/20 border-[#c5a059]/50 text-[#c5a059]"
                : "bg-white/5 hover:bg-white/10 border-white/10 text-white/70 hover:text-white"
            }`}
          >
            <FileText className="w-3.5 h-3.5 text-[#3b82f6]" />
            <span className="leading-snug truncate">Add to Briefing Queue</span>
          </button>

        </div>
      </div>

      {/* Dynamic AI Output Preview Panel */}
      {activeDraft && (
        <div className="bg-white/5 rounded border border-[#c5a059]/30 p-3 space-y-2 relative animate-fade-in">
          <div className="flex items-center justify-between border-b border-white/5 pb-1.5">
            <span className="text-[10px] font-mono uppercase tracking-wider text-[#c5a059] font-bold">{activeDraft.title}</span>
            <div className="flex items-center space-x-1.5">
              <button 
                onClick={copyToClipboard}
                className="p-1 rounded text-white/40 hover:text-white transition-colors"
                title="Copy outline"
              >
                {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
              </button>
            </div>
          </div>
          
          <p className="text-[10.5px] text-white/80 whitespace-pre-line leading-relaxed font-sans">
            {activeDraft.content}
          </p>

          <div className="pt-2 border-t border-white/5 flex items-center justify-between">
            <span className="text-[9px] font-mono uppercase text-white/40 italic">
              Draft — requires human review prior to action
            </span>
            {activeDraftType === "briefing" && (
              <span className="flex items-center text-[9px] font-mono text-emerald-400 space-x-0.5">
                <CheckCircle className="w-3 h-3" />
                <span>Queued</span>
              </span>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
