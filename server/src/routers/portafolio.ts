import { error } from "console"
import { AssetModel } from "../models/portfolioAsset.js"
import {PortfolioModel} from "../models/portfolio.js"
import express from 'express'

export const PortfolioRouter = express.Router()

PortfolioRouter.use(express.json())


/**
 * @route GET /portfolios/:id
 * @summary Get a portfolio by id
 * @param req.params.id - The id of the portfolio to retrieve
 * @returns 200 - portfolio found
 * @returns 404 - portfolio not found
 * @returns 500 - Server error
 */

PortfolioRouter.get('/portfolios/:id', async (req, res) => {
  try {
    const portfolio = await PortfolioModel
      .findById(req.params.id)
      .populate('assets') 
      .exec()

    if (!portfolio) {
      return res.status(404).json({ error: 'Portfolio not found' })
    }

    return res.status(200).json(portfolio)
  } catch (err) {
    return res.status(500).json({ error: err.message || err })
  }
})



/**
 * @route POST /portfolios
 * @summary Create a new portfolio
 * @param req.body - Payload used to populate the new instance (must conform to the PortfolioModel schema; only allowed fields will be applied)
 * @remarks This operation creates the instance in memory; call .save() to persist it to the database.
 * @throws ValidationError - May be thrown when saving if the data violates model validations
 * @returns 201 - Portfolio created (returns the created instance)
 * @returns 400 - Missing body or invalid payload
 * @returns 500 - Server error
 */
PortfolioRouter.post('/portfolios', async (req,res)=> {
  if(!req.body){
    res.status(400).send('Missing body')
  } 
  try {
    const Portfolio = new PortfolioModel(req.body)
    await Portfolio.save()
    res.status(201).send(Portfolio)
  } catch (err) {
    res.status(500).send({error:err})
  }
})
/**
 * @route PATCH /portfolios/:id
 * @summary Update a portfolio by id
 * @param req.params.id - The id of the portfolio to update
 * @param req.body - The fields to update (only allowed fields will be applied)
 * @returns 200 - portfolio updated (returns the updated portfolio, populated with assets)
 * @returns 400 - validation error or invalid update payload
 * @returns 404 - portfolio not found
 * @returns 500 - Server error
 */
PortfolioRouter.patch('/portfolios/:id', async (req, res) => {
  try {
    if (!req.body) return res.status(400).send({ error: 'Missing body' })

    const allowedUpdate: Partial<any> = {}
    if (req.body.totalValue !== undefined) allowedUpdate.totalValue = req.body.totalValue
    if (req.body.lastUpdated !== undefined) allowedUpdate.lastUpdated = req.body.lastUpdated
    if (Array.isArray(req.body.assets)) allowedUpdate.assets = req.body.assets

    const updated = await PortfolioModel.findByIdAndUpdate(
      req.params.id,
      { $set: allowedUpdate },
      { new: true, runValidators: true }
    ).populate('assets').exec()

    if (!updated) return res.status(404).send({ error: 'Portfolio not found' })
    return res.status(200).send(updated)
  } catch (err) {
    return res.status(500).send({ error: err })
  }
})