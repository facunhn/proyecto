import { useEffect, useRef } from 'react';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { BASE_LAT, BASE_LON } from '../api/mockData';

const pinIcon = L.divIcon({
  className: '',
  html: `<svg width="28" height="28" viewBox="0 0 24 24" fill="#22b24a" stroke="#ffffff" stroke-width="1.5"><path d="M12 21s7-7.5 7-12a7 7 0 10-14 0c0 4.5 7 12 7 12z"/></svg>`,
  iconSize: [28, 28],
  iconAnchor: [14, 26],
});

const youIcon = L.divIcon({
  className: '',
  html: `<div style="width:16px;height:16px;border-radius:50%;background:#22b24a;border:3px solid #ffffff;box-shadow:0 0 0 6px rgba(34,178,74,0.3)"></div>`,
  iconSize: [16, 16],
  iconAnchor: [8, 8],
});

export default function PromoMap({ promos, coords, onOpen }) {
  const containerRef = useRef(null);
  const mapRef = useRef(null);
  const markersRef = useRef([]);

  useEffect(() => {
    if (!containerRef.current || mapRef.current) return;
    const map = L.map(containerRef.current, { zoomControl: false, attributionControl: false }).setView([BASE_LAT, BASE_LON], 14);
    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', { maxZoom: 19 }).addTo(map);
    mapRef.current = map;
    return () => {
      map.remove();
      mapRef.current = null;
    };
  }, []);

  useEffect(() => {
    const map = mapRef.current;
    if (!map) return;
    markersRef.current.forEach((m) => m.remove());
    markersRef.current = [];

    const center = coords ? [coords.lat, coords.lon] : [BASE_LAT, BASE_LON];

    if (coords) {
      const youMarker = L.marker(center, { icon: youIcon, interactive: false }).addTo(map);
      markersRef.current.push(youMarker);
    }

    promos.forEach((p) => {
      const lat = BASE_LAT + (p.dLat ?? 0);
      const lon = BASE_LON + (p.dLon ?? 0);
      const marker = L.marker([lat, lon], { icon: pinIcon }).addTo(map);
      marker.on('click', () => onOpen(p.id));
      marker.bindTooltip(p.business, { direction: 'top', offset: [0, -24] });
      markersRef.current.push(marker);
    });

    map.setView(center, coords ? 15 : 14);
  }, [promos, coords, onOpen]);

  return <div ref={containerRef} style={{ width: '100%', height: '100%' }} />;
}
