import axios from 'axios';

export async function calculateDistance(userAddress, providerAddress) {
    const key = 'AIzaSyCoo4Tzwqzhb-ghGZjJx_R3iaaW0a7vx9s';
    const url = `https://maps.googleapis.com/maps/api/distancematrix/json?units=metric&origins=${encodeURIComponent(userAddress)}&destinations=${encodeURIComponent(providerAddress)}&key=${key}`;
    const response = await axios.get(url);
    const distanceInKm = response.data.rows[0].elements[0].distance.value / 1000; // Convert distance from meters to kilometers
    return distanceInKm;
}
