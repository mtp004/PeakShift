export interface HourData {
  hour: string;
  rate: number;
}

export interface PeakPeriod {
  startHour: string;
  endHour: string;
}

export function findPeakHours(data: HourData[]): PeakPeriod[] {
  if (!data || data.length === 0) return [];

  const startTime = 7; // 7 AM
  const endTime = 21;  // 9 PM
  const filteredData = data.slice(startTime, endTime + 1);
  
  if (filteredData.length === 0) return [];

  const rates = filteredData.map(item => item.rate);
  const maxRate = Math.max(...rates);
  const minRate = Math.min(...rates);
  
  // If all rates are the same, no peak hours
  if (maxRate === minRate) return [];

  const peakPeriods: PeakPeriod[] = [];
  let currentStart: number | null = null;

  filteredData.forEach((item, index) => {
    const originalIndex = startTime + index;
    
    if (item.rate === maxRate) {
      if (currentStart === null) {
        currentStart = originalIndex;
      }
    } else {
      if (currentStart !== null) {
        peakPeriods.push({
          startHour: data[currentStart].hour,
          endHour: data[originalIndex - 1].hour
        });
        currentStart = null;
      }
    }
  });

  return peakPeriods;
}