const EXCHANGE_RATES = Object.freeze({
    CAD: 1.00,
    USD: 0.72,
    EUR: 0.66,
    GBP: 0.57,
    AUD: 1.09,
    JPY: 109.50
});

const convertCurrency = (payload) => {
    const { from, to, amount } = payload;

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