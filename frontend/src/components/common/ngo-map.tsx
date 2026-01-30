import { GoogleMap, useJsApiLoader, Marker } from '@react-google-maps/api';
import { Donation } from '@/types';
import { Loader2 } from 'lucide-react';
import { memo } from 'react';

interface NgoMapProps {
    donations: Donation[];
    apiKey: string;
}

const containerStyle = {
    width: '100%',
    height: '100%',
};

const defaultCenter = {
    lat: 28.6139,
    lng: 77.2090
};

const mapStyles = [
    { "elementType": "geometry", "stylers": [{ "color": "#12191b" }] },
    { "elementType": "labels.text.fill", "stylers": [{ "color": "#51696a" }] },
    { "elementType": "labels.text.stroke", "stylers": [{ "color": "#12191b" }] },
    { "featureType": "administrative", "elementType": "geometry", "stylers": [{ "color": "#2c393d" }] },
    { "featureType": "landscape", "elementType": "geometry", "stylers": [{ "color": "#12191b" }] },
    { "featureType": "poi", "elementType": "geometry", "stylers": [{ "color": "#2c393d" }] },
    { "featureType": "road", "elementType": "geometry", "stylers": [{ "color": "#2c393d" }] },
    { "featureType": "road.highway", "elementType": "geometry", "stylers": [{ "color": "#1e4d58" }] },
    { "featureType": "water", "elementType": "geometry", "stylers": [{ "color": "#0d1112" }] }
];

function NgoMapComponent({ donations, apiKey }: NgoMapProps) {
    const { isLoaded } = useJsApiLoader({
        id: 'google-map-script',
        googleMapsApiKey: apiKey
    });

    const activeDonationsWithCoords = donations.filter(d => d.coordinates);

    const onMapLoad = (map: google.maps.Map) => {
        if (activeDonationsWithCoords.length > 0) {
            const bounds = new google.maps.LatLngBounds();
            activeDonationsWithCoords.forEach(d => {
                if (d.coordinates) bounds.extend(d.coordinates);
            });
            map.fitBounds(bounds);
            // Don't zoom in too far if there's only one marker
            if (activeDonationsWithCoords.length === 1) {
                map.setZoom(14);
            }
        }
    };

    if (!isLoaded) return (
        <div className="w-full h-full flex items-center justify-center bg-[#12191b] border border-border/10 rounded-2xl overflow-hidden">
            <div className="flex flex-col items-center gap-2">
                <Loader2 className="h-8 w-8 text-primary animate-spin" />
                <p className="text-sm text-muted-foreground font-black uppercase tracking-widest">Initalizing Satellite Feed...</p>
            </div>
        </div>
    );

    return (
        <div className="w-full h-full rounded-2xl overflow-hidden border border-border/10 shadow-2xl">
            <GoogleMap
                mapContainerStyle={containerStyle}
                center={defaultCenter}
                zoom={12}
                onLoad={onMapLoad}
                options={{
                    disableDefaultUI: true,
                    zoomControl: true,
                    styles: mapStyles
                }}
            >
                {activeDonationsWithCoords.map(d => (
                    <Marker
                        key={d.id}
                        position={d.coordinates!}
                        title={d.title}
                        icon={{
                            path: google.maps.SymbolPath.CIRCLE,
                            scale: 10,
                            fillColor: "#22c55e",
                            fillOpacity: 1,
                            strokeWeight: 2,
                            strokeColor: "#ffffff",
                        }}
                    />
                ))}
            </GoogleMap>
        </div>
    );
}

export const NgoMap = memo(NgoMapComponent);
