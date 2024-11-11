import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

type RouteHandler = (request: NextRequest) => Promise<NextResponse> | NextResponse;

export function secure(handler: RouteHandler) {
  return async (request: NextRequest) => {
    const apiKey = request.headers.get('authorization');
    
    if (!apiKey || apiKey !== `Bearer ${process.env.CRON_SECRET}`) {
      return NextResponse.json({ error: 'Unauthorized, check your CRON_SECRET' }, { status: 401 });
    }
    
    return handler(request);
  };
} 