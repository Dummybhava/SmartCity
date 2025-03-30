import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Map } from "lucide-react";
import { useEffect, useRef, useState } from "react";

interface MapPosition {
  lat: number;
  lng: number;
  zoom: number;
}

export default function CityMap() {
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const [mapLoaded, setMapLoaded] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  // Default city center coordinates (example: New York)
  const defaultPosition: MapPosition = {
    lat: 40.7128,
    lng: -74.0060,
    zoom: 12
  };

  useEffect(() => {
    // Check if Leaflet is available in the window object
    if (typeof window !== 'undefined' && !window.L) {
      // Load Leaflet CSS
      const leafletCss = document.createElement('link');
      leafletCss.rel = 'stylesheet';
      leafletCss.href = 'https://unpkg.com/leaflet@1.9.4/dist/leaflet.css';
      leafletCss.integrity = 'sha256-p4NxAoJBhIIN+hmNHrzRCf9tD/miZyoHS5obTRR9BMY=';
      leafletCss.crossOrigin = '';
      document.head.appendChild(leafletCss);

      // Load Leaflet JS
      const leafletScript = document.createElement('script');
      leafletScript.src = 'https://unpkg.com/leaflet@1.9.4/dist/leaflet.js';
      leafletScript.integrity = 'sha256-20nQCchB9co0qIjJZRGuk2/Z9VM+kNiyxNV1lvTlZBo=';
      leafletScript.crossOrigin = '';
      
      leafletScript.onload = () => {
        initializeMap();
      };
      
      leafletScript.onerror = () => {
        setError("Failed to load map library. Please try again later.");
      };
      
      document.head.appendChild(leafletScript);
    } else if (window.L) {
      // Leaflet already loaded
      initializeMap();
    }
    
    return () => {
      // Clean up map instance if needed
      if (mapLoaded && window.L && mapContainerRef.current) {
        // If we stored the map instance somewhere, we could destroy it here
      }
    };
  }, []);

  const initializeMap = () => {
    if (!mapContainerRef.current || !window.L) return;
    
    try {
      // Initialize map
      const L = window.L;
      const map = L.map(mapContainerRef.current).setView(
        [defaultPosition.lat, defaultPosition.lng], 
        defaultPosition.zoom
      );
      
      // Add tile layer
      L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
      }).addTo(map);
      
      // Add some example POIs
      const attractions = [
        { name: "Innovation Hub", lat: 40.7128, lng: -74.006, type: "education" },
        { name: "Green Café", lat: 40.7139, lng: -74.013, type: "food" },
        { name: "Tech Museum", lat: 40.7119, lng: -74.008, type: "museum" },
        { name: "Smart Shopping Center", lat: 40.7150, lng: -74.009, type: "shopping" }
      ];
      
      // Create markers for attractions
      attractions.forEach(attraction => {
        L.marker([attraction.lat, attraction.lng])
          .addTo(map)
          .bindPopup(`<b>${attraction.name}</b><br>${attraction.type}`);
      });
      
      // Add a circle to represent the city center
      L.circle([defaultPosition.lat, defaultPosition.lng], {
        color: 'blue',
        fillColor: '#0056b3',
        fillOpacity: 0.2,
        radius: 500
      }).addTo(map);
      
      // Set map loaded flag
      setMapLoaded(true);
    } catch (err) {
      console.error("Error initializing map:", err);
      setError("Failed to initialize map. Please try again later.");
    }
  };

  return (
    <Card className="bg-white overflow-hidden shadow rounded-lg">
      <CardHeader className="bg-white px-4 py-5 border-b border-gray-200 sm:px-6">
        <CardTitle className="text-lg leading-6 font-medium text-gray-900">
          Interactive City Map
        </CardTitle>
        <CardDescription className="mt-1 text-sm text-gray-500">
          Explore Smart City's attractions, transportation routes, and points of interest
        </CardDescription>
      </CardHeader>
      <CardContent className="p-0">
        {error ? (
          <div className="h-96 flex items-center justify-center bg-gray-100 text-center px-6">
            <div>
              <svg className="mx-auto h-12 w-12 text-gray-400" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
              </svg>
              <h3 className="mt-2 text-sm font-medium text-gray-900">Map error</h3>
              <p className="mt-1 text-sm text-gray-500">{error}</p>
              <div className="mt-6">
                <Button 
                  onClick={() => window.location.reload()}
                  variant="default"
                >
                  Refresh page
                </Button>
              </div>
            </div>
          </div>
        ) : !mapLoaded ? (
          <div className="h-96 flex items-center justify-center bg-gray-100 text-center px-6">
            <div>
              <svg className="mx-auto h-12 w-12 text-gray-400" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 20l-5.447-2.724A1 1 0 013 16.382V5.618a1 1 0 011.447-.894L9 7m0 13l6-3m-6 3V7m6 10l4.553 2.276A1 1 0 0021 18.382V7.618a1 1 0 00-.553-.894L15 4m0 13V4m0 0L9 7" />
              </svg>
              <h3 className="mt-2 text-sm font-medium text-gray-900">Loading map</h3>
              <p className="mt-1 text-sm text-gray-500">
                The interactive map is loading. Please wait a moment.
              </p>
            </div>
          </div>
        ) : (
          <div ref={mapContainerRef} className="h-96 border-b" />
        )}
        <div className="bg-gray-50 px-4 py-4 sm:px-6">
          <Button className="inline-flex items-center">
            <Map className="mr-2 h-5 w-5" />
            Explore Full Map
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}

// Add types for Leaflet
declare global {
  interface Window {
    L: any;
  }
}
