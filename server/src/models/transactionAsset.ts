import {Document, ObjectId, Schema, model} from 'mongoose';

import {ownDate} from './friendInvite.js';

export enum ActionType {
  BUY = 'BUY',
  SELL = 'SELL',
}

export interface Transaction extends Document {
  userId: ObjectId;
  assetSymbol: String;
  actionType: ActionType;
  quantity: number;
  price: number;
  date: ownDate;
}

const TransactionSchema = new Schema<Transaction>({
  userId: {
    type: Schema.Types.ObjectId,
    required: true,
    ref: 'User',
  },
  assetSymbol: {
    type: String,
    required: true,
    trim: true,
  },
  actionType:  {
    type: String,
    required: true,
    validate: (value: string) => {
      if (!Object.values(ActionType).includes(value as ActionType)) {
        throw new Error('Invalid action type');
      }
    }
  },
  quantity: {
    type: Number,
    required: true,
    validate: (value: number) => {
      if (value <= 0) {
        throw new Error('Quantity must be greater than zero');
      }
    }
  },
  price: {
    required: true,
    type: Number,
    validate: (value: number) => {  
      if (value <= 0) {
        throw new Error('Price must be greater than zero');
      }
    }
  },
  date: {
    type: {
      day: { type: Number, required: true },
      month: { type: Number, required: true },
      year: { type: Number, required: true },
    },
    required: true,
    validate: (value: ownDate) => {
      const { day, month, year } = value;
      if (day < 1 || day > 31) {
        throw new Error('Day must be between 1 and 31');
      }
      if (month < 1 || month > 12) {
        throw new Error('Month must be between 1 and 12');
      }
      if (year < 1900 || year > new Date().getFullYear()) {
        throw new Error('Year must be a valid year');
      }
    }
  }
})

export const TransactionModel = model<Transaction>('Transaction', TransactionSchema);