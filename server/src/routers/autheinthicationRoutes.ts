import { UserModel } from "../models/user.js";
import express from 'express';
import jwt from 'jsonwebtoken'
import dotenv from 'dotenv';


export const authenticationRouter = express.Router();

dotenv.config();
const SECRET_KEY = process.env.JWT_SECRET

/**
 * @route POST /login
 * @summary User login
 * @param req.body.userName - User's username
 * @param req.body.password - User's password
 * @returns 200 - Login successful
 * @returns 400 - Bad request (missing credentials)
 * @returns 404 - User not found
 * @returns 500 - Server error
 */
authenticationRouter.post('/login', async (req, res) => {
  const { userName, password } = req.body || {};
  if (!userName || !password) {
    return res.status(400).send('UserName and password are required');
  }
  try {
    const user = await UserModel.findOne({ userName });
    if (!user) {
      return res.status(404).send('User not found');
    }
    // Possible password verification (commented out)
    // const isMatch = await user.comparePassword(password);
    // if (!isMatch) {
    //   return res.status(401).send('Invalid password');
    // }
    const token = jwt.sign({ userName: userName}, SECRET_KEY, {
      expiresIn: '1h'
    });
    const refreshToken = jwt.sign({ userName: userName}, process.env.REFRESH_TOKEN_SECRET, {
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

authenticationRouter.post('/signIn', async (req, res) => {
  if(!req.body) {
    return res.status(400).json({ error: 'User data must be provided in the request body' });
  }
  try {
    const user = new UserModel(req.body);
    const filter = req.body.userName ? { userName: req.body.userName } : {};
    const existingUser = await UserModel.find(filter);
    if (existingUser.length == 0) {
      return res.status(409).json({ error: 'User with this userName already exists' });
    } else {
      await user.save();
      return res.status(201).json({ message: 'User created successfully', user });
    }
  } catch (err) {
    return res.status(500).json({ error: err.message });
  }
});