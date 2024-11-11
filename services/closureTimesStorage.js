import { put } from '@vercel/blob';

const formatDate = (date) => {
  return date.toISOString().split('T')[0];
};

const buildClosureData = (tableData) => {
  // Get today's date at midnight for comparison
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  // Create dictionary of closure data
  const closureDict = {};

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

export const storeClosureTimes = async (data) => {
  try {
    // 1. Concat all tableData
    const allTableData = data.reduce((acc, month) => {
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
    throw new Error(`Failed to store closure times: ${error.message}`);
  }
}; 