import { Request, Response } from "express";
import { TOP_STOCKS, TOP_CRYPTOS } from "../config/assets.js";
import { getActionsData, getCriptoData, PRICE_TIME } from "../services/FMP.js";
import { AssetPriceModel } from "../models/asset.js";
import { Router } from "express";

const routerprices = Router();

/**
 * @route POST /me/prices
 * @desc Updates daily asset prices for stocks and cryptos
 */
routerprices.post("/prices", async (req: Request, res: Response) => {
  try {
    const results: any[] = [];

    // --- STOCKS ---
    for (const symbol of TOP_STOCKS) {
      const data = await getActionsData(false, symbol);
      if (Array.isArray(data) && data[0]) {
        const item = data[0];

        await AssetPriceModel.findOneAndUpdate(
          { symbol },
          {
            name: item.name || symbol,
            type: "stock",
            price: item.price,
            timestamp: new Date()
          },
          { upsert: true, new: true }
        );

        results.push({ symbol, status: "updated" });
      }
    }

    // --- CRYPTOS ---
    for (const symbol of TOP_CRYPTOS) {
      const data = await getCriptoData(false, symbol);
      if (data && data.price) {
        await AssetPriceModel.findOneAndUpdate(
          { symbol: `${symbol}USDT` },
          {
            name: symbol,
            type: "crypto",
            price: Number(data.price),
            timestamp: new Date()
          },
          { upsert: true, new: true }
        );

        results.push({ symbol, status: "updated" });
      }
    }

    return res.status(200).json({
      message: "Daily prices updated",
      results
    });

  } catch (error: any) {
    return res.status(500).json({ error: error.message });
  }
});

export default routerprices;