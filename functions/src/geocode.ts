import { onRequest } from 'firebase-functions/v2/https';
import { Client } from '@googlemaps/google-maps-services-js';

const mapsClient = new Client({});

export const geocode = onRequest(async (req, res) => {
  // CORS
  res.set('Access-Control-Allow-Origin', 'https://peakshift-react.web.app');
  res.set('Access-Control-Allow-Methods', 'GET, OPTIONS');
  res.set('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') {
    res.status(204).end();
    return;
  }

  if (req.method !== 'GET') {
    res.status(405).send('Method not allowed');
    return;
  }

  const address = (req.query.address as string) || '';
  if (!address.trim()) {
    res.status(400).send('Missing address parameter');
    return;
  }

  try {
    const GOOGLE_MAPS_API_KEY = process.env.GOOGLE_MAPS_API_KEY;
    
    if (!GOOGLE_MAPS_API_KEY) {
      throw new Error('Google Maps API key not configured');
    }

    const response = await mapsClient.geocode({
      params: {
        address: address,
        key: GOOGLE_MAPS_API_KEY,
        components: { country: 'US' },
      },
    });

    if (response.data.status !== 'OK') {
      res.status(400).json({
        error: response.data.status,
        message: response.data.error_message || 'Geocoding failed'
      });
      return;
    }

    res.status(200).json(response.data);
  } catch (err: any) {
    console.error('Geocode proxy error:', err);
    res.status(500).send('Geocoding failed');
  }
});