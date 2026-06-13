import React, { useState, useEffect, useMemo } from "react";
import { 
  EcosystemEntity, 
  RelationshipEdge, 
  MapLens, 
  ChallengeArea, 
  EntityType 
} from "../../types";
import { CITIES_COORDS, OWNERS } from "../../data/syntheticData";
import { projectCanadaPoint } from "./CanadaMapProjection";
import CanadaPixelBasemapCanvas from "./CanadaPixelBasemapCanvas";
import MapLabelLayer from "./MapLabelLayer";
import { 
  MapPin, 
  Compass, 
  Layers, 
  Award, 
  Zap, 
  Flame, 
  Droplet, 
  Leaf, 
  Brain, 
  Binary, 
  Cpu, 
  Activity, 
  Play, 
  Pause, 
  Info,
  ExternalLink,
  Plus,
  Minus,
  ChevronUp,
  ChevronDown,
  ChevronLeft,
  ChevronRight
} from "lucide-react";

interface EcosystemMapCanvasProps {
  entities: EcosystemEntity[];
  edges: RelationshipEdge[];
  selectedEntity: EcosystemEntity | null;
  onSelectEntity: (entity: EcosystemEntity) => void;
  activeLens: MapLens;
  activeFilters: {
    challengeAreas: ChallengeArea[];
    types: EntityType[];
    statuses: string[];
    readiness: string[];
    owners: string[];
    evidence: string[];
  };
  isMapPulsing?: boolean;
  onAddToBriefingQueue?: (entity: EcosystemEntity) => void;
  onResetFilters?: () => void;
}

export default function EcosystemMapCanvas({
  entities,
  edges,
  selectedEntity,
  onSelectEntity,
  activeLens,
  activeFilters,
  isMapPulsing = false,
  onAddToBriefingQueue,
  onResetFilters
}: EcosystemMapCanvasProps) {
  const [hoveredEntity, setHoveredEntity] = useState<EcosystemEntity | null>(null);
  const [tooltipPos, setTooltipPos] = useState({ x: 0, y: 0 });
  const [pulsePhase, setPulsePhase] = useState(0);
  const [isAnimating, setIsAnimating] = useState(true);
  const [showGrid, setShowGrid] = useState(false);
  const [showIntensityMap, setShowIntensityMap] = useState(false);
  const [isLegendOpen, setIsLegendOpen] = useState(false);

  // Region Tooltip state
  const [hoveredRegion, setHoveredRegion] = useState<string | null>(null);
  const [regionTooltipPos, setRegionTooltipPos] = useState({ x: 0, y: 0 });
  
  const tooltipTimeoutRef = React.useRef<any>(null);

  // Zoom and Pan states
  const [zoom, setZoom] = useState(1);
  const [panX, setPanX] = useState(0);
  const [panY, setPanY] = useState(0);
  const [isDragging, setIsDragging] = useState(false);
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 });

  // Panning and zoom handlers
  const handleMouseDown = (e: React.MouseEvent) => {
    const target = e.target as HTMLElement;
    if (target.closest('.cursor-pointer') || target.closest('button') || target.tagName === 'BUTTON') {
      return;
    }
    setIsDragging(true);
    setDragStart({ x: e.clientX - panX, y: e.clientY - panY });
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!isDragging) return;
    setPanX(e.clientX - dragStart.x);
    setPanY(e.clientY - dragStart.y);
  };

  const handleMouseUp = () => {
    setIsDragging(false);
  };

  const handleMouseLeave = () => {
    setIsDragging(false);
  };

  const handleZoomIn = () => {
    setZoom((prev) => Math.min(3.5, prev + 0.25));
  };

  const handleZoomOut = () => {
    setZoom((prev) => Math.max(0.75, prev - 0.25));
  };

  const handleResetZoomAndPan = () => {
    setZoom(1);
    setPanX(0);
    setPanY(0);
  };

  const handlePan = (direction: "up" | "down" | "left" | "right") => {
    const step = 40;
    switch (direction) {
      case "up": setPanY((y) => y + step); break;
      case "down": setPanY((y) => y - step); break;
      case "left": setPanX((x) => x + step); break;
      case "right": setPanX((x) => x - step); break;
    }
  };

  // Region mapping for the 7 key region markers
  const REGION_MAPPING: Record<string, string[]> = {
    "Vancouver": ["Vancouver", "Whitehorse"],
    "Calgary": ["Calgary", "Yellowknife"],
    "Edmonton": ["Edmonton"],
    "Toronto": ["Toronto", "Waterloo", "Winnipeg", "Saskatoon"],
    "Montreal": ["Montreal", "Quebec City", "Iqaluit"],
    "Halifax": ["Halifax", "St. John's"],
    "Ottawa": ["Ottawa"]
  };

  const hoveredRegionMetrics = useMemo(() => {
    if (!hoveredRegion) return null;
    const citiesInRegion = REGION_MAPPING[hoveredRegion] || [];
    
    // Scan all entities matching the region
    const regionalEntities = entities.filter(e => citiesInRegion.includes(e.city));
    
    // Determine key challenge area
    const challengeCounts: Record<string, number> = {};
    regionalEntities.forEach(e => {
      e.challengeAreas.forEach(area => {
        challengeCounts[area] = (challengeCounts[area] || 0) + 1;
      });
    });
    
    let keyChallenge = "Multi-sector";
    let maxCount = 0;
    Object.entries(challengeCounts).forEach(([area, count]) => {
      if (count > maxCount) {
        maxCount = count;
        keyChallenge = area;
      }
    });

    // Top Readiness Stage
    const readinessCounts: Record<string, number> = {};
    regionalEntities.forEach(e => {
      readinessCounts[e.readinessStage] = (readinessCounts[e.readinessStage] || 0) + 1;
    });
    let topReadiness = "Research";
    let maxReadinessCount = 0;
    Object.entries(readinessCounts).forEach(([stage, count]) => {
      if (count > maxReadinessCount) {
        maxReadinessCount = count;
        topReadiness = stage;
      }
    });

    // Highest Priority Score
    const topScore = regionalEntities.length > 0 
      ? Math.max(...regionalEntities.map(e => e.priorityScore))
      : 0;

    return {
      regionName: hoveredRegion,
      activeNodes: regionalEntities.length,
      keyChallenge,
      topReadiness,
      topScore,
      citiesList: citiesInRegion.join(", ")
    };
  }, [hoveredRegion, entities]);

  // Pulse effect tick for general premium aesthetic
  useEffect(() => {
    let interval: any;
    if (isAnimating) {
      interval = setInterval(() => {
        setPulsePhase((prev) => (prev + 1) % 360);
      }, 50);
    }
    return () => clearInterval(interval);
  }, [isAnimating]);

  // Compute positions of each entity, resolving overlaps on identical cities with a visual spiral offset
  const positionedEntities = useMemo(() => {
    return entities.map((entity, idx) => {
      const city = entity.city;
      let base = { x: 50, y: 50 };
      if (entity.latitude !== undefined && entity.longitude !== undefined) {
        base = projectCanadaPoint(entity.latitude, entity.longitude);
      } else {
        const cityCoord = CITIES_COORDS[city] || { x: 50, y: 50 };
        base = { x: cityCoord.x, y: cityCoord.y };
      }
      
      // Calculate a highly aesthetic spiral clustering offset for cities with multiple nodes
      // Toronto, Calgary, Waterloo require spacing so they are clickable
      const citySiblings = entities.filter(e => e.city === city);
      const siblingIndex = citySiblings.findIndex(e => e.id === entity.id);
      
      let offsetX = 0;
      let offsetY = 0;
      
      if (siblingIndex > 0) {
        // Spiral equations
        const angle = siblingIndex * (Math.PI * 0.45) + (city.length * 0.2); // spaced out beautifully
        const radius = 1.3 + (siblingIndex * 0.65); // gradual expansion
        offsetX = Math.cos(angle) * radius;
        offsetY = Math.sin(angle) * radius * 0.85; // slightly flattened for perspective
      }
      
      return {
        ...entity,
        xPercent: base.x + offsetX,
        yPercent: base.y + offsetY
      };
    });
  }, [entities]);

// Return specific hex colors based on Readiness Stage or active Lens
  const getNodeColor = (entity: EcosystemEntity) => {
    if (entity.engagementStatus === "follow_up_needed") {
      return "#F0645A"; // Red/Coral
    }
    if (entity.type === "partner" || entity.type === "funder") {
      return "#A855F7"; // Purple
    }
    if (entity.readinessStage === "prize_ready" || entity.evidenceStatus === "report_ready") {
      return "#3B82F6"; // Blue
    }
    if (entity.readinessStage === "validated" || entity.engagementStatus === "qualified") {
      return "#14B8A6"; // Teal
    }
    if (entity.readinessStage === "pilot" || entity.readinessStage === "prototype") {
      return "#F59E0B"; // Amber
    }
    return "#64748B"; // Slate
  };

  const isNodeActiveForLens = (entity: EcosystemEntity) => {
    if (activeLens === "all_activity") return true;
    if (activeLens === "follow_up_needed") {
      return entity.engagementStatus === "follow_up_needed";
    }
    if (activeLens === "high_readiness") {
      return entity.readinessStage === "prize_ready" || entity.readinessStage === "validated";
    }
    if (activeLens === "report_ready_evidence") {
      return entity.evidenceCount >= 6;
    }
    if (activeLens === "challenge_gaps") {
      return entity.priorityScore > 80;
    }
    if (activeLens === "partner_network") {
      return entity.type === "partner" || entity.type === "funder";
    }
    return true;
  };

  const getChallengeIcon = (area: ChallengeArea) => {
    switch (area) {
      case "Wildfire": return Flame;
      case "Water Scarcity": return Droplet;
      case "Carbon Removal": return Leaf;
      case "Healthspan": return Activity;
      case "Quantum": return Cpu;
      case "AI + Deep Tech": return Binary;
    }
  };

  const currentLensLabel = useMemo(() => {
    switch (activeLens) {
      case "all_activity": return "All Activity";
      case "follow_up_needed": return "Follow-up Needed";
      case "high_readiness": return "High-Readiness Teams";
      case "challenge_gaps": return "Challenge Gaps";
      case "partner_network": return "Partner Network";
      case "event_aftermath": return "Event Aftermath";
      case "report_ready_evidence": return "Report-Ready Evidence";
      default: return "Ecosystem Scan";
    }
  }, [activeLens]);

  // Basemap grid cells and geographic outline are modularly decoupled to CanadaGridBasemap.tsx

  return (
    <div className="relative w-full h-[580px] bg-[#f7fafb] rounded-xl border border-slate-200/80 overflow-hidden shadow-[0_24px_70px_rgba(15,23,42,0.18)] flex flex-col">
      {/* Top Controls Bar */}
      <div className="absolute top-4 left-4 right-4 z-20 flex justify-between items-start gap-3 select-none pointer-events-none">
        {/* Left Side: Active lens chip */}
        <div className="bg-white/90 backdrop-blur-md border border-slate-200/80 px-3 py-1.5 rounded-lg flex items-center space-x-2 text-xs pointer-events-auto shadow-[0_6px_18px_rgba(15,23,42,0.12)] shrink-0">
          <div className="w-2 h-2 rounded-full bg-[#11b8a6] shadow-[0_0_8px_rgba(17,184,166,0.6)] animate-pulse"></div>
          <span className="font-mono text-[10px] text-slate-500 uppercase tracking-wider">Lens</span>
          <span className="font-semibold text-slate-900">{currentLensLabel}</span>
        </div>

        {/* Center: Frosted Glass Controller */}
        <div className="bg-white/90 backdrop-blur-md border border-slate-200/80 py-1 px-1.5 rounded-full flex items-center gap-0.5 shadow-[0_8px_24px_rgba(15,23,42,0.14)] pointer-events-auto">
          <span className="px-2.5 py-1 bg-slate-100 text-[#9a6b18] font-mono text-[11px] font-bold rounded-full tracking-wider">2026</span>

          <span className="w-px h-4 bg-slate-200"></span>

          <button
            onClick={() => setIsAnimating(!isAnimating)}
            className="p-1 px-2.5 rounded-full text-[11px] font-semibold tracking-wider uppercase transition-all flex items-center space-x-1 hover:bg-slate-100 text-slate-600 hover:text-slate-950 cursor-pointer"
            title="Toggle micro animations"
          >
            {isAnimating ? (
              <>
                <Play className="w-3.5 h-3.5 text-[#3b82f6]" />
                <span>Live</span>
              </>
            ) : (
              <>
                <Pause className="w-3.5 h-3.5 text-slate-400" />
                <span>Paused</span>
              </>
            )}
          </button>

          <span className="w-px h-4 bg-slate-200"></span>

          <button
            onClick={() => setShowGrid(!showGrid)}
            id="map-grid-toggle"
            className={`p-1 px-2.5 rounded-full text-[11px] font-semibold tracking-wider uppercase transition-all flex items-center space-x-1 cursor-pointer hover:bg-slate-100 ${
              showGrid ? "text-[#c5a059] bg-[#c5a059]/10" : "text-slate-500 hover:text-slate-900"
            }`}
            title="Toggle geographical coordinates grid lines"
          >
            <Layers className="w-3.5 h-3.5" />
            <span>Grid</span>
          </button>

          <span className="w-px h-4 bg-slate-200"></span>

          <button
            onClick={() => setShowIntensityMap(!showIntensityMap)}
            className={`p-1 px-2.5 rounded-full text-[11px] font-semibold tracking-wider uppercase transition-all flex items-center space-x-1 cursor-pointer hover:bg-slate-100 ${
              showIntensityMap ? "text-red-500 bg-red-500/10" : "text-slate-500 hover:text-slate-900"
            }`}
            title="Toggle high-priority density heatmap layer"
          >
            <Flame className="w-3.5 h-3.5" />
            <span>Heat</span>
          </button>
        </div>

        {/* Right Side: Calgary Hub Notice */}
        <div className="bg-white/90 border border-emerald-200/80 px-3 py-1.5 rounded-lg text-[10px] font-mono text-[#0f9f8c] pointer-events-auto shadow-[0_6px_18px_rgba(15,23,42,0.12)] flex items-center space-x-1.5 shrink-0">
          <Compass className="w-3.5 h-3.5 animate-spin" style={{ animationDuration: "12s" }} />
          <span className="hidden sm:inline">CAN-HUB ACTIVE</span>
          <span className="sm:hidden">HUB</span>
        </div>
      </div>

      {/* Map Interactive Viewport Box supporting Grab and Drag-to-Pan */}
      <div className="map-viewport relative flex-grow h-full w-full overflow-hidden select-none">
        
        {entities.length === 0 && (
          <div className="absolute inset-0 z-30 flex flex-col items-center justify-center bg-[#0a0a0c]/82 backdrop-blur-[2px] p-6 text-center animate-fade-in" id="map-empty-state">
            <div className="relative bg-[#15151c]/95 border border-white/10 rounded-xl p-8 max-w-sm shadow-2xl flex flex-col items-center gap-4">
              <div className="w-12 h-12 rounded-full bg-red-500/10 border border-red-500/20 flex items-center justify-center text-red-500">
                <Compass className="w-6 h-6 animate-pulse" />
              </div>
              <h3 className="text-xs font-bold uppercase tracking-wider text-white">No matching demo entities</h3>
              <p className="text-[10px] font-mono text-white/50 leading-relaxed max-w-[280px]">
                No synthetic entities correspond to your current filter metrics. Reset active criteria to resume simulation visualization.
              </p>
              <button
                onClick={onResetFilters}
                className="w-full px-4 py-2 bg-[#c5a059] hover:bg-[#b08b47] active:scale-[0.98] transition-all text-black text-[10px] font-bold tracking-wider uppercase rounded cursor-pointer"
              >
                Reset Filters
              </button>
            </div>
          </div>
        )}

        <div 
          className={`w-full h-full relative transition-transform duration-200 ease-out origin-center`}
          style={{
            transform: `translate(${panX}px, ${panY}px) scale(${zoom})`,
            cursor: isDragging ? "grabbing" : "grab"
          }}
          onMouseDown={handleMouseDown}
          onMouseMove={handleMouseMove}
          onMouseUp={handleMouseUp}
          onMouseLeave={handleMouseLeave}
        >
          {/* Aspect-locked stage keeps the basemap + node overlay proportional (no stretch). */}
          <div className="map-stage">
          {/* Generated education-style Canada pixel basemap. */}
          <CanadaPixelBasemapCanvas animate={isAnimating} drawMarkers={false} className="z-0" />

          {/* Transparent SVG overlay for live entity nodes, edges, labels, and tooltips. */}
          <svg 
            id="ecosystem-map-svg"
            className="absolute inset-0 z-10 w-full h-full flex-grow select-none bg-transparent" 
            viewBox="0 0 100 100" 
            preserveAspectRatio="none"
          >
            <defs>
              {/* Glowing filter for anchors */}
              <filter id="glow-gold" x="-50%" y="-50%" width="200%" height="200%">
                <feGaussianBlur stdDeviation="0.6" result="blur" />
                <feComposite in="SourceGraphic" in2="blur" operator="over" />
              </filter>
              <filter id="glow-blue" x="-50%" y="-50%" width="200%" height="200%">
                <feGaussianBlur stdDeviation="0.4" result="blur" />
                <feComposite in="SourceGraphic" in2="blur" operator="over" />
              </filter>
            </defs>

            {/* Grid lines (Subtle Lat/Long ticks) */}
            {showGrid && (
              <g id="map-coordinate-grid">
                <line x1="10" y1="0" x2="10" y2="100" stroke="#0f172a" strokeOpacity="0.035" strokeWidth="0.08" />
                <line x1="30" y1="0" x2="30" y2="100" stroke="#0f172a" strokeOpacity="0.035" strokeWidth="0.08" />
                <line x1="50" y1="0" x2="50" y2="100" stroke="#0f172a" strokeOpacity="0.035" strokeWidth="0.08" />
                <line x1="70" y1="0" x2="70" y2="100" stroke="#0f172a" strokeOpacity="0.035" strokeWidth="0.08" />
                <line x1="90" y1="0" x2="90" y2="100" stroke="#0f172a" strokeOpacity="0.035" strokeWidth="0.08" />
                
                <line x1="0" y1="30" x2="100" y2="30" stroke="#0f172a" strokeOpacity="0.035" strokeWidth="0.08" />
                <line x1="0" y1="50" x2="100" y2="50" stroke="#0f172a" strokeOpacity="0.035" strokeWidth="0.08" />
                <line x1="0" y1="70" x2="100" y2="70" stroke="#0f172a" strokeOpacity="0.035" strokeWidth="0.08" />
              </g>
            )}

            {/* Pixel basemap is rendered on the canvas layer below this SVG. */}

            {/* Global Intensity Map Overlay */}
            {showIntensityMap && (
              <g id="map-intensity-layer">
                {positionedEntities.map(entity => {
                  if (entity.priorityScore < 50) return null;
                  const intensity = entity.priorityScore / 100;
                  const radius = 4 + (intensity * 8);
                  const color = entity.priorityScore >= 90 ? "#ef4444" : entity.priorityScore >= 75 ? "#f59e0b" : "#14b8a6";
                  return (
                    <circle
                      key={`intensity-${entity.id}`}
                      cx={entity.xPercent}
                      cy={entity.yPercent}
                      r={radius}
                      fill={color}
                      opacity={intensity * 0.35}
                      style={{ filter: "blur(4px)" }}
                    />
                  );
                })}
              </g>
            )}

            {/* Calgary Hub Anchor — UCalgary reference area indicator (Minimal, professional) */}
            <g transform="translate(23.6, 52.7)">
              {/* Subtle slow spinning antenna line */}
              <circle 
                r="3.5" 
                fill="none" 
                stroke="#c5a059" 
                strokeWidth="0.22" 
                strokeDasharray="1,1"
                className="animate-spin"
                style={{ animationDuration: "18s" }} 
              />
              <circle 
                r="1.8" 
                fill="none" 
                stroke="#c5a059" 
                strokeWidth="0.32" 
                filter="url(#glow-gold)"
              />
              <circle 
                r="0.75" 
                fill="#c5a059" 
                className="animate-pulse"
              />
            </g>

            {/* Drawn Relationship Edges (Clean, thin vector lines) */}
            {edges.map((edge) => {
              const source = positionedEntities.find(e => e.id === edge.sourceId);
              const target = positionedEntities.find(e => e.id === edge.targetId);
              
              if (!source || !target) return null;
              
              const isSourceSelected = selectedEntity?.id === source.id;
              const isTargetSelected = selectedEntity?.id === target.id;
              const isActive = isSourceSelected || isTargetSelected || isMapPulsing;

              return (
                <path
                  key={`edge-${edge.id}`}
                  d={`M ${source.xPercent} ${source.yPercent} Q ${(source.xPercent + target.xPercent)/2} ${(source.yPercent + target.yPercent)/2 - 1.2}, ${target.xPercent} ${target.yPercent}`}
                  fill="none"
                  stroke={isActive ? "#0ea5e9" : "#0f766e"}
                  strokeWidth={isActive ? 0.28 : 0.10}
                  strokeOpacity={isActive ? 0.68 : 0.18}
                  strokeDasharray={edge.type === "pathway" ? "0.8,0.8" : undefined}
                />
              );
            })}

            {/* Placed Interactive City Ecosystem Nodes */}
            {positionedEntities.map((entity) => {
              const nodeColor = getNodeColor(entity);
              const isSelected = selectedEntity?.id === entity.id;
              const isHovered = hoveredEntity?.id === entity.id;
              const isActive = isNodeActiveForLens(entity);

              // Emphasize nodes with priority pulses or rings
              const showPulseRing = entity.priorityScore >= 90 || isSelected;
              const needsFollowUp = entity.engagementStatus === "follow_up_needed";

              return (
                <g 
                  key={`node-${entity.id}`}
                  transform={`translate(${entity.xPercent}, ${entity.yPercent})`}
                  className="cursor-pointer group"
                  onClick={() => onSelectEntity(entity)}
                  opacity={isActive ? 1.0 : 0.16}
                  onMouseEnter={(e) => {
                    if (tooltipTimeoutRef.current) clearTimeout(tooltipTimeoutRef.current);
                    setHoveredEntity(entity);
                    const rect = e.currentTarget.getBoundingClientRect();
                    const parentRect = document.getElementById("ecosystem-map-svg")?.getBoundingClientRect();
                    if (rect && parentRect) {
                      setTooltipPos({
                        x: rect.left - parentRect.left + 15,
                        y: rect.top - parentRect.top - 55
                      });
                    }
                  }}
                  onMouseLeave={() => {
                    tooltipTimeoutRef.current = setTimeout(() => {
                      setHoveredEntity(null);
                    }, 250);
                  }}
                >
                  {/* Action pulse for nodes needing critical reviews */}
                  {needsFollowUp && !isSelected && (
                    <circle
                      r="2.8"
                      fill="none"
                      stroke="#F0645A"
                      strokeWidth="0.25"
                      className="animate-ping"
                      style={{ animationDuration: "2.5s" }}
                    />
                  )}

                  {/* High-fidelity outer glow backdrop */}
                  {(isSelected || isHovered || showPulseRing) && (
                    <circle
                      r={isSelected ? 3.2 : isHovered ? 2.5 : 1.8}
                      fill={nodeColor}
                      opacity="0.45"
                      style={{ filter: "blur(0.4px)", mixBlendMode: "screen" }}
                    />
                  )}

                  {/* Translucent pulse background ring */}
                  {(showPulseRing || isMapPulsing) && (
                    <circle
                      r={isSelected ? 4.5 : 3.0}
                      fill="none"
                      stroke={isSelected ? "#c5a059" : nodeColor}
                      strokeWidth="0.5"
                      strokeOpacity="0.4"
                      className="animate-pulse"
                    />
                  )}

                  {/* White/Ivory Outer boundary ring */}
                  <circle
                    r={isSelected ? 2.0 : isHovered ? 1.5 : 1.1}
                    fill={nodeColor}
                    stroke="#ffffff"
                    strokeWidth={isSelected ? 0.45 : 0.3}
                  />

                  {/* Solid colored center core node */}
                  <circle
                    r={isSelected ? 1.1 : isHovered ? 0.85 : 0.6}
                    fill={nodeColor}
                  />
                </g>
              );
            })}
          </svg>

          {/* DYNAMIC AND GEOGRAPHICALLY ALIGNED CITY LABELS */}
          <MapLabelLayer 
            onHoverRegion={(region) => setHoveredRegion(region)}
            onSetRegionTooltipPos={(pos) => setRegionTooltipPos(pos)}
          />
          </div>
        </div>
      </div>

      {/* Dynamic Hover Tooltip for Entity Nodes - High-contrast floating mini-card info-deck */}
      {hoveredEntity && (
        <div 
          className="absolute z-50 bg-[#0e0e12] border border-[#c5a059]/40 p-3.5 rounded-lg shadow-2xl pointer-events-auto w-72 text-xs"
          style={{ 
            left: `${tooltipPos.x + 15}px`, 
            top: `${tooltipPos.y + 15}px`,
            boxShadow: "0 12px 36px rgba(0,0,0,0.75)"
          }}
          onMouseEnter={() => {
            if (tooltipTimeoutRef.current) clearTimeout(tooltipTimeoutRef.current);
          }}
          onMouseLeave={() => {
            tooltipTimeoutRef.current = setTimeout(() => {
              setHoveredEntity(null);
            }, 250);
          }}
        >
          {/* Header row with challenge track background bar & Priority Score */}
          <div className="flex items-start justify-between gap-3 mb-2 pb-1.5 border-b border-white/10">
            <div>
              <span className="font-extrabold text-white text-[12px] block truncate tracking-wide">{hoveredEntity.name}</span>
              <span className="text-[9px] text-white/40 font-mono uppercase tracking-widest">{hoveredEntity.city}, {hoveredEntity.province}</span>
            </div>
            
            <div className="flex flex-col items-end shrink-0">
              <span className="text-[7.5px] font-mono uppercase tracking-widest text-white/50 block">Priority</span>
              <span className="font-mono text-[13px] font-extrabold text-[#c5a059] bg-[#c5a059]/10 px-2 py-0.5 rounded border border-[#c5a059]/30">
                {hoveredEntity.priorityScore}
              </span>
            </div>
          </div>

          {/* Key challenge area emphasize section */}
          <div className="bg-white/5 p-2 rounded border border-white/5 space-y-1.5">
            <div className="flex justify-between items-center text-[10px]">
              <span className="text-white/40 uppercase tracking-widest font-mono text-[8px]">Sector Track</span>
              <span className="font-bold text-[#c5a059] uppercase tracking-wide px-1.5 py-0.25 bg-[#c5a059]/10 rounded border border-[#c5a059]/10">
                {hoveredEntity.challengeAreas[0]}
              </span>
            </div>
            
            <div className="flex justify-between items-center text-[10px]">
              <span className="text-white/40 uppercase tracking-widest font-mono text-[8px]">Readiness Stage</span>
              <span className="font-mono text-white/80 capitalize font-medium">
                {hoveredEntity.readinessStage}
              </span>
            </div>
          </div>

          {/* Quick status bullet footer */}
          <div className="mt-2.5 flex items-center justify-between text-[9px] font-mono text-white/50">
            <span className="flex items-center space-x-1 uppercase text-[8px] tracking-widest">
              <span className={`w-1.5 h-1.5 rounded-full ${
                hoveredEntity.engagementStatus === 'follow_up_needed' ? 'bg-red-500' :
                hoveredEntity.engagementStatus === 'qualified' ? 'bg-emerald-400' :
                'bg-[#c5a059]'
              }`}></span>
              <span>{hoveredEntity.engagementStatus.replace("_", " ")}</span>
            </span>
            
            {onAddToBriefingQueue && (
              <button
                type="button"
                className="px-2 py-0.5 rounded bg-[#c5a059]/20 hover:bg-[#c5a059]/40 text-[#c5a059] border border-[#c5a059]/30 text-[9px] font-bold tracking-wider uppercase transition-colors cursor-pointer"
                onClick={() => {
                  onAddToBriefingQueue(hoveredEntity);
                  setHoveredEntity(null);
                }}
              >
                + Quick Pin
              </button>
            )}
          </div>
        </div>
      )}

      {/* Dynamic Hover Tooltip for Regional Map Clusters */}
      {hoveredRegion && hoveredRegionMetrics && (
        <div 
          className="absolute z-50 bg-[#15151c]/95 border border-[#c5a059]/40 p-3 rounded-lg shadow-2xl pointer-events-none w-64 text-xs select-none"
          style={{ 
            left: `${Math.max(10, Math.min(regionTooltipPos.x, window.innerWidth - 280))}px`, 
            top: `${regionTooltipPos.y}px`,
            boxShadow: "0 10px 30px rgba(0,0,0,0.6)"
          }}
        >
          {/* Header */}
          <div className="flex items-center justify-between border-b border-white/10 pb-1.5 mb-2">
            <div>
              <span className="font-bold text-white block text-sm tracking-wide">{hoveredRegionMetrics.regionName} Region</span>
              <span className="text-[9px] text-white/40 font-mono uppercase">Ecosystem Cluster Hub</span>
            </div>
            <span className="bg-[#c5a059]/15 text-[#c5a059] border border-[#c5a059]/30 px-2 py-0.5 rounded text-[10px] font-mono font-bold">
              {hoveredRegionMetrics.activeNodes || 0} {hoveredRegionMetrics.activeNodes === 1 ? 'Node' : 'Nodes'}
            </span>
          </div>

          {/* Details */}
          <div className="space-y-1.5 font-sans text-[11px]">
            <div className="flex justify-between items-center bg-white/5 px-1.5 py-1 rounded">
              <span className="text-white/40">Active nodes:</span>
              <span className="font-bold text-[#c5a059]">{hoveredRegionMetrics.activeNodes}</span>
            </div>
            <div className="flex justify-between items-center bg-white/5 px-1.5 py-1 rounded">
              <span className="text-white/40">Key challenge area:</span>
              <span className="font-semibold text-emerald-400 text-right truncate max-w-[120px]" title={hoveredRegionMetrics.keyChallenge}>
                {hoveredRegionMetrics.keyChallenge}
              </span>
            </div>
            <div className="flex justify-between items-center text-[10px] text-white/50 pt-1">
              <span>Coverage:</span>
              <span className="italic truncate max-w-[150px]" title={hoveredRegionMetrics.citiesList}>
                {hoveredRegionMetrics.citiesList}
              </span>
            </div>
          </div>
        </div>
      )}

      {/* Map Legend Floating Lower Left */}
      <div className="absolute bottom-4 left-4 z-10 select-none text-[10px] pointer-events-auto flex flex-col items-start">
        <button 
          onClick={() => setIsLegendOpen(!isLegendOpen)}
          className="bg-white/90 backdrop-blur-md border border-slate-200/80 px-3 py-1.5 rounded-lg flex items-center space-x-2 text-slate-600 hover:text-slate-900 transition-colors cursor-pointer shadow-[0_6px_18px_rgba(15,23,42,0.12)] mb-2"
        >
          <Layers className="w-3.5 h-3.5 text-[#c5a059]" />
          <span className="font-mono font-bold uppercase tracking-wider">Legend</span>
          {isLegendOpen ? <ChevronDown className="w-3 h-3" /> : <ChevronUp className="w-3 h-3" />}
        </button>
        
        {isLegendOpen && (
          <div className="bg-white/90 backdrop-blur-md border border-slate-200/80 p-3.5 rounded-xl w-64 shadow-[0_12px_32px_rgba(15,23,42,0.16)] animate-fade-in">
            <h4 className="font-mono text-[9px] uppercase tracking-wider text-slate-400 font-bold pb-2 border-b border-slate-200">
              {activeLens === "follow_up_needed" ? "Follow-Up Action Lens" : 
               activeLens === "high_readiness" ? "High-Readiness Lens" :
               activeLens === "report_ready_evidence" ? "Evidence Lens" : 
               "Readiness Stage Colors"}
            </h4>
            
            <div className="mt-3 space-y-2 text-[10px] text-slate-600 font-mono">
              {activeLens === "follow_up_needed" ? (
                <>
                  <div className="flex items-center space-x-2">
                    <span className="w-2.5 h-2.5 rounded-full bg-[#F0645A] ring-1 ring-white shadow-sm"></span>
                    <span>Needs Follow-up</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <span className="w-2.5 h-2.5 rounded-full bg-slate-300 ring-1 ring-white shadow-sm"></span>
                    <span>No Action Needed</span>
                  </div>
                </>
              ) : activeLens === "high_readiness" ? (
                <>
                  <div className="flex items-center space-x-2">
                    <span className="w-2.5 h-2.5 rounded-full bg-[#38BDF8] ring-1 ring-white shadow-sm"></span>
                    <span>Prize Ready / Validated</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <span className="w-2.5 h-2.5 rounded-full bg-slate-300 ring-1 ring-white shadow-sm"></span>
                    <span>Other Stages</span>
                  </div>
                </>
              ) : activeLens === "report_ready_evidence" ? (
                <>
                  <div className="flex items-center space-x-2">
                    <span className="w-2.5 h-2.5 rounded-full bg-[#22C55E] ring-1 ring-white shadow-sm"></span>
                    <span>Report-Ready (6+ Evidence)</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <span className="w-2.5 h-2.5 rounded-full bg-slate-300 ring-1 ring-white shadow-sm"></span>
                    <span>Building Evidence</span>
                  </div>
                </>
              ) : (
                <>
                  <div className="flex items-center space-x-2">
                    <span className="w-2.5 h-2.5 rounded-full bg-[#3B82F6] ring-1 ring-white shadow-sm"></span>
                    <span>Prize Ready</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <span className="w-2.5 h-2.5 rounded-full bg-[#14B8A6] ring-1 ring-white shadow-sm"></span>
                    <span>Validated</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <span className="w-2.5 h-2.5 rounded-full bg-[#22C55E] ring-1 ring-white shadow-sm"></span>
                    <span>Pilot</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <span className="w-2.5 h-2.5 rounded-full bg-[#EAB308] ring-1 ring-white shadow-sm"></span>
                    <span>Prototype</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <span className="w-2.5 h-2.5 rounded-full bg-[#F0645A] ring-1 ring-white shadow-sm"></span>
                    <span>Research</span>
                  </div>
                </>
              )}
            </div>

            <div className="mt-3 pt-2.5 border-t border-slate-200 space-y-2 text-[10px] text-slate-600 font-mono">
              <div className="flex items-center space-x-2">
                <svg className="w-3 h-3 overflow-visible px-0.5"><circle cx="4" cy="4" r="3" fill="none" stroke="#c5a059" strokeWidth="1" /></svg>
                <span>Priority Pulse (Score &gt;= 90)</span>
              </div>
              <div className="flex items-center space-x-2">
                 <svg className="w-3 h-3 overflow-visible px-0.5"><circle cx="4" cy="4" r="3" fill="none" stroke="#ef4444" strokeWidth="1" strokeDasharray="1,1" /></svg>
                <span>Action Ping (Needs Follow-up)</span>
              </div>
            </div>
            
            {activeFilters.types.length > 0 && (
              <div className="mt-3 pt-2.5 border-t border-slate-200">
                 <span className="text-[8px] text-slate-400 font-mono uppercase tracking-wider block mb-1.5">Visible Types</span>
                 <div className="flex flex-wrap gap-1">
                    {activeFilters.types.map(t => (
                      <span key={t} className="px-1.5 py-0.5 rounded bg-[#c5a059]/10 border border-[#c5a059]/20 capitalize text-[#9a6b18] font-semibold">{t.replace("_", " ")}</span>
                    ))}
                 </div>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Zoom and Pan Navigation Control Overlay in bottom-right corner */}
      <div className="absolute bottom-4 right-4 z-30 bg-white/90 border border-slate-200/80 backdrop-blur-md p-2 rounded-xl flex flex-col items-center shadow-[0_12px_32px_rgba(15,23,42,0.16)] space-y-1.5 select-none pointer-events-auto">
        <span className="text-[8px] font-mono uppercase tracking-wider text-slate-400 font-bold block pb-1 border-b border-slate-200 w-full text-center">
          Navigate
        </span>
        
        {/* Directional Pad Container */}
        <div className="relative w-24 h-24 bg-slate-100/70 rounded-full border border-slate-200/70 flex items-center justify-center p-1 shadow-inner">
          <button 
            onClick={() => handlePan("up")}
            className="absolute top-1 p-1 rounded-md hover:bg-slate-200 text-slate-500 hover:text-slate-900 transition-all cursor-pointer"
            title="Pan Up"
            id="map-pan-up"
          >
            <ChevronUp className="w-4 h-4" />
          </button>
          <button 
            onClick={() => handlePan("left")}
            className="absolute left-1 p-1 rounded-md hover:bg-slate-200 text-slate-500 hover:text-slate-900 transition-all cursor-pointer"
            title="Pan Left"
            id="map-pan-left"
          >
            <ChevronLeft className="w-4 h-4" />
          </button>
          <button 
            onClick={() => handleResetZoomAndPan()}
            className="p-1 rounded-full bg-[#c5a059]/15 text-[#9a6b18] hover:bg-[#c5a059]/30 transition-all cursor-pointer flex items-center justify-center aspect-square text-[9px] font-mono font-bold uppercase w-10 h-10 select-none border border-[#c5a059]/20"
            title="Recenter Map View"
            id="map-recenter"
          >
            Reset
          </button>
          <button 
            onClick={() => handlePan("right")}
            className="absolute right-1 p-1 rounded-md hover:bg-slate-200 text-slate-500 hover:text-slate-900 transition-all cursor-pointer"
            title="Pan Right"
            id="map-pan-right"
          >
            <ChevronRight className="w-4 h-4" />
          </button>
          <button 
            onClick={() => handlePan("down")}
            className="absolute bottom-1 p-1 rounded-md hover:bg-slate-200 text-slate-500 hover:text-slate-900 transition-all cursor-pointer"
            title="Pan Down"
            id="map-pan-down"
          >
            <ChevronDown className="w-4 h-4" />
          </button>
        </div>

        {/* Separator line */}
        <div className="w-full h-px bg-slate-200"></div>

        {/* Zoom adjustment panel */}
        <div className="flex items-center justify-between w-full space-x-1.5 px-1">
          <button 
            onClick={handleZoomOut}
            className="p-1.5 rounded-md bg-slate-100 hover:bg-slate-200 text-slate-600 hover:text-slate-900 transition-all cursor-pointer flex items-center justify-center border border-slate-200/70"
            title="Zoom Out"
            id="map-zoom-out"
          >
            <Minus className="w-3 h-3" />
          </button>
          
          <span className="font-mono text-[10px] font-semibold text-slate-700 min-w-[36px] text-center select-none">
            {Math.round(zoom * 100)}%
          </span>

          <button 
            onClick={handleZoomIn}
            className="p-1.5 rounded-md bg-slate-100 hover:bg-slate-200 text-slate-600 hover:text-slate-900 transition-all cursor-pointer flex items-center justify-center border border-slate-200/70"
            title="Zoom In"
            id="map-zoom-in"
          >
            <Plus className="w-3 h-3" />
          </button>
        </div>
      </div>
    </div>
  );
}
