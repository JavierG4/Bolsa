import { Document, Schema, model } from 'mongoose';
export const ALLOWED_TYPE = ['stock' , 'etf' , 'crypto' , 'bond'] as const;

export type AllowedType = typeof ALLOWED_TYPE[number];

export interface PortfolioAsset extends Document {
  symbol: string;
  name: string;
  type: AllowedType;
  quantity: number;
  avgBuyPrice: number;
  // Tener en cuenta:
  // Current price
  // value, es decir, quantity * value
}

const PortfolioAsssetSchema = new Schema<PortfolioAsset> ({
  symbol: {
    type: String,
    required: true,
    trim: true
  },
  name: {
    type: String,
    required: true,
    trim: true
  },
  type: {
    type: String,
    required: true,
    enum: ALLOWED_TYPE as unknown as string[],
    trim: true
  },
  quantity: {
    type: Number,
    required: true,
    trim: true
  },
  avgBuyPrice : { // Cada vez que se añada a la cantidad habrá que actualizar esto
    type: Number,
    required: true,
    trim: true 
  }

})

export const AssetModel =  model<PortfolioAsset> ('PortfolioAsset', PortfolioAsssetSchema);
