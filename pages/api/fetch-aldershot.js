import { fetchAllClosureTimes } from '../../services/aldershotService';
import { storeClosureTimes } from '../../services/closureTimesStorage';

export default async function handler(req, res) {
    
  try {
    // Fetch the closure times data
    const data = await fetchAllClosureTimes();

    // Store the data in Vercel Blob
    const storageResult = await storeClosureTimes(data);

    return res.status(200).json({ storage: storageResult });
  } catch (error) {
    console.error('Error in closure times handler:', error);
    return res.status(500).json({ error: error.message });
  }
} 