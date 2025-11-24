import express from "express";
import { PortfolioModel } from "../models/portfolio.js";
import { UserModel } from "../models/user.js";
import { Request, Response } from "express";
import { TOP_STOCKS, TOP_CRYPTOS } from "../config/assets.js";
import { getActionsData, getCriptoData, PRICE_TIME } from "../services/FMP.js";
import { AssetPriceModel } from "../models/asset.js";
import {TransactionModel} from "../models/transactionAsset.js";
import { AssetModel } from "../models/portfolioAsset.js";
import mongoose from "mongoose";


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


auxiliar.post("/me/add", async (req, res) => {
  try {
    const userId = (req as any).user.userId;
    const { symbol, avgBuyPrice, quantity, type } = req.body;

    console.log("POST /me/add - userId:", userId);
    console.log("POST /me/add - body:", { symbol, avgBuyPrice, quantity, type });

    if (!userId) return res.status(401).json({ error: "Missing user ID" });

    //  Buscar usuario y portfolio completo
    const user = await UserModel.findById(userId).populate({
      path: "portfolio",
      populate: {
        path: "assets",
        model: "PortfolioAsset"
      }
    });

    console.log("Usuario encontrado:", user ? "Sí" : "No");

    if (!user) return res.status(404).json({ error: "User not found" });

    let portfolio = user.portfolio as any;
    console.log("Portfolio assets count:", portfolio.assets?.length ?? 0);

    //  Buscar si el asset ya existe dentro del portfolio
    const existingAsset = portfolio.assets.find(asset => {
      // si es ObjectId, ignorar
      if (asset instanceof mongoose.Types.ObjectId) return false;
      return asset.symbol === symbol && asset.type === type;
    });

    console.log("Asset existente:", existingAsset ? "Sí" : "No");

    if (existingAsset) {
      console.log("Actualizando asset existente...");
      //  Actualizar precio medio y cantidad
      const oldTotal = existingAsset.quantity * existingAsset.avgBuyPrice;
      const newTotal = quantity * avgBuyPrice;

      console.log("Cálculo: oldTotal =", oldTotal, "newTotal =", newTotal);

      existingAsset.quantity += quantity;
      existingAsset.avgBuyPrice = (oldTotal + newTotal) / existingAsset.quantity;

      console.log("Nuevos valores: quantity =", existingAsset.quantity, "avgBuyPrice =", existingAsset.avgBuyPrice);

      await existingAsset.save();
    } else {
      console.log("Creando nuevo asset...");
      //  Validar que el asset exista en AssetPriceModel
      const priceEntry = await AssetPriceModel.findOne({ symbol, type });
      console.log("Precio encontrado:", priceEntry ? "Sí" : "No");

      if (!priceEntry) {
        return res.status(404).json({
          error: `No existe el asset ${symbol} en el tipo ${type}`
        });
      }

      //  Crear nuevo asset
      const newAsset = await AssetModel.create({
        symbol,
        type,
        quantity,
        avgBuyPrice,
        name: priceEntry.name
      });

      console.log("Nuevo asset creado:", newAsset._id);

      portfolio.assets.push(newAsset._id);
    }

    await portfolio.save();
    console.log("Portfolio guardado");

    //  Registrar transacción
    await TransactionModel.create({
      userId,
      symbol,
      type,
      quantity,
      price: avgBuyPrice,
      action: "buy",
      createdAt: new Date()
    });

    console.log("Transacción registrada");

    return res.json({ success: true });

  } catch (err) {
    console.error("ERROR en POST /me/add:", err);
    return res.status(500).json({ error: err.message });
  }
});
