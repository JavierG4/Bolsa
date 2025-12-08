import { describe, it, expect } from 'vitest';
import { getActionsData, getCriptoData, PRICE_TIME } from '../services/FMP.js';
import dotenv from 'dotenv';

dotenv.config();

describe('FMP Service', () => {
  const symbol = 'AAPL';
  const cryptoSymbol = 'BTC';

  describe('getActionsData', () => {
    it('should throw an error if fullPrice is true and intervals are not provided', async () => {
      const data = await getActionsData(true, symbol);
      expect(data).toMatchObject({
        error: expect.objectContaining({
          message: 'Interval dates are required for full price data'
        })
      });
    });

    it('should return data for full price with valid intervals', async () => {
      const fromInterval = { day: 1, month: 1, year: 2023 };
      const toInterval = { day: 1, month: 2, year: 2023 };
      const data = await getActionsData(true, symbol, fromInterval, toInterval);
      expect(data).toBeDefined();
    });

    it('should return data for non-full price', async () => {
      const data = await getActionsData(false, symbol);
      expect(data).toBeDefined();
    });
  });

  describe('getCriptoData', () => {
    it('should throw an error if fullPrice is true and priceTime is not provided', async () => {
      const data = await getCriptoData(true, cryptoSymbol);
      expect(data).toMatchObject({
        error: expect.objectContaining({
          message: 'Price time is required for full price data'
        })
      });
    });

    it('should return data for non-full price', async () => {
      const data = await getCriptoData(false, cryptoSymbol);
      expect(data).toBeDefined();
    });

    it('should return data for full price with valid price time', async () => {
      const data = await getCriptoData(true, cryptoSymbol, PRICE_TIME.DAY);
      expect(data).toBeDefined();
    });

    it('should throw an error for invalid price time', async () => {
      const data = await getCriptoData(true, cryptoSymbol, 'INVALID_TIME' as PRICE_TIME);
      expect(data).toMatchObject({
        error: expect.objectContaining({
          message: 'Invalid price time'
        })
      });
    });
  });
});