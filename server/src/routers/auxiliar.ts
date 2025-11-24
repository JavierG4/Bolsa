import express from "express";
import { PortfolioModel } from "../models/portfolio.js";
import { UserModel } from "../models/user.js";
import { Request, Response } from "express";
import { TOP_STOCKS, TOP_CRYPTOS } from "../config/assets.js";
import { getActionsData, getCriptoData, PRICE_TIME } from "../services/FMP.js";
import { AssetPriceModel } from "../models/asset.js";



export const auxiliar = express.Router();

/**
 * @route GET /me/patrimonio
 * @desc Returns total user portfolio value
 */
/**
 * @route GET /me/patrimonio
 * @desc Returns total user portfolio value using CURRENT prices
 */
auxiliar.get("/me/patrimonio", async (req, res) => {
  try {
    console.log("Paso 1: Entró a /me/patrimonio");

    const userId: string = (req as any).user.userId;

    if (!userId) {
      console.log("Paso 2.1: userId es undefined → middleware no funciona");
      return res.status(401).json({ error: "Missing user ID" });
    }

    console.log("Paso 3: Buscando usuario en DB...");
    const user = await UserModel.findById(userId).populate({
      path: "portfolio",
      populate: {
        path: "assets",
        model: "PortfolioAsset"
      }
    });

    if (!user) return res.status(404).json({ error: "User not found" });
    if (!user.portfolio) return res.status(200).json({ patrimonio: 0 });

    const portfolio = user.portfolio as any;

    if (!portfolio.assets || portfolio.assets.length === 0) {
      return res.status(200).json({ patrimonio: 0 });
    }

    let patrimonio = 0;

    console.log("Paso 4: Calculando patrimonio usando precios actuales...");

    for (const asset of portfolio.assets) {
      console.log("Procesando:", asset.symbol);

      if (!asset.symbol || !asset.quantity) {
        console.log("Asset incompleto:", asset);
        continue;
      }

      // 🔥 Obtener precio ACTUAL desde la BD
      const priceEntry = await AssetPriceModel.findOne({ symbol: asset.symbol });

      if (!priceEntry) {
        console.log(`⚠️ No existe precio actual para ${asset.symbol}, se ignora`);
        continue;
      }

      const currentPrice = priceEntry.price;

      patrimonio += asset.quantity * currentPrice;

      console.log(
        `✔️ ${asset.symbol}: quantity=${asset.quantity}, price=${currentPrice} → subtotal=${asset.quantity * currentPrice}`
      );
    }

    console.log("Patrimonio final:", patrimonio);

    return res.status(200).json({ patrimonio });

  } catch (err: any) {
    console.error("ERROR EN /me/patrimonio:", err);
    return res.status(500).json({ error: err.message });
  }
});


/**
 * @route GET /me/assets
 * @desc Returns total user portfolio value
 */
auxiliar.get("/me/assets", async (req, res) => {
  try {

    const userId: string = (req as any).user.userId;
    if (!userId) {
      return res.status(401).json({ error: "Missing user ID" });
    }
    const user = await UserModel.findById(userId).populate({
      path: "portfolio",
      populate: {
        path: "assets",
        model: "PortfolioAsset"
      }
    });

    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }

    if (!user.portfolio) {
      return res.status(404).json({ error: "User has no portfolio" });
    }
    const portfolio = user.portfolio as any;

    if (!portfolio.assets) {
      return res.status(200).json({ assets: [] });
    }

    let assets = [];

    for (const asset of portfolio.assets) {
      const existing = assets.find((a: any) => a.symbol === asset.symbol);

      if (!existing) {
        assets.push({
          symbol: asset.symbol,
          name: asset.name,
          type: asset.type,
          quantity: asset.quantity ?? 0,
          avgBuyPrice: asset.avgBuyPrice
        });
      } else {
        existing.quantity = (existing.quantity ?? 0) + (asset.quantity ?? 0);
      }
    }

    return res.status(200).json({ assets: assets });

  } catch (err: any) {
    console.error("Paso ERROR: Excepción atrapada:", err);
    return res.status(500).json({ error: err.message });
  }
});

