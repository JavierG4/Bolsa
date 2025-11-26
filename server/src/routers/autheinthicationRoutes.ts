import { UserModel } from "../models/user.js";
import express from 'express';
import jwt from 'jsonwebtoken'
import dotenv from 'dotenv';
import { UserSettingsModel } from "../models/userSettings.js";
import { PortfolioModel } from "../models/portfolio.js";



export const authenticationRouter = express.Router();

dotenv.config();
const SECRET_KEY = process.env.JWT_SECRET

/**
 * @route POST /login
 * @summary User login
 * @param req.body.email - User's email
 * @param req.body.password - User's password
 * @returns 200 - Login successful
 * @returns 400 - Bad request (missing credentials)
 * @returns 404 - User not found
 * @returns 500 - Server error
 */
authenticationRouter.post('/login', async (req, res) => {
  const { email, password } = req.body || {};
  if (!email || !password) {
    return res.status(400).send('Email and password are required');
  }
  try {
    const user = await UserModel.findOne({ mail: email });
    if (!user) {
      return res.status(404).send('User not found');
    }
    // Possible password verification (commented out)
    // const isMatch = await user.comparePassword(password);
    // if (!isMatch) {
    //   return res.status(401).send('Invalid password');
    // }
    const token = jwt.sign({ 
      userId: user._id.toString(),
      userMail: email
    }, SECRET_KEY, {
      expiresIn: '1h'
    });
    const refreshToken = jwt.sign({ 
      userId: user._id.toString(),
      userMail: email
    }, process.env.REFRESH_TOKEN_SECRET, {
      expiresIn: '7d'
    });
    return res.cookie('access_token', token, {
      httpOnly: true,
      maxAge: 3600000, // 1 hour
    }).cookie('refresh_token', refreshToken, {
      httpOnly: true, 
      maxAge: 7 * 24 * 60 * 60 * 1000
    }).status(200).json({
      id: user._id,
      userName: user.userName,
      email: user.mail
    })
  } catch (err) {
    return res.status(500).send({error: err.message});
  }
});

authenticationRouter.post('/users', async (req, res) => {
  if (!req.body) {
    return res.status(400).json({ error: 'User data must be provided in the request body' });
  }

  try {
    const { userName, mail, password } = req.body;

    // Verificar campos mínimos
    if (!userName || !mail || !password) {
      return res.status(400).json({ error: 'userName, mail and password are required' });
    }

    // Comprobar si ya existe el usuario
    const existingUser = await UserModel.findOne({ userName });
    if (existingUser) {
      return res.status(409).json({ error: 'User with this userName already exists' });
    }

    // Crear settings por defecto
    const defaultSettings = new UserSettingsModel({
      currency: 'EUR',
      notifications: true,
    });
    await defaultSettings.save();

    // Crear portfolio por defecto
    const defaultPortfolio = new PortfolioModel({
      assets: [],
      totalValue: 0,
      lastUpdated: {
        day: new Date().getDate(),
        month: new Date().getMonth() + 1,
        year: new Date().getFullYear(),
      },
    });
    await defaultPortfolio.save();

    // Crear watchlist vacia por defecto
    const watchlistSymbols: string[] = [];

    // Crear el usuario con los IDs generados
    const newUser = new UserModel({
      userName,
      mail,
      password,
      portfolio: defaultPortfolio._id,
      settings: defaultSettings._id,
      createdAt: {
        day: new Date().getDate(),
        month: new Date().getMonth() + 1,
        year: new Date().getFullYear(),
      },
      watchlistSymbols
    });

    await newUser.save();
    return res.status(201).json({
      message: 'User created successfully',
      user: newUser,
    });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ error: err.message });
  }
});