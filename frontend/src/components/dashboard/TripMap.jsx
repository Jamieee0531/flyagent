import { useEffect, useRef, useState } from 'react';
import './TripMap.css';

const MAPS_KEY = import.meta.env.VITE_GOOGLE_MAPS_KEY;

// Dynamically load Google Maps script (only once)
let mapsPromise = null;
function loadGoogleMaps() {
  if (window.google?.maps) return Promise.resolve();
  if (mapsPromise) return mapsPromise;
  mapsPromise = new Promise((resolve, reject) => {
    const script = document.createElement('script');
    script.src = `https://maps.googleapis.com/maps/api/js?key=${MAPS_KEY}&libraries=geocoding`;
    script.async = true;
    script.onload = resolve;
    script.onerror = reject;
    document.head.appendChild(script);
  });
  return mapsPromise;
}

const MARKER_COLORS = ['#c4593a', '#3a6b8a', '#b8873c', '#4a6b5a', '#9b9488', '#7c5cbf'];

export default function TripMap({ stops }) {
  const mapRef = useRef(null);
  const mapInstanceRef = useRef(null);
  const markersRef = useRef([]);
  const [error, setError] = useState(null);

  // Filter stops that have location data
  const locatedStops = (stops || []).filter((s) => s.location);

  useEffect(() => {
    if (!MAPS_KEY || locatedStops.length === 0) return;

    let cancelled = false;

    async function initMap() {
      try {
        await loadGoogleMaps();
        if (cancelled) return;

        const geocoder = new window.google.maps.Geocoder();
        const bounds = new window.google.maps.LatLngBounds();
        const positions = [];

        // Geocode all locations
        for (let i = 0; i < locatedStops.length; i++) {
          try {
            const result = await new Promise((resolve, reject) => {
              geocoder.geocode({ address: locatedStops[i].location }, (results, status) => {
                if (status === 'OK' && results[0]) resolve(results[0].geometry.location);
                else reject(new Error(status));
              });
            });
            positions.push({ idx: i, pos: result, stop: locatedStops[i] });
            bounds.extend(result);
          } catch {
            // Skip stops that can't be geocoded
          }
        }

        if (cancelled || positions.length === 0) return;

        // Create or update map
        if (!mapInstanceRef.current) {
          mapInstanceRef.current = new window.google.maps.Map(mapRef.current, {
            zoom: 13,
            center: positions[0].pos,
            disableDefaultUI: true,
            zoomControl: true,
            mapTypeControl: false,
            streetViewControl: false,
            styles: [
              { featureType: 'poi', stylers: [{ visibility: 'simplified' }] },
              { featureType: 'water', stylers: [{ color: '#c8dbe6' }] },
              { featureType: 'landscape', stylers: [{ color: '#e8e2d6' }] },
            ],
          });
        }

        // Clear old markers
        markersRef.current.forEach((m) => m.setMap(null));
        markersRef.current = [];

        // Add numbered markers
        for (const { idx, pos, stop } of positions) {
          const color = MARKER_COLORS[idx % MARKER_COLORS.length];
          const marker = new window.google.maps.Marker({
            position: pos,
            map: mapInstanceRef.current,
            label: {
              text: String(idx + 1),
              color: 'white',
              fontSize: '11px',
              fontWeight: '600',
            },
            icon: {
              path: window.google.maps.SymbolPath.CIRCLE,
              scale: 14,
              fillColor: color,
              fillOpacity: 1,
              strokeColor: 'white',
              strokeWeight: 2,
            },
            title: stop.location,
          });
          markersRef.current.push(marker);
        }

        // Fit map to show all markers
        if (positions.length > 1) {
          mapInstanceRef.current.fitBounds(bounds, { top: 30, bottom: 30, left: 30, right: 30 });
        } else {
          mapInstanceRef.current.setCenter(positions[0].pos);
          mapInstanceRef.current.setZoom(14);
        }
      } catch (err) {
        if (!cancelled) setError('Map failed to load');
      }
    }

    initMap();
    return () => {
      cancelled = true;
      // Clean up markers and map instance on unmount
      markersRef.current.forEach((m) => m.setMap(null));
      markersRef.current = [];
      mapInstanceRef.current = null;
    };
  }, [locatedStops.map((s) => s.location).join(',')]);

  if (!MAPS_KEY) return null;
  if (locatedStops.length === 0) return null;
  if (error) return null; // Silently hide map on error

  return (
    <div className="trip-map-wrap">
      <div className="trip-map" ref={mapRef} />
    </div>
  );
}
