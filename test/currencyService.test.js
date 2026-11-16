import assert from 'node:assert/strict';
import test from 'node:test';
import { convertCurrency, EXCHANGE_RATES } from '../src/currencyService.js';

test('convertCurrency should convert amounts correctly between any two supported currencies', () => {
    for (const [from, fromRate] of Object.entries(EXCHANGE_RATES)) {
        for (const [to, toRate] of Object.entries(EXCHANGE_RATES)) {
            const amount = 100;
            const exchangeRate = toRate / fromRate;
            const expectedConvertedAmount = amount * exchangeRate;
            const result = convertCurrency({ from, to, amount });
            assert.deepEqual(result, {
            from,
            to,
            originalAmount: Number(amount.toFixed(2)),
            convertedAmount: Number(expectedConvertedAmount.toFixed(2)),
            exchangeRate: Number(exchangeRate.toFixed(2))
        });
        }
    }
});