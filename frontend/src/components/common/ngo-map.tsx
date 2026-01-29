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

// Custom Map Styles for "SurplusLink" Aesthetic (Dark/Clean)
const mapStyles = [
    {
        "featureType": "all",
        "elementType": "geometry.fill",
        "stylers": [{ "weight": "2.00" }]
    },
    {
        "featureType": "all",
        "elementType": "geometry.stroke",
        "stylers": [{ "color": "#9c9c9c" }]
    },
    {
        "featureType": "all",
        "elementType": "labels.text",
        "stylers": [{ "visibility": "on" }]
    },
    {
        "featureType": "landscape",
        "elementType": "all",
        "stylers": [{ "color": "#f2f2f2" }]
    },
    {
        "featureType": "landscape",
        "elementType": "geometry.fill",
        "stylers": [{ "color": "#ffffff" }]
    },
    {
        "featureType": "landscape.man_made",
        "elementType": "geometry.fill",
        "stylers": [{ "color": "#ffffff" }]
    },
    {
        "featureType": "poi",
        "elementType": "all",
        "stylers": [{ "visibility": "off" }]
    },
    {
        "featureType": "road",
        "elementType": "all",
        "stylers": [{ "saturation": -100 }, { "lightness": 45 }]
    },
    {
        "featureType": "road",
        "elementType": "geometry.fill",
        "stylers": [{ "color": "#eeeeee" }]
    },
    {
        "featureType": "road",
        "elementType": "labels.text.fill",
        "stylers": [{ "color": "#7b7b7b" }]
    },
    {
        "featureType": "road",
        "elementType": "labels.text.stroke",
        "stylers": [{ "color": "#ffffff" }]
    },
    {
        "featureType": "road.highway",
        "elementType": "all",
        "stylers": [{ "visibility": "simplified" }]
    },
    {
        "featureType": "road.arterial",
        "elementType": "labels.icon",
        "stylers": [{ "visibility": "off" }]
    },
    {
        "featureType": "transit",
        "elementType": "all",
        "stylers": [{ "visibility": "off" }]
    },
    {
        "featureType": "water",
        "elementType": "all",
        "stylers": [{ "color": "#46bcec" }, { "visibility": "on" }]
    },
    {
        "featureType": "water",
        "elementType": "geometry.fill",
        "stylers": [{ "color": "#c8d7d4" }]
    },
    {
        "featureType": "water",
        "elementType": "labels.text.fill",
        "stylers": [{ "color": "#070707" }]
    },
    {
        "featureType": "water",
        "elementType": "labels.text.stroke",
        "stylers": [{ "color": "#ffffff" }]
    }
];

function NgoMapComponent({ donations, apiKey }: NgoMapProps) {
    const { isLoaded } = useJsApiLoader({
        id: 'google-map-script',
        googleMapsApiKey: apiKey
    });

    const activeDonationsWithCoords = donations.filter(d => d.coordinates);

    // Default to first donation or Delhi
    const center = activeDonationsWithCoords.length > 0 && activeDonationsWithCoords[0].coordinates
        ? activeDonationsWithCoords[0].coordinates
        : defaultCenter;

    if (!isLoaded) return (
        <div className="w-full h-full flex items-center justify-center bg-slate-50 border border-slate-200 rounded-xl">
            <div className="flex flex-col items-center gap-2">
                <Loader2 className="h-8 w-8 text-primary animate-spin" />
                <p className="text-sm text-slate-500">Loading Map...</p>
            </div>
        </div>
    );

    return (
        <GoogleMap
            mapContainerStyle={containerStyle}
            center={center}
            zoom={13}
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
                    animation={typeof google !== 'undefined' ? google.maps.Animation.DROP : undefined}
                />
            ))}
        </GoogleMap>
    );
}

export const NgoMap = memo(NgoMapComponent);
