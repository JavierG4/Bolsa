import { describe, it, expect, beforeAll, afterAll } from 'vitest';
import request from 'supertest';
import {app} from '../app.js';
import { PortfolioModel } from '../models/portfolio.js'
import { UserModel } from '../models/user.js'
import { UserSettingsModel } from '../models/userSettings.js'
import { AssetPriceModel } from '../models/asset.js';
import mongoose from 'mongoose'
import { MongoMemoryServer } from 'mongodb-memory-server';

let mongoServer: MongoMemoryServer;

describe('Watchlist Router', () => {
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
      mail: 'testwatchlist@example.com',
      password: 'password123',
      userName: 'testuserwatchlist',
      portfolio: portfolioId,
      settings: settings._id,
      createdAt: { day: 16, month: 11, year: 2025 }
    })

    userId = user._id.toString()

    const loginRes = await request(app)
      .post('/login')
      .send({
        email: 'testwatchlist@example.com',
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
  }, 2000)
  
  afterAll(async () => {
    await PortfolioModel.deleteMany({})
    await UserModel.deleteMany({})
    await UserSettingsModel.deleteMany({})
    await AssetPriceModel.deleteMany({})
    await mongoose.disconnect();
    await mongoServer.stop();
  })


  it('should create a new watchlist item', async () => {
    const response = await request(app)
      .post('/addSymbol')
      .set('Cookie', `access_token=${authToken}`)
      .send({ symbol: 'AAPL' });

    expect(response.status).toBe(200);
    expect(response.body).toHaveProperty('symbolAddedd', true);
  });

  it('shoud not add a symbol that does not exist', async () => {
    const response = await request(app)
      .post('/addSymbol')
      .set('Cookie', `access_token=${authToken}`)
      .send({ symbol: 'XXXX' });

    expect(response.status).toBe(404);
    expect(response.body).toHaveProperty('error');
  });

  it('should get watchlist items', async () => {
    const response = await request(app)
      .get('/myWatchlist')
      .set('Cookie', `access_token=${authToken}`);

    expect(response.status).toBe(200);
    expect(response.body).toHaveProperty('symbolValues');
    expect(Array.isArray(response.body.symbolValues)).toBe(true);
  });
  
  it('should get watchlist count', async () => {
    const response = await request(app)
      .get('/count')
      .set('Cookie', `access_token=${authToken}`);

    expect(response.status).toBe(200);
    expect(response.body).toHaveProperty('count');
    expect(typeof response.body.count).toBe('number');
  });

  it('should remove a watchlist item', async () => {
    const response = await request(app)
      .post('/removeSymbol')
      .set('Cookie', `access_token=${authToken}`)
      .send({ symbol: 'AAPL' });

    expect(response.status).toBe(200);
    expect(response.body).toHaveProperty('symbolRemoved', true);
  });

  it('should not remove a symbol that is not in watchlist', async () => {
    const response = await request(app)
      .post('/removeSymbol')
      .set('Cookie', `access_token=${authToken}`)
      .send({ symbol: 'AAPL' });

    expect(response.status).toBe(200);
    expect(response.body).toHaveProperty('symbolRemoved', false);
  });

});