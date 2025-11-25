import { describe, it, expect, beforeAll, afterAll, beforeEach } from 'vitest'
import request from 'supertest'
import { app } from '../app.js'
import { AssetModel } from '../models/portfolioAsset.js'
import { UserModel } from '../models/user.js'
import { UserSettingsModel } from '../models/userSettings.js'
import { PortfolioModel } from '../models/portfolio.js'
import mongoose from 'mongoose'
//import '../db/mongoose.js'   // Conexión a Mongo REAL
import { MongoMemoryServer } from 'mongodb-memory-server';

let mongoServer: MongoMemoryServer;

describe('Asset Routes', () => {
  let authToken: string
  let testUserId: string
  let assetId: string

  beforeAll(async () => {
    mongoServer = await MongoMemoryServer.create();
    const uri = mongoServer.getUri();
    await mongoose.connect(uri);

    // Crear settings
    const settings = await UserSettingsModel.create({
      currency: 'USD',
      notifications: true
    })

    // Crear portfolio
    const portfolio = await PortfolioModel.create({
      assets: [],
      totalValue: 0,
      lastUpdated: { day: 16, month: 11, year: 2025 }
    })

    // Crear usuario
    const user = await UserModel.create({
      mail: 'asset@test.com',
      password: 'password123',
      userName: 'assetTester',
      portfolio: portfolio._id,
      settings: settings._id,
      createdAt: { day: 16, month: 11, year: 2025 }
    })

    testUserId = user._id.toString()

    // Login para obtener token
    const loginRes = await request(app).post('/login').send({
      email: 'asset@test.com',
      password: 'password123'
    })

    const cookie = loginRes.headers['set-cookie']
    authToken = cookie[0].split('=')[1].split(';')[0]
  })

  afterAll(async () => {
    await UserModel.deleteMany({})
    await AssetModel.deleteMany({})
    await PortfolioModel.deleteMany({})
    await UserSettingsModel.deleteMany({})
    await mongoose.disconnect();
    await mongoServer.stop();
  })

  beforeEach(async () => {
    await AssetModel.deleteMany({})
  })

  // ---------------------------------------------------------------
  // GET /assets/:id
  // ---------------------------------------------------------------
  it('GET /assets/:id debería devolver un asset', async () => {
    const newAsset = await AssetModel.create({
      symbol: 'AAPL',
      name: 'Apple',
      type: 'stock',
      quantity: 10,
      avgBuyPrice: 150
    })

    assetId = newAsset._id.toString()

    const res = await request(app)
      .get(`/assets/${assetId}`)
      .set('Cookie', `access_token=${authToken}`)

    expect(res.status).toBe(200)
    expect(res.body.symbol).toBe('AAPL')
  })

  it('GET /assets/:id debería fallar sin token', async () => {
    const newAsset = await AssetModel.create({
      symbol: 'TSLA',
      name: 'Tesla',
      type: 'stock',
      quantity: 5,
      avgBuyPrice: 200
    })

    const res = await request(app)
      .get(`/assets/${newAsset._id}`)

    expect(res.status).toBe(401)
  })

  it('GET /assets/:id debería devolver 404 si no existe', async () => {
    const res = await request(app)
      .get('/assets/000000000000000000000000')
      .set('Cookie', `access_token=${authToken}`)

    expect(res.status).toBe(404)
    expect(res.body.error).toContain('not found')
  })

  // ---------------------------------------------------------------
  // POST /assets
  // ---------------------------------------------------------------
  it('POST /assets debería crear un asset válido', async () => {
    const res = await request(app)
      .post('/assets')
      .set('Cookie', `access_token=${authToken}`)
      .send({
        symbol: 'ETH',
        name: 'Ethereum',
        type: 'crypto',
        quantity: 50,
        avgBuyPrice: 2000
      })

    expect(res.status).toBe(201)
    expect(res.body.symbol).toBe('ETH')
  })

  it('POST /assets debería fallar sin body', async () => {
    const res = await request(app)
      .post('/assets')
      .set('Cookie', `access_token=${authToken}`)

    expect(res.status).toBe(400)
    expect(res.body.error).toContain('Missing body')
  })

  it('POST /assets debería fallar con type inválido', async () => {
    const res = await request(app)
      .post('/assets')
      .set('Cookie', `access_token=${authToken}`)
      .send({
        symbol: 'BAD',
        name: 'Invalid',
        type: 'INVALID_TYPE',
        quantity: 1,
        avgBuyPrice: 100
      })

    expect(res.status).toBe(500)
    expect(res.body.error).toContain('enum')
  })

  // ---------------------------------------------------------------
  // PATCH /assets/:id
  // ---------------------------------------------------------------
  it('PATCH /assets/:id debería actualizar un asset', async () => {
    const asset = await AssetModel.create({
      symbol: 'MSFT',
      name: 'Microsoft',
      type: 'stock',
      quantity: 20,
      avgBuyPrice: 250
    })

    const res = await request(app)
      .patch(`/assets/${asset._id}`)
      .set('Cookie', `access_token=${authToken}`)
      .send({ quantity: 99 })

    expect(res.status).toBe(200)
    expect(res.body.quantity).toBe(99)
  })

  it('PATCH /assets/:id debería fallar sin body', async () => {
    const asset = await AssetModel.create({
      symbol: 'NFLX',
      name: 'Netflix',
      type: 'stock',
      quantity: 3,
      avgBuyPrice: 300
    })

    const res = await request(app)
      .patch(`/assets/${asset._id}`)
      .set('Cookie', `access_token=${authToken}`)

    expect(res.status).toBe(400)
    expect(res.body.error).toContain('Missing body')
  })

  it('PATCH /assets/:id debería devolver 404 si no existe', async () => {
    const res = await request(app)
      .patch('/assets/000000000000000000000000')
      .set('Cookie', `access_token=${authToken}`)
      .send({ quantity: 10 })

    expect(res.status).toBe(404)
  })

  it('PATCH /assets/:id debería fallar con datos inválidos', async () => {
    const asset = await AssetModel.create({
      symbol: 'GOOG',
      name: 'Google',
      type: 'stock',
      quantity: 8,
      avgBuyPrice: 1000
    })

    const res = await request(app)
      .patch(`/assets/${asset._id}`)
      .set('Cookie', `access_token=${authToken}`)
      .send({ quantity: "INVALID" })

    expect(res.status).toBe(500)
  })

  // ---------------------------------------------------------------
  // DELETE /assets/:id
  // ---------------------------------------------------------------
  it('DELETE /assets/:id debería borrar un asset', async () => {
    const asset = await AssetModel.create({
      symbol: 'BNB',
      name: 'Binance',
      type: 'crypto',
      quantity: 2,
      avgBuyPrice: 300
    })

    const res = await request(app)
      .delete(`/assets/${asset._id}`)
      .set('Cookie', `access_token=${authToken}`)

    expect(res.status).toBe(200)
    expect(res.body.message).toBe('Asset deleted successfully')
  })

  it('DELETE /assets/:id debería devolver 404 si no existe', async () => {
    const res = await request(app)
      .delete('/assets/000000000000000000000000')
      .set('Cookie', `access_token=${authToken}`)

    expect(res.status).toBe(404)
  })
})