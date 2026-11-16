import http from 'node:http';
import { convertCurrency, createError } from './src/currencyService.js';

const MAX_REQUEST_BODY_SIZE = 1 * 1024 * 1024;

const parseRequestBody = (req) => new Promise((resolve, reject) => {
  const chunks = [];

  req.on('error', () => {
    reject(createError(400, 'Unable to read the request body.'));
  });

  req.on('data', (chunk) => {
    if (Buffer.byteLength(chunk) > MAX_REQUEST_BODY_SIZE) {
      reject(createError(413, 'Request body too large.'));
      return;
    }
    chunks.push(chunk);
  });

  req.on('end', () => {
    try {
      const rawBody = Buffer.concat(chunks).toString();
      const body = JSON.parse(rawBody);
      resolve(body);
    } catch {
      reject(createError(400, 'Invalid JSON in request body, expected a JSON object with "from", "to", and "amount" fields.'));
    }
  });
});

const server = http.createServer(async (req, res) => {
  const { method, url } = req;
  const parsedUrl = new URL(url, `http://${req.headers.host}`);
  const pathname = parsedUrl.pathname;

  if (pathname !== '/convert') {
    res.writeHead(404, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify({ error: 'Endpoint not found. Use POST /convert.' }));
    return;
  }

  if (method !== "POST") {
    res.writeHead(405, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify({ error: 'Method Not Allowed, only POST requests are allowed for this endpoint' }));
    return;
  }
  
  try {
    const payload = await parseRequestBody(req);
    const result = convertCurrency(payload);

    res.writeHead(200, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify(result));
  } catch (error) {
    const statusCode = Number.isInteger(error?.statusCode) ? error.statusCode : 500;
    const message = statusCode === 500
      ? 'An unexpected error occurred while processing the conversion request.'
      : error.message;
    res.writeHead(statusCode, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify({ error: message }));
  }
});

const PORT = process.env.PORT || 3000;
server.listen(PORT, () => {
  console.log(`fx-conversion-api listening on http://localhost:${PORT}`);
});