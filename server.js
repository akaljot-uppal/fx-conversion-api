import http from "node:http";
import { convertCurrency, createError } from "./src/currencyService.js";

const MAX_REQUEST_BODY_SIZE = 1 * 1024 * 1024;

const isJsonContentType = (contentType) =>
  typeof contentType === "string" &&
  /^application\/(?:[\w.-]+\+)?json(?:\s*;|$)/i.test(contentType);

const parseRequestBody = (req) =>
  new Promise((resolve, reject) => {
    const chunks = [];
    let bodySize = 0;
    let bodyTooLarge = false;

    req.on("error", () => {
      reject(createError(400, "Unable to read the request body."));
    });

    req.on("data", (chunk) => {
      if (bodyTooLarge) {
        return;
      }

      bodySize += chunk.length;
      if (bodySize > MAX_REQUEST_BODY_SIZE) {
        bodyTooLarge = true;
        chunks.length = 0;
        reject(createError(413, "Request body too large."));
        return;
      }
      chunks.push(chunk);
    });

    req.on("end", () => {
      if (bodyTooLarge) {
        return;
      }

      try {
        const rawBody = Buffer.concat(chunks).toString();
        const body = JSON.parse(rawBody);

        if (!body || typeof body !== "object" || Array.isArray(body)) {
          reject(
            createError(
              400,
              "Invalid request payload, expected a JSON object with 'from', 'to', and 'amount' fields.",
            ),
          );
          return;
        }

        resolve(body);
      } catch {
        reject(
          createError(
            400,
            "Invalid JSON in request body, expected a JSON object with 'from', 'to', and 'amount' fields.",
          ),
        );
      }
    });
  });

const server = http.createServer(async (req, res) => {
  try {
    const { method, url, headers } = req;
    const contentType = headers["content-type"];
    let pathname;

    try {
      pathname = new URL(url, `http://localhost`).pathname;
    } catch {
      res.writeHead(400, { "Content-Type": "application/json" });
      res.end(JSON.stringify({ error: "Invalid request URL." }));
      return;
    }

    if (typeof url !== "string") {
      res.writeHead(400, { "Content-Type": "application/json" });
      res.end(JSON.stringify({ error: "Invalid request URL." }));
      return;
    }

    if (pathname !== "/convert") {
      res.writeHead(404, { "Content-Type": "application/json" });
      res.end(
        JSON.stringify({ error: "Endpoint not found. Use POST /convert." }),
      );
      return;
    }

    if (method !== "POST") {
      res.writeHead(405, { "Content-Type": "application/json" });
      res.end(
        JSON.stringify({
          error:
            "Method Not Allowed, only POST requests are allowed for this endpoint",
        }),
      );
      return;
    }

    if (!isJsonContentType(contentType)) {
      res.writeHead(400, { "Content-Type": "application/json" });
      res.end(
        JSON.stringify({
          error: "Invalid Content-Type, expected application/json.",
        }),
      );
      return;
    }

    const payload = await parseRequestBody(req);
    const result = convertCurrency(payload);

    res.writeHead(200, { "Content-Type": "application/json" });
    res.end(JSON.stringify(result));
  } catch (error) {
    const statusCode = Number.isInteger(error?.statusCode)
      ? error.statusCode
      : 500;
    const message =
      statusCode === 500
        ? "An unexpected error occurred while processing the conversion request."
        : error.message;
    res.writeHead(statusCode, { "Content-Type": "application/json" });
    res.end(JSON.stringify({ error: message }));
  }
});

const PORT = process.env.PORT || 3000;
server.listen(PORT, () => {
  console.log(`fx-conversion-api listening on http://localhost:${PORT}`);
});
