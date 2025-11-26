import express from 'express';
import { PortfolioRouter } from './routers/portafolio.js';
import { AssetRouter } from './routers/assets.js';
import { transactionRouter } from './routers/transactions.js';
import { usersRouter } from './routers/users.js';
import { userSettingsRouter } from './routers/userSettings.js';
import cookieParser from 'cookie-parser';
import { authenticationRouter } from './routers/autheinthicationRoutes.js';
import { authMiddleware } from './middlewares/authToken.js';
import { auxiliar } from './routers/auxiliar.js';
import routerprices from './routers/actualizarassets.js';
import {watchlistRouter} from './routers/watchlist.js';

export const app = express();
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());
app.use(routerprices)
app.use(authenticationRouter); 
app.use(authMiddleware);
app.use(AssetRouter);
app.use(PortfolioRouter);
app.use(transactionRouter)
app.use(usersRouter)
app.use(userSettingsRouter)
app.use(auxiliar)
app.use(watchlistRouter)
