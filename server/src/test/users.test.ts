import { describe, it, expect, beforeAll, afterAll, beforeEach } from 'vitest';
import request from 'supertest';
import mongoose from 'mongoose';
import { app } from '../app.js';

import { UserModel } from '../models/user.js';
import { UserSettingsModel } from '../models/userSettings.js';
import { PortfolioModel } from '../models/portfolio.js';

import { MongoMemoryServer } from 'mongodb-memory-server';

let mongoServer: MongoMemoryServer;

describe('User Routes', () => {
  let authToken: string;
  let settingsId: string;
  let portfolioId: string;
  let userId: string;

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

    settingsId = settings._id.toString();
    portfolioId = portfolio._id.toString();
  }, 1000);

  afterAll(async () => {
    await UserModel.deleteMany({});
    await UserSettingsModel.deleteMany({});
    await PortfolioModel.deleteMany({});
    await mongoose.connection.close();
    await mongoServer.stop();
  }, 1000);

  // POST /users
  describe('POST /users', () => {
    it('debería crear un usuario válido', async () => {
      const newUser = {
        userName: 'juan',
        mail: 'juan@example.com',
        password: 'pass123',
        portfolio: portfolioId,
        settings: settingsId,
        createdAt: { day: 10, month: 11, year: 2024 }
      };

      const res = await request(app)
        .post('/users')
        .send(newUser);

      expect(res.status).toBe(201);
      expect(res.body.user).toHaveProperty('_id');
      expect(res.body.user.mail).toBe('juan@example.com');
      userId = res.body.user._id;
      // Login para obtener token
      const loginRes = await request(app)
        .post('/login')
        .send({
          email: 'juan@example.com',
          password: 'pass123'
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
    });

    it('debería fallar con email inválido', async () => {
      const res = await request(app)
        .post('/users')
        .send({
          userName: 'badEmail',
          mail: 'invalid-email',
          password: 'pass123',
          portfolio: portfolioId,
          settings: settingsId,
          createdAt: { day: 10, month: 11, year: 2024 }
        });

      expect(res.status).toBe(500);
      expect(res.body.error).toContain('Invalid email');
    });

    it('debería fallar si existe un usuario con el mismo userName', async () => {
      const res = await request(app)
        .post('/users')
        .send({
          userName: 'juan',
          mail: 'test@mail.com',
          password: 'pass123',
          portfolio: portfolioId,
          settings: settingsId,
          createdAt: { day: 10, month: 11, year: 2024 }
        });

      expect(res.status).toBe(409);
      expect(res.body.error).toContain('userName');
    });

    it('debería fallar si el mail está repetido', async () => {
      await UserModel.create({
        userName: 'user1',
        mail: 'repeat@mail.com',
        password: 'pass123',
        portfolio: portfolioId,
        settings: settingsId,
        createdAt: { day: 10, month: 11, year: 2024 }
      });

      const res = await request(app)
        .post('/users')
        .send({
          userName: 'user2',
          mail: 'repeat@mail.com',
          password: 'pass123',
          portfolio: portfolioId,
          settings: settingsId,
          createdAt: { day: 10, month: 11, year: 2024 }
        });

      expect(res.status).toBe(500);
      expect(res.body.error).toContain('duplicate');
    });
  });

  // GET /users/
  describe('GET /users', () => {
    it('debería obtener un usuario existente', async () => {

      const res = await request(app)
        .get(`/users`)
        .set('Cookie', `access_token=${authToken}`);
        

      expect(res.status).toBe(200);
      expect(res.body.userName).toBe('juan');
    });

    it('debería devolver 401 si no se autentica', async () => {
      const res = await request(app)
        .get('/users');
      expect(res.status).toBe(401);
    });
  });

  // PUT /users/:id
  describe('PUT /users/:id', () => {
    it('debería actualizar el mail del usuario', async () => {

      const res = await request(app)
        .put(`/users/${userId}`)
        .set('Cookie', `access_token=${authToken}`)
        .send({ mail: 'new@mail.com' });

      expect(res.status).toBe(200);
      expect(res.body.mail).toBe('new@mail.com');
    });

    it('debería fallar si email nuevo no es válido', async () => {
      const res = await request(app)
        .put(`/users/${userId}`)
        .set('Cookie', `access_token=${authToken}`)
        .send({ mail: 'invalid-mail' });

      expect(res.status).toBe(500);
      expect(res.body.error).toContain('Invalid email');
    });
  });

  // DELETE /users/:id
  describe('DELETE /users/:id', () => {
    it('debería borrar un usuario existente', async () => {
      const res = await request(app)
      .delete(`/users/${userId}`)
      .set('Cookie', `access_token=${authToken}`);

      expect(res.status).toBe(200);
    });

    it('debería devolver 404 si no existe', async () => {
      const res = await request(app)
      .delete('/users/000000000000000000000000')
      .set('Cookie', `access_token=${authToken}`);
      expect(res.status).toBe(404);
    });
  });

});