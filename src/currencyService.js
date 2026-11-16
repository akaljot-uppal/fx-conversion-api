const EXCHANGE_RATES = Object.freeze({
    CAD: 1.00,
    USD: 0.72,
    EUR: 0.66,
    GBP: 0.57,
    AUD: 1.09,
    JPY: 109.50
});

const validateConversionRequest = (payload) => {
    if (!payload || typeof payload !== 'object' || Array.isArray(payload)) {
        throw new Error('Invalid request payload, please provide a valid JSON object with to, from, and amount fields');
    }

    if (!payload.from || !payload.to || !payload.amount) {
        throw new Error('Missing required fields in payload, please provide valid to, from, and amount fields');
    }

    if (!(payload.from in EXCHANGE_RATES)) {
        throw new Error(`Unsupported currency: ${payload.from}. Supported currencies are: ${Object.keys(EXCHANGE_RATES).join(', ')}`);
    }

    if (!(payload.to in EXCHANGE_RATES)) {
        throw new Error(`Unsupported currency: ${payload.to}. Supported currencies are: ${Object.keys(EXCHANGE_RATES).join(', ')}`);
    }

    if (typeof payload.amount !== 'number' || isNaN(payload.amount) || payload.amount < 0 || !Number.isFinite(payload.amount)) {
        throw new Error('Invalid amount, please provide a valid positive number');
    }

    return {to: payload.to, from: payload.from, amount: payload.amount}
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