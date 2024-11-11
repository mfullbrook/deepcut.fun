import { put } from '@vercel/blob';
import type { ClosureTimesResult, TableDataEntry, ClosureConditions } from './aldershotService';

interface ClosureDayData {
  isOpen: boolean;
  conditions: ClosureConditions | null;
  rawText: string;
}

interface ClosureDict {
  [date: string]: ClosureDayData;
}

interface StorageResult {
  success: boolean;
  url: string;
  message: string;
}

const formatDate = (date: Date): string => {
  return date.toISOString().split('T')[0];
};

const buildClosureData = (tableData: TableDataEntry[]): ClosureDict => {
  // Get today's date at midnight for comparison
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  // Create dictionary of closure data
  const closureDict: ClosureDict = {};

  tableData.forEach(row => {
    const rowDate = new Date(row.dateObject);
    
    // Only include dates from today onwards
    if (rowDate >= today) {
      const formattedDate = formatDate(rowDate);
      
      closureDict[formattedDate] = {
        isOpen: row.isOpen,
        conditions: row.conditions,
        rawText: row.rawText
      };
    }
  });

  return closureDict;
};

export const storeClosureTimes = async (data: ClosureTimesResult[]): Promise<StorageResult> => {
  try {
    // 1. Concat all tableData
    const allTableData = data.reduce<TableDataEntry[]>((acc, month) => {
      return acc.concat(month.tableData);
    }, []);

    // 2 & 3. Build dictionary of future dates
    const closureDict = buildClosureData(allTableData);

    // 4. Convert to JSON string
    const jsonData = JSON.stringify(closureDict, null, 2);

    // 5. Store in Vercel Blob
    const { url } = await put('aldershotTrainingAreaData.json', jsonData, {
      access: 'public',
      addRandomSuffix: false
    });

    return {
      success: true,
      url,
      message: 'Closure times data stored successfully'
    };
  } catch (error) {
    console.error('Error storing closure times:', error);
    if (error instanceof Error) {
      throw new Error(`Failed to store closure times: ${error.message}`);
    }
    throw error;
  }
};
