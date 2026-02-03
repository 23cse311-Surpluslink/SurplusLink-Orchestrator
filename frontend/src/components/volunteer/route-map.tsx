import React, { useMemo } from 'react';
import { GoogleMap, Marker, Polyline, useJsApiLoader } from '@react-google-maps/api';
import { Loader2 } from 'lucide-react';

interface RouteMapProps {
    donorCoords?: { lat: number; lng: number };
    ngoCoords?: { lat: number; lng: number };
    volunteerCoords?: { lat: number; lng: number };
    diversionCoords?: { lat: number; lng: number };
    stops?: Array<{ coordinates: [number, number]; type: string; isDiversion?: boolean }>;
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

export function RouteMap({ donorCoords, ngoCoords, volunteerCoords, diversionCoords, stops }: RouteMapProps) {
    const { isLoaded } = useJsApiLoader({
        id: 'google-map-script',
        googleMapsApiKey: import.meta.env.VITE_GOOGLE_MAPS_API_KEY || ""
    });

    const center = useMemo(() => {
        if (volunteerCoords) return volunteerCoords;
        if (donorCoords) return donorCoords;
        return { lat: 28.6139, lng: 77.2090 }; // Delhi default
    }, [volunteerCoords, donorCoords]);

    const polylinePath = useMemo(() => {
        if (stops && stops.length > 0) {
            const path = stops.map(s => ({ lat: s.coordinates[1], lng: s.coordinates[0] }));
            if (volunteerCoords) {
                return [volunteerCoords, ...path];
            }
            return path;
        }

        const path = [];
        if (volunteerCoords) path.push(volunteerCoords);
        if (donorCoords) path.push(donorCoords);
        if (diversionCoords) path.push(diversionCoords);
        if (ngoCoords) path.push(ngoCoords);
        return path;
    }, [volunteerCoords, donorCoords, ngoCoords, diversionCoords, stops]);

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
                zoomControl: false,
            }}
        >
            {volunteerCoords && (
                <Marker
                    position={volunteerCoords}
                    icon={{
                        path: google.maps.SymbolPath.FORWARD_CLOSED_ARROW,
                        scale: 6,
                        fillColor: "#3b82f6",
                        fillOpacity: 1,
                        strokeWeight: 2,
                        strokeColor: "#ffffff",
                    }}
                    title="You"
                />
            )}

            {donorCoords && (
                <Marker
                    position={donorCoords}
                    icon={{
                        url: "https://maps.google.com/mapfiles/ms/icons/red-pushpin.png",
                        scaledSize: new google.maps.Size(40, 40)
                    }}
                    label={{ text: "PICKUP", className: "font-black text-[10px] bg-background/80 px-2 py-1 rounded text-red-500 translate-y-8" }}
                />
            )}

            {ngoCoords && (
                <Marker
                    position={ngoCoords}
                    icon={{
                        url: "https://maps.google.com/mapfiles/ms/icons/green-pushpin.png",
                        scaledSize: new google.maps.Size(40, 40)
                    }}
                    label={{ text: "NGO", className: "font-black text-[10px] bg-background/80 px-2 py-1 rounded text-emerald-500 translate-y-8" }}
                />
            )}

            {diversionCoords && (
                <Marker
                    position={diversionCoords}
                    icon={{
                        url: "https://maps.google.com/mapfiles/ms/icons/orange-pushpin.png",
                        scaledSize: new google.maps.Size(40, 40)
                    }}
                    label={{ text: "DIVERSION", className: "font-black text-[10px] bg-background/80 px-2 py-1 rounded text-orange-500 translate-y-8" }}
                />
            )}

            {polylinePath.length > 1 && (
                <Polyline
                    path={polylinePath}
                    options={{
                        strokeColor: "#22c55e",
                        strokeOpacity: 0.8,
                        strokeWeight: 4,
                        icons: [{
                            icon: { path: google.maps.SymbolPath.FORWARD_OPEN_ARROW, strokeOpacity: 1, scale: 3 },
                            offset: "50%",
                            repeat: "100px"
                        }]
                    }}
                />
            )}
        </GoogleMap>
    );
}
