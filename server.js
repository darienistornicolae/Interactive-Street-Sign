import express from 'express';
import cors from 'cors';
// import { PrismaClient } from '@prisma/client/edge';
// import { withAccelerate } from '@prisma/extension-accelerate';
import path from 'path';
import { fileURLToPath } from 'url';
import dotenv from 'dotenv';
import { google } from 'googleapis';
import fs from 'fs';

dotenv.config();

// Google Sheets (for Google Forms responses)
const RESPONSES_SHEET_ID = process.env.RESPONSES_SHEET_ID; // required
const RESPONSES_SHEET_NAME = process.env.RESPONSES_SHEET_NAME || 'Form Responses 1'; // optional, defaults to standard sheet name
console.log('[Sheets] Sheet ID present:', !!RESPONSES_SHEET_ID, '| Tab:', RESPONSES_SHEET_NAME);

// Credential sources supported (checked in order):
// 1) GOOGLE_CREDENTIALS or GOOGLE_SERVICE_ACCOUNT_JSON (JSON string or base64-encoded JSON)
// 2) GOOGLE_APPLICATION_CREDENTIALS (path to JSON file)
// 3) GOOGLE_SERVICE_ACCOUNT_EMAIL + GOOGLE_PRIVATE_KEY (env vars; key may contain literal \n or real newlines)

function loadServiceAccountCreds() {
  const jsonInline = process.env.GOOGLE_CREDENTIALS || process.env.GOOGLE_SERVICE_ACCOUNT_JSON;
  if (jsonInline) {
    try {
      const raw = jsonInline.trim().startsWith('{')
        ? jsonInline
        : Buffer.from(jsonInline, 'base64').toString('utf8');
      const parsed = JSON.parse(raw);
      return {
        email: parsed.client_email,
        key: parsed.private_key,
        source: 'inline-json'
      };
    } catch (e) {
      console.error('❌ Failed to parse GOOGLE_CREDENTIALS / GOOGLE_SERVICE_ACCOUNT_JSON:', e);
    }
  }

  const jsonPath = process.env.GOOGLE_APPLICATION_CREDENTIALS;
  if (jsonPath) {
    try {
      const raw = fs.readFileSync(jsonPath, 'utf8');
      const parsed = JSON.parse(raw);
      return {
        email: parsed.client_email,
        key: parsed.private_key,
        source: 'file-path'
      };
    } catch (e) {
      console.error('❌ Failed to read GOOGLE_APPLICATION_CREDENTIALS file:', e);
    }
  }

  const email = process.env.GOOGLE_SERVICE_ACCOUNT_EMAIL;
  const key = (process.env.GOOGLE_PRIVATE_KEY || '').replace(/\\n/g, '\n');
  if (email || key) {
    return { email, key, source: 'env-pair' };
  }
  return { email: undefined, key: undefined, source: 'none' };
}

const sa = loadServiceAccountCreds();
console.log(`[Sheets] Credential source: ${sa.source} | email present:`, !!sa.email, '| key present:', !!sa.key);

let sheets;
(async () => {
  if (!sa.email || !sa.key) {
    console.warn('⚠️ Missing service account email or private key; Google Sheets client will not be initialized.');
    return;
  }
  if (!/BEGIN PRIVATE KEY/.test(sa.key)) {
    console.warn('⚠️ Private key does not look like a PEM block. If you used a .env, ensure newlines are encoded as \\n or provide full JSON via GOOGLE_CREDENTIALS.');
  }
  try {
    const sheetsAuth = new google.auth.JWT({
      email: sa.email,
      key: sa.key,
      scopes: ['https://www.googleapis.com/auth/spreadsheets.readonly'],
    });
    await sheetsAuth.authorize();
    sheets = google.sheets({ version: 'v4', auth: sheetsAuth });
    console.log('✅ Google Sheets client authorized');
  } catch (e) {
    console.error('❌ Failed to authorize Google Sheets client:', e);
  }
})();

const app = express();
const PORT = 3001;
const HOST = '0.0.0.0';


// const prisma = new PrismaClient({
//   datasources: { db: { url: process.env.DATABASE_URL } }
// }).$extends(withAccelerate());


app.use(cors());
app.use(express.json());
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

app.use(express.static(path.join(__dirname, 'dist')));

async function fetchResponsesCount() {
  if (!RESPONSES_SHEET_ID) {
    throw new Error('Missing RESPONSES_SHEET_ID env var');
  }
  if (!sheets) {
    throw new Error('Google Sheets client not initialized (auth failed or missing env vars)');
  }

  const TARGET_HEADER = (process.env.RESPONSES_YES_HEADER || 'Did you or someone help with the harassment?').trim().toLowerCase();

  // 1) Read header row to find the column index
  const headerResp = await sheets.spreadsheets.values.get({
    spreadsheetId: RESPONSES_SHEET_ID,
    range: `'${RESPONSES_SHEET_NAME}'!1:1`,
    majorDimension: 'ROWS',
  });
  const headerRow = (headerResp.data.values && headerResp.data.values[0]) || [];

  let colIndex = headerRow.findIndex(h => (h || '').trim().toLowerCase() === TARGET_HEADER);
  if (colIndex === -1) {
    // Fallback: fuzzy match in case the header is slightly different
    colIndex = headerRow.findIndex(h => {
      const t = (h || '').toLowerCase();
      return t.includes('did you or someone help') || (t.includes('help') && (t.includes('harassment') || t.includes('harass')));
    });
  }
  if (colIndex === -1) {
    throw new Error(`Could not find target header. Set RESPONSES_YES_HEADER env var to the exact column title.`);
  }

  // Helper to convert 0-based index -> column letter (A, B, ..., Z, AA, AB, ...)
  function indexToColumnLetter(i) {
    let n = i + 1;
    let s = '';
    while (n > 0) {
      const r = (n - 1) % 26;
      s = String.fromCharCode(65 + r) + s;
      n = Math.floor((n - 1) / 26);
    }
    return s;
  }

  const colLetter = indexToColumnLetter(colIndex);

  // 2) Read the column values (skip header) and count "Yes"
  const valuesResp = await sheets.spreadsheets.values.get({
    spreadsheetId: RESPONSES_SHEET_ID,
    range: `'${RESPONSES_SHEET_NAME}'!${colLetter}2:${colLetter}`,
    majorDimension: 'ROWS',
  });

  const rows = valuesResp.data.values || [];
  const yesCount = rows.reduce((acc, row) => {
    const v = (row[0] || '').trim().toLowerCase();
    return acc + (v === 'yes' ? 1 : 0);
  }, 0);

  return yesCount;
}


app.get('/api/form-count', async (req, res) => {
  try {
    const count = await fetchResponsesCount();
    res.json({ count });
  } catch (error) {
    console.error('Error getting Google Forms count from Sheets:', error);
    const msg = error instanceof Error ? error.message : 'Failed to get count from Google Sheets';
    res.status(500).json({ error: msg });
  }
});

app.get('/api/form-count/stream', async (req, res) => {
  res.setHeader('Content-Type', 'text/event-stream');
  res.setHeader('Cache-Control', 'no-cache');
  res.setHeader('Connection', 'keep-alive');
  // If you want to restrict origins, configure CORS accordingly. Default cors() allows * by default.

  let isClosed = false;
  req.on('close', () => {
    isClosed = true;
    clearInterval(intervalId);
  });

  const send = (data) => {
    res.write(`data: ${JSON.stringify(data)}\n\n`);
  };

  // Initial send
  try {
    const count = await fetchResponsesCount();
    send({ count, ts: Date.now() });
  } catch (e) {
    send({ error: (e instanceof Error ? e.message : 'init failed'), ts: Date.now() });
  }

  // Poll every 15s and push updates
  let lastCount = null;
  const intervalId = setInterval(async () => {
    if (isClosed) return;
    try {
      const count = await fetchResponsesCount();
      if (count !== lastCount) {
        lastCount = count;
        send({ count, ts: Date.now() });
      } else {
        // heartbeat to keep connection alive
        res.write(`: ping\n\n`);
      }
    } catch (e) {
      send({ error: (e instanceof Error ? e.message : 'poll failed'), ts: Date.now() });
    }
  }, 15000);
});

// app.post('/api/submit-report', async (req, res) => {
//   try {
//     const { incident_date, helped_with_harassment } = req.body;
    
//     if (!incident_date || !helped_with_harassment) {
//       return res.status(400).json({ error: 'Missing required fields' });
//     }
    
//     const report = await prisma.harassmentReport.create({
//       data: {
//         incident_date,
//         helped_with_harassment,
//       },
//     });
    
//     res.json({ 
//       success: true, 
//       id: report.id,
//       message: 'Report submitted successfully' 
//     });
//   } catch (error) {
//     console.error('Error submitting report:', error);
//     res.status(500).json({ error: 'Failed to submit report' });
//   }
// });


app.use((req, res) => {
  res.sendFile(path.join(__dirname, 'dist', 'index.html'));
});

app.listen(PORT, HOST, () => {
  console.log(`Server running on http://${HOST}:${PORT}`);
  console.log(`Local access: http://localhost:${PORT}`);
  console.log(`Network access: http://YOUR_IP:${PORT}`);
  console.log('Database initialized with Prisma Accelerate (PostgreSQL)');
});


process.on('SIGINT', async () => {
  console.log('Shutting down gracefully...');
  // await prisma.$disconnect?.();
  console.log('Prisma client disconnected. Shutting down...');
  process.exit(0);
});
