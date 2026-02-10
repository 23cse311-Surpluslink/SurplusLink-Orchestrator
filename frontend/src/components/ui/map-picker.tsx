import React, { useState, useCallback, useEffect } from 'react';
import { GoogleMap, Marker, useJsApiLoader } from '@react-google-maps/api';
import { Loader2, Crosshair, MapPin } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface MapPickerProps {
    initialCenter?: { lat: number; lng: number };
    onLocationSelect: (location: { lat: number; lng: number; address?: string }) => void;
}

const mapContainerStyle = {
    width: '100%',
    height: '100%',
};

const mapStyles = [
    { "elementType": "geometry", "stylers": [{ "color": "#1f2937" }] },
    { "elementType": "labels.text.fill", "stylers": [{ "color": "#9ca3af" }] },
    { "elementType": "labels.text.stroke", "stylers": [{ "color": "#111827" }] },
    { "featureType": "administrative", "elementType": "geometry", "stylers": [{ "color": "#374151" }] },
    { "featureType": "landscape", "elementType": "geometry", "stylers": [{ "color": "#111827" }] },
    { "featureType": "poi", "elementType": "labels.text.fill", "stylers": [{ "color": "#6b7280" }] },
    { "featureType": "road", "elementType": "geometry", "stylers": [{ "color": "#374151" }] },
    { "featureType": "road.highway", "elementType": "geometry", "stylers": [{ "color": "#4b5563" }] },
    { "featureType": "water", "elementType": "geometry", "stylers": [{ "color": "#0f172a" }] }
];

const defaultCenter = { lat: 28.6139, lng: 77.2090 }; // Delhi

export function MapPicker({ initialCenter, onLocationSelect }: MapPickerProps) {
    const { isLoaded } = useJsApiLoader({
        id: 'google-map-script',
        googleMapsApiKey: import.meta.env.VITE_GOOGLE_MAPS_API_KEY || ""
    });

    const [map, setMap] = useState<google.maps.Map | null>(null);
    const [markerPos, setMarkerPos] = useState<{ lat: number; lng: number }>(initialCenter || defaultCenter);
    const [isLocating, setIsLocating] = useState(false);

    const fetchCurrentLocation = useCallback(() => {
        setIsLocating(true);
        if (navigator.geolocation) {
            navigator.geolocation.getCurrentPosition(
                (position) => {
                    const newPos = {
                        lat: position.coords.latitude,
                        lng: position.coords.longitude,
                    };
                    setMarkerPos(newPos);
                    map?.panTo(newPos);
                    onLocationSelect(newPos);
                    setIsLocating(false);
                },
                (error) => {
                    console.error("Error fetching location:", error);
                    setIsLocating(false);
                },
                { enableHighAccuracy: true }
            );
        } else {
            setIsLocating(false);
        }
    }, [map, onLocationSelect]);

    useEffect(() => {
        if (initialCenter) {
            setMarkerPos(initialCenter);
        } else if (!initialCenter && navigator.geolocation) {
            // Auto-locate if no initial center is provided
            fetchCurrentLocation();
        }
    }, [initialCenter, fetchCurrentLocation]);

    const onLoad = useCallback(function callback(m: google.maps.Map) {
        setMap(m);
    }, []);

    const onUnmount = useCallback(function callback() {
        setMap(null);
    }, []);

    const handleMapClick = useCallback((e: google.maps.MapMouseEvent) => {
        if (e.latLng) {
            const newPos = { lat: e.latLng.lat(), lng: e.latLng.lng() };
            setMarkerPos(newPos);
            onLocationSelect(newPos);
        }
    }, [onLocationSelect]);

    const handleMarkerDragEnd = useCallback((e: google.maps.MapMouseEvent) => {
        if (e.latLng) {
            const newPos = { lat: e.latLng.lat(), lng: e.latLng.lng() };
            setMarkerPos(newPos);
            onLocationSelect(newPos);
        }
    }, [onLocationSelect]);

    if (!isLoaded) {
        return (
            <div className="w-full h-64 flex items-center justify-center bg-muted rounded-3xl">
                <Loader2 className="animate-spin text-primary size-8" />
            </div>
        );
    }

    return (
        <div className="relative w-full h-80 rounded-3xl overflow-hidden border border-border/40 shadow-inner">
            <GoogleMap
                mapContainerStyle={mapContainerStyle}
                center={markerPos}
                zoom={15}
                onLoad={onLoad}
                onUnmount={onUnmount}
                onClick={handleMapClick}
                options={{
                    disableDefaultUI: true,
                    styles: mapStyles,
                    zoomControl: true,
                }}
            >
                <Marker
                    position={markerPos}
                    draggable={true}
                    onDragEnd={handleMarkerDragEnd}
                    icon={{
                        url: "https://maps.google.com/mapfiles/ms/icons/blue-dot.png",
                        scaledSize: new google.maps.Size(40, 40)
                    }}
                />
            </GoogleMap>

            <div className="absolute top-4 right-4 flex flex-col gap-2">
                <Button
                    size="icon"
                    variant="secondary"
                    className="size-10 rounded-xl shadow-xl backdrop-blur-md bg-white/10 border-white/20 hover:bg-white/20 text-white"
                    onClick={fetchCurrentLocation}
                    disabled={isLocating}
                    type="button"
                >
                    {isLocating ? <Loader2 className="size-5 animate-spin" /> : <Crosshair className="size-5" />}
                </Button>
            </div>

            <div className="absolute bottom-4 left-4 right-4">
                <div className="bg-background/90 backdrop-blur-md px-4 py-2 rounded-2xl border border-border/40 shadow-lg flex items-center gap-2">
                    <MapPin className="size-4 text-primary shrink-0" />
                    <p className="text-[10px] font-bold text-muted-foreground truncate uppercase tracking-widest">
                        Drag pin or tap map to set base location
                    </p>
                </div>
            </div>
        </div>
    );
}
