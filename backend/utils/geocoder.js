import https from 'https';

/**
 * Geocode an address using Google Maps Geocoding API
 * @param {string} address - The address to geocode
 * @returns {Promise<{lat: number, lng: number} | null>}
 */
export const geocodeAddress = async (address) => {
    if (!address) return null;
    
    const apiKey = process.env.GOOGLE_MAPS_API_KEY;
    if (!apiKey) {
        if (process.env.NODE_ENV !== 'test') {
            console.warn('GEOCODER: GOOGLE_MAPS_API_KEY is missing');
        }
        return null;
    }

    const encodedAddress = encodeURIComponent(address);
    const url = `https://maps.googleapis.com/maps/api/geocode/json?address=${encodedAddress}&key=${apiKey}`;

    return new Promise((resolve, reject) => {
        https.get(url, (res) => {
            let data = '';
            res.on('data', (chunk) => { data += chunk; });
            res.on('end', () => {
                try {
                    const result = JSON.parse(data);
                    if (result.status === 'OK' && result.results.length > 0) {
                        const { lat, lng } = result.results[0].geometry.location;
                        resolve({ lat, lng });
                    } else {
                        console.warn(`GEOCODER: No results for address: ${address}. Status: ${result.status}`);
                        resolve(null);
                    }
                } catch (error) {
                    reject(error);
                }
            });
        }).on('error', (err) => {
            reject(err);
        });
    });
};
