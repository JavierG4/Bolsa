import { describe, it, expect, beforeAll, afterAll, beforeEach } from 'vitest';
import request from 'supertest';
import { app } from '../app.js';
import { TransactionModel } from '../models/transactionAsset.js';
import { UserModel } from '../models/user.js';
import { PortfolioModel } from '../models/portfolio.js';
import { UserSettingsModel } from '../models/userSettings.js';
import mongoose from 'mongoose';
import { MongoMemoryServer } from 'mongodb-memory-server';

let mongoServer: MongoMemoryServer;

describe('Transaction Routes', () => {
  let authToken: string;
  let testUserId: string;
  let transactionId: string;


  beforeAll(async () => {
    mongoServer = await MongoMemoryServer.create();
    const uri = mongoServer.getUri();
    await mongoose.connect(uri);
    // Crear documentos relacionados primero
    const portfolio = await PortfolioModel.create({
      assets: [],
      totalValue: 0,
      lastUpdated: {
        day: 16,
        month: 11,
        year: 2025
      }
    });
    
    const settings = await UserSettingsModel.create({
      currency: 'USD',
      notifications: true
    });
    
    // Crear usuario de prueba
    const testUser = await UserModel.create({
      mail: 'test@example.com',
      password: 'password123',
      userName: 'testuser',
      portfolio: portfolio._id,
      settings: settings._id,
      createdAt: {
        day: 16,
        month: 11,
        year: 2025
      }
    });
    testUserId = testUser._id.toString();

    // Login para obtener token
    const loginRes = await request(app)
      .post('/login')
      .send({
        email: 'test@example.com',
        password: 'password123'
      });

    // Extraer token de la cookie
    const cookies = loginRes.headers['set-cookie'];
    if (cookies) {
      const cookieArray = Array.isArray(cookies) ? cookies : [cookies];
      const tokenCookie = cookieArray.find((cookie: string) => cookie.startsWith('access_token='));
      if (tokenCookie) {
        const parts = tokenCookie.split(';')[0].split('=');
        authToken = parts[1];
      }
    }
  }, 1000);

  afterAll(async () => {
    // Limpiar datos de prueba
    const user = await UserModel.findById(testUserId);
    if (user) {
      await PortfolioModel.findByIdAndDelete(user.portfolio);
      await UserSettingsModel.findByIdAndDelete(user.settings);
    }
    await TransactionModel.deleteMany({ userId: testUserId });
    await UserModel.findByIdAndDelete(testUserId);
    await mongoose.disconnect();
    await mongoServer.stop();
  },  10000);

  beforeEach(async () => {
    // Limpiar transacciones antes de cada test
    await TransactionModel.deleteMany({ userId: testUserId });
  });

  describe('GET /transactions', () => {
    it('debería obtener todas las transacciones del usuario sin filtros', async () => {
      // Crear transacciones de prueba
      await TransactionModel.create([
        {
          userId: testUserId,
          assetSymbol: 'AAPL',
          actionType: 'BUY',
          quantity: 10,
          price: 150.5,
          date: { day: 15, month: 11, year: 2025 }
        },
        {
          userId: testUserId,
          assetSymbol: 'TSLA',
          actionType: 'SELL',
          quantity: 5,
          price: 200.75,
          date: { day: 16, month: 11, year: 2025 }
        }
      ]);

      const res = await request(app)
        .get('/transactions')
        .set('Cookie', `access_token=${authToken}`);

      expect(res.status).toBe(200);
      expect(res.body.transaction).toHaveLength(2);
      expect(res.body.transaction[0]).toHaveProperty('assetSymbol');
      expect(res.body.transaction[0]).toHaveProperty('actionType');
    });

    it('debería filtrar por símbolo de activo', async () => {
      await TransactionModel.create([
        {
          userId: testUserId,
          assetSymbol: 'AAPL',
          actionType: 'BUY',
          quantity: 10,
          price: 150.5,
          date: { day: 15, month: 11, year: 2025 }
        },
        {
          userId: testUserId,
          assetSymbol: 'TSLA',
          actionType: 'BUY',
          quantity: 5,
          price: 200.75,
          date: { day: 16, month: 11, year: 2025 }
        }
      ]);

      const res = await request(app)
        .get('/transactions?assetSymbol=AAPL')
        .set('Cookie', `access_token=${authToken}`);

      expect(res.status).toBe(200);
      expect(res.body.transaction).toHaveLength(1);
      expect(res.body.transaction[0].assetSymbol).toBe('AAPL');
    });

    it('debería filtrar por tipo de acción (BUY)', async () => {
      await TransactionModel.create([
        {
          userId: testUserId,
          assetSymbol: 'AAPL',
          actionType: 'BUY',
          quantity: 10,
          price: 150.5,
          date: { day: 15, month: 11, year: 2025 }
        },
        {
          userId: testUserId,
          assetSymbol: 'TSLA',
          actionType: 'SELL',
          quantity: 5,
          price: 200.75,
          date: { day: 16, month: 11, year: 2025 }
        }
      ]);

      const res = await request(app)
        .get('/transactions?actionType=BUY')
        .set('Cookie', `access_token=${authToken}`);

      expect(res.status).toBe(200);
      expect(res.body.transaction).toHaveLength(1);
      expect(res.body.transaction[0].actionType).toBe('BUY');
    });

    it('debería filtrar por fecha específica', async () => {
      await TransactionModel.create([
        {
          userId: testUserId,
          assetSymbol: 'AAPL',
          actionType: 'BUY',
          quantity: 10,
          price: 150.5,
          date: { day: 15, month: 11, year: 2025 }
        },
        {
          userId: testUserId,
          assetSymbol: 'TSLA',
          actionType: 'BUY',
          quantity: 5,
          price: 200.75,
          date: { day: 16, month: 11, year: 2025 }
        }
      ]);

      const res = await request(app)
        .get('/transactions?date=15-11-2025')
        .set('Cookie', `access_token=${authToken}`);

      expect(res.status).toBe(200);
      expect(res.body.transaction).toHaveLength(1);
      expect(res.body.transaction[0].date.day).toBe(15);
    });

    it('debería aplicar múltiples filtros combinados', async () => {
      await TransactionModel.create([
        {
          userId: testUserId,
          assetSymbol: 'AAPL',
          actionType: 'BUY',
          quantity: 10,
          price: 150.5,
          date: { day: 15, month: 11, year: 2025 }
        },
        {
          userId: testUserId,
          assetSymbol: 'AAPL',
          actionType: 'SELL',
          quantity: 5,
          price: 160.0,
          date: { day: 15, month: 11, year: 2025 }
        },
        {
          userId: testUserId,
          assetSymbol: 'TSLA',
          actionType: 'BUY',
          quantity: 5,
          price: 200.75,
          date: { day: 16, month: 11, year: 2025 }
        }
      ]);

      const res = await request(app)
        .get('/transactions?assetSymbol=AAPL&actionType=BUY&date=15-11-2025')
        .set('Cookie', `access_token=${authToken}`);

      expect(res.status).toBe(200);
      expect(res.body.transaction).toHaveLength(1);
      expect(res.body.transaction[0].assetSymbol).toBe('AAPL');
      expect(res.body.transaction[0].actionType).toBe('BUY');
    });

    it('debería retornar array vacío cuando no hay transacciones', async () => {
      const res = await request(app)
        .get('/transactions?assetSymbol=NOEXISTE')
        .set('Cookie', `access_token=${authToken}`);

      expect(res.status).toBe(200);
      expect(res.body.transaction).toHaveLength(0);
    });

    it('debería rechazar parámetros inválidos', async () => {
      const res = await request(app)
        .get('/transactions?invalidParam=test')
        .set('Cookie', `access_token=${authToken}`);

      expect(res.status).toBe(400);
      expect(res.body.error).toContain('invalidParam');
    });

    it('debería rechazar fecha con formato incorrecto', async () => {
      const res = await request(app)
        .get('/transactions?date=2025-11-15')
        .set('Cookie', `access_token=${authToken}`);

      expect(res.status).toBe(400);
      expect(res.body.error).toContain('DD-MM-YYYY');
    });

    it('debería fallar sin token de autenticación', async () => {
      const res = await request(app)
        .get('/transactions');

      expect(res.status).toBe(401);
    });
  });

  describe('POST /transactions', () => {
    it('debería crear una transacción válida (BUY)', async () => {
      const newTransaction = {
        userId: testUserId,
        assetSymbol: 'AAPL',
        actionType: 'BUY',
        quantity: 10,
        price: 150.5,
        date: { day: 15, month: 11, year: 2025 }
      };

      const res = await request(app)
        .post('/transactions')
        .set('Cookie', `access_token=${authToken}`)
        .send(newTransaction);

      expect(res.status).toBe(201);
      expect(res.body).toHaveProperty('_id');
      expect(res.body.assetSymbol).toBe('AAPL');
      expect(res.body.actionType).toBe('BUY');
      expect(res.body.quantity).toBe(10);
      transactionId = res.body._id;
    });

    it('debería crear una transacción válida (SELL)', async () => {
      const newTransaction = {
        userId: testUserId,
        assetSymbol: 'TSLA',
        actionType: 'SELL',
        quantity: 5,
        price: 200.75,
        date: { day: 16, month: 11, year: 2025 }
      };

      const res = await request(app)
        .post('/transactions')
        .set('Cookie', `access_token=${authToken}`)
        .send(newTransaction);

      expect(res.status).toBe(201);
      expect(res.body.actionType).toBe('SELL');
    });

    it('debería fallar sin body', async () => {
      const res = await request(app)
        .post('/transactions')
        .set('Cookie', `access_token=${authToken}`);

      expect(res.status).toBe(400);
      expect(res.body.error).toContain('body');
    });

    it('debería fallar con usuario inexistente', async () => {
      const newTransaction = {
        userId: '000000000000000000000000',
        assetSymbol: 'AAPL',
        actionType: 'BUY',
        quantity: 10,
        price: 150.5,
        date: { day: 15, month: 11, year: 2025 }
      };

      const res = await request(app)
        .post('/transactions')
        .set('Cookie', `access_token=${authToken}`)
        .send(newTransaction);

      expect(res.status).toBe(400);
      expect(res.body.error).toContain('does not exist');
    });

    it('debería fallar con actionType inválido', async () => {
      const newTransaction = {
        userId: testUserId,
        assetSymbol: 'AAPL',
        actionType: 'HOLD',
        quantity: 10,
        price: 150.5,
        date: { day: 15, month: 11, year: 2025 }
      };

      const res = await request(app)
        .post('/transactions')
        .set('Cookie', `access_token=${authToken}`)
        .send(newTransaction);

      expect(res.status).toBe(500);
      expect(res.body.error).toContain('action type');
    });

    it('debería fallar con quantity negativa', async () => {
      const newTransaction = {
        userId: testUserId,
        assetSymbol: 'AAPL',
        actionType: 'BUY',
        quantity: -5,
        price: 150.5,
        date: { day: 15, month: 11, year: 2025 }
      };

      const res = await request(app)
        .post('/transactions')
        .set('Cookie', `access_token=${authToken}`)
        .send(newTransaction);

      expect(res.status).toBe(500);
      expect(res.body.error).toContain('Quantity');
    });

    it('debería fallar con price cero o negativo', async () => {
      const newTransaction = {
        userId: testUserId,
        assetSymbol: 'AAPL',
        actionType: 'BUY',
        quantity: 10,
        price: 0,
        date: { day: 15, month: 11, year: 2025 }
      };

      const res = await request(app)
        .post('/transactions')
        .set('Cookie', `access_token=${authToken}`)
        .send(newTransaction);

      expect(res.status).toBe(500);
      expect(res.body.error).toContain('Price');
    });

    it('debería fallar con día fuera de rango', async () => {
      const newTransaction = {
        userId: testUserId,
        assetSymbol: 'AAPL',
        actionType: 'BUY',
        quantity: 10,
        price: 150.5,
        date: { day: 32, month: 11, year: 2025 }
      };

      const res = await request(app)
        .post('/transactions')
        .set('Cookie', `access_token=${authToken}`)
        .send(newTransaction);

      expect(res.status).toBe(500);
      expect(res.body.error).toContain('Day');
    });

    it('debería fallar con mes fuera de rango', async () => {
      const newTransaction = {
        userId: testUserId,
        assetSymbol: 'AAPL',
        actionType: 'BUY',
        quantity: 10,
        price: 150.5,
        date: { day: 15, month: 13, year: 2025 }
      };

      const res = await request(app)
        .post('/transactions')
        .set('Cookie', `access_token=${authToken}`)
        .send(newTransaction);

      expect(res.status).toBe(500);
      expect(res.body.error).toContain('Month');
    });

    it('debería fallar sin assetSymbol (campo requerido)', async () => {
      const newTransaction = {
        userId: testUserId,
        actionType: 'BUY',
        quantity: 10,
        price: 150.5,
        date: { day: 15, month: 11, year: 2025 }
      };

      const res = await request(app)
        .post('/transactions')
        .set('Cookie', `access_token=${authToken}`)
        .send(newTransaction);

      expect(res.status).toBe(500);
      expect(res.body.error).toContain('assetSymbol');
    });

    it('debería fallar sin userId (campo requerido)', async () => {
      const newTransaction = {
        assetSymbol: 'AAPL',
        actionType: 'BUY',
        quantity: 10,
        price: 150.5,
        date: { day: 15, month: 11, year: 2025 }
      };

      const res = await request(app)
        .post('/transactions')
        .set('Cookie', `access_token=${authToken}`)
        .send(newTransaction);

      expect(res.status).toBe(400);
      expect(res.body.error).toContain('User');
    });

    it('debería fallar sin actionType (campo requerido)', async () => {
      const newTransaction = {
        userId: testUserId,
        assetSymbol: 'AAPL',
        quantity: 10,
        price: 150.5,
        date: { day: 15, month: 11, year: 2025 }
      };

      const res = await request(app)
        .post('/transactions')
        .set('Cookie', `access_token=${authToken}`)
        .send(newTransaction);

      expect(res.status).toBe(500);
      expect(res.body.error).toContain('actionType');
    });

    it('debería fallar sin quantity (campo requerido)', async () => {
      const newTransaction = {
        userId: testUserId,
        assetSymbol: 'AAPL',
        actionType: 'BUY',
        price: 150.5,
        date: { day: 15, month: 11, year: 2025 }
      };

      const res = await request(app)
        .post('/transactions')
        .set('Cookie', `access_token=${authToken}`)
        .send(newTransaction);

      expect(res.status).toBe(500);
      expect(res.body.error).toContain('quantity');
    });

    it('debería fallar sin price (campo requerido)', async () => {
      const newTransaction = {
        userId: testUserId,
        assetSymbol: 'AAPL',
        actionType: 'BUY',
        quantity: 10,
        date: { day: 15, month: 11, year: 2025 }
      };

      const res = await request(app)
        .post('/transactions')
        .set('Cookie', `access_token=${authToken}`)
        .send(newTransaction);

      expect(res.status).toBe(500);
      expect(res.body.error).toContain('price');
    });

    it('debería fallar sin date (campo requerido)', async () => {
      const newTransaction = {
        userId: testUserId,
        assetSymbol: 'AAPL',
        actionType: 'BUY',
        quantity: 10,
        price: 150.5
      };

      const res = await request(app)
        .post('/transactions')
        .set('Cookie', `access_token=${authToken}`)
        .send(newTransaction);

      expect(res.status).toBe(500);
      expect(res.body.error).toContain('date');
    });
  });
});