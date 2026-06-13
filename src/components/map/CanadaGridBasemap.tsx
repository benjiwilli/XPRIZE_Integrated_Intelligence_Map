import React, { useMemo } from "react";

// Precise mathematical mask function which outlines the geographic Canada silhouette for our coordinate box
export const isInsideCanada = (x: number, y: number): boolean => {
  if (x < 8) return false;
  if (x >= 14 && x <= 56 && y > 76.5) return false; // US border alignment constraint

  // West Coast slant slope
  const coastLine = 9 + (y - 32) * 0.10;
  if (x < coastLine) {
    if (x >= 10 && x <= 13.5 && y >= 72 && y <= 76) return true; // Vancouver Island
    return false;
  }

  // Hudson Bay negative space scoop
  const dxHudson = x - 53;
  const dyHudson = y - 48;
  const distHudsonSq = dxHudson * dxHudson + dyHudson * dyHudson;
  if (distHudsonSq < 88) {
    const isJamesBay = x >= 56 && x <= 59.5 && y >= 55 && y <= 63;
    if (isJamesBay || distHudsonSq < 78) return false;
  }

  // Great Lakes negative space gaps (Erie, Ontario, Huron, Superior bounds)
  const dxSup = x - 54.5;
  const dySup = y - 79;
  if (dxSup * dxSup + dySup * dySup < 5) return false;
  const dxHurun = x - 61.5;
  const dyHurun = y - 82.5;
  if (dxHurun * dxHurun + dyHurun * dyHurun < 4) return false;
  if (x >= 63.5 && x <= 69 && y >= 88.5 && y <= 90.5) return false;

  // St Lawrence River diagonal gap channel
  if (x >= 73 && x <= 84 && y >= 68 && y <= 80) {
    const riverVal = y - (-0.6 * x + 124.5);
    if (Math.abs(riverVal) < 1.4 && x > 75) return false;
  }

  // Mainland blocks
  if (x >= 8 && x < 28 && y >= 32 && y <= 77) return true; // BC/Yukon
  if (x >= 28 && x < 50 && y >= 38 && y <= 77) return true; // Prairies & Central NWT
  if (x >= 50 && x <= 72 && y >= 56 && y <= 91) return true; // Ontario
  if (x > 72 && x <= 85 && y >= 47 && y <= 84) return true; // Quebec
  
  // Atlantic block (NB, PEI, NS)
  if (x >= 80 && x <= 84 && y >= 75 && y <= 80) return true; // NB
  if (x >= 84 && x <= 89.5 && y >= 79 && y <= 84) {
    if (x >= 83.5 && x <= 85.5 && y >= 78.5 && y <= 80.5) return false; // Bay of Fundy
    return true; // NS
  }
  if (x >= 83.5 && x <= 86.5 && y >= 77 && y <= 78) return true; // PEI

  // Newfoundland Island
  if (x >= 89 && x <= 97 && y >= 59 && y <= 71.5) {
    if (x < 90.5 && y > 68) return false;
    return true;
  }

  // Northern Territories & Arctic Islands
  if (x >= 45 && x <= 62 && y >= 6 && y <= 19) {
    if (x > 54 && y > 15) return false;
    return true; // Ellesmere Island
  }
  if (x >= 54 && x <= 75 && y >= 19 && y <= 45) {
    if (x >= 56 && x <= 61 && y >= 20 && y <= 28) return true;
    if (x >= 58 && x <= 68 && y >= 27 && y <= 35) return true;
    if (x >= 64 && x <= 74 && y >= 34 && y <= 45) {
      if (x > 71 && y < 39) return false;
      return true;
    } // Baffin Island
  }
  if (x >= 31 && x <= 44 && y >= 22 && y <= 31) {
    if (x > 41 && y > 28) return false;
    return true; // Victoria Island
  }
  if (x >= 21 && x <= 29 && y >= 21 && y <= 30) return true; // Banks Island
  if (x >= 30 && x <= 52 && y >= 16 && y <= 22) {
    if (x === 38 || x === 44 || x === 48) return false;
    return true; // Melville/Somerset
  }
  if (x >= 46 && x <= 51 && y >= 36 && y <= 42) return true; // Southampton Island

  return false;
};

export default function CanadaGridBasemap() {
  const canadaGridPoints = useMemo(() => {
    const points: { x: number; y: number; opacity: number }[] = [];
    // Small square cells matching visual density requirements of the specs
    for (let x = 8; x <= 97; x += 1.35) {
      for (let y = 6; y <= 91; y += 1.5) {
        if (isInsideCanada(x, y)) {
          const sinNoise = Math.sin(x * 0.18 + y * 0.22) * 0.12;
          const randomFactor = ((x * 17 + y * 23) % 10) / 100;
          const baseOp = 0.38 + sinNoise + randomFactor;
          points.push({
            x,
            y,
            opacity: Math.max(0.24, Math.min(0.65, baseOp))
          });
        }
      }
    }
    return points;
  }, []);

  return (
    <g id="canada-grid-silhouette">
      {canadaGridPoints.map((pt, index) => (
        <rect
          key={`basemap-grid-cell-${index}`}
          x={pt.x - 0.45}
          y={pt.y - 0.45}
          width={0.9}
          height={0.9}
          fill="#14B8A6"
          fillOpacity={pt.opacity}
          rx={0.25}
          className="transition-all duration-300 hover:fill-[#22d4bf]"
        />
      ))}
    </g>
  );
}
