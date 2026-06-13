import React from "react";

export default function MapHeatLayer() {
  return (
    <>
      <defs>
        {/* Luminous Regional Heatmap Glow Gradients optimized for the graphite SaaS layout */}
        <radialGradient id="heat-alberta" cx="24%" cy="66%" r="22%">
          <stop offset="0%" stopColor="#ef4444" stopOpacity="0.48" />
          <stop offset="25%" stopColor="#f59e0b" stopOpacity="0.28" />
          <stop offset="65%" stopColor="#f59e0b" stopOpacity="0.08" />
          <stop offset="100%" stopColor="#f59e0b" stopOpacity="0" />
        </radialGradient>
        
        <radialGradient id="heat-vancouver" cx="14%" cy="72%" r="14%">
          <stop offset="0%" stopColor="#06b6d4" stopOpacity="0.45" />
          <stop offset="55%" stopColor="#10b981" stopOpacity="0.12" />
          <stop offset="100%" stopColor="#10b981" stopOpacity="0" />
        </radialGradient>

        <radialGradient id="heat-toronto" cx="64%" cy="86%" r="15%">
          <stop offset="0%" stopColor="#3b82f6" stopOpacity="0.42" />
          <stop offset="50%" stopColor="#06b6d4" stopOpacity="0.15" />
          <stop offset="100%" stopColor="#22d4bf" stopOpacity="0" />
        </radialGradient>

        <radialGradient id="heat-quebec" cx="76%" cy="78%" r="16%">
          <stop offset="0%" stopColor="#8b5cf6" stopOpacity="0.38" />
          <stop offset="60%" stopColor="#a78bfa" stopOpacity="0.12" />
          <stop offset="100%" stopColor="#8b5cf6" stopOpacity="0" />
        </radialGradient>

        <radialGradient id="heat-atlantic" cx="89%" cy="79%" r="15%">
          <stop offset="0%" stopColor="#f59e0b" stopOpacity="0.4" />
          <stop offset="55%" stopColor="#ea580c" stopOpacity="0.15" />
          <stop offset="100%" stopColor="#f59e0b" stopOpacity="0" />
        </radialGradient>

        <radialGradient id="heat-north" cx="57%" cy="26%" r="13%">
          <stop offset="0%" stopColor="#ef4444" stopOpacity="0.35" />
          <stop offset="55%" stopColor="#f97316" stopOpacity="0.12" />
          <stop offset="100%" stopColor="#ef4444" stopOpacity="0" />
        </radialGradient>
      </defs>

      {/* Luminous Heatmap Circles with soft screen-blending */}
      <g id="map-heat-regions" style={{ mixBlendMode: "screen" }}>
        {/* Alberta Hub central massive heat glow */}
        <circle cx="24" cy="66" r="22" fill="url(#heat-alberta)" />
        {/* British Columbia/Vancouver coastal glow */}
        <circle cx="14" cy="72" r="14" fill="url(#heat-vancouver)" />
        {/* Southern Ontario/Waterloo tech tech belt */}
        <circle cx="64" cy="86" r="15" fill="url(#heat-toronto)" />
        {/* Quebec corridor purple heat cluster */}
        <circle cx="76" cy="78" r="16" fill="url(#heat-quebec)" />
        {/* Atlantic Canada / Halifax startup denseness */}
        <circle cx="89" cy="79" r="15" fill="url(#heat-atlantic)" />
        {/* Arctic Hub Anchor and Iqaluit sector network warmth */}
        <circle cx="57" cy="26" r="13" fill="url(#heat-north)" />
      </g>
    </>
  );
}
