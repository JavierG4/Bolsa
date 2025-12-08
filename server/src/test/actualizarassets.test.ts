import { describe, it, expect, beforeAll, afterAll, vi } from 'vitest'
import request from 'supertest';
import { app } from '../app.js';
import { AssetPriceModel } from '../models/asset.js';
import mongoose from 'mongoose';
import { MongoMemoryServer } from 'mongodb-memory-server';
import * as FMP from '../services/FMP.js';

let mongoServer: MongoMemoryServer;

describe('Actualizar Assets Router', () => {
  beforeAll(async () => {
    mongoServer = await MongoMemoryServer.create();
    const uri = mongoServer.getUri();
    await mongoose.connect(uri);
  }, 10000)

  afterAll(async () => {
    await AssetPriceModel.deleteMany({})
    await mongoose.disconnect();
    await mongoServer.stop();
  })

  describe('POST /prices', () => {
    it('should update daily asset prices for stocks and cryptos', async () => {
      vi.spyOn(FMP, 'getActionsData').mockResolvedValue([{
        name: 'Apple Inc.',
        price: 277.55,
        symbol: 'AAPL'
      }]);
      
      vi.spyOn(FMP, 'getCriptoData').mockResolvedValue({
        price: '45000.50',
        symbol: 'BTC'
      });

      const response = await request(app)
        .post('/prices');

      expect(response.status).toBe(200);
      expect(response.body).toHaveProperty('message', 'Daily prices updated');
      expect(response.body).toHaveProperty('results');
      expect(Array.isArray(response.body.results)).toBe(true);
    });

    it('should handle errors gracefully', async () => {
      vi.spyOn(FMP, 'getActionsData').mockRejectedValue(new Error('API Error'));
      vi.spyOn(FMP, 'getCriptoData').mockRejectedValue(new Error('API Error'));

      const response = await request(app)
        .post('/prices');

      expect(response.status).toBe(500);
      expect(response.body).toHaveProperty('error');
    });

    it('should save assets to database with correct structure', async () => {
      vi.spyOn(FMP, 'getActionsData').mockResolvedValue([{
        name: 'Tesla Inc.',
        price: 250.00,
        symbol: 'TSLA'
      }]);
      
      vi.spyOn(FMP, 'getCriptoData').mockResolvedValue({
        price: '50000.00',
        symbol: 'ETH'
      });

      await request(app).post('/prices');

      const asset = await AssetPriceModel.findOne({ symbol: 'TSLA' });
      expect(asset).toBeDefined();
      expect(asset?.type).toBe('stock');
      expect(asset?.price).toBe(250.00);
    });
  });
});