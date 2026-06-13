import React from "react";

interface MapLabelLayerProps {
  onHoverRegion: (regionName: string | null) => void;
  onSetRegionTooltipPos: (pos: { x: number; y: number }) => void;
}

export default function MapLabelLayer({
  onHoverRegion,
  onSetRegionTooltipPos
}: MapLabelLayerProps) {
  
  const handleMouseEnter = (e: React.MouseEvent<HTMLDivElement>, region: string, xOffset = 0, yOffset = -120) => {
    onHoverRegion(region);
    const rect = e.currentTarget.getBoundingClientRect();
    const parent = e.currentTarget.parentElement;
    if (rect && parent) {
      const parentRect = parent.getBoundingClientRect();
      onSetRegionTooltipPos({
        x: rect.left - parentRect.left + xOffset,
        y: rect.top - parentRect.top + yOffset
      });
    }
  };

  const handleMouseLeave = () => {
    onHoverRegion(null);
  };

  return (
    <>
      {/* BC/Vancouver Label */}
      <div 
        className="absolute z-20 top-[55%] left-[11%] pointer-events-auto cursor-help text-[9px] font-mono font-bold text-[#0f766e] bg-white/90 border border-emerald-200 px-2 py-0.5 rounded tracking-wider uppercase hover:bg-white hover:border-emerald-400 hover:scale-105 transition-all shadow-lg select-none"
        onMouseEnter={(e) => handleMouseEnter(e, "Vancouver")}
        onMouseLeave={handleMouseLeave}
      >
        Vancouver
      </div>

      {/* National Calgary Hub Anchor */}
      <div 
        className="absolute z-20 top-[53%] left-[24%] -translate-x-1/2 pointer-events-auto cursor-help select-none text-[9px] font-mono text-[#9a6b18] tracking-wider text-center drop-shadow-[0_1px_2px_rgba(255,255,255,0.8)] bg-white/90 px-2.5 py-1 rounded border-2 border-[#e2b64f]/60 backdrop-blur-md hover:bg-white hover:border-[#c5a059] hover:scale-[1.03] transition-all shadow-xl"
        onMouseEnter={(e) => handleMouseEnter(e, "Calgary", 15)}
        onMouseLeave={handleMouseLeave}
      >
        <span className="font-extrabold uppercase text-[9px] block tracking-widest text-[#9a6b18]">Canada Hub Calgary</span>
        <div className="text-[7.5px] text-slate-500 font-medium">Anchor Operations</div>
      </div>

      {/* Edmonton Sector Operations */}
      <div 
        className="absolute z-20 top-[38%] left-[24%] pointer-events-auto cursor-help text-[9px] font-mono font-bold text-[#2563eb] bg-white/90 border border-blue-200 px-2 py-0.5 rounded tracking-wider uppercase hover:bg-white hover:border-blue-400 hover:scale-105 transition-all shadow-lg select-none"
        onMouseEnter={(e) => handleMouseEnter(e, "Edmonton")}
        onMouseLeave={handleMouseLeave}
      >
        Edmonton
      </div>

      {/* Arctic/North Terminal */}
      <div 
        className="absolute z-20 top-[27%] left-[25%] pointer-events-auto cursor-help text-[9px] font-mono font-bold text-[#b45309] bg-white/90 border border-amber-200 px-2 py-0.5 rounded tracking-wider uppercase hover:bg-white hover:border-amber-400 hover:scale-105 transition-all shadow-lg select-none"
        onMouseEnter={(e) => handleMouseEnter(e, "Calgary")} // fallback region
        onMouseLeave={handleMouseLeave}
      >
        North
      </div>

      {/* Federal Ottawa Corridor */}
      <div 
        className="absolute z-20 top-[68%] left-[62%] pointer-events-auto cursor-help text-[9px] font-mono font-bold text-slate-700 bg-white/90 border border-slate-200 px-2 py-0.5 rounded tracking-wider uppercase hover:bg-white hover:border-slate-400 hover:scale-105 transition-all shadow-lg select-none"
        onMouseEnter={(e) => handleMouseEnter(e, "Ottawa")}
        onMouseLeave={handleMouseLeave}
      >
        Ottawa
      </div>

      {/* Southern Ontario/Toronto Cluster Flag */}
      <div 
        className="absolute z-20 top-[79%] left-[54%] pointer-events-auto cursor-help text-[9px] font-mono font-bold text-purple-700 bg-white/90 border border-purple-200 px-2 py-0.5 rounded tracking-wider uppercase hover:bg-white hover:border-purple-400 hover:scale-105 transition-all shadow-lg select-none"
        onMouseEnter={(e) => handleMouseEnter(e, "Toronto")}
        onMouseLeave={handleMouseLeave}
      >
        Toronto
      </div>

      {/* Montreal Research Corridor */}
      <div 
        className="absolute z-20 top-[62%] left-[71%] pointer-events-auto cursor-help text-[9px] font-mono font-bold text-cyan-700 bg-white/90 border border-cyan-200 px-2 py-0.5 rounded tracking-wider uppercase hover:bg-white hover:border-cyan-400 hover:scale-105 transition-all shadow-lg select-none"
        onMouseEnter={(e) => handleMouseEnter(e, "Montreal")}
        onMouseLeave={handleMouseLeave}
      >
        Montreal
      </div>

      {/* Atlantic Halifax Hub */}
      <div 
        className="absolute z-20 top-[72%] left-[79%] pointer-events-auto cursor-help text-[9px] font-mono font-bold text-emerald-700 bg-white/90 border border-emerald-200 px-2 py-0.5 rounded tracking-wider uppercase hover:bg-white hover:border-emerald-400 hover:scale-105 transition-all shadow-lg select-none"
        onMouseEnter={(e) => handleMouseEnter(e, "Halifax", -40)}
        onMouseLeave={handleMouseLeave}
      >
        Halifax
      </div>

      {/* Visual Sector Tags mapped across regions to elevate tech dashboard ambiance */}
      <div className="absolute z-20 top-[43%] left-[16%] bg-white/90 border border-[#F97316]/50 px-2 py-0.5 rounded text-[8px] uppercase font-bold tracking-wider text-[#F97316] select-none pointer-events-none shadow-sm backdrop-blur-xs flex items-center gap-1">
        <span className="w-1 h-1 rounded-full bg-[#F97316] animate-pulse"></span>
        <span>Wildfire Response</span>
      </div>
      <div className="absolute z-20 top-[61%] left-[38%] bg-white/90 border border-[#38BDF8]/50 px-2 py-0.5 rounded text-[8px] uppercase font-bold tracking-wider text-[#38BDF8] select-none pointer-events-none shadow-sm backdrop-blur-xs flex items-center gap-1">
        <span className="w-1 h-1 rounded-full bg-[#38BDF8] animate-pulse"></span>
        <span>Water Innovation</span>
      </div>
      <div className="absolute z-20 top-[44%] left-[45%] bg-white/90 border border-[#84CC16]/50 px-2 py-0.5 rounded text-[8px] uppercase font-bold tracking-wider text-[#84CC16] select-none pointer-events-none shadow-sm backdrop-blur-xs flex items-center gap-1">
        <span className="w-1 h-1 rounded-full bg-[#84CC16] animate-pulse"></span>
        <span>Carbon Removal</span>
      </div>
      <div className="absolute z-20 top-[57%] left-[10%] bg-white/90 border border-[#8B5CF6]/50 px-2 py-0.5 rounded text-[8px] uppercase font-bold tracking-wider text-[#8B5CF6] select-none pointer-events-none shadow-sm backdrop-blur-xs flex items-center gap-1">
        <span className="w-1 h-1 rounded-full bg-[#8B5CF6] animate-pulse"></span>
        <span>Quantum Apps</span>
      </div>
      <div className="absolute z-20 top-[49%] left-[73%] bg-white/90 border border-[#A78BFA]/50 px-2 py-0.5 rounded text-[8px] uppercase font-bold tracking-wider text-[#A78BFA] select-none pointer-events-none shadow-sm backdrop-blur-xs flex items-center gap-1">
        <span className="w-1 h-1 rounded-full bg-[#A78BFA] animate-pulse"></span>
        <span>Healthspan</span>
      </div>
      <div className="absolute z-20 top-[65%] left-[60%] bg-white/90 border border-[#06B6D4]/50 px-2 py-0.5 rounded text-[8px] uppercase font-bold tracking-wider text-[#06B6D4] select-none pointer-events-none shadow-sm backdrop-blur-xs flex items-center gap-1">
        <span className="w-1 h-1 rounded-full bg-[#06B6D4] animate-pulse"></span>
        <span>Critical Review</span>
      </div>
    </>
  );
}
