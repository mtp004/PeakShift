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

export async function fetchAddressElectricRates(
  address: string
): Promise<RatesAPIResponse | null> {
  const API_KEY = import.meta.env.VITE_OPENEI_API_KEY;
  
  if (!API_KEY) {
    return null;
  }

  const url = new URL('https://api.openei.org/utility_rates');
  url.searchParams.set('version', 'latest');
  url.searchParams.set('format', 'json');
  url.searchParams.set('api_key', API_KEY);
  url.searchParams.set('address', address);
  url.searchParams.set('sector', 'Residential');
  url.searchParams.set('limit', '50');
  url.searchParams.set('approved', 'false');
  url.searchParams.set('orderby', 'startdate');
  url.searchParams.set('direction', 'desc');
  url.searchParams.set('detail', 'full');

  try {
    const response = await fetch(url.toString());
    if (!response.ok) return null;
    const data: RatesAPIResponse = await response.json();
    return data;
  } catch (error) {
    console.error('Fetch rates error:', error);
    return null;
  }
}

export async function processRatesResults(
  address: string,
  callback: (result: RatesAPIResponse | null) => void
): Promise<void> {
  const result = await fetchAddressElectricRates(address);
  const latestDate = result?.items?.[0]?.startdate;
  
  if (result?.items) {
    const processedItems: RateItem[] = [];
    const deliveryItems: RateItem[] = [];
    
    // Loop through all items
    for (const item of result.items) {
      // Check if item meets criteria
      if (item.servicetype != "Delivery") {
        if(item.startdate === latestDate || item.is_default === true){
          // Search for existing item with similar name
          const existingIndex = processedItems.findIndex(
            processedItem => processedItem.name === item.name
          );
          
          if (existingIndex !== -1) {
            // Found existing item - compare latest revision times
            const existingItem = processedItems[existingIndex];
            const currentLatestRevision = item.revisions[item.revisions.length - 1];
            const existingLatestRevision = existingItem.revisions[existingItem.revisions.length - 1];
            
            if (currentLatestRevision > existingLatestRevision) {
              // Current item has higher latest revision, replace existing
              processedItems[existingIndex] = item;
            }
            // If current item doesn't have higher latest revision, continue (do nothing)
          } else {
            // No existing item found, add current item
            processedItems.push(item);
          }
        }
      } else{
        // Search for existing item with similar name
        const existingIndex = deliveryItems.findIndex(
          deliveryItem => deliveryItem.name === item.name
        );
        
        if (existingIndex !== -1) {
          // Found existing item - compare latest revision times
          const existingItem = deliveryItems[existingIndex];
          const currentLatestRevision = item.revisions[item.revisions.length - 1];
          const existingLatestRevision = existingItem.revisions[existingItem.revisions.length - 1];
          
          if (currentLatestRevision > existingLatestRevision) {
            // Current item has higher latest revision, replace existing
            deliveryItems[existingIndex] = item;
          }
          // If current item doesn't have higher latest revision, continue (do nothing)
        } else {
          // No existing item found, add current item
          deliveryItems.push(item);
        }
      }
    }
    
    //Implement logic here
    processedItems.forEach(processedItem => {
      const matchingDeliveryItem = deliveryItems.find(d => d.name === processedItem.name);
      if (matchingDeliveryItem?.energyratestructure && processedItem.energyratestructure) {
        processedItem.energyratestructure.forEach((group, i) => {
          if (matchingDeliveryItem.energyratestructure[i]?.[0]) {
            group[0].rate -= matchingDeliveryItem.energyratestructure[i][0].rate;
            if (group[0].adj !== undefined && matchingDeliveryItem.energyratestructure[i][0].adj !== undefined) {
              group[0].adj -= matchingDeliveryItem.energyratestructure[i][0].adj;
            }
          }
        });
      }
    });
    
    //Implement logic here

    // Update result.items with processed items
    result.items = processedItems;
  }
  
  callback(result);
}

