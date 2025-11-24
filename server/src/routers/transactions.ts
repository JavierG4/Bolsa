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
  //Obtenemos el userId del token (añadido por el middleware global)
  const userId: string = (req as any).user.userId;
  const validFilters = ["userId", "assetSymbol", "actionType", "date"]
  const params = req.query
  const invalidParams = Object.keys(req.query).filter(param => !validFilters.includes(param))
  if (invalidParams.length > 0) {
    return res.status(400).send({error: `Params ${invalidParams} are invalid`})
  }
  else {
    const filter: any = {}
    // Add parameters to the filter
    filter.userId = userId
    if (params.assetSymbol) filter.assetSymbol = params.assetSymbol
    if (params.actionType) filter.actionType = params.actionType as ActionType
    if (params.date as string) {
      const dateStr = params.date as string;
      if (dateStr.length !== 10) {
        return res.status(400).send({error: 'Date must be in format DD-MM-YYYY'})
      }
      // Validar que tenga guiones en las posiciones correctas
      if (dateStr[2] !== '-' || dateStr[5] !== '-') {
        return res.status(400).send({error: 'Date must be in format DD-MM-YYYY'})
      }
      const day = Number(dateStr.slice(0, 2));
      const month = Number(dateStr.slice(3, 5));
      const year = Number(dateStr.slice(6, 10));
      // Validar que sean números válidos
      if (isNaN(day) || isNaN(month) || isNaN(year)) {
        return res.status(400).send({error: 'Date must be in format DD-MM-YYYY'})
      }
      filter['date.day'] = day;
      filter['date.month'] = month;
      filter['date.year'] = year;
    }
    // Search the transaction
    const transaction = await TransactionModel.find(filter)
    if (transaction.length == 0) {
      return res.status(200).send({transaction: []})
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