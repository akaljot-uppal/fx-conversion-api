export const EXCHANGE_RATES = Object.freeze({
  CAD: 1.0,
  USD: 0.72,
  EUR: 0.66,
  GBP: 0.57,
  AUD: 1.09,
  JPY: 109.5,
});

// Create an error object with a status code and message
export const createError = (statusCode, message) => {
  const error = new Error(message);
  error.statusCode = statusCode;
  return error;
};

// Round a number to two decimal places or keep as is if too large
const roundToTwoDecimals = (value) => {
  if (Math.abs(value) >= 1e21) {
    return value;
  }
  return Math.round((value + Number.EPSILON) * 100) / 100;
};

// Validate currency code and normalize it to uppercase
const normalizeCurrencyCode = (code, field) => {
  if (typeof code !== "string") {
    throw createError(
      400,
      `Invalid field '${field}', expected a non-empty string.`,
    );
  }
  const normalizedCode = code.trim().toUpperCase();
  if (!normalizedCode) {
    throw createError(400, `Missing required field '${field}'.`);
  }
  return normalizedCode;
};

// Validate the conversion request payload and return normalized values
const validateConversionRequest = (payload) => {
  if (!payload || typeof payload !== "object" || Array.isArray(payload)) {
    throw createError(
      400,
      "Invalid request payload, expected a JSON object with 'from', 'to', and 'amount' fields.",
    );
  }

  if (payload.from === undefined || payload.from === null) {
    throw createError(400, "Missing required field 'from'.");
  }
  if (payload.to === undefined || payload.to === null) {
    throw createError(400, "Missing required field 'to'.");
  }
  if (payload.amount === undefined || payload.amount === null) {
    throw createError(400, "Missing required field 'amount'.");
  }

  const from = normalizeCurrencyCode(payload.from, "from");
  const to = normalizeCurrencyCode(payload.to, "to");
  const amount = payload.amount;

  if (!Object.hasOwn(EXCHANGE_RATES, from)) {
    throw createError(
      400,
      `Unsupported currency '${from}'. Supported currencies are: ${Object.keys(EXCHANGE_RATES).join(", ")}`,
    );
  }

  if (!Object.hasOwn(EXCHANGE_RATES, to)) {
    throw createError(
      400,
      `Unsupported currency '${to}'. Supported currencies are: ${Object.keys(EXCHANGE_RATES).join(", ")}`,
    );
  }

  if (typeof amount !== "number" || !Number.isFinite(amount) || amount < 0) {
    throw createError(
      400,
      "Invalid amount, expected a finite, non-negative number.",
    );
  }

  return { to, from, amount };
};

// Convert currency based on the validated request payload
export const convertCurrency = (payload) => {
  const { from, to, amount } = validateConversionRequest(payload);

  const exchangeRate = EXCHANGE_RATES[to] / EXCHANGE_RATES[from];

  const convertedAmount = amount * exchangeRate;

  if (!Number.isFinite(convertedAmount)) {
    throw createError(400, "Amount is too large to convert.");
  }

  return {
    from,
    to,
    originalAmount: roundToTwoDecimals(amount),
    convertedAmount: roundToTwoDecimals(convertedAmount),
    exchangeRate,
  };
};
