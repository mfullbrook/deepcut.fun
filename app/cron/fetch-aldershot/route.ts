import { NextResponse } from 'next/server';
import { fetchAllClosureTimes } from '@/services/aldershotService';
import { storeClosureTimes } from '@/services/closureTimesStorage';
import { secure } from '@/lib/secure';

// Using the secure wrapper with the new route handler format
export const POST = secure(async () => {
  try {
    // Fetch the closure times data
    const data = await fetchAllClosureTimes();

    // Store the data in Vercel Blob
    const storageResult = await storeClosureTimes(data);

    return NextResponse.json({ storage: storageResult });
  } catch (error) {
    console.error('Error in closure times handler:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
}); 