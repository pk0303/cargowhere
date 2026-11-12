/**
 * Serverless function to pull real-time carpark lots availability from Singapore LTA DataMall
 * Endpoint: https://datamall2.mytransport.sg/ltaodataservice/CarParkAvailabilityv2
 * Required Header: AccountKey: <LTA_ACCOUNT_KEY>
 *
 * GET /api/carparkavailability
 */

const LTA_ENDPOINT = 'https://datamall2.mytransport.sg/ltaodataservice/CarParkAvailabilityv2';

export default async function handler(req: any, res: any) {
  // CORS configuration
  res.setHeader('Access-Control-Allow-Credentials', 'true');
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET,OPTIONS');
  res.setHeader(
    'Access-Control-Allow-Headers',
    'X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version, AccountKey, x-account-key'
  );

  // Handle pre-flight OPTIONS request
  if (req.method === 'OPTIONS') {
    res.statusCode = 204;
    res.end();
    return;
  }

  // Retrieve LTA AccountKey from environment variables or incoming request headers
  // No key is hardcoded; user can configure it via .env or headers
  const accountKey =
    process.env.LTA_ACCOUNT_KEY ||
    process.env.LTA_DATAMALL_KEY ||
    req.headers['accountkey'] ||
    req.headers['x-account-key'];

  if (!accountKey) {
    const errorPayload = {
      error: 'Missing LTA AccountKey',
      message:
        'LTA DataMall requires an AccountKey header. Please configure LTA_ACCOUNT_KEY in your environment variables, or pass AccountKey / X-Account-Key in request headers.',
      documentation:
        'Request a free API key at: https://datamall.lta.gov.sg/content/datamall/en/request-for-api.html',
      status: 401,
    };

    res.setHeader('Content-Type', 'application/json');
    if (typeof res.status === 'function') {
      res.status(401).json(errorPayload);
    } else {
      res.statusCode = 401;
      res.end(JSON.stringify(errorPayload, null, 2));
    }
    return;
  }

  try {
    // Parse query params for pagination ($skip)
    let url = LTA_ENDPOINT;
    const query = req.query || {};
    const skip = query.skip || query.$skip;

    if (skip) {
      url += `?$skip=${encodeURIComponent(skip)}`;
    }

    const response = await fetch(url, {
      method: 'GET',
      headers: {
        AccountKey: String(accountKey).trim(),
        accept: 'application/json',
      },
    });

    if (!response.ok) {
      const errorText = await response.text();
      const status = response.status;
      const errorPayload = {
        error: 'LTA DataMall API responded with an error',
        statusCode: status,
        details: errorText,
      };

      res.setHeader('Content-Type', 'application/json');
      if (typeof res.status === 'function') {
        res.status(status).json(errorPayload);
      } else {
        res.statusCode = status;
        res.end(JSON.stringify(errorPayload, null, 2));
      }
      return;
    }

    const data = await response.json();

    // Cache headers: Carpark availability updates every 1 minute in LTA
    res.setHeader('Content-Type', 'application/json');
    res.setHeader('Cache-Control', 'public, s-maxage=60, stale-while-revalidate=30');

    if (typeof res.json === 'function') {
      res.status(200).json(data);
    } else {
      res.statusCode = 200;
      res.end(JSON.stringify(data));
    }
  } catch (err: any) {
    const errorPayload = {
      error: 'Failed to fetch carpark availability from LTA DataMall',
      message: err.message || 'Unknown network error',
      timestamp: new Date().toISOString(),
    };

    res.setHeader('Content-Type', 'application/json');
    if (typeof res.status === 'function') {
      res.status(500).json(errorPayload);
    } else {
      res.statusCode = 500;
      res.end(JSON.stringify(errorPayload, null, 2));
    }
  }
}
