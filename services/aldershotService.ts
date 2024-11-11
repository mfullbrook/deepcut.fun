import * as cheerio from 'cheerio';

interface MonthYear {
  month: string;
  year: number;
}

interface ClosureConditions {
  raw: string | null;
  opensAt: string | null;
  closesAt: string | null;
}

interface TableDataEntry {
  dateObject: Date;
  year: number;
  month: string;
  date: string;
  isOpen: boolean;
  conditions: ClosureConditions | null;
  rawText: string;
}

interface ClosureTimesResult {
  month: string;
  year: number;
  closureTimesUrl: string;
  tableData: TableDataEntry[];
}

const BASE_URL = 'https://www.gov.uk';
const MAIN_URL = `${BASE_URL}/government/publications/south-east-training-estate-firing-times`;

const getMonthYear = (monthsToAdd: number = 0): MonthYear => {
  const date = new Date();
  date.setMonth(date.getMonth() + monthsToAdd);
  return {
    month: date.toLocaleString('en-GB', { month: 'long' }),
    year: date.getFullYear()
  };
};

const fetchAndParse = async (url: string): Promise<cheerio.CheerioAPI> => {
  const response = await fetch(url);
  const html = await response.text();
  return cheerio.load(html);
};

const findClosureTimesLink = ($: cheerio.CheerioAPI, month: string, year: number): string | null => {
  const targetText = `Aldershot Training Area closure times ${month} ${year}`;
  const link = $(`a:contains("${targetText}")`);
  
  if (!link.length) {
    return null;
  }
  
  return BASE_URL + link.attr('href');
};

const parseTableData = ($: cheerio.CheerioAPI, month: string, year: number, targetH2Id: string = 'aldershot-training-area-g2'): TableDataEntry[] | null => {
  const targetH2 = $(`h2#${targetH2Id}`);
  const table = targetH2.next('table');
  
  if (!table.length) {
    return null;
  }

  const tableData: TableDataEntry[] = [];
  table.find('tbody tr').each((_, row) => {
    const cells = $(row).find('td');
    const date = cells.eq(0).text().trim();
    const dateObject = new Date(`${year} ${month} ${date}`);
    let rawData = cells.eq(1).text().trim();
    rawData = rawData.replace(/\s{2,}/g, ' ');
    
    const isOpen = rawData.toLowerCase().includes('open to public');
    
    let conditions = null;
    const matchConditions = rawData.match(/\((.*?)\)/);
    if (matchConditions) {
      conditions = parseConditions(isOpen, matchConditions[1].trim())
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

export const parseConditions = (isOpen: boolean, input: string | null): ClosureConditions => {
  if (isOpen && input) {
    throw new Error('Edge case found, isOpen=true with conditions');
  }

  let opensAt: string | null = null;
  let closesAt: string | null = null;

  if (!input) {
    return { raw: input, opensAt, closesAt };
  }

  // Check for "from X" or "until X" patterns
  const fromRegex = /^from (\d{1,2}(?:[\.:]\d{2})?(?:am|pm)?)/i;
  const startRegex = /^(\d{1,2}(?:[\.:]\d{2})?(?:am|pm)?) to/i;
  const toRegex = /(?:to|until) (\d{1,2}(?:[\.:]\d{2})?(?:am|pm)?)/i;

  // Match "from X" to set closesAt
  const fromMatch = fromRegex.exec(input);
  if (fromMatch) {
    closesAt = fromMatch[1];
  }

  // Match "X to" to set closesAt
  const startMatch = startRegex.exec(input);
  if (startMatch) {
    closesAt = startMatch[1];
  }

  // Match "to X" or "until X" to set opensAt
  const toMatch = toRegex.exec(input);
  if (toMatch) {
    opensAt = toMatch[1];
  }

  return {
    raw: input,
    opensAt,
    closesAt,
  };
};

class ClosureTimesError extends Error {
  month: string;
  year: number;

  constructor(message: string, month: string, year: number) {
    super(message);
    this.name = 'ClosureTimesError';
    this.month = month;
    this.year = year;
  }
}

const fetchClosureTimes = async (mainDoc: cheerio.CheerioAPI, monthsAhead: number = 0): Promise<ClosureTimesResult> => {
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

export const fetchAllClosureTimes = async (): Promise<ClosureTimesResult[]> => {
  let mainDoc: cheerio.CheerioAPI;
  try {
    // Fetch and parse main page
    mainDoc = await fetchAndParse(MAIN_URL);
  } catch (error) {
    if (error instanceof Error) {
      throw new Error(`Failed to fetch main page: ${error.message}`);
    }
    throw error;
  }

  const results: ClosureTimesResult[] = [];

  for (let i = 0; i < 2; i++) {
    try {
      // Fetch closure time for a month
      const times = await fetchClosureTimes(mainDoc, i);
      results.push(times);
    } catch (error) {
      if (error instanceof ClosureTimesError) {
        console.log(`Notice: ${error.message} for ${error.month} ${error.year}`);
      } else if (error instanceof Error) {
        throw new Error(`Failed to fetch closure times: ${error.message}`);
      } else {
        throw error;
      }
    }
  }

  return results;
};
