import http from 'node:http';
import { convertCurrency } from './src/currencyService.js';

const parseRequestBody = (req) => new Promise((resolve, reject) => {
  let body = '';

  req.on('error', () => {
    const error = new Error('Unable to read the request body.');
    error.statusCode = 400;
    reject(error);
  });

  req.on('data', (chunk) => {
    body += chunk;
  });

  req.on('end', () => {
    if (!body) {
      resolve({});
      return;
    }

    try {
      resolve(JSON.parse(body));
    } catch {
      reject(new Error('Invalid JSON in request body, expected a JSON object with "from", "to", and "amount" fields.'));
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