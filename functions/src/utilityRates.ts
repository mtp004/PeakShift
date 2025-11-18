import { onRequest } from 'firebase-functions/v2/https';

export type RateStructure = {
  unit: string;
  rate: number;
  adj?: number;
};

export type RateItem = {
  label: string;
  uri: string;
  revisions: number[];
  approved: boolean;
  is_default: boolean;
  utility: string;
  eiaid: number;
  name: string;
  startdate?: number;
  enddate?: number;
  supersedes?: string;
  sector: string;
  servicetype: string;
  description?: string;
  source?: string;
  sourceparent?: string;
  demandunits?: string;
  phasewiring?: string;
  energyratestructure: RateStructure[][];
  energyweekdayschedule: number[][];
  energyweekendschedule: number[][];
  energycomments?: string;
  dgrules?: string;
  fixedchargefirstmeter?: number;
  fixedchargeunits?: string;
  country: string;
};

export type RatesAPIResponse = {
  items: RateItem[];
};

export const utilityRates = onRequest(async (req, res) => {
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
  const sector = (req.query.sector as string) || 'Residential';
  const limit = (req.query.limit as string) || '50';

  if (!address.trim()) {
    res.status(400).send('Missing address parameter');
    return;
  }

  try {
    const OPENEI_API_KEY = process.env.OPENEI_API_KEY;
    
    if (!OPENEI_API_KEY) {
      throw new Error('OpenEI API key not configured');
    }

    const params = new URLSearchParams({
      version: 'latest',
      format: 'json',
      api_key: OPENEI_API_KEY,
      address: address,
      sector: sector,
      limit: limit,
      approved: 'false',
      orderby: 'startdate',
      direction: 'desc',
      detail: 'full',
    });

    const openEIUrl = `https://api.openei.org/utility_rates?${params.toString()}`;

    const openEIRes = await fetch(openEIUrl);

    if (!openEIRes.ok) {
      throw new Error(`OpenEI API error: ${openEIRes.status}`);
    }

    const data: RatesAPIResponse = await openEIRes.json();

    res.status(200).json(data);
  } catch (err: any) {
    console.error('Utility rates proxy error:', err);
    res.status(500).send('Failed to fetch utility rates');
  }
});