import React, { useState } from 'react';
import { Code2, Copy, Check, Server, Database, Globe, KeyRound } from 'lucide-react';

export const BackendIntegrationGuide: React.FC = () => {
  const [copiedSection, setCopiedSection] = useState<string | null>(null);

  const copyToClipboard = (text: string, sectionId: string) => {
    navigator.clipboard.writeText(text);
    setCopiedSection(sectionId);
    setTimeout(() => setCopiedSection(null), 2000);
  };

  const expressSnippet = `// server.ts - Example Express Backend Proxy for Singapore LTA & HDB Carpark Data
import express from 'express';
import axios from 'axios';

const app = express();
const PORT = process.env.PORT || 3000;

// 1. Data.gov.sg Carpark Availability API (Free, Public)
app.get('/api/carparks/availability', async (req, res) => {
  try {
    const response = await axios.get(
      'https://api.data.gov.sg/v1/transport/carpark-availability'
    );
    res.json(response.data);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch carpark availability' });
  }
});

// 2. LTA DataMall v2 Carpark Availability (Real-time Malls, URA & LTA)
app.get('/api/lta/availability', async (req, res) => {
  const apiKey = process.env.LTA_DATAMALL_KEY;
  try {
    const response = await axios.get(
      'https://datamall2.mytransport.sg/ltaodataservice/CarParkAvailabilityv2',
      {
        headers: {
          AccountKey: apiKey,
          accept: 'application/json',
        },
      }
    );
    res.json(response.data);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch LTA DataMall data' });
  }
});

app.listen(PORT, () => {
  console.log(\`ParkSG Backend running on port \${PORT}\`);
});`;

  const jsonSnippet = `{
  "carpark_data": [
    {
      "carpark_number": "ACB",
      "update_datetime": "2026-11-12T17:10:00",
      "carpark_info": [
        {
          "total_lots": "480",
          "lot_type": "C",
          "lots_available": "142"
        },
        {
          "total_lots": "60",
          "lot_type": "Y",
          "lots_available": "24"
        }
      ]
    }
  ]
}`;

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Header */}
      <div>
        <div className="flex items-center gap-2 text-xs font-semibold text-emerald-600 dark:text-emerald-400 uppercase tracking-wider">
          <Server className="h-4 w-4" />
          <span>Backend Integration Guide</span>
        </div>
        <h2 className="mt-1 text-2xl font-bold text-slate-900 dark:text-white">
          Ready for Your Backend Integration
        </h2>
        <p className="mt-1 text-xs sm:text-sm text-slate-500 dark:text-slate-400">
          This frontend was built with clean decoupled models (`src/types/carpark.ts` and `src/services/carparkService.ts`). You can seamlessly hook it up to your backend or Singapore Government Open Data APIs.
        </p>
      </div>

      {/* Official Singapore Data Feeds */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-xs dark:border-slate-800 dark:bg-slate-900">
          <div className="flex items-center gap-2 text-sm font-bold text-slate-900 dark:text-white">
            <Globe className="h-4 w-4 text-emerald-600" />
            <span>Data.gov.sg (HDB API)</span>
          </div>
          <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">
            Provides 1-minute updates for over 2,100 HDB carparks across Singapore. No API key required.
          </p>
          <div className="mt-3 rounded-md bg-slate-100 p-2 font-mono text-[11px] text-slate-700 dark:bg-slate-800 dark:text-slate-300 break-all">
            GET https://api.data.gov.sg/v1/transport/carpark-availability
          </div>
        </div>

        <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-xs dark:border-slate-800 dark:bg-slate-900">
          <div className="flex items-center gap-2 text-sm font-bold text-slate-900 dark:text-white">
            <KeyRound className="h-4 w-4 text-amber-500" />
            <span>LTA DataMall v2 API</span>
          </div>
          <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">
            Provides commercial malls (Orchard, Marina Bay, Suntec, VivoCity, etc.) and URA/LTA lots. Requires free LTA developer key.
          </p>
          <div className="mt-3 rounded-md bg-slate-100 p-2 font-mono text-[11px] text-slate-700 dark:bg-slate-800 dark:text-slate-300 break-all">
            GET https://datamall2.mytransport.sg/ltaodataservice/CarParkAvailabilityv2
          </div>
        </div>
      </div>

      {/* Code Snippet: Node.js Express Proxy */}
      <div className="rounded-xl border border-slate-200 bg-white overflow-hidden shadow-xs dark:border-slate-800 dark:bg-slate-900">
        <div className="flex items-center justify-between border-b border-slate-200 px-4 py-3 dark:border-slate-800">
          <div className="flex items-center gap-2">
            <Code2 className="h-4 w-4 text-slate-500" />
            <span className="text-xs font-semibold text-slate-900 dark:text-white">
              server.ts (Express Backend Proxy Template)
            </span>
          </div>

          <button
            onClick={() => copyToClipboard(expressSnippet, 'express')}
            className="flex items-center gap-1.5 rounded-md border border-slate-200 px-2.5 py-1 text-xs font-medium text-slate-600 hover:bg-slate-100 dark:border-slate-800 dark:text-slate-300 dark:hover:bg-slate-800 transition-colors"
          >
            {copiedSection === 'express' ? (
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
          {expressSnippet}
        </pre>
      </div>

      {/* JSON Output Schema Reference */}
      <div className="rounded-xl border border-slate-200 bg-white overflow-hidden shadow-xs dark:border-slate-800 dark:bg-slate-900">
        <div className="flex items-center justify-between border-b border-slate-200 px-4 py-3 dark:border-slate-800">
          <div className="flex items-center gap-2">
            <Database className="h-4 w-4 text-slate-500" />
            <span className="text-xs font-semibold text-slate-900 dark:text-white">
              Data.gov.sg Payload Format Reference
            </span>
          </div>

          <button
            onClick={() => copyToClipboard(jsonSnippet, 'json')}
            className="flex items-center gap-1.5 rounded-md border border-slate-200 px-2.5 py-1 text-xs font-medium text-slate-600 hover:bg-slate-100 dark:border-slate-800 dark:text-slate-300 dark:hover:bg-slate-800 transition-colors"
          >
            {copiedSection === 'json' ? (
              <>
                <Check className="h-3.5 w-3.5 text-emerald-600" />
                <span>Copied</span>
              </>
            ) : (
              <>
                <Copy className="h-3.5 w-3.5" />
                <span>Copy JSON</span>
              </>
            )}
          </button>
        </div>

        <pre className="p-4 overflow-x-auto text-xs font-mono text-slate-800 dark:text-slate-200 bg-slate-50 dark:bg-slate-950/60 leading-relaxed">
          {jsonSnippet}
        </pre>
      </div>
    </div>
  );
};
