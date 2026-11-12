import React, { useState } from 'react';
import {
  Code2,
  Copy,
  Check,
  Server,
  Database,
  Globe,
  KeyRound,
  Play,
  Loader2,
  CheckCircle2,
  AlertCircle,
} from 'lucide-react';

export const BackendIntegrationGuide: React.FC = () => {
  const [copiedSection, setCopiedSection] = useState<string | null>(null);

  // Live tester states
  const [testEndpoint, setTestEndpoint] = useState<'/api/health' | '/api/carparkavailability'>('/api/health');
  const [testKey, setTestKey] = useState<string>('');
  const [isTesting, setIsTesting] = useState<boolean>(false);
  const [testResponse, setTestResponse] = useState<any>(null);
  const [testStatus, setTestStatus] = useState<number | null>(null);

  const copyToClipboard = (text: string, sectionId: string) => {
    navigator.clipboard.writeText(text);
    setCopiedSection(sectionId);
    setTimeout(() => setCopiedSection(null), 2000);
  };

  const runEndpointTest = async () => {
    setIsTesting(true);
    setTestResponse(null);
    setTestStatus(null);
    try {
      const headers: Record<string, string> = {
        accept: 'application/json',
      };
      if (testKey.trim()) {
        headers['AccountKey'] = testKey.trim();
      }

      const res = await fetch(testEndpoint, {
        method: 'GET',
        headers,
      });

      setTestStatus(res.status);
      const data = await res.json();
      setTestResponse(data);
    } catch (err: any) {
      setTestStatus(500);
      setTestResponse({
        error: 'Failed to execute request to local endpoint',
        message: err.message,
      });
    } finally {
      setIsTesting(false);
    }
  };

  const serverlessAvailabilitySnippet = `/**
 * /api/carparkavailability.ts
 * Serverless function: pulls live carpark lots from LTA DataMall
 * Endpoint: https://datamall2.mytransport.sg/ltaodataservice/CarParkAvailabilityv2
 * Required Header: AccountKey: <LTA_ACCOUNT_KEY>
 */

const LTA_ENDPOINT = 'https://datamall2.mytransport.sg/ltaodataservice/CarParkAvailabilityv2';

export default async function handler(req: any, res: any) {
  // CORS configuration
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET,OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, AccountKey, x-account-key');

  if (req.method === 'OPTIONS') {
    res.statusCode = 204;
    res.end();
    return;
  }

  // Key retrieved from environment variable or header; no hardcoding
  const accountKey =
    process.env.LTA_ACCOUNT_KEY ||
    process.env.LTA_DATAMALL_KEY ||
    req.headers['accountkey'] ||
    req.headers['x-account-key'];

  if (!accountKey) {
    res.status(401).json({
      error: 'Missing LTA AccountKey',
      message: 'Configure LTA_ACCOUNT_KEY in .env or pass AccountKey header.',
    });
    return;
  }

  try {
    const response = await fetch(LTA_ENDPOINT, {
      method: 'GET',
      headers: {
        AccountKey: String(accountKey).trim(),
        accept: 'application/json',
      },
    });

    const data = await response.json();
    res.status(response.status).json(data);
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
}`;

  const serverlessHealthSnippet = `/**
 * /api/health.ts
 * Serverless health check endpoint
 */
export default async function handler(req: any, res: any) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.status(200).json({
    status: 'ok',
    timestamp: new Date().toISOString(),
    service: 'ParkSG LTA DataMall Gateway',
    ltaKeyConfigured: Boolean(process.env.LTA_ACCOUNT_KEY || process.env.LTA_DATAMALL_KEY),
  });
}`;

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Header */}
      <div>
        <div className="flex items-center gap-2 text-xs font-semibold text-emerald-600 dark:text-emerald-400 uppercase tracking-wider">
          <Server className="h-4 w-4" />
          <span>Serverless Connection & LTA DataMall Gateway</span>
        </div>
        <h2 className="mt-1 text-2xl font-bold text-slate-900 dark:text-white">
          LTA DataMall Serverless Endpoints
        </h2>
        <p className="mt-1 text-xs sm:text-sm text-slate-500 dark:text-slate-400">
          Created in the root <code className="font-mono text-emerald-600 dark:text-emerald-400">/api</code> directory for serverless environments (Vercel, AWS Lambda, Cloud Run, Netlify) with zero hardcoded API keys.
        </p>
      </div>

      {/* Live Serverless Endpoint Tester */}
      <div className="rounded-xl border border-emerald-300/80 bg-emerald-50/30 p-5 shadow-xs dark:border-emerald-900/60 dark:bg-emerald-950/20">
        <div className="flex items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <Play className="h-4 w-4 text-emerald-600" />
            <span className="text-sm font-bold text-slate-900 dark:text-white">
              Live Serverless Tester
            </span>
          </div>
          <span className="text-[11px] text-slate-500 dark:text-slate-400">
            Tests endpoints live via Express / Serverless Gateway
          </span>
        </div>

        <div className="mt-3 grid grid-cols-1 sm:grid-cols-12 gap-3">
          <div className="sm:col-span-4">
            <label className="block text-[11px] font-semibold text-slate-600 dark:text-slate-300 mb-1">
              Endpoint
            </label>
            <select
              value={testEndpoint}
              onChange={(e) => setTestEndpoint(e.target.value as any)}
              className="w-full rounded-lg border border-slate-200 bg-white p-2 text-xs font-mono font-medium text-slate-800 dark:border-slate-700 dark:bg-slate-800 dark:text-white"
            >
              <option value="/api/health">GET /api/health</option>
              <option value="/api/carparkavailability">GET /api/carparkavailability</option>
            </select>
          </div>

          <div className="sm:col-span-6">
            <label className="block text-[11px] font-semibold text-slate-600 dark:text-slate-300 mb-1">
              AccountKey (Optional: for testing before saving to .env)
            </label>
            <input
              type="password"
              placeholder="Leave blank to use process.env.LTA_ACCOUNT_KEY"
              value={testKey}
              onChange={(e) => setTestKey(e.target.value)}
              className="w-full rounded-lg border border-slate-200 bg-white p-2 text-xs font-mono text-slate-800 placeholder-slate-400 dark:border-slate-700 dark:bg-slate-800 dark:text-white"
            />
          </div>

          <div className="sm:col-span-2 flex items-end">
            <button
              onClick={runEndpointTest}
              disabled={isTesting}
              className="w-full flex items-center justify-center gap-1.5 rounded-lg bg-emerald-600 py-2 text-xs font-semibold text-white shadow-xs hover:bg-emerald-700 disabled:opacity-60 transition-colors"
            >
              {isTesting ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Play className="h-3.5 w-3.5" />}
              <span>Send</span>
            </button>
          </div>
        </div>

        {/* Test Result Display */}
        {testStatus !== null && (
          <div className="mt-3 rounded-lg border border-slate-200 bg-white p-3 dark:border-slate-800 dark:bg-slate-900">
            <div className="flex items-center justify-between border-b border-slate-100 pb-2 mb-2 dark:border-slate-800">
              <div className="flex items-center gap-2">
                {testStatus >= 200 && testStatus < 300 ? (
                  <CheckCircle2 className="h-4 w-4 text-emerald-600" />
                ) : (
                  <AlertCircle className="h-4 w-4 text-amber-500" />
                )}
                <span className="text-xs font-bold font-mono">
                  HTTP {testStatus}
                </span>
              </div>
              <span className="text-[11px] text-slate-400">
                {testStatus === 401 ? 'Auth required (LTA AccountKey)' : 'Response received'}
              </span>
            </div>

            <pre className="max-h-60 overflow-y-auto text-[11px] font-mono text-slate-800 dark:text-slate-200 bg-slate-50 dark:bg-slate-950 p-2.5 rounded-md leading-relaxed">
              {JSON.stringify(testResponse, null, 2)}
            </pre>
          </div>
        )}
      </div>

      {/* Endpoint Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {/* /api/health.ts */}
        <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-xs dark:border-slate-800 dark:bg-slate-900">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2 text-sm font-bold text-slate-900 dark:text-white">
              <CheckCircle2 className="h-4 w-4 text-emerald-600" />
              <span>/api/health.ts</span>
            </div>
            <button
              onClick={() => copyToClipboard(serverlessHealthSnippet, 'health')}
              className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
              title="Copy code"
            >
              {copiedSection === 'health' ? (
                <Check className="h-4 w-4 text-emerald-600" />
              ) : (
                <Copy className="h-4 w-4" />
              )}
            </button>
          </div>
          <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">
            Validates serverless status, timestamp, and whether <code className="font-mono">LTA_ACCOUNT_KEY</code> is loaded.
          </p>
          <div className="mt-3 rounded-md bg-slate-100 p-2 font-mono text-[11px] text-slate-700 dark:bg-slate-800 dark:text-slate-300">
            GET /api/health
          </div>
        </div>

        {/* /api/carparkavailability.ts */}
        <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-xs dark:border-slate-800 dark:bg-slate-900">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2 text-sm font-bold text-slate-900 dark:text-white">
              <Globe className="h-4 w-4 text-emerald-600" />
              <span>/api/carparkavailability.ts</span>
            </div>
            <button
              onClick={() => copyToClipboard(serverlessAvailabilitySnippet, 'availability')}
              className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
              title="Copy code"
            >
              {copiedSection === 'availability' ? (
                <Check className="h-4 w-4 text-emerald-600" />
              ) : (
                <Copy className="h-4 w-4" />
              )}
            </button>
          </div>
          <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">
            Proxies LTA CarParkAvailabilityv2 with <code className="font-mono">AccountKey</code> header.
          </p>
          <div className="mt-3 rounded-md bg-slate-100 p-2 font-mono text-[11px] text-slate-700 dark:bg-slate-800 dark:text-slate-300">
            GET /api/carparkavailability
          </div>
        </div>
      </div>

      {/* Code Viewer: /api/carparkavailability.ts */}
      <div className="rounded-xl border border-slate-200 bg-white overflow-hidden shadow-xs dark:border-slate-800 dark:bg-slate-900">
        <div className="flex items-center justify-between border-b border-slate-200 px-4 py-3 dark:border-slate-800">
          <div className="flex items-center gap-2">
            <Code2 className="h-4 w-4 text-slate-500" />
            <span className="text-xs font-semibold text-slate-900 dark:text-white">
              /api/carparkavailability.ts
            </span>
          </div>

          <button
            onClick={() => copyToClipboard(serverlessAvailabilitySnippet, 'full-code')}
            className="flex items-center gap-1.5 rounded-md border border-slate-200 px-2.5 py-1 text-xs font-medium text-slate-600 hover:bg-slate-100 dark:border-slate-800 dark:text-slate-300 dark:hover:bg-slate-800 transition-colors"
          >
            {copiedSection === 'full-code' ? (
              <>
                <Check className="h-3.5 w-3.5 text-emerald-600" />
                <span>Copied</span>
              </>
            ) : (
              <>
                <Copy className="h-3.5 w-3.5" />
                <span>Copy Code</span>
              </>
            )}
          </button>
        </div>

        <pre className="p-4 overflow-x-auto text-xs font-mono text-slate-800 dark:text-slate-200 bg-slate-50 dark:bg-slate-950/60 leading-relaxed">
          {serverlessAvailabilitySnippet}
        </pre>
      </div>

      {/* How to configure API key */}
      <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-xs dark:border-slate-800 dark:bg-slate-900">
        <h3 className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2 mb-2">
          <KeyRound className="h-4 w-4 text-amber-500" />
          <span>Setting Your LTA AccountKey</span>
        </h3>
        <p className="text-xs text-slate-600 dark:text-slate-400 mb-3">
          To connect to live data, add your key to your environment variables without checking it into git:
        </p>

        <div className="rounded-md bg-slate-100 p-3 font-mono text-xs text-slate-800 dark:bg-slate-800 dark:text-slate-200">
          LTA_ACCOUNT_KEY="your_lta_datamall_key_here"
        </div>
      </div>
    </div>
  );
};
