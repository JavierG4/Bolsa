import { UserModel } from "../models/user.js";
import express from 'express';
import jwt from 'jsonwebtoken'
import dotenv from 'dotenv';


dotenv.config();
const SECRET_KEY = process.env.JWT_SECRET
const REFRESH_SECRET = process.env.REFRESH_TOKEN_SECRET;

export const usersRouter = express.Router();

/**
 * @route POST /users
 * @summary Create a new user
 * @param req.body - User data
 * @returns 201 - User created successfully
 * @returns 400 - Bad request (missing user data)
 * @returns 409 - Conflict (user with the same userName already exists)
 * @returns 500 - Server error
 */
// usersRouter.post('/users', async (req, res) => {
//   if(!req.body) {
//     res.status(400).send('User data must be provided in the request body');
//     return;
//   }
//   try {
//     const user = new UserModel(req.body);
//     const filter = req.body.userName ? { userName: req.body.userName } : {};
//     const existingUser = await UserModel.find(filter);
//     if (existingUser.length !== 0) {
//       res.status(409).send('User with this userName already exists');
//     } else {
//       await user.save();
//       res.status(201).send(user);
//     }
//   } catch (err) {
//     res.status(500).send({error: err.message});
//   }
// });

usersRouter.post('/logout', (req, res) => {
  return res.clearCookie('access_token').
  clearCookie('refresh_token').
  status(200).send('Logged out successfully');
})

/**
 * @route GET /users
 * @summary Get the authenticated user's profile
 * @returns 200 - User profile found
 * @returns 404 - User not found
 * @returns 500 - Server error
 */
usersRouter.get('/users', async (req, res) => {
  try {
    const userId: string = (req as any).user.userId;
    const user = await UserModel.findById(userId);
    if (!user) {
      res.status(404).send();
    } else {
      res.status(200).send(user);
    }
  } catch (err) {
    res.status(500).send({error: err.message});
  }
});

// /**
//  * @route GET /users/:id
//  * @summary Get a user by ID
//  * @param req.params.id - User ID
//  * @returns 200 - User found
//  * @returns 404 - User not found
//  * @returns 500 - Server error
//  */
// usersRouter.get('/users/:id', async (req, res) => {
//   try {
//     const user = await UserModel.findById(req.params.id);
//     if (!user) {
//       res.status(404).send();
//     }
//     else {
//       res.status(200).send(user);
//     }
//   } catch (err) {
//     res.status(500).send({error: err.message});
//   }
// });

/**
 * @route PUT /users/:id
 * @summary Update a user by ID
 * @param req.params.id - User ID
 * @param req.body - Updated user data
 * @returns 200 - User updated successfully
 * @returns 400 - Bad request (missing user data)
 * @returns 404 - User not found
 * @returns 500 - Server error
 */
usersRouter.put('/users/:id', async (req, res) => {
  if (!req.body) {
    res.status(400).send('User data must be provided in the request body');
    return;
  }
  try {
    const user = await UserModel.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true,
    });
    if (!user) {
      res.status(404).send();
    } else {
      res.status(200).send(user);
    }
  } catch (err) {
    res.status(500).send({error: err.message});
  }
});

/**
 * @route DELETE /users/:id
 * @summary Delete user by ID
 * @param req.params.id - User ID
 * @returns 200 - User deleted
 * @returns 404 - User not found
 * @returns 500 - Server error
 */
usersRouter.delete('/users/:id', async (req, res) => {
  try {
    const user = await UserModel.findByIdAndDelete(req.params.id);
    if (!user) {
      res.status(404).send();
    } else {
      res.status(200).send(user);
    }
  } catch (err) {
    res.status(500).send({error: err.message});
  }
});

usersRouter.post('/refresh-token', (req, res) => {
  const token = req.cookies.refresh_token;
  if (!token) return res.status(401).send("No refresh token");
  try {
    const decoded = jwt.verify(token, REFRESH_SECRET);
    const newAccessToken = jwt.sign({ userId: decoded.userId }, SECRET_KEY, { expiresIn: '15m' });
    return res.cookie('access_token', newAccessToken, { httpOnly: true, maxAge: 3600000 }) //1 hour
      .status(200).send("Access token refreshed");
  } catch (err) {
    return res.status(401).send("Invalid refresh token");
  }
})

/**
 * @route ALL /users/{*splat}
 * @summary Catch-all for undefined user routes
 * @returns 501 - Not implemented
 */
usersRouter.all('/users/{*splat}', (_, res) => {
  res.status(501).send()
})