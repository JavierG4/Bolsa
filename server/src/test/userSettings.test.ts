import { describe, it, expect, beforeAll, afterAll, beforeEach } from 'vitest';
import request from 'supertest';
import mongoose from 'mongoose';
import { app } from '../app.js';

import { UserModel } from '../models/user.js';
import { UserSettingsModel } from '../models/userSettings.js';
import { PortfolioModel } from '../models/portfolio.js';

import { MongoMemoryServer } from 'mongodb-memory-server';

let mongoServer: MongoMemoryServer;

describe('UserSettings Routes', () => {
  let settingsId: string;
  let portfolioId: string;
  let userId: string;
  let authToken: string;

  
  beforeAll(async () => {
    mongoServer = await MongoMemoryServer.create();
    const uri = mongoServer.getUri();
    await mongoose.connect(uri);
    const settings = await UserSettingsModel.create({
      currency: 'USD',
      notifications: true,
    });

    const portfolio = await PortfolioModel.create({
      assets: [],
      totalValue: 0,
      lastUpdated: { day: 17, month: 11, year: 2025 }
    });

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
    userId = testUser._id.toString();
    
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

    settingsId = settings._id.toString();
    portfolioId = portfolio._id.toString();
  }, 1000);

  afterAll(async () => {
    await UserModel.deleteMany({});
    await PortfolioModel.deleteMany({});
    await UserSettingsModel.deleteMany({});
    await mongoose.disconnect();
    await mongoServer.stop();
  }, 1000);


  // GET /users/settings/:id
  describe('GET /userSettings/:id', () => {
    it('debería devolver los user settings existentes (200)', async () => {
      const res = await request(app)
        .get(`/userSettings/${settingsId}`)
        .set('Cookie', `access_token=${authToken}`);
      expect(res.status).toBe(200);
      expect(res.body).toHaveProperty('_id');
      expect(res.body.currency).toBe('USD');
      expect(res.body.notifications).toBe(true);
    });

    it('debería devolver 404 si no existen los settings', async () => {
      const res = await request(app)
        .get('/userSettings/000000000000000000000000')
        .set('Cookie', `access_token=${authToken}`);

      expect(res.status).toBe(404);
      expect(res.text).toContain('User settings not found');
    });
  });

  // POST /userSettings
  describe('POST /userSettings', () => {
    it('debería crear nuevos user settings válidos (201)', async () => {
      const body = { currency: 'EUR', notifications: false };
      const res = await request(app)
        .post('/userSettings').send(body)
        .set('Cookie', `access_token=${authToken}`);

      expect(res.status).toBe(201);
      expect(res.body).toHaveProperty('_id');
      expect(res.body.currency).toBe('EUR');
      expect(res.body.notifications).toBe(false);

      await UserSettingsModel.findByIdAndDelete(res.body._id);
    });

    it('debería rechazar cuando falta body (400)', async () => {
      const res = await request(app)
        .post('/userSettings')
        .set('Cookie', `access_token=${authToken}`);

      expect(res.status).toBe(400);
      expect(res.body).toHaveProperty('error');
      expect(res.body.error).toContain('userSettings must be specified in body');
    });

    it('debería fallar con currency no permitido (500)', async () => {
      const res = await request(app)
        .post('/userSettings')
        .set('Cookie', `access_token=${authToken}`)
        .send({ currency: 'INVALID', notifications: true });

      expect(res.status).toBe(500);
      expect(res.body).toHaveProperty('error');
    });
  });

  // PATCH /userSettings/:id
  describe('PATCH /userSettings/:id', () => {
    it('debería actualizar parcialmente los settings (200)', async () => {

      const temp = await UserSettingsModel.create({ currency: 'GBP', notifications: true });

      const res = await request(app)
        .patch(`/userSettings/${temp._id}`)
        .set('Cookie', `access_token=${authToken}`)
        .send({ notifications: false });

      expect(res.status).toBe(200);
      expect(res.body).toHaveProperty('_id');
      expect(res.body.notifications).toBe(false);

      await UserSettingsModel.findByIdAndDelete(temp._id);
    });

    it('debería rechazar patch sin body (400)', async () => {
      const res = await request(app)
        .patch(`/userSettings/${settingsId}`)
        .set('Cookie', `access_token=${authToken}`);

      expect(res.status).toBe(400);
      expect(res.body).toHaveProperty('error');
      expect(res.body.error).toContain('New userSettings must be provided in the body');
    });

    it('debería devolver 404 al actualizar id inexistente', async () => {
      const res = await request(app)
        .patch('/userSettings/000000000000000000000000')
        .set('Cookie', `access_token=${authToken}`)
        .send({ notifications: false });

      expect(res.status).toBe(404);
      expect(res.body).toHaveProperty('error');
      expect(res.body.error).toContain('userSettings with id');
    });

    it('debería fallar con validación inválida (500)', async () => {
      const temp = await UserSettingsModel.create({ currency: 'JPY', notifications: true });
      const res = await request(app)
        .patch(`/userSettings/${temp._id}`)
        .set('Cookie', `access_token=${authToken}`)
        .send({ currency: 'NO_MONEY' });

      expect(res.status).toBe(500);
      expect(res.body).toHaveProperty('error');

      await UserSettingsModel.findByIdAndDelete(temp._id);
    });
  });

  // DELETE /userSettings/:id
  describe('DELETE /userSettings/:id', () => {
    it('debería borrar unos settings existentes (200)', async () => {
      const temp = await UserSettingsModel.create({ currency: 'BTC', notifications: true });
      const res = await request(app)
        .delete(`/userSettings/${temp._id}`)
        .set('Cookie', `access_token=${authToken}`);

      expect(res.status).toBe(200);
      expect(res.body).toHaveProperty('_id');
      expect(res.body._id).toBe(temp._id.toString());
    });

    it('debería devolver 404 al borrar id inexistente', async () => {
      const res = await request(app)
        .delete('/userSettings/000000000000000000000000')
        .set('Cookie', `access_token=${authToken}`);

      expect(res.status).toBe(404);
      expect(res.text).toContain('User settings not found');
    });
  });

  // All-catch route -> /usersSettings/{*splat} devuelve 501
  describe('Catch-all /usersSettings/{*splat}', () => {
    it('debería devolver 501 para ruta no implementada', async () => {
      const res = await request(app)
        .get('/usersSettings/some/other/path')
        .set('Cookie', `access_token=${authToken}`);
      expect(res.status).toBe(501);
    });
  });
});