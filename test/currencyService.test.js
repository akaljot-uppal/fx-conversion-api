import assert from 'node:assert/strict';
import test from 'node:test';
import { convertCurrency, EXCHANGE_RATES } from '../src/currencyService.js';

test('converts every supported currency pair', async (t) => {
  for (const [from, fromRate] of Object.entries(EXCHANGE_RATES)) {
    for (const [to, toRate] of Object.entries(EXCHANGE_RATES)) {
      await t.test(`${from} to ${to}`, () => {
        const result = convertCurrency({ from, to, amount: 100 });
        const exchangeRate = toRate / fromRate;

        assert.deepEqual(result, {
          from,
          to,
          originalAmount: 100,
          convertedAmount: Number((100 * exchangeRate).toFixed(2)),
          exchangeRate: Number(exchangeRate.toFixed(2))
        });
      });
    }
  }
});