/**
 * Health check serverless endpoint
 * GET /api/health
 */
export default async function handler(req: any, res: any) {
  // Set CORS headers
  res.setHeader('Access-Control-Allow-Credentials', 'true');
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET,OPTIONS');
  res.setHeader(
    'Access-Control-Allow-Headers',
    'X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version, AccountKey, x-account-key'
  );

  if (req.method === 'OPTIONS') {
    res.statusCode = 204;
    res.end();
    return;
  }

  const isConfigured = Boolean(
    process.env.LTA_ACCOUNT_KEY || process.env.LTA_DATAMALL_KEY
  );

  const data = {
    status: 'ok',
    timestamp: new Date().toISOString(),
    service: 'ParkSG LTA DataMall Serverless Gateway',
    endpoints: {
      health: '/api/health',
      carparkAvailability: '/api/carparkavailability',
    },
    ltaKeyConfigured: isConfigured,
    message: isConfigured
      ? 'LTA AccountKey is configured and active.'
      : 'LTA AccountKey not yet set in environment. Set LTA_ACCOUNT_KEY to connect to live LTA DataMall.',
  };

  res.setHeader('Content-Type', 'application/json');
  if (typeof res.json === 'function') {
    res.status(200).json(data);
  } else {
    res.statusCode = 200;
    res.end(JSON.stringify(data, null, 2));
  }
}
