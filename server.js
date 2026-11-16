import http from 'node:http';
import { convertCurrency } from './src/currencyService.js';

const server = http.createServer((req, res) => {

  let body = '';
  req.on('data', (chunk) => {
    body += chunk;
  });

  req.on('end', () => {
    const payload = body ? JSON.parse(body) : {};
    const result = convertCurrency(payload);

    res.writeHead(200, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify(result));
  });
});

const PORT = process.env.PORT || 3000;
server.listen(PORT, () => {
  console.log(`fx-conversion-api listening on http://localhost:${PORT}`);
});