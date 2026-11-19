# fx-conversion-api

A lightweight Node.js REST API that converts amounts between a small set of predefined currencies using fixed exchange rates.

## Overview

This project exposes a single HTTP endpoint for currency conversion and uses the built-in `node:http` module without any external libraries or frameworks. The API validates incoming payloads, rejects unsupported or malformed requests with JSON errors, and returns the converted result as JSON.

## Features

- Single conversion endpoint: `POST /convert`
- Built with plain Node.js, no framework dependencies
- Fixed exchange rates stored in code as a static map
- CAD used as the base currency for calculations
- Request validation is done prior to any calculation or conversion
- Structured JSON responses for both success and error cases

## Supported Currencies

- CAD
- USD
- EUR
- GBP
- AUD
- JPY

## Exchange Rates

The rates in the current implementation are:

- CAD: 1.00 (base)
- USD: 0.72
- EUR: 0.66
- GBP: 0.57
- AUD: 1.09
- JPY: 109.50

## API Usage

### Request

Send a `POST` request to `/convert` with a JSON body like:

```json
{
  "from": "CAD",
  "to": "USD",
  "amount": 100
}
```

The `from` and `to` fields are case-insensitive; values are normalized to uppercase internally.

### Success Response

```json
{
  "from": "CAD",
  "to": "USD",
  "originalAmount": 100,
  "convertedAmount": 72,
  "exchangeRate": 0.72
}
```

### Error Response

Errors are returned as JSON with an `error` field:

```json
{
  "error": "Unsupported currency 'CHF'. Supported currencies are: CAD, USD, EUR, GBP, AUD, JPY"
}
```

Common validation errors include:

- missing request body fields
- invalid JSON payload
- unsupported currencies
- invalid or negative amounts
- method not allowed on `/convert`
- invalid route or URL

## Running the API

**Note: Ensure you have [Node](https://nodejs.org/en/download) installed**  

Install dependencies if needed (the project currently has no external dependencies), then start the server:

```bash
npm install
npm start
```

The server listens on port `3000` by default, or on `process.env.PORT` if it is set.

## Examples with curl

Run the following command in a separate terminal while the API is running.

### Bash (Linux, macOS, or Git Bash)

```bash
curl -X POST http://localhost:3000/convert \
  -H "Content-Type: application/json" \
  -d '{"from":"CAD","to":"USD","amount":100}'
```

### Command Prompt (cmd.exe)

```cmd
curl.exe -X POST http://localhost:3000/convert -H "Content-Type: application/json" -d "{\"from\":\"CAD\",\"to\":\"USD\",\"amount\":100}"
```

### PowerShell

Use `curl.exe` to invoke curl directly (rather than PowerShell's `curl` alias):

```powershell
curl.exe -X POST http://localhost:3000/convert `
  -H "Content-Type: application/json" `
  -d '{"from":"CAD","to":"USD","amount":100}'
```

## Notes

- The conversion formula: `targetAmount = sourceAmount * (targetRate / sourceRate)`.
- Returned amounts are rounded to two decimal places; `exchangeRate` retains full precision.

## The Use of AI
In this project I have made use of AI tools. Specifically, I have made use of the VS Code Copilot Chat extension as my main tool.
There are a couple of things that I used this tool for. The tool aided me in organizing the layout of my folders and files. The use of this tool allowed
me to consider various types of error scenarios to consider when validating the payload, for example the max request size and URL/content-type
validations. I also used to this to help highlight test cases that would be meaningful and reasonable to create, in addition to the cases I had already 
developed. Based on all these suggestions I was able to develop in a more effective manner by cutting off more tedious and time-consuming tasks. The actual
implementation and technical decisions were made and reviewed by me.