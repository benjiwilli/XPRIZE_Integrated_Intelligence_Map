# Canada Pixel Map Replacement Notes

This repo has been updated so the Ecosystem Map uses the generated education-style `canada-pixel-map` as the basemap.

Changed files:

- `src/components/map/CanadaPixelBasemapCanvas.tsx` — new animated canvas basemap generated from the standalone Canada pixel map.
- `src/components/map/CanadaPixelBasemapCanvas.css` — responsive full-bleed canvas styling.
- `src/components/map/EcosystemMapCanvas.tsx` — now renders the canvas basemap beneath the existing interactive SVG entity layer.
- `src/components/map/CanadaMapProjection.ts` — city projection coordinates remapped to the generated basemap.
- `src/data/syntheticData.ts` — fallback city coordinates remapped for entities without lat/lng.
- `src/components/map/MapLabelLayer.tsx` — label positions/style tuned to the light education-map aesthetic.

The static markers inside the generated canvas are disabled by default to avoid duplicating the live interactive entity nodes. To render the static generated markers too, pass `drawMarkers={true}` to `CanadaPixelBasemapCanvas`, but this is not recommended for the app view because it will create double markers.
