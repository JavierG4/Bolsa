import { ownDate } from "../models/friendInvite.js";
import { TransactionModel , ActionType} from "../models/transactionAsset.js";
import { UserModel } from "../models/user.js";
import express from "express"

export const transactionRouter = express.Router()

transactionRouter.use(express.json())


/**
 * @route GET /transaction
 * @summary Get transactions with optional filters
 * @param req.query.userId - Filter by user ID
 * @param req.query.assetSymbol - Filter by asset symbol
 * @param req.query.actionType - Filter by action type (BUY or SELL)
 * @param req.query.date - Filter by date in format DD-MM-YYYY
 * @returns 200 - Transactions found
 * @returns 400 - Invalid parameters or missing required filters
 * @returns 404 - Transactions not found
 * @returns 500 - Server error
 */
transactionRouter.get('/transactions', async (req, res) => {
try {
  // Check if filters are valid
  const validFilters = ["userId", "assetSymbol", "actionType", "date"]
  const params = req.query
  const invalidParams = Object.keys(req.query).filter(param => !validFilters.includes(param))
  if (invalidParams.length > 0) {
    return res.status(400).send({error: `Params ${invalidParams} are invalid`})
  }
  // Check if there is at least one valid filter
  else if (!params.userId && !params.assetSymbol && !params.actionType && !params.date) {
    return res.status(400).send({error: 'userId, assetSymbol, actionType or date must be provided'})
  }
  else {
    const filter: any = {}
    // Add parameters to the filter
    if (params.userId) filter.userId = params.userId
    if (params.assetSymbol) filter.assetSymbol = params.assetSymbol
    if (params.actionType) filter.actionType = params.actionType as ActionType
    if (params.date as string) {
      if ((params.date)?.length != 10) {
        return res.status(400).send({error: 'Date must be in format DD-MM-YYYY'})
      }
      else {
        const stringDate: string = params.date as string
        filter['date.day'] = Number(stringDate.slice(0, 2))
        filter['date.month'] = Number(stringDate.slice(3, 5))
        filter['date.year'] = Number(stringDate.slice(6, 10))
      }
    }
    // Search the transaction
    const transaction = await TransactionModel.find(filter)
    if (transaction.length == 0) {
      return res.status(404).send({error: 'Transaction not found'})
    }
    else {
      return res.status(200).send({transaction: transaction})
    }
  }
}
catch(err) {
  return res.status(500).send({error: err.message})
}
})

/**
 * @route GET /transaction/:id
 * @summary Get a transaction by id
 * @param req.params.id - The id of the transaction to retrieve
 * @returns 200 - Transaction found
 * @returns 404 - Transaction not found
 * @returns 500 - Server error
 */
transactionRouter.get('/transactions/:id', async (req, res) => {
  try {
    const transaction = await TransactionModel.findById(req.params.id)
    if (!transaction) {
      return res.status(404).send({error: `Transaction with id ${req.params.id} not found`})
    }
    else {
      return res.status(200).send({transaction: transaction})
    }
  }
  catch(err) {
    return res.status(500).send({error: err.message})
  }
})

/**
 * @route POST /transactions
 * @summary Create a new transaction
 * @param req.body - Payload used to populate the new instance (must conform to the TransactionModel schema)
 * @remarks This operation creates the instance in memory; call .save() to persist it to the database.
 * @throws ValidationError - May be thrown when saving if the data violates model validations
 * @returns 201 - Transaction created (returns the created instance)
 * @returns 400 - Missing body or invalid payload
 * @returns 500 - Server error
 */
transactionRouter.post('/transactions', async (req, res) => {
  try {
    if (!req.body) {
      return res.status(400).send({error: 'Data must be secified on the body'})
    }
    else {
      //Verify that user exists
      const user = await UserModel.findById(req.body.userId)
      if (!user) {
        return res.status(400).send({error: `User with id ${req.body.userId} does not exist`})
      }
      let transaction = new TransactionModel(req.body)
      transaction = await transaction.save()
      return res.status(201).send(transaction)
    }
  }
  catch(err) {
    return res.status(500).send({error: err.message})
  }
})


transactionRouter.all('/transactions/{*splat}', (_, res) => {
  res.status(501).send({error: 'Bad request'})
})