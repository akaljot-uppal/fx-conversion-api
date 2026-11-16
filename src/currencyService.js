const EXCHANGE_RATES = Object.freeze({
    CAD: 1.00,
    USD: 0.72,
    EUR: 0.66,
    GBP: 0.57,
    AUD: 1.09,
    JPY: 109.50
});

const normalizeCurrencyCode = (code) => {
    if (typeof code !== 'string') {
        throw new Error('Invalid currency code, please provide a valid string as for currency codes');
    }
    return code.toUpperCase();
};

const validateConversionRequest = (payload) => {

    if (!payload || typeof payload !== 'object' || Array.isArray(payload)) {
        throw new Error('Invalid request payload, please provide a valid JSON object with to, from, and amount fields');
    }
    
    const from = normalizeCurrencyCode(payload.from);
    const to = normalizeCurrencyCode(payload.to);
    const amount = payload.amount;

    if (!from || !to || !amount) {
        throw new Error('Missing required fields in payload, please provide valid to, from, and amount fields');
    }

    if (!(from in EXCHANGE_RATES)) {
        throw new Error(`Unsupported currency: ${from}. Supported currencies are: ${Object.keys(EXCHANGE_RATES).join(', ')}`);
    }

    if (!(to in EXCHANGE_RATES)) {
        throw new Error(`Unsupported currency: ${to}. Supported currencies are: ${Object.keys(EXCHANGE_RATES).join(', ')}`);
    }

    if (typeof amount !== 'number' || isNaN(amount) || amount < 0 || !Number.isFinite(amount)) {
        throw new Error('Invalid amount, please provide a valid positive number');
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