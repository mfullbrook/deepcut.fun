import type { NextApiRequest, NextApiResponse } from 'next';

export interface SecureHandler {
  (req: NextApiRequest, res: NextApiResponse): Promise<void> | void;
}

export function secure(handler: SecureHandler) {
  return async (req: NextApiRequest, res: NextApiResponse) => {
    const apiKey = req.headers['x-api-key'];
    
    if (!apiKey || apiKey !== process.env.API_KEY) {
      res.status(401).json({ error: 'Unauthorized' });
      return;
    }
    
    return handler(req, res);
  };
} 