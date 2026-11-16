import http from 'node:http';
import { convertCurrency } from './src/currencyService.js';

const parseRequestBody = (req) => {
  let body = '';

  req.on('data', (chunk) => {
    body += chunk;
  });

  req.on('end', () => {
    if (!body) return {};

    try {
      return JSON.parse(body);
    } catch (error) {
      throw new Error('Invalid request payload, please provide a valid JSON object with to, from, and amount fields');
    }
  });
}

const server = http.createServer((req, res) => {
  const { method, url } = req;
  const parsedUrl = new URL(url, `http://${req.headers.host}`);
  const pathname = parsedUrl.pathname;

  if (pathname !== '/convert') {
    res.writeHead(404, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify({ error: 'Endpoint Not Found, only request to /convert are allowed' }));
    return;
  }

  if (method !== "POST") {
    res.writeHead(405, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify({ error: 'Method Not Allowed, only POST requests are allowed for this endpoint' }));
    return;
  }
  
  try {
    const payload = parseRequestBody(req);
    const result = convertCurrency(payload);

    res.writeHead(200, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify(result));
  } catch (error) {
    res.writeHead(400, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify({ error: error.message }));
  }
});

const PORT = process.env.PORT || 3000;
server.listen(PORT, () => {
  console.log(`fx-conversion-api listening on http://localhost:${PORT}`);
});