import * as cheerio from 'cheerio';

const BASE_URL = 'https://www.gov.uk';
const MAIN_URL = `${BASE_URL}/government/publications/south-east-training-estate-firing-times`;

const getMonthYear = (monthsToAdd = 0) => {
  const date = new Date();
  date.setMonth(date.getMonth() + monthsToAdd);
  return {
    month: date.toLocaleString('en-GB', { month: 'long' }),
    year: date.getFullYear()
  };
};

const fetchAndParse = async (url) => {
  const response = await fetch(url);
  const html = await response.text();
  return cheerio.load(html);
};

const findClosureTimesLink = ($, month, year) => {
  const targetText = `Aldershot Training Area closure times ${month} ${year}`;
  const link = $(`a:contains("${targetText}")`);
  
  if (!link.length) {
    return null;
  }
  
  return BASE_URL + link.attr('href');
};

const parseTableData = ($, month, year, targetH2Id = 'aldershot-training-area-g2') => {
  const targetH2 = $(`h2#${targetH2Id}`);
  const table = targetH2.next('table');
  
  if (!table.length) {
    return null;
  }

  const tableData = [];
  table.find('tbody tr').each((_, row) => {
    const cells = $(row).find('td');
    const date = cells.eq(0).text().trim();
    const dateObject = new Date(`${year} ${month} ${date}`);
    const rawData = cells.eq(1).text().trim();

    const isOpen = rawData.toLowerCase().includes('open to public');
    
    let conditions = null;
    const matchConditions = rawData.match(/\((.*?)\)/);
    if (matchConditions) {
      conditions = matchConditions[1].trim();
    }

    tableData.push({
      dateObject,
      year,
      month,
      date,
      isOpen,
      conditions,
      rawText: rawData
    });
  });

  return tableData;
};

class ClosureTimesError extends Error {
  constructor(message, month, year) {
    super(message);
    this.name = 'ClosureTimesError';
    this.month = month;
    this.year = year;
  }
}

const fetchClosureTimes = async (mainDoc, monthsAhead = 0) => {
  const { month, year } = getMonthYear(monthsAhead);
  
  // Find closure times link
  const closureTimesUrl = findClosureTimesLink(mainDoc, month, year);
  if (!closureTimesUrl) {
    throw new ClosureTimesError(`Closure times link not found`, month, year);
  }
  
  // Fetch and parse closure times page
  const closureDoc = await fetchAndParse(closureTimesUrl);
  
  // Extract table data
  const tableData = parseTableData(closureDoc, month, year);
  if (!tableData) {
    throw new ClosureTimesError(`Closure times table not found`, month, year);
  }
  
  return {
    month,
    year,
    closureTimesUrl,
    tableData
  };
};

export const fetchAllClosureTimes = async () => {
  let mainDoc;
  try {
    // Fetch and parse main page
    mainDoc = await fetchAndParse(MAIN_URL);
  } catch (error) {
    throw error
    throw new Error(`Failed to fetch main page: ${error.message}`);
  }

  let results = []

  for (let i = 0; i < 2; i++) {
    try {
      // Fetch closure time for a month
      const times = await fetchClosureTimes(mainDoc, i);
      results.push(times)
    } catch (error) {
      if (error instanceof ClosureTimesError) {
        console.log(`Notice: ${error.message} for ${error.month} ${error.year}`);
      } else {
        throw new Error(`Failed to fetch closure times: ${error.message}`);
      }
    }
  }

  return results;
}; 