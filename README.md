# fx-conversion-api
A simple and small node.js REST API that converts amounts between predefined currencies.

## Features
- REST API with one endpoint
- Made entirely with node.js only (No other frameworks)
- Uses static data with fictional exchange rates
- CAD is the base currency
- Endpoint accepts a JSON request with fields indicating the currency to convert fromm, currency to convert to, and the amount of currency
- On success, endpoint will return a repsonse as JSON with currency to convert from, currency to convert to, original amount, converted amount, and the exchange rate
- Requests will be validated (example: Missing fields, invalid amounts, unsupported currencies, etc...) and errors will be handled


## Supported Currencies
- CAD
- USD
- EUR
- GBP
- AUD
- JPY

## Exchange Rates
- CAD: 1.00 (Base)
- USD: 0.72
- EUR: 0.66
- GBP: 0.57
- AUD: 1.09
- JPY: 109.50