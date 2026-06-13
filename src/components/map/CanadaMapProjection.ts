/**
 * Maps geographic coordinates of Canada to the 0-100 coordinate grid space of our dashboard.
 * Uses a customized conic projection with northern latitude compression.
 */
export function projectCanadaPoint(latitude: number, longitude: number): { x: number; y: number } {
  // Check against known cities first to guarantee perfect alignment with UI filters and custom city labels.
  const knownCities = [
    // Percent coordinates aligned to the generated education-map Canada pixel basemap.
    { lat: 49.2827, lng: -123.1207, x: 12.4, y: 52.3 }, // Vancouver
    { lat: 51.0447, lng: -114.0719, x: 23.6, y: 52.7 }, // Calgary
    { lat: 53.5461, lng: -113.4937, x: 24.1, y: 37.0 }, // Edmonton
    { lat: 52.1332, lng: -106.6700, x: 29.6, y: 43.1 }, // Saskatoon
    { lat: 49.8951, lng: -97.1384,  x: 38.3, y: 59.5 }, // Winnipeg
    { lat: 43.4643, lng: -80.5204,  x: 49.6, y: 65.3 }, // Waterloo
    { lat: 43.6532, lng: -79.3832,  x: 53.7, y: 78.4 }, // Toronto
    { lat: 45.4215, lng: -75.6972,  x: 61.9, y: 66.7 }, // Ottawa
    { lat: 45.5017, lng: -73.5673,  x: 70.9, y: 61.2 }, // Montreal
    { lat: 46.8139, lng: -71.2082,  x: 67.8, y: 49.5 }, // Quebec City
    { lat: 44.6488, lng: -63.5752,  x: 79.2, y: 70.8 }, // Halifax
    { lat: 47.5615, lng: -52.7126,  x: 85.4, y: 58.3 }, // St. John's
    { lat: 60.7212, lng: -135.0568, x: 13.7, y: 24.2 }, // Whitehorse
    { lat: 62.4540, lng: -114.3718, x: 26.7, y: 28.1 }, // Yellowknife
    { lat: 63.7467, lng: -68.5170,  x: 73.6, y: 38.3 }  // Iqaluit
  ];

  for (const city of knownCities) {
    const dLat = Math.abs(city.lat - latitude);
    const dLng = Math.abs(city.lng - longitude);
    // Expand tolerances slightly for precise mapping matching synthetic dataset lat/lng entries
    if (dLat < 0.8 && dLng < 1.2) {
      return { x: city.x, y: city.y };
    }
  }

  // Fallback geometric projection for arbitrary latitude/longitude values
  const centerLng = -96;
  const radFactor = Math.PI / 180;
  
  // Distance from pole (higher latitude means smaller distance r)
  // Compress higher latitudes so Ellesmere Island and Greenland gaps remain beautifully positioned
  const r = 90 - latitude;
  
  // Standard wide-sweep angle
  const theta = (longitude - centerLng) * 0.76 * radFactor;

  let x = 50 + r * Math.sin(theta) * 1.18;
  let y = 78 - r * Math.cos(theta) * 1.05;

  // Clamp within safe geographic canvas boundaries
  x = Math.max(9, Math.min(96, x));
  y = Math.max(8, Math.min(92, y));

  return { x, y };
}
