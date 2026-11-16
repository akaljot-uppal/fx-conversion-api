const EXCHANGE_RATES = Object.freeze({
    CAD: 1.00,
    USD: 0.72,
    EUR: 0.66,
    GBP: 0.57,
    AUD: 1.09,
    JPY: 109.50
});

const throwError = (statusCode, message) => {
    const error = new Error(message);
    error.statusCode = statusCode;
    throw error;
};

const normalizeCurrencyCode = (code, field) => {
    if (typeof code !== 'string') {
        throwError(400, `Invalid field "${field}", expected a non-empty string.`);
    }
    const normalizedCode = code.trim().toUpperCase();
    if (!normalizedCode) {
        throwError(400, `Missing required field "${field}".`);
    }
    return normalizedCode;
};

const validateConversionRequest = (payload) => {
    if (!payload || typeof payload !== 'object' || Array.isArray(payload)) {
        throwError(400, 'Invalid request payload, expected a JSON object with "from", "to", and "amount" fields.');
    }

    if (payload.from === undefined || payload.from === null) {
        throwError(400, 'Missing required field "from".');
    }
    if (payload.to === undefined || payload.to === null) {
        throwError(400, 'Missing required field "to".');
    }
    if (payload.amount === undefined || payload.amount === null) {
        throwError(400, 'Missing required field "amount".');
    }

    const from = normalizeCurrencyCode(payload.from, 'from');
    const to = normalizeCurrencyCode(payload.to, 'to');
    const amount = payload.amount;

    if (!(Object.hasOwn(EXCHANGE_RATES, from))) {
        throwError(400, `Unsupported currency "${from}". Supported currencies are: ${Object.keys(EXCHANGE_RATES).join(', ')}`);
    }

    if (!(Object.hasOwn(EXCHANGE_RATES, to))) {
        throwError(400, `Unsupported currency "${to}". Supported currencies are: ${Object.keys(EXCHANGE_RATES).join(', ')}`);
    }

    if (typeof amount !== 'number' || !Number.isFinite(amount) || amount < 0) {
        throwError(400, 'Invalid amount, expected a finite, non-negative number.');
    }

    return {to, from, amount}
};

export const convertCurrency = (payload) => {
    const { from, to, amount } = validateConversionRequest(payload);

    const exchangeRate = EXCHANGE_RATES[to] / EXCHANGE_RATES[from];

    const convertedAmount = amount * exchangeRate;

    return {
        from,
        to,
        originalAmount: Number(amount.toFixed(2)),
        convertedAmount: Number(convertedAmount.toFixed(2)),
        exchangeRate: Number(exchangeRate.toFixed(2))
    };
}