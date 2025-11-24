import mongoose, { Schema, Document } from "mongoose";

export interface IAssetPrice extends Document {
  name: string;
  symbol: string;
  type: "stock" | "crypto";
  price: number;
  timestamp: Date;
}

const AssetPriceSchema = new Schema<IAssetPrice>({
  name: { type: String, required: true },
  symbol: { type: String, required: true, index: true },
  type: { type: String, enum: ["stock", "crypto"], required: true },
  price: { type: Number, required: true },
  timestamp: { type: Date, default: Date.now }
});

// Opcional: evita duplicados del mismo día
AssetPriceSchema.index({ symbol: 1, timestamp: 1 }, { unique: false });

export const AssetPriceModel = mongoose.model<IAssetPrice>(
  "AssetPrice",
  AssetPriceSchema
);
