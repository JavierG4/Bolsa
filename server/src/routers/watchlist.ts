import express from 'express';
import {UserModel} from '../models/user.js';
import {AssetPriceModel} from '../models/asset.js';


export const watchlistRouter = express.Router()
  
// get user watchlist
watchlistRouter.get('/myWatchlist', async (req, res) => {
  try {
    //Obtain userId from token
    const userId = (req as any).user.userId
    //Search user in DB
    const user = await UserModel.findById(userId);
    if (!user) {
      return res.status(404).send({error: 'User not found'})
    }
    const watchlistSymbols = user.watchlistSymbols;
    if (watchlistSymbols.length === 0) {
      return res.status(200).send({symbolValues: []})
    }
    else {
      // Obtain symbols information from db
      let symbolValues = []
      for (const symbol of watchlistSymbols) {
        // Search symbol value in DB
        const asset = await AssetPriceModel.findOne({symbol: symbol})
        if (!asset) {
          res.status(404).send({error: `Symbol ${symbol} not found`})
        }
        else {
          symbolValues.push({
            name: asset.name,
            symbol: asset.symbol,
            type: asset.type,
            price: asset.price
          })
        }
      }
      return res.status(200).send({symbolValues: symbolValues})
    }
  }
  catch(err) {
    return res.status(500).send({error: err.message})
  }
})

watchlistRouter.get('/count', async (req, res) => {
  try {
    //Obtain userId from token
    const userId = (req as any).user.userId
    //Search user in DB
    const user = await UserModel.findById(userId);
    if (!user) {
      return res.status(404).send({error: 'User not found'})
    }
    const watchlistSymbols = user.watchlistSymbols;
    return res.status(200).send({count: watchlistSymbols.length})
  }
  catch(err) {
    return res.status(500).send({error: err.message})
  }
});

// Add symbol to user watchlist
watchlistRouter.post('/addSymbol', async (req, res) => {
  try {
    const userId = (req as any).user.userId
    if (!req.body || !req.body.symbol) {
      return res.status(400).send({error: 'Symbol is required'})
    }
    const symbolToAdd = req.body.symbol
    //Check if user exists
    const user = await UserModel.findById(userId);
    if (!user) {
      return res.status(404).send({error: 'User not found'})
    }
    //Check if symbol is already in watchlist
    if (user.watchlistSymbols.includes(symbolToAdd)) {
      return res.status(200).send({symbolAddedd: false})
    }
    //Check if symbol exists in AssetPriceModel
    const asset = await AssetPriceModel.findOne({symbol: symbolToAdd})
    if (!asset) {
      return res.status(404).send({error: 'Symbol not found'})
    }
    //Add symbol to watchlist
    const watch = user.watchlistSymbols
    watch.push(symbolToAdd)
    //Update user watchlist
    const _ = await UserModel.findByIdAndUpdate(userId, {watchlistSymbols: watch})
    return res.status(200).send({symbolAddedd: true})
  }
  catch(err) {
    return res.status(400).send({error: err.message})
  }
})

// Remove symbol from user watchlist
watchlistRouter.post('/removeSymbol', async(req, res) => {
  try {
    //Obtain userId from token
    const userId = (req as any).user.userId
    if (!req.body || !req.body.symbol) {
      return res.status(400).send({error: 'Symbol is required'})
    }
    const symbolToRemove = req.body.symbol
    //Check if user exists
    const user = await UserModel.findById(userId);
    if (!user) {
      return res.status(404).send({error: 'User not found'})
    }
    //Check if list is not empty
    let watchlist = user.watchlistSymbols
    if (watchlist.length === 0) {
      return res.status(200).send({symbolRemoved: false})
    }
    //Check if symbol is in watchlist
    if (!watchlist.includes(symbolToRemove)) {
      return res.status(200).send({symbolRemoved: false})
    }
    //Remove symbol from watchlist
    watchlist = watchlist.filter((symbol) => symbol !== symbolToRemove)
    //Update user watchlist
    await UserModel.findByIdAndUpdate(userId, {watchlistSymbols: watchlist})
    return res.status(200).send({symbolRemoved: true})
  }
  catch(err) {
    return res.status(500).send({error: err.message})
  }
})