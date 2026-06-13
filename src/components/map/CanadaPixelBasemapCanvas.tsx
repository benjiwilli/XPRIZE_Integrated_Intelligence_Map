import { useEffect, useRef } from 'react';
import './CanadaPixelBasemapCanvas.css';

const DESIGN_WIDTH = 1586;
const DESIGN_HEIGHT = 992;
const GRID_ORIGIN_X = 2.0;
const GRID_ORIGIN_Y = 3.6;
const GRID_STEP = 11.0;
const TILE_SIZE = 7.4;
const ROW_RUNS: Array<[number, Array<[number, number]>]> = [[3,[[16,3]]],[4,[[15,5],[51,2],[62,2],[66,1]]],[5,[[15,5],[48,6],[60,4],[65,3],[74,3]]],[6,[[15,6],[48,6],[60,4],[65,3],[71,7]]],[7,[[14,9],[36,1],[38,1],[47,8],[61,3],[65,2],[70,12]]],[8,[[14,11],[31,3],[35,5],[48,7],[62,2],[70,12]]],[9,[[14,14],[30,11],[49,7],[65,2],[70,14]]],[10,[[13,29],[50,6],[64,3],[71,14]]],[11,[[13,30],[45,1],[52,5],[63,4],[71,15]]],[12,[[12,31],[45,4],[51,8],[61,1],[63,5],[79,10]]],[13,[[12,32],[46,11],[61,1],[63,6],[74,2],[81,10]]],[14,[[12,33],[47,6],[54,3],[59,11],[73,3],[82,10]]],[15,[[11,34],[48,4],[59,12],[73,4],[83,10]]],[16,[[11,35],[59,12],[73,4],[81,1],[83,11]]],[17,[[13,34],[52,26],[81,1],[85,11]]],[18,[[10,2],[13,35],[50,2],[53,25],[82,1],[86,12]]],[19,[[10,42],[53,25],[86,12]]],[20,[[10,43],[54,23],[86,13]]],[21,[[11,65],[85,9],[95,5]]],[22,[[12,61],[74,1],[84,8],[96,3]]],[23,[[13,59],[81,12],[97,2]]],[24,[[14,61],[81,13],[98,1]]],[25,[[14,57],[72,4],[82,1],[86,9],[98,1]]],[26,[[14,56],[72,5],[87,10]]],[27,[[14,55],[72,7],[81,1],[88,10]]],[28,[[14,54],[71,4],[77,2],[89,5],[96,2]]],[29,[[14,53],[73,1],[92,4],[99,1]]],[30,[[14,52],[75,1],[79,1],[82,6],[95,3]]],[31,[[14,51],[74,1],[82,7],[98,1]]],[32,[[13,51],[82,9],[93,2],[97,4],[109,2]]],[33,[[13,50],[82,10],[94,1],[97,6],[108,3],[112,1]]],[34,[[10,2],[13,22],[36,27],[82,10],[97,9],[107,7]]],[35,[[9,2],[12,51],[83,10],[97,17]]],[36,[[9,2],[12,52],[83,11],[96,13],[110,3]]],[37,[[9,1],[12,52],[83,29]]],[38,[[9,1],[13,52],[84,28]]],[39,[[9,1],[13,16],[30,35],[84,31]]],[40,[[10,1],[13,18],[32,34],[84,33]]],[41,[[11,1],[13,56],[85,35]]],[42,[[10,60],[85,37]]],[43,[[10,62],[85,38]]],[44,[[11,29],[41,33],[84,39]]],[45,[[11,21],[33,3],[38,1],[40,35],[83,39]]],[46,[[11,21],[33,5],[41,34],[83,36],[120,4]]],[47,[[12,19],[32,1],[34,6],[41,3],[45,31],[78,2],[83,35],[121,3]]],[48,[[12,7],[20,10],[31,6],[41,35],[78,3],[83,34],[121,4],[127,2]]],[49,[[13,2],[16,2],[19,11],[33,5],[41,1],[43,1],[45,32],[79,2],[83,33],[122,8]]],[50,[[13,3],[17,14],[32,6],[41,37],[80,1],[84,32],[121,10]]],[51,[[12,3],[17,7],[26,6],[33,5],[41,1],[44,35],[82,9],[92,1],[94,20],[121,10]]],[52,[[13,1],[15,1],[17,6],[26,8],[41,1],[43,37],[82,9],[93,20],[120,12]]],[53,[[17,14],[32,2],[38,75],[121,11]]],[54,[[18,7],[26,1],[28,1],[30,1],[32,2],[37,1],[39,71],[114,4],[121,12]]],[55,[[19,4],[26,16],[44,20],[65,53],[121,12]]],[56,[[20,4],[25,92],[121,1],[123,3],[130,1]]],[57,[[22,7],[30,11],[42,74],[121,1],[123,1]]],[58,[[23,93]]],[59,[[24,92]]],[60,[[24,50],[75,13],[89,16],[106,11]]],[61,[[25,48],[74,13],[90,3],[94,11],[106,12],[122,1],[124,1]]],[62,[[26,60],[88,17],[107,14],[122,2]]],[63,[[27,10],[41,45],[88,18],[107,17]]],[64,[[28,8],[43,43],[88,18],[108,15]]],[65,[[31,4],[43,6],[55,30],[87,17],[109,4],[115,8]]],[66,[[58,26],[86,18],[115,2],[119,8]]],[67,[[59,24],[85,16],[115,7],[124,1]]],[68,[[60,22],[83,18],[116,5]]],[69,[[62,38],[115,5]]],[70,[[64,36],[114,5],[120,1]]],[71,[[67,11],[79,12],[92,7],[114,7]]],[72,[[72,6],[79,14],[94,6],[114,7]]],[73,[[73,5],[79,2],[83,15],[114,7]]],[74,[[74,4],[81,1],[83,13],[115,5]]],[75,[[75,14],[91,3],[117,2]]],[76,[[75,13],[90,3]]],[77,[[75,12],[88,4]]],[78,[[75,11],[87,4]]],[79,[[76,10],[89,1]]],[80,[[76,8]]],[81,[[75,9]]],[82,[[74,8]]],[83,[[73,6]]],[84,[[73,6]]],[85,[[74,3]]]];
const HEAT_CLUSTERS: Array<[number, number, number, string, string | null, number, number, number]> = [[0.236,0.526,0.118,"#ffc426","#f22f4f",1.1,2.25,1.0],[0.105,0.545,0.04,"#1688ff",null,1.0,2.4,0.82],[0.382,0.596,0.047,"#00b894",null,1.0,2.55,0.75],[0.537,0.783,0.04,"#1688ff",null,1.0,2.4,0.78],[0.619,0.667,0.044,"#7d3df2",null,1.0,2.8,0.75],[0.619,0.762,0.04,"#7d3df2",null,1.0,2.8,0.72],[0.709,0.612,0.036,"#7d3df2",null,1.0,2.9,0.7],[0.736,0.383,0.034,"#f22f4f",null,1.0,2.8,0.68],[0.817,0.662,0.033,"#ffc426",null,1.0,2.9,0.64],[0.792,0.708,0.029,"#1688ff",null,1.0,2.9,0.56],[0.678,0.495,0.032,"#ff8a18",null,1.0,2.85,0.62],[0.618,0.553,0.034,"#ffc426",null,1.0,2.85,0.62]];
const MARKERS: Array<[number, number, string, number]> = [[217,240,"#17bf72",9],[228,296,"#00b894",10],[284,334,"#00b894",10],[204,426,"#ff6a1f",9],[196,519,"#1688ff",10],[157,552,"#1688ff",11],[255,576,"#ff8a18",12],[286,488,"#17bf72",9],[382,367,"#ffc426",10],[423,279,"#6dc92d",9],[469,428,"#17bf72",9],[335,628,"#00b894",9],[404,641,"#17bf72",10],[374,523,"#f22f4f",14],[598,435,"#17bf72",9],[721,434,"#17bf72",10],[607,590,"#00b894",11],[720,478,"#17bf72",11],[690,526,"#17bf72",10],[689,600,"#1688ff",10],[786,648,"#1688ff",11],[701,720,"#00b894",10],[880,662,"#00b894",9],[852,778,"#1688ff",14],[848,839,"#00b894",10],[981,439,"#17bf72",9],[980,549,"#ffc426",12],[1075,491,"#ff8a18",10],[1125,607,"#7d3df2",11],[982,662,"#7d3df2",12],[982,755,"#7d3df2",11],[1168,380,"#ff4b24",11],[1355,578,"#00b894",10],[1256,702,"#1688ff",10],[1296,657,"#ff8a18",12],[1246,762,"#00b894",9]];

const PALETTE = {
  baseA: [105, 221, 194] as const,
  baseB: [92, 213, 183] as const,
};

type Rgb = [number, number, number];

function lerp(a: number, b: number, t: number) {
  return a + (b - a) * t;
}

function mixRgb(a: readonly number[], b: readonly number[], t: number): Rgb {
  return [
    Math.round(lerp(a[0], b[0], t)),
    Math.round(lerp(a[1], b[1], t)),
    Math.round(lerp(a[2], b[2], t)),
  ];
}

function hexToRgb(hex: string): Rgb {
  const h = hex.replace('#', '');
  return [parseInt(h.slice(0, 2), 16), parseInt(h.slice(2, 4), 16), parseInt(h.slice(4, 6), 16)];
}

function rgba(rgb: readonly number[], alpha = 1) {
  return `rgba(${rgb[0]}, ${rgb[1]}, ${rgb[2]}, ${alpha})`;
}

function roundRect(ctx: CanvasRenderingContext2D, x: number, y: number, w: number, h: number, r: number) {
  const rr = Math.min(r, w / 2, h / 2);
  ctx.beginPath();
  ctx.moveTo(x + rr, y);
  ctx.arcTo(x + w, y, x + w, y + h, rr);
  ctx.arcTo(x + w, y + h, x, y + h, rr);
  ctx.arcTo(x, y + h, x, y, rr);
  ctx.arcTo(x, y, x + w, y, rr);
  ctx.closePath();
}

function clamp(value: number, min: number, max: number) {
  return Math.min(max, Math.max(min, value));
}

function getTileColor(x: number, y: number, time = 0) {
  const baseWave = 0.5 + 0.5 * Math.sin(x * 0.010 + y * 0.009 + time * 0.10);
  const base = mixRgb(PALETTE.baseA, PALETTE.baseB, baseWave);
  let out: Rgb = base;
  let strongest = 0;

  for (let clusterIndex = 0; clusterIndex < HEAT_CLUSTERS.length; clusterIndex += 1) {
    const [cx, cy, radius, color, core, corePower, falloff, strength] = HEAT_CLUSTERS[clusterIndex];
    const clusterX = cx * DESIGN_WIDTH;
    const clusterY = cy * DESIGN_HEIGHT;
    const r = radius * DESIGN_WIDTH;
    const dx = (x - clusterX) / r;
    const dy = (y - clusterY) / r;
    const breath = 1 + 0.06 * Math.sin(time * 0.82 + clusterIndex * 0.77);
    const influence = Math.exp(-(dx * dx + dy * dy) * falloff) * strength * breath;

    if (influence > 0.045 && influence > strongest) {
      strongest = influence;
      out = mixRgb(base, hexToRgb(color), Math.min(0.84, influence * 1.02));

      if (core && influence > 0.28) {
        out = mixRgb(out, hexToRgb(core), Math.min(0.82, (influence - 0.28) * corePower));
      }
    }
  }

  const shimmer = 0.5 + 0.5 * Math.sin(time * 0.72 + x * 0.022 - y * 0.017);
  const alphaBase = strongest > 0.045 ? 0.855 : 0.805;
  return rgba(out, clamp(alphaBase + shimmer * 0.035, 0.78, 0.91));
}

function drawHeatPulses(ctx: CanvasRenderingContext2D, time: number) {
  const pulseClusterIndexes = [0, 3, 4, 7, 8, 10];

  for (const clusterIndex of pulseClusterIndexes) {
    const [cx, cy, radius, color] = HEAT_CLUSTERS[clusterIndex];
    const x = cx * DESIGN_WIDTH;
    const y = cy * DESIGN_HEIGHT;
    const rgb = hexToRgb(color);
    const progress = (time / (4.6 + (clusterIndex % 3) * 0.35) + clusterIndex * 0.151) % 1;
    const ringRadius = radius * DESIGN_WIDTH * (0.45 + progress * 0.95);
    const alpha = Math.pow(1 - progress, 2.25) * 0.055;

    ctx.save();
    ctx.lineWidth = 2.2;
    ctx.strokeStyle = rgba(rgb, alpha);
    ctx.beginPath();
    ctx.arc(x, y, ringRadius, 0, Math.PI * 2);
    ctx.stroke();
    ctx.restore();
  }
}

function drawRipple(ctx: CanvasRenderingContext2D, x: number, y: number, color: string, radius: number, time: number, index: number) {
  const rippleEligible = radius >= 11 || index % 5 === 0;
  if (!rippleEligible) return;

  const rgb = hexToRgb(color);
  const period = radius >= 12 ? 2.85 : 3.55 + (index % 4) * 0.16;
  const ringCount = radius >= 12 ? 2 : 1;

  for (let ring = 0; ring < ringCount; ring += 1) {
    const progress = (time / period + index * 0.137 + ring * 0.52) % 1;
    const ringRadius = radius * (1.45 + progress * (3.15 + (index % 3) * 0.24));
    const alpha = Math.pow(1 - progress, 2.15) * (radius >= 12 ? 0.145 : 0.055);

    ctx.save();
    ctx.lineWidth = radius >= 12 ? 1.65 : 1.15;
    ctx.strokeStyle = rgba(rgb, alpha);
    ctx.beginPath();
    ctx.arc(x, y, ringRadius, 0, Math.PI * 2);
    ctx.stroke();
    ctx.restore();
  }
}

function drawMarker(ctx: CanvasRenderingContext2D, x: number, y: number, color: string, radius: number, time = 0, index = 0) {
  const rgb = hexToRgb(color);
  const pulse = 0.5 + 0.5 * Math.sin(time * 2.25 + index * 0.55);
  const markerRadius = radius * (1 + (radius >= 12 ? 0.045 : 0.022) * pulse);

  drawRipple(ctx, x, y, color, radius, time, index);

  const glow = ctx.createRadialGradient(x, y, 0, x, y, radius * (3.25 + pulse * 0.45));
  glow.addColorStop(0.00, rgba(rgb, 0.20 + pulse * 0.09));
  glow.addColorStop(0.45, rgba(rgb, 0.10 + pulse * 0.035));
  glow.addColorStop(1.00, rgba(rgb, 0));
  ctx.fillStyle = glow;
  ctx.beginPath();
  ctx.arc(x, y, radius * (3.35 + pulse * 0.42), 0, Math.PI * 2);
  ctx.fill();

  ctx.lineWidth = Math.max(3, radius * 0.30);
  ctx.strokeStyle = 'rgba(255,255,255,0.98)';
  ctx.fillStyle = color;
  ctx.beginPath();
  ctx.arc(x, y, markerRadius, 0, Math.PI * 2);
  ctx.fill();
  ctx.stroke();

  ctx.lineWidth = Math.max(1.15, radius * 0.12);
  ctx.strokeStyle = rgba(rgb, 0.24 + pulse * 0.12);
  ctx.beginPath();
  ctx.arc(x, y, radius * (1.38 + pulse * 0.10), 0, Math.PI * 2);
  ctx.stroke();

  ctx.fillStyle = 'rgba(255,255,255,0.58)';
  ctx.beginPath();
  ctx.arc(x - markerRadius * 0.26, y - markerRadius * 0.28, markerRadius * 0.21, 0, Math.PI * 2);
  ctx.fill();
}

function ensureCanvasSize(canvas: HTMLCanvasElement) {
  const dpr = Math.max(1, window.devicePixelRatio || 1);
  const width = Math.round(DESIGN_WIDTH * dpr);
  const height = Math.round(DESIGN_HEIGHT * dpr);

  if (canvas.width !== width || canvas.height !== height) {
    canvas.width = width;
    canvas.height = height;
  }

  canvas.style.width = '100%';
  canvas.style.height = '100%';

  const ctx = canvas.getContext('2d', { alpha: true });
  if (!ctx) return null;

  ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
  return ctx;
}

function renderCanadaPixelMap(canvas: HTMLCanvasElement, time = 0, drawMarkers = false) {
  const ctx = ensureCanvasSize(canvas);
  if (!ctx) return;

  ctx.clearRect(0, 0, DESIGN_WIDTH, DESIGN_HEIGHT);

  const bg = ctx.createRadialGradient(
    DESIGN_WIDTH * 0.50, DESIGN_HEIGHT * 0.48, DESIGN_WIDTH * 0.12,
    DESIGN_WIDTH * 0.50, DESIGN_HEIGHT * 0.48, DESIGN_WIDTH * 0.73,
  );
  bg.addColorStop(0.00, '#ffffff');
  bg.addColorStop(0.64, '#ffffff');
  bg.addColorStop(1.00, '#f7fafb');
  ctx.fillStyle = bg;
  ctx.fillRect(0, 0, DESIGN_WIDTH, DESIGN_HEIGHT);

  drawHeatPulses(ctx, time);

  ctx.shadowColor = 'rgba(15, 70, 96, 0.035)';
  ctx.shadowBlur = 1.2;
  for (const [row, runs] of ROW_RUNS) {
    const y = GRID_ORIGIN_Y + row * GRID_STEP;
    for (const [startColumn, count] of runs) {
      for (let i = 0; i < count; i += 1) {
        const x = GRID_ORIGIN_X + (startColumn + i) * GRID_STEP;
        const microPulse = 0.5 + 0.5 * Math.sin(time * 0.76 + x * 0.013 + y * 0.021);
        const tileSize = TILE_SIZE + (microPulse - 0.5) * 0.18;
        ctx.fillStyle = getTileColor(x, y, time);
        roundRect(ctx, x - tileSize / 2, y - tileSize / 2, tileSize, tileSize, 1.05);
        ctx.fill();
      }
    }
  }
  ctx.shadowBlur = 0;

  if (drawMarkers) {
    for (let index = 0; index < MARKERS.length; index += 1) {
      const [x, y, color, radius] = MARKERS[index];
      drawMarker(ctx, x, y, color, radius, time, index);
    }
  }
}


interface CanadaPixelBasemapCanvasProps {
  animate?: boolean;
  drawMarkers?: boolean;
  className?: string;
}

export default function CanadaPixelBasemapCanvas({
  animate = true,
  drawMarkers = false,
  className = ''
}: CanadaPixelBasemapCanvasProps) {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    let animationFrame = 0;
    let lastFrame = 0;
    const targetFrameMs = 1000 / 30;
    const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)');

    const drawStatic = () => renderCanadaPixelMap(canvas, reducedMotion.matches ? 0 : performance.now() / 1000, drawMarkers);

    const loop = (timestamp: number) => {
      if (reducedMotion.matches || !animate) return;
      if (timestamp - lastFrame >= targetFrameMs) {
        renderCanadaPixelMap(canvas, timestamp / 1000, drawMarkers);
        lastFrame = timestamp;
      }
      animationFrame = requestAnimationFrame(loop);
    };

    const start = () => {
      cancelAnimationFrame(animationFrame);
      lastFrame = 0;
      if (reducedMotion.matches || !animate) {
        renderCanadaPixelMap(canvas, 0, drawMarkers);
      } else {
        animationFrame = requestAnimationFrame(loop);
      }
    };

    start();
    window.addEventListener('resize', drawStatic);
    reducedMotion.addEventListener?.('change', start);

    return () => {
      cancelAnimationFrame(animationFrame);
      window.removeEventListener('resize', drawStatic);
      reducedMotion.removeEventListener?.('change', start);
    };
  }, [animate, drawMarkers]);

  return (
    <div className={`canada-pixel-basemap-shell ${className}`.trim()} aria-label="Animated pixelated Canada ecosystem heat map">
      <canvas ref={canvasRef} className="canada-pixel-basemap-canvas" width={DESIGN_WIDTH} height={DESIGN_HEIGHT} />
    </div>
  );
}
