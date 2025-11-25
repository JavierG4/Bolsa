import { describe, it, expect, beforeAll, afterAll, beforeEach } from 'vitest'
import request from 'supertest'
import { app } from '../app.js'
import { PortfolioModel } from '../models/portfolio.js'
import { UserModel } from '../models/user.js'
import { UserSettingsModel } from '../models/userSettings.js'
import mongoose from 'mongoose'
import { MongoMemoryServer } from 'mongodb-memory-server';

let mongoServer: MongoMemoryServer;

describe('Portfolio Routes', () => {
  let authToken: string
  let testUserId: string
  let portfolioId: string

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

    testUserId = user._id.toString()

    const loginRes = await request(app)
      .post('/login')
      .send({
        email: 'test@example.com',
        password: 'password123'
      })

    const cookie = loginRes.headers['set-cookie']
    authToken = cookie[0].split('=')[1].split(';')[0]
  })

  afterAll(async () => {
    await PortfolioModel.deleteMany({})
    await UserModel.deleteMany({})
    await UserSettingsModel.deleteMany({})
    await mongoose.disconnect();
    await mongoServer.stop();
  })

  beforeEach(async () => {
    // por si haces inserts de portfolios dentro de tests
  })

  // ---------------------------------------------------------
  // GET /portfolios/:id
  // ---------------------------------------------------------

  it('GET /portfolios/:id debería devolver el portfolio', async () => {
    const res = await request(app)
      .get(`/portfolios/${portfolioId}`)
      .set('Cookie', `access_token=${authToken}`)

    expect(res.status).toBe(200)
    expect(res.body).toHaveProperty('_id')
    expect(res.body.totalValue).toBe(0)
  })

  it('GET /portfolios/:id debería fallar sin token', async () => {
    const res = await request(app)
      .get(`/portfolios/${portfolioId}`)

    expect(res.status).toBe(401)
  })

  it('GET /portfolios/:id debería devolver 404 si el portfolio no existe', async () => {
    const fakeId = '000000000000000000000000'

    const res = await request(app)
      .get(`/portfolios/${fakeId}`)
      .set('Cookie', `access_token=${authToken}`)

    expect(res.status).toBe(404)
    expect(res.body.error).toContain('not found')
  })

  // ---------------------------------------------------------
  // POST /portfolios
  // ---------------------------------------------------------

  it('POST /portfolios debería crear un portfolio', async () => {
    const newPortfolio = {
      assets: [],
      totalValue: 5000,
      lastUpdated: { day: 10, month: 1, year: 2026 }
    }

    const res = await request(app)
      .post('/portfolios')
      .set('Cookie', `access_token=${authToken}`)
      .send(newPortfolio)

    expect(res.status).toBe(201)
    expect(res.body.totalValue).toBe(5000)
    expect(res.body.assets).toHaveLength(0)
  })

  it('POST /portfolios debería fallar sin body', async () => {
    const res = await request(app)
      .post('/portfolios')
      .set('Cookie', `access_token=${authToken}`)

    expect(res.status).toBe(400)
    expect(res.text).toContain('Missing body')
  })

  it('POST /portfolios debería fallar con datos inválidos', async () => {
    const invalidPortfolio = {
      assets: [],
      totalValue: "not a number",
      lastUpdated: { day: 1, month: 1, year: 2026 }
    }

    const res = await request(app)
      .post('/portfolios')
      .set('Cookie', `access_token=${authToken}`)
      .send(invalidPortfolio)

    expect(res.status).toBe(500)
    expect(res.body.error).toBeDefined()
  })

  // ---------------------------------------------------------
  // PATCH /portfolios/:id
  // ---------------------------------------------------------

  it('PATCH /portfolios/:id debería actualizar correctamente', async () => {
    const res = await request(app)
      .patch(`/portfolios/${portfolioId}`)
      .set('Cookie', `access_token=${authToken}`)
      .send({ totalValue: 9999 })

    expect(res.status).toBe(200)
    expect(res.body.totalValue).toBe(9999)
  })

  it('PATCH /portfolios/:id debería fallar sin body', async () => {
    const res = await request(app)
      .patch(`/portfolios/${portfolioId}`)
      .set('Cookie', `access_token=${authToken}`)

    expect(res.status).toBe(400)
    expect(res.body.error).toContain('Missing body')
  })

  it('PATCH /portfolios/:id debería devolver 404 si el ID es incorrecto', async () => {
    const fakeId = '000000000000000000000000'

    const res = await request(app)
      .patch(`/portfolios/${fakeId}`)
      .set('Cookie', `access_token=${authToken}`)
      .send({ totalValue: 123 })

    expect(res.status).toBe(404)
    expect(res.body.error).toContain('not found')
  })

  it('PATCH /portfolios/:id debería fallar con datos inválidos', async () => {
    const res = await request(app)
      .patch(`/portfolios/${portfolioId}`)
      .set('Cookie', `access_token=${authToken}`)
      .send({ totalValue: "invalid" })

    expect(res.status).toBe(500)
    expect(res.body.error).toBeDefined()
  })
})