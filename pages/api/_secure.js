// Verify request method
//   if (req.method !== 'POST') {
//     return res.status(405).json({ error: 'Method not allowed' });
//   }

//   // Verify authorization
//   const authHeader = req.headers.authorization;
//   if (authHeader !== process.env.CRON_SECRET) {
//     return res.status(401).json({ error: 'Unauthorized' });
//   }