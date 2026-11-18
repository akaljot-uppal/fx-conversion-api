import assert from "node:assert/strict";
import test from "node:test";
import { convertCurrency, EXCHANGE_RATES } from "../src/currencyService.js";

test("converts every supported currency pair", async (t) => {
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
          exchangeRate
        });
      });
    }
  }
});

test("correctly rounds amounts to two decimal places", () => {
    const result = convertCurrency({ from: "CAD", to: "USD", amount: 1.236 });
    assert.deepEqual(result, {
    from: "CAD",
    to: "USD",
    originalAmount: 1.24,
    convertedAmount: 0.89,
    exchangeRate: 0.72
  });
});

test("rounds decimal half values correctly", () => {
  const result = convertCurrency({ from: "CAD", to: "CAD", amount: 1.005 });
  assert.equal(result.originalAmount, 1.01);
  assert.equal(result.convertedAmount, 1.01);
});

test("returns the exchange rate used for conversion without rounding it", () => {
  const result = convertCurrency({ from: "JPY", to: "GBP", amount: 1000 });
  assert.equal(result.exchangeRate, EXCHANGE_RATES.GBP / EXCHANGE_RATES.JPY);
  assert.equal(
    result.convertedAmount,
    Number((1000 * result.exchangeRate).toFixed(2))
  );
});

test("correctly normalizes currency codes", () => {
    const result = convertCurrency({ from: " cad ", to: "usd", amount: 100 });
    assert.deepEqual(result, {
    from: "CAD",
    to: "USD",
    originalAmount: 100.00,
    convertedAmount: 72.00,
    exchangeRate: 0.72
  });
});

test("supports conversion between the same currency", () => {
    const result = convertCurrency({ from: "USD", to: "USD", amount: 100 });
    assert.deepEqual(result, {
    from: "USD",
    to: "USD",
    originalAmount: 100.00,
    convertedAmount: 100.00,
    exchangeRate: 1.00
  });
});

test("supports zero amount conversion", () => {
    const result = convertCurrency({ from: "CAD", to: "USD", amount: 0 });
    assert.deepEqual(result, {
    from: "CAD",
    to: "USD",
    originalAmount: 0.00,
    convertedAmount: 0.00,
    exchangeRate: 0.72
  });
});

test("rejects invalid payload shapes", async (t) => {
  for (const payload of [undefined, null, [], "payload", 42]) {
    await t.test(`rejects ${String(payload)}`, () => {
      assert.throws(
        () => convertCurrency(payload),
        { statusCode: 400, message: "Invalid request payload, expected a JSON object with 'from', 'to', and 'amount' fields." }
      );
    });
  }
});

test("rejects each missing required field", async (t) => {
  for (const field of ["from", "to", "amount"]) {
    for (const missingValue of [undefined, null]) {
      await t.test(`${field} is ${String(missingValue)}`, () => {
        const payload = { from: "CAD", to: "USD", amount: 1, [field]: missingValue };
        assert.throws(
          () => convertCurrency(payload),
          { statusCode: 400, message: `Missing required field '${field}'.` }
        );
      });
    }
  }
});

test("rejects currency codes that are not non-empty strings", async (t) => {
  for (const field of ["from", "to"]) {
    for (const code of [1, false, {}, "", "  "]) {
      await t.test(`${field}=${JSON.stringify(code)}`, () => {
        const payload = { from: "CAD", to: "USD", amount: 1, [field]: code };
        const message = typeof code === "string"
          ? `Missing required field '${field}'.`
          : `Invalid field '${field}', expected a non-empty string.`;
        assert.throws(() => convertCurrency(payload), { statusCode: 400, message });
      });
    }
  }
});

test("rejects unsupported source and target currencies", async (t) => {
  for (const field of ["from", "to"]) {
    for (const code of ["INR", "MXN", "NZD"]) {
      await t.test(`${field}=${code}`, () => {
        const payload = { from: "CAD", to: "USD", amount: 1, [field]: code };
        assert.throws(
          () => convertCurrency(payload),
          {
            statusCode: 400,
            message: `Unsupported currency '${code.toUpperCase()}'. Supported currencies are: CAD, USD, EUR, GBP, AUD, JPY`
          }
        );
      });
    }
  }
});

test("rejects non-finite, non-numeric, and negative amounts", async (t) => {
  for (const amount of ["1", NaN, Infinity, -Infinity, -0.01, {}, false]) {
    await t.test(`amount=${String(amount)}`, () => {
      assert.throws(
        () => convertCurrency({ from: "CAD", to: "USD", amount }),
        { statusCode: 400, message: "Invalid amount, expected a finite, non-negative number." }
      );
    });
  }
});

test("rejects amounts where the converted value overflows", () => {
  assert.throws(
    () => convertCurrency({ from: "USD", to: "CAD", amount: Number.MAX_VALUE }),
    { statusCode: 400, message: "Amount is too large to convert." }
  );
});