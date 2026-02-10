import React, { useMemo } from 'react';
import { GoogleMap, Marker, useJsApiLoader } from '@react-google-maps/api';
import { Loader2 } from 'lucide-react';
import { Donation } from '@/types';

interface MissionsMapProps {
    missions: Donation[];
    userCoords?: { lat: number; lng: number };
    onSelectMission: (mission: Donation) => void;
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

export function MissionsMap({ missions, userCoords, onSelectMission }: MissionsMapProps) {
    const { isLoaded } = useJsApiLoader({
        id: 'google-map-script',
        googleMapsApiKey: import.meta.env.VITE_GOOGLE_MAPS_API_KEY || ""
    });

    const center = useMemo(() => {
        if (userCoords) return userCoords;
        if (missions.length > 0 && missions[0].coordinates) return missions[0].coordinates;
        return { lat: 28.6139, lng: 77.2090 };
    }, [userCoords, missions]);

    if (!isLoaded) {
        return (
            <div className="w-full h-full flex items-center justify-center bg-[#0f172a]">
                <Loader2 className="animate-spin text-primary size-10" />
            </div>
        );
    }

    return (
        <GoogleMap
            mapContainerStyle={mapContainerStyle}
            center={center}
            zoom={13}
            options={{
                disableDefaultUI: true,
                styles: mapStyles,
                zoomControl: true,
            }}
        >
            {userCoords && (
                <Marker
                    position={userCoords}
                    icon={{
                        path: google.maps.SymbolPath.CIRCLE,
                        scale: 10,
                        fillColor: "#3b82f6",
                        fillOpacity: 1,
                        strokeWeight: 2,
                        strokeColor: "#ffffff",
                    }}
                    title="Your Location"
                    zIndex={100}
                />
            )}

            {missions.map((mission) => {
                if (!mission.coordinates) return null;

                return (
                    <Marker
                        key={mission.id}
                        position={mission.coordinates}
                        onClick={() => onSelectMission(mission)}
                        icon={{
                            url: "https://maps.google.com/mapfiles/ms/icons/red-pushpin.png",
                            scaledSize: new google.maps.Size(40, 40)
                        }}
                        label={{
                            text: mission.title,
                            className: "font-black text-[10px] bg-background/90 px-2 py-1 rounded text-primary translate-y-8 shadow-xl border border-primary/20"
                        }}
                    />
                );
            })}
        </GoogleMap>
    );
}
