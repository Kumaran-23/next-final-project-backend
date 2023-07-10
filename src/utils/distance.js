import { createRequire } from 'module';
const require = createRequire(import.meta.url);
const googleMaps = require('@google/maps');

const googleMapsClient = googleMaps.createClient({
  key: 'YOUR_API_KEY',
  Promise: Promise
});

export async function calculateDistance(address1, address2) {
  const response = await googleMapsClient.distanceMatrix({
    origins: [address1],
    destinations: [address2],
    units: 'metric'
  }).asPromise();

  if (
    response.json.status === 'OK' &&
    response.json.rows[0].elements[0].status === 'OK'
  ) {
    const distance = response.json.rows[0].elements[0].distance.value;
    return distance / 1000; // Convert to km
  } else {
    throw new Error('Failed to calculate distance');
  }
}
