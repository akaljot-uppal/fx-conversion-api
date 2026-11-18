import http from "node:http";
import { convertCurrency, createError } from "./src/currencyService.js";

const MAX_REQUEST_BODY_SIZE = 1 * 1024 * 1024;

const sendJsonResponse = (res, statusCode, body) => {
  res.writeHead(statusCode, { "Content-Type": "application/json" });
  res.end(JSON.stringify(body));
};

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

export const createServer = () =>
  http.createServer(async (req, res) => {
    try {
      const { method, url, headers } = req;
      const contentType = headers["content-type"];
      let pathname;

      if (typeof url !== "string") {
        sendJsonResponse(res, 400, { error: "Invalid request URL." });
        return;
      }

      try {
        pathname = new URL(url, "http://localhost").pathname;
      } catch {
        sendJsonResponse(res, 400, { error: "Invalid request URL." });
        return;
      }

      if (pathname !== "/convert") {
        sendJsonResponse(res, 404, {
          error: "Endpoint not found. Use POST /convert.",
        });
        return;
      }

      if (method !== "POST") {
        sendJsonResponse(res, 405, {
          error:
            "Method Not Allowed, only POST requests are allowed for this endpoint",
        });
        return;
      }

      if (!isJsonContentType(contentType)) {
        sendJsonResponse(res, 400, {
          error: "Invalid Content-Type, expected application/json.",
        });
        return;
      }

      const payload = await parseRequestBody(req);
      const result = convertCurrency(payload);

      sendJsonResponse(res, 200, result);
    } catch (error) {
      const statusCode = Number.isInteger(error?.statusCode)
        ? error.statusCode
        : 500;
      const message =
        statusCode === 500
          ? "An unexpected error occurred while processing the conversion request."
          : error.message;
      sendJsonResponse(res, statusCode, { error: message });
    }
  });

const PORT = process.env.PORT || 3000;
const server = createServer();

server.on("error", (error) => {
  console.error("Server error:", error);
  if (server.listening) {
    server.close();
  }
});

server.listen(PORT, () => {
  console.log(`fx-conversion-api listening on http://localhost:${PORT}`);
});
