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

test('correctly rounds amounts to two decimal places', () => {
    const result = convertCurrency({ from: 'CAD', to: 'USD', amount: 1.236 });
    assert.deepEqual(result, {
    from: 'CAD',
    to: 'USD',
    originalAmount: 1.24,
    convertedAmount: 0.89,
    exchangeRate: 0.72
  });
});

test('correctly normalizes currency codes', () => {
    const result = convertCurrency({ from: ' cad ', to: 'usd', amount: 100 });
    assert.deepEqual(result, {
    from: 'CAD',
    to: 'USD',
    originalAmount: 100.00,
    convertedAmount: 72.00,
    exchangeRate: 0.72
  });
});

test('supports conversion between the same currency', () => {
    const result = convertCurrency({ from: 'USD', to: 'USD', amount: 100 });
    assert.deepEqual(result, {
    from: 'USD',
    to: 'USD',
    originalAmount: 100.00,
    convertedAmount: 100.00,
    exchangeRate: 1.00
  });
});

test('supports zero amount conversion', () => {
    const result = convertCurrency({ from: 'CAD', to: 'USD', amount: 0 });
    assert.deepEqual(result, {
    from: 'CAD',
    to: 'USD',
    originalAmount: 0.00,
    convertedAmount: 0.00,
    exchangeRate: 0.72
  });
});