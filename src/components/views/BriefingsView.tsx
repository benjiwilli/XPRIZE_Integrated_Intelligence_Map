import React, { useState } from "react";
import { BriefingItem } from "../../types";
import { 
  FileText, 
  Trash2, 
  ShieldCheck, 
  Calendar, 
  Award, 
  MapPin, 
  User, 
  Sparkles, 
  Clock, 
  AlertCircle 
} from "lucide-react";

interface BriefingsViewProps {
  queue: BriefingItem[];
  onRemoveItem: (id: string) => void;
  onClearQueue: () => void;
}

export default function BriefingsView({
  queue,
  onRemoveItem,
  onClearQueue
}: BriefingsViewProps) {
  const [selectedBrief, setSelectedBrief] = useState<BriefingItem | null>(queue[0] || null);
  const [finalizedBriefs, setFinalizedBriefs] = useState<string[]>([]);

  const handleFinalize = (id: string) => {
    setFinalizedBriefs(prev => [...prev, id]);
  };

  return (
    <div className="space-y-6 select-none animate-fade-in p-6">
      
      {/* Intro Header */}
      <div className="flex items-center justify-between bg-[#15151c] border border-white/10 rounded-xl p-5">
        <div className="space-y-1.5">
          <h2 className="text-sm font-bold font-mono tracking-widest text-[#c5a059] uppercase flex items-center space-x-2">
            <FileText className="w-4.5 h-4.5" />
            <span className="font-sans">National Intelligence Briefings</span>
          </h2>
          <p className="text-xs text-white/70 leading-relaxed max-w-2xl">
            Sift, consolidate, and review ecosystem brief templates destined for governmental sponsors, review syndicates, or Director oversight boards. Use the Ecosystem Map sidebar tool to add candidate nodes.
          </p>
        </div>
        {queue.length > 0 && (
          <button 
            onClick={onClearQueue}
            className="text-xs text-red-400 hover:text-red-300 font-semibold uppercase border border-red-500/20 bg-red-500/5 px-2.5 py-1 rounded cursor-pointer transition-all hover:bg-red-500/10"
          >
            Clear Drafts
          </button>
        )}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Left Column: Briefing list */}
        <div className="lg:col-span-1 space-y-4">
          <h3 className="text-xs font-bold font-mono uppercase tracking-wider text-white/40 pb-1.5 border-b border-white/10">Draft Briefing Cards</h3>
          
          {queue.length === 0 ? (
            <div className="bg-[#0a0a0c] rounded-xl border border-white/10 p-12 text-center text-xs text-white/40 space-y-2">
              <AlertCircle className="w-8 h-8 text-[#c5a059]/50 mx-auto animate-pulse" />
              <p>Briefing queue is currently empty.</p>
              <p className="text-[10px] max-w-[200px] mx-auto text-white/30 leading-normal font-sans">
                Go to the Ecosystem Map tab, select a candidate node, and click "Add to Briefing Queue."
              </p>
            </div>
          ) : (
            <div className="space-y-3">
              {queue.map((item) => {
                const isSelected = selectedBrief?.id === item.id;
                const isFinalized = finalizedBriefs.includes(item.id);

                return (
                  <div
                    key={item.id}
                    onClick={() => setSelectedBrief(item)}
                    className={`p-3.5 rounded-lg border cursor-pointer transition-all flex items-start justify-between space-x-2 relative ${
                      isSelected 
                        ? "bg-[#15151c] border-[#c5a059]/50 shadow-md shadow-black/20" 
                        : "bg-[#15151c]/60 hover:bg-[#15151c] border-white/5 border-b-white/10"
                    }`}
                  >
                    <div className="space-y-1.5 truncate text-white">
                      <span className="text-xs font-bold text-white block truncate">{item.entityName}</span>
                      <div className="flex items-center space-x-2 text-[9px] font-mono uppercase text-white/40">
                        <span className="text-[#c5a059] tracking-wide font-bold">{item.challengeArea}</span>
                        <span>•</span>
                        <span>{item.owner}</span>
                      </div>
                    </div>

                    <div className="flex flex-col items-end space-y-1.5 shrink-0">
                      <span className={`px-1.5 py-0.5 rounded text-[8px] font-mono uppercase font-bold shrink-0 ${
                        isFinalized 
                          ? "bg-emerald-500/10 text-emerald-400 border border-emerald-500/30" 
                          : "bg-amber-500/10 text-[#c5a059] border border-[#c5a059]/30"
                      }`}>
                        {isFinalized ? "Ready" : item.status}
                      </span>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          onRemoveItem(item.id);
                          if (selectedBrief?.id === item.id) {
                            setSelectedBrief(null);
                          }
                        }}
                        className="text-white/40 hover:text-red-400 p-0.5 rounded hover:bg-white/5 transition-all cursor-pointer"
                        title="Delete draft brief"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Center/Right Column: Live Editor or Selected Brief inspect */}
        <div className="lg:col-span-2 space-y-6">
          <h3 className="text-xs font-bold font-mono uppercase tracking-wider text-white/40 pb-1.5 border-b border-white/10">Inspection & Release Console</h3>
          
          {selectedBrief ? (
            <div className="bg-[#15151c] border border-white/10 p-5 rounded-xl space-y-4 shadow-xl">
              <div className="flex items-start justify-between border-b border-white/5 pb-3">
                <div className="space-y-1">
                  <h4 className="text-sm font-bold text-white uppercase">{selectedBrief.entityName}</h4>
                  <p className="text-[10px] text-[#c5a059] font-mono uppercase tracking-widest font-bold">{selectedBrief.challengeArea} • Calgary Anchor Node</p>
                </div>
                <div className="flex items-center space-x-1.5 text-[10px] text-white/40 font-mono">
                  <Clock className="w-3.5 h-3.5" />
                  <span>Created: {selectedBrief.addedAt || "2026-06-12"}</span>
                </div>
              </div>

              {/* Editable/Preview draft document */}
              <div className="bg-[#0a0a0c] border border-white/5 p-4 rounded text-xs text-white/70 leading-relaxed font-sans space-y-3">
                <div className="flex justify-between font-mono text-[9px] uppercase border-b border-white/5 pb-1 text-white/40">
                  <span>SUBSEC: INN_CASE // ID: {selectedBrief.id}</span>
                  <span>CONFIDENTIALITY: DEMO BRIEFING DRAFT</span>
                </div>
                <p className="text-white font-semibold">RECOMMENDED EXECUTIVE CONTEXT:</p>
                <p>
                  Deploying active technical validations near geographic coordinates. Key relationship benchmarks compiled through physical summit workshops indicate exceptional scalability in alignment with national challenge rubrics.
                </p>
                <p className="italic">
                  "Based on comprehensive reviewer panels and submitted evidence counts, recommend highlighting this candidate for advanced trials."
                </p>
                <div className="pt-2 border-t border-white/5 text-[10px] text-white/30 font-mono flex justify-between">
                  <span>Assigned: {selectedBrief.owner}</span>
                  <span className="text-emerald-400 font-bold">Human review placeholder</span>
                </div>
              </div>

              {/* Actions */}
              <div className="flex justify-end space-x-2 pt-2">
                <button
                  onClick={() => handleFinalize(selectedBrief.id)}
                  disabled={finalizedBriefs.includes(selectedBrief.id)}
                  className={`px-4 py-2 text-xs font-semibold uppercase tracking-wider rounded transition-all cursor-pointer flex items-center space-x-1.5 ${
                    finalizedBriefs.includes(selectedBrief.id)
                      ? "bg-emerald-600/20 text-emerald-400 border border-emerald-500/30 cursor-not-allowed"
                      : "border border-[#c5a059] bg-[#c5a059]/10 text-[#c5a059] hover:bg-[#c5a059]/20"
                  }`}
                >
                  <ShieldCheck className="w-4 h-4" />
                  <span>{finalizedBriefs.includes(selectedBrief.id) ? "Signed & Released" : "Finalize & Sign Brief"}</span>
                </button>
              </div>
            </div>
          ) : (
            <div className="bg-white/5 border border-white/5 p-12 text-center text-xs text-white/30 rounded-xl flex items-center justify-center h-[260px] font-sans">
              Select a briefing card on the left to inspect, finalize, and sign.
            </div>
          )}

          {/* Next Briefing Panel layout replicating requested features */}
          <div className="bg-[#15151c] rounded-xl border border-[#3b82f6]/20 p-4 space-y-3">
            <h4 className="text-[10px] font-mono uppercase tracking-wider text-[#3b82f6] font-bold flex items-center space-x-1.5">
              <Calendar className="w-3.5 h-3.5" />
              <span>Next Core Strategic Panels</span>
            </h4>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="bg-[#0a0a0c] p-3 rounded border border-white/5 space-y-1 text-xs">
                <div className="flex items-center justify-between font-mono text-[9px]">
                  <span className="text-white/40">Session #14</span>
                  <span className="text-red-400">June 20, 2026</span>
                </div>
                <p className="font-bold text-white truncate uppercase font-sans">Wildfire Mitigation Briefing</p>
                <p className="text-[10px] text-white/40 leading-tight">Director review on regional drone telemetries across Alberta corridors.</p>
              </div>

              <div className="bg-[#0a0a0c] p-3 rounded border border-white/5 space-y-1 text-xs">
                <div className="flex items-center justify-between font-mono text-[9px]">
                  <span className="text-white/40">Session #15</span>
                  <span className="text-[#c5a059] font-bold">July 08, 2026</span>
                </div>
                <p className="font-bold text-white truncate uppercase font-sans">Fresh Water Desalination Panel</p>
                <p className="text-[10px] text-white/40 leading-tight">Evaluating northern community reports from Iqaluit adaptation networks.</p>
              </div>
            </div>
          </div>
        </div>

      </div>
    </div>
  );
}
