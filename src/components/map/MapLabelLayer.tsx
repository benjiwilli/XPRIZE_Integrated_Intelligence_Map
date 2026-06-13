import React from "react";

interface MapLabelLayerProps {
  onHoverRegion: (regionName: string | null) => void;
  onSetRegionTooltipPos: (pos: { x: number; y: number }) => void;
}

/**
 * Geographically anchored overlay labels for the Canada basemap.
 *
 * Two label families sit on top of the pixel basemap:
 *  1. City / region markers — interactive (hover surfaces a regional tooltip).
 *  2. Sector annotations — ambient, non-interactive challenge-area tags.
 *
 * Positions are tuned to the basemap so the two families never collide. Both
 * families share a single frosted-pill visual language for a cohesive look:
 * a leading accent dot + high-contrast slate text, so legibility no longer
 * depends on a rainbow of border colors.
 */

interface CityLabel {
  region: string;
  label: string;
  sublabel?: string;
  top: string;
  left: string;
  accent: string;
  tooltipXOffset?: number;
  anchor?: boolean;
}

const CITY_LABELS: CityLabel[] = [
  { region: "Calgary", label: "Canada Hub · Calgary", sublabel: "Anchor Operations", top: "57%", left: "21%", accent: "#c5a059", tooltipXOffset: 15, anchor: true },
  { region: "Vancouver", label: "Vancouver", top: "50%", left: "5%", accent: "#0f766e" },
  { region: "Edmonton", label: "Edmonton", top: "32%", left: "21%", accent: "#2563eb" },
  { region: "Calgary", label: "Northern Sector", top: "23%", left: "23%", accent: "#b45309" },
  { region: "Ottawa", label: "Ottawa", top: "71%", left: "59%", accent: "#475569" },
  { region: "Toronto", label: "Toronto", top: "83%", left: "49%", accent: "#7c3aed" },
  { region: "Montreal", label: "Montreal", top: "55%", left: "74%", accent: "#0e7490" },
  { region: "Halifax", label: "Halifax", top: "73%", left: "83%", accent: "#047857", tooltipXOffset: -40 },
];

interface SectorTag {
  label: string;
  top: string;
  left: string;
  accent: string;
}

const SECTOR_TAGS: SectorTag[] = [
  { label: "Wildfire Response", top: "40%", left: "13%", accent: "#f97316" },
  { label: "Quantum Apps", top: "72%", left: "10%", accent: "#8b5cf6" },
  { label: "Water Innovation", top: "60%", left: "36%", accent: "#38bdf8" },
  { label: "Carbon Removal", top: "41%", left: "45%", accent: "#84cc16" },
  { label: "Healthspan", top: "46%", left: "76%", accent: "#a78bfa" },
  { label: "Critical Review", top: "89%", left: "34%", accent: "#06b6d4" },
];

export default function MapLabelLayer({
  onHoverRegion,
  onSetRegionTooltipPos
}: MapLabelLayerProps) {

  const handleMouseEnter = (
    e: React.MouseEvent<HTMLDivElement>,
    region: string,
    xOffset = 0,
    yOffset = -120
  ) => {
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
      {/* Interactive city / region markers */}
      {CITY_LABELS.map((city) =>
        city.anchor ? (
          <div
            key={`${city.label}-${city.left}`}
            className="absolute z-20 -translate-x-1/2 pointer-events-auto cursor-help select-none rounded-md bg-white/95 px-2.5 py-1 text-center shadow-[0_4px_14px_rgba(15,23,42,0.18)] ring-1 ring-[#e2b64f]/70 backdrop-blur-md transition-all hover:scale-[1.04] hover:ring-[#c5a059]"
            style={{ top: city.top, left: city.left }}
            onMouseEnter={(e) => handleMouseEnter(e, city.region, city.tooltipXOffset ?? 0)}
            onMouseLeave={handleMouseLeave}
          >
            <span className="flex items-center justify-center gap-1.5">
              <span className="h-1.5 w-1.5 rounded-full bg-[#c5a059] shadow-[0_0_6px_rgba(197,160,89,0.7)]" />
              <span className="block text-[9px] font-extrabold uppercase tracking-widest text-[#9a6b18]">
                {city.label}
              </span>
            </span>
            {city.sublabel && (
              <span className="mt-0.5 block text-[7.5px] font-medium uppercase tracking-wider text-slate-500">
                {city.sublabel}
              </span>
            )}
          </div>
        ) : (
          <div
            key={`${city.label}-${city.left}`}
            className="absolute z-20 flex items-center gap-1.5 pointer-events-auto cursor-help select-none rounded-md bg-white/92 px-2 py-0.5 shadow-[0_3px_10px_rgba(15,23,42,0.14)] ring-1 ring-slate-200/90 backdrop-blur-md transition-all hover:scale-105 hover:bg-white hover:ring-slate-300"
            style={{ top: city.top, left: city.left }}
            onMouseEnter={(e) => handleMouseEnter(e, city.region, city.tooltipXOffset ?? 0)}
            onMouseLeave={handleMouseLeave}
          >
            <span
              className="h-1.5 w-1.5 shrink-0 rounded-full"
              style={{ backgroundColor: city.accent }}
            />
            <span className="text-[9px] font-bold uppercase tracking-wider text-slate-700">
              {city.label}
            </span>
          </div>
        )
      )}

      {/* Ambient sector annotations (non-interactive) */}
      {SECTOR_TAGS.map((tag) => (
        <div
          key={tag.label}
          className="absolute z-10 flex items-center gap-1 pointer-events-none select-none rounded bg-white/80 px-1.5 py-0.5 shadow-[0_2px_6px_rgba(15,23,42,0.08)] ring-1 ring-slate-200/70 backdrop-blur-[2px]"
          style={{ top: tag.top, left: tag.left }}
        >
          <span
            className="h-1 w-1 rounded-full animate-pulse"
            style={{ backgroundColor: tag.accent }}
          />
          <span
            className="text-[8px] font-bold uppercase tracking-wider"
            style={{ color: tag.accent }}
          >
            {tag.label}
          </span>
        </div>
      ))}
    </>
  );
}
