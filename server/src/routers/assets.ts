import express from 'express'
import { AssetModel } from '../models/portfolioAsset.js'

export const AssetRouter = express.Router()
AssetRouter.use(express.json())

/**
 * @route GET /assets/:id
 * @summary Get an asset by ID
 * @param req.params.id - Asset ID
 * @returns 200 - Asset found
 * @returns 404 - Asset not found
 * @returns 500 - Server error
 */
AssetRouter.get('/assets/:id', async (req, res) => {
  try {
    const asset = await AssetModel.findById(req.params.id)
    if (!asset) return res.status(404).json({ error: 'Asset not found' })
    return res.status(200).json(asset)
  } catch (err) {
    return res.status(500).json({ error: err.message || err })
  }
})

/**
 * @route POST /assets
 * @summary Create a new asset
 * @param req.body - Asset data (symbol, name, type, quantity, avgBuyPrice)
 * @returns 201 - Created asset
 * @returns 400 - Missing or invalid data
 * @returns 500 - Server error
 */
AssetRouter.post('/assets', async (req, res) => {
  try {
    if (!req.body) return res.status(400).json({ error: 'Missing body' })

    const newAsset = new AssetModel(req.body)
    await newAsset.save()
    return res.status(201).json(newAsset)
  } catch (err) {
    return res.status(500).json({ error: err.message || err })
  }
})

/**
 * @route PATCH /assets/:id
 * @summary Update an asset by ID
 * @param req.params.id - Asset ID
 * @param req.body - Fields to update (symbol, name, type, quantity, avgBuyPrice)
 * @returns 200 - Updated asset
 * @returns 404 - Asset not found
 * @returns 500 - Server error
 */
AssetRouter.patch('/assets/:id', async (req, res) => {
  try {
    if (!req.body) return res.status(400).json({ error: 'Missing body' })

    const allowedUpdate: Partial<any> = {}
    if (req.body.symbol !== undefined) allowedUpdate.symbol = req.body.symbol
    if (req.body.name !== undefined) allowedUpdate.name = req.body.name
    if (req.body.type !== undefined) allowedUpdate.type = req.body.type
    if (req.body.quantity !== undefined) allowedUpdate.quantity = req.body.quantity
    if (req.body.avgBuyPrice !== undefined) allowedUpdate.avgBuyPrice = req.body.avgBuyPrice

    const updated = await AssetModel.findByIdAndUpdate(
      req.params.id,
      { $set: allowedUpdate },
      { new: true, runValidators: true }
    )

    if (!updated) return res.status(404).json({ error: 'Asset not found' })
    return res.status(200).json(updated)
  } catch (err) {
    return res.status(500).json({ error: err.message || err })
  }
})

/**
 * @route DELETE /assets/:id
 * @summary Delete an asset by ID
 * @param req.params.id - Asset ID
 * @returns 200 - Deleted asset
 * @returns 404 - Asset not found
 * @returns 500 - Server error
 */
AssetRouter.delete('/assets/:id', async (req, res) => {
  try {
    const deleted = await AssetModel.findByIdAndDelete(req.params.id)
    if (!deleted) return res.status(404).json({ error: 'Asset not found' })
    return res.status(200).json({ message: 'Asset deleted successfully', deleted })
  } catch (err) {
    return res.status(500).json({ error: err.message || err })
  }
})