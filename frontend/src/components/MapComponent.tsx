import React, { useEffect, useRef } from 'react';
import L from 'leaflet';

// Fix standard Leaflet default marker icon paths in React Vite
delete (L.Icon.Default.prototype as any)._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png',
  iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
  shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
});

export interface MapMarkerItem {
  id: number | string;
  latitude: number;
  longitude: number;
  title: string;
  category: string;
  severity?: string;
  is_official?: boolean;
  description?: string;
  type?: 'traffic' | 'easyaccess';
}

interface MapComponentProps {
  markers: MapMarkerItem[];
  center?: [number, number];
  zoom?: number;
  height?: string;
  onLocationSelect?: (lat: number, lng: number) => void;
  selectedCoord?: [number, number] | null;
}

export const MapComponent: React.FC<MapComponentProps> = ({
  markers,
  center = [23.8103, 90.4125], // Dhaka Zero Point
  zoom = 12,
  height = '420px',
  onLocationSelect,
  selectedCoord,
}) => {
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<L.Map | null>(null);
  const markersLayerRef = useRef<L.LayerGroup | null>(null);
  const tempMarkerRef = useRef<L.Marker | null>(null);

  // Initialize map once
  useEffect(() => {
    if (!mapContainerRef.current) return;

    if (!mapInstanceRef.current) {
      const map = L.map(mapContainerRef.current, {
        center,
        zoom,
        zoomControl: true,
      });

      L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
        maxZoom: 19,
      }).addTo(map);

      const markersGroup = L.layerGroup().addTo(map);
      markersLayerRef.current = markersGroup;
      mapInstanceRef.current = map;

      if (onLocationSelect) {
        map.on('click', (e: L.LeafletMouseEvent) => {
          onLocationSelect(e.latlng.lat, e.latlng.lng);
        });
      }
    }

    return () => {
      // Keep map instance alive across rerenders or clean up on unmount
    };
  }, []);

  // Update center if explicitly shifted
  useEffect(() => {
    if (mapInstanceRef.current && center) {
      mapInstanceRef.current.setView(center, zoom);
    }
  }, [center[0], center[1], zoom]);

  // Update selected coordinate temporary pin
  useEffect(() => {
    if (!mapInstanceRef.current) return;

    if (tempMarkerRef.current) {
      tempMarkerRef.current.remove();
      tempMarkerRef.current = null;
    }

    if (selectedCoord) {
      const pinIcon = L.divIcon({
        className: 'custom-pin',
        html: `<div style="background-color: #f42a41; width: 18px; height: 18px; border-radius: 50%; border: 3px solid white; box-shadow: 0 0 10px rgba(0,0,0,0.5);"></div>`,
        iconSize: [18, 18],
        iconAnchor: [9, 9],
      });
      tempMarkerRef.current = L.marker(selectedCoord, { icon: pinIcon }).addTo(mapInstanceRef.current);
      tempMarkerRef.current.bindPopup('<b>Selected Location</b><br/>Ready to report incident').openPopup();
    }
  }, [selectedCoord]);

  // Render markers
  useEffect(() => {
    if (!markersLayerRef.current || !mapInstanceRef.current) return;

    markersLayerRef.current.clearLayers();

    markers.forEach((m) => {
      if (!m.latitude || !m.longitude) return;

      // Color selection based on category/type
      let color = '#10b981'; // default emerald
      if (m.type === 'traffic') {
        if (m.is_official) color = '#7c3aed'; // official authority: purple
        else if (m.category === 'waterlogging') color = '#0284c7'; // sky-blue
        else if (m.category === 'road_closure' || m.severity === 'severe') color = '#e11d48'; // rose-red
        else if (m.category === 'accident') color = '#ea580c'; // orange
        else color = '#d97706'; // congestion amber
      } else if (m.type === 'easyaccess') {
        color = '#059669'; // accessible green
      }

      const customIcon = L.divIcon({
        className: 'custom-marker',
        html: `<div style="
          background-color: ${color};
          width: 24px;
          height: 24px;
          border-radius: 50%;
          border: 2.5px solid white;
          box-shadow: 0 2px 8px rgba(0,0,0,0.3);
          display: flex;
          align-items: center;
          justify-content: center;
          color: white;
          font-size: 11px;
          font-weight: bold;
        ">
          ${m.is_official ? '★' : '•'}
        </div>`,
        iconSize: [24, 24],
        iconAnchor: [12, 12],
        popupAnchor: [0, -12],
      });

      const marker = L.marker([m.latitude, m.longitude], { icon: customIcon });

      const popupHtml = `
        <div style="font-family: inherit; font-size: 12px; line-height: 1.4; max-width: 220px;">
          <div style="font-weight: 700; color: #0f172a; margin-bottom: 2px;">
            ${m.title}
          </div>
          ${m.is_official ? `<div style="display:inline-block; font-size:10px; background:#f3e8ff; color:#6b21a8; padding:1px 6px; border-radius:4px; font-weight:600; margin-bottom:4px;">Official Authority Feed</div>` : ''}
          <div style="color: #475569; font-size: 11px;">
            ${m.description ? m.description.slice(0, 100) + '...' : ''}
          </div>
        </div>
      `;

      marker.bindPopup(popupHtml);
      markersLayerRef.current?.addLayer(marker);
    });
  }, [markers]);

  return (
    <div className="relative w-full rounded-2xl overflow-hidden border border-slate-200 shadow-sm bg-slate-100">
      <div ref={mapContainerRef} style={{ width: '100%', height }} />
      {onLocationSelect && (
        <div className="absolute bottom-3 left-3 z-[1000] bg-white/90 backdrop-blur-md px-3 py-1.5 rounded-lg border border-slate-200 text-[11px] text-slate-700 font-medium shadow-xs pointer-events-none">
          📍 Click anywhere on map to select incident location
        </div>
      )}
    </div>
  );
};
