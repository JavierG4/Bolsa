import { describe, it, expect, beforeAll, afterAll } from 'vitest'
import request from 'supertest';
import { app } from '../app.js';
import { UserModel } from '../models/user.js';
import { UserSettingsModel } from '../models/userSettings.js';
import { PortfolioModel } from '../models/portfolio.js';
import mongoose from 'mongoose';
import { MongoMemoryServer } from 'mongodb-memory-server';
import { AssetPriceModel } from '../models/asset.js';

let mongoServer: MongoMemoryServer;

describe('Auxiliar Router', () => {
  let userId: string;
  let authToken: string;
  let portfolioId: string;

  beforeAll(async () => {
    mongoServer = await MongoMemoryServer.create();
    const uri = mongoServer.getUri();
    await mongoose.connect(uri);

    const settings = await UserSettingsModel.create({
      currency: 'USD',
      notifications: true
    })

    const portfolio = await PortfolioModel.create({
      assets: [],
      totalValue: 0,
      lastUpdated: { day: 16, month: 11, year: 2025 }
    })

    portfolioId = portfolio._id.toString()

    const user = await UserModel.create({
      mail: 'test@example.com',
      password: 'password123',
      userName: 'testuser',
      portfolio: portfolioId,
      settings: settings._id,
      createdAt: { day: 16, month: 11, year: 2025 }
    })

    userId = user._id.toString()

    const loginRes = await request(app)
      .post('/login')
      .send({
        email: 'test@example.com',
        password: 'password123'
      })

    const cookie = loginRes.headers['set-cookie']
    authToken = cookie[0].split('=')[1].split(';')[0]

    const asset = await AssetPriceModel.create({
      name: "Apple Inc.",
      symbol: "AAPL",
      type: "stock",
      price: 277.55,
      timestamp: Date.now()
    })
    await asset.save();
  }, 20000)

  afterAll(async () => {
    await PortfolioModel.deleteMany({})
    await UserModel.deleteMany({})
    await UserSettingsModel.deleteMany({})
    await AssetPriceModel.deleteMany({})
    await mongoose.disconnect();
    await mongoServer.stop();
  })

  describe('GET /me/patrimonio', () => {
    it('should return total user portfolio value', async () => {
      const response = await request(app)
        .get('/me/patrimonio')
        .set('Cookie', `access_token=${authToken}`);

      expect(response.status).toBe(200);
      expect(response.body).toHaveProperty('patrimonio');
    });

    it('should return 401 if user not found', async () => {
      const response = await request(app)
        .get('/me/patrimonio')
        .set('Cookie', `access_token=invalidUserId`);

      expect(response.status).toBe(401);
    });
  });

  describe('GET /me/assets', () => {
    it('should return user assets', async () => {
      const response = await request(app)
        .get('/me/assets')
        .set('Cookie', `access_token=${authToken}`);

      expect(response.status).toBe(200);
      expect(response.body).toHaveProperty('assets');
    });

    it('should return 401 if portfolio not found', async () => {
      const response = await request(app)
        .get('/me/assets')
        .set('Cookie', `access_token=invalidUserId`);

      expect(response.status).toBe(401);
    });
  });

  describe('POST /me/add', () => {
    it('should add an asset to the user portfolio', async () => {
      const asset = {
        symbol: 'AAPL',
        avgBuyPrice: 150,
        quantity: 10,
        type: 'stock',
      }
      const response = await request(app)
        .post('/me/add')
        .set('Cookie', `access_token=${authToken}`)
        .send({
          symbol: asset.symbol,
          avgBuyPrice: asset.avgBuyPrice,
          quantity: asset.quantity,
          type: asset.type
        });
        console.log(response.body);
      expect(response.body).toHaveProperty('success', true);
    });
  });

  describe('POST /me/sell', () => {
    it('should sell an asset from the user portfolio', async () => {
      const asset = {
        symbol: 'AAPL',
        avgBuyPrice: 150,
        quantity: 5,
        type: 'stock',
      }
      const response = await request(app)
        .post('/me/sell')
        .set('Cookie', `access_token=${authToken}`)
        .send({
          symbol: asset.symbol,
          avgBuyPrice: asset.avgBuyPrice,
          quantity: asset.quantity,
          type: asset.type
        });
      console.log(response.body);
      expect(response.body).toHaveProperty('success', true);
      expect(response.body.message).toContain('Asset vendido correctamente');
    });
  });

  describe('GET /me/recently-added', () => {
    it('should return recently added assets', async () => {
      const response = await request(app)
        .get('/me/recently-added')
        .set('Cookie', `access_token=${authToken}`);

      expect(response.status).toBe(200);
      expect(response.body).toHaveProperty('assets');
    });
  });

  describe('GET /all-data/top-assets', () => {
    it('should return top assets', async () => {
      const response = await request(app)
        .get('/all-data/top-assets')
        .set('Cookie', `access_token=${authToken}`);

      expect(response.status).toBe(200);
      expect(response.body).toHaveProperty('stocks');
    });
  });

  describe('GET /all-data/top-crypto', () => {
    it('should return top cryptocurrencies', async () => {
      const response = await request(app)
        .get('/all-data/top-crypto')
        .set('Cookie', `access_token=${authToken}`);

      expect(response.status).toBe(200);
      expect(response.body).toHaveProperty('cryptos');
    });
  });
});