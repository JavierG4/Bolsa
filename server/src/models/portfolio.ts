import mongoose from 'mongoose';
import { Document, Schema, model, ObjectId } from 'mongoose';
import type { ownDate } from './friendInvite.js';

try {
  mongoose.model('PortfolioAsset')
} catch {
  // lo importamos dinámicamente solo si no está registrado
  const {AssetModel } = await import('./portfolioAsset.js')
}

// Cada vez que se accede al usuario 
export interface Portfolio extends Document{
  assets: mongoose.Types.ObjectId[];
  totalValue: number;
  lastUpdated: ownDate;
}


export const PortfolioSchema = new Schema<Portfolio>({
  totalValue: {
    type: Number,
    trim: true,
    required: true
  },
  lastUpdated: {
    type: {
      day: { type: Number, required: true },
      month: { type: Number, required: true },
      year: { type: Number, required: true },
    },
    trim: true,
    required: true
  },
  assets: {
    type: [
      {
        type: Schema.Types.ObjectId,
        ref: 'PortfolioAsset'
      }
    ],
    required: true,
    default: []
  }

})

export const PortfolioModel =  model<Portfolio> ('Portfolio', PortfolioSchema);