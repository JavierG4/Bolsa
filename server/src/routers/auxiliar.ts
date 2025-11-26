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
    // console.log("Paso 1: Entró a /me/patrimonio");

    const userId: string = (req as any).user.userId;

    if (!userId) {
      // console.log("Paso 2.1: userId es undefined → middleware no funciona");
      return res.status(401).json({ error: "Missing user ID" });
    }

    // console.log("Paso 3: Buscando usuario en DB...");
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

    // console.log("Paso 4: Calculando patrimonio usando precios actuales...");

    for (const asset of portfolio.assets) {
      // console.log("Procesando:", asset.symbol);

      if (!asset.symbol || !asset.quantity) {
        // console.log("Asset incompleto:", asset);
        continue;
      }

      // 🔥 Obtener precio ACTUAL desde la BD
      const priceEntry = await AssetPriceModel.findOne({ symbol: asset.symbol });

      if (!priceEntry) {
        // console.log(`⚠️ No existe precio actual para ${asset.symbol}, se ignora`);
        continue;
      }

      const currentPrice = priceEntry.price;

      patrimonio += asset.quantity * currentPrice;

      // console.log(
      //   `✔️ ${asset.symbol}: quantity=${asset.quantity}, price=${currentPrice} → subtotal=${asset.quantity * currentPrice}`
      // );
    }

    // console.log("Patrimonio final:", patrimonio);

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
        const assetPriceEntry = await AssetPriceModel.findOne({ symbol: asset.symbol, type: asset.type });
        // console.log("Asset price entry for", asset.symbol, ":", assetPriceEntry);
        assets.push({
          symbol: asset.symbol,
          name: asset.name,
          type: asset.type,
          quantity: asset.quantity ?? 0,
          avgBuyPrice: asset.avgBuyPrice,
          price: assetPriceEntry ? assetPriceEntry.price : "NoData"
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
  // console.log(req.body)
  try {
    const userId = (req as any).user.userId;
    // const userId = "691c664622d0266f769c5bcb"
    const { symbol, avgBuyPrice, quantity, type } = req.body;

    // console.log("POST /me/add - userId:", userId);
    // console.log("POST /me/add - body:", { symbol, avgBuyPrice, quantity, type });

    if (!userId) return res.status(401).json({ error: "Missing user ID" });

    //  Buscar usuario y portfolio completo
    const user = await UserModel.findById(userId).populate({
      path: "portfolio",
      populate: {
        path: "assets",
        model: "PortfolioAsset"
      }
    });

    // console.log("Usuario encontrado:", user ? "Sí" : "No");

    if (!user) return res.status(404).json({ error: "User not found" });

    let portfolio = user.portfolio as any;
    // console.log("Portfolio assets count:", portfolio.assets?.length ?? 0);

    //  Buscar si el asset ya existe dentro del portfolio
    const existingAsset = portfolio.assets.find(asset => {
      // si es ObjectId, ignorar
      if (asset instanceof mongoose.Types.ObjectId) return false;
      return asset.symbol === symbol && asset.type === type;
    });

    // console.log("Asset existente:", existingAsset ? "Sí" : "No");

    if (existingAsset) {
      // console.log("Actualizando asset existente...");
      //  Actualizar precio medio y cantidad
      const oldTotal = existingAsset.quantity * existingAsset.avgBuyPrice;
      const newTotal = quantity * avgBuyPrice;

      // console.log("Cálculo: oldTotal =", oldTotal, "newTotal =", newTotal);

      existingAsset.quantity += quantity;
      existingAsset.avgBuyPrice = (oldTotal + newTotal) / existingAsset.quantity;

      // console.log("Nuevos valores: quantity =", existingAsset.quantity, "avgBuyPrice =", existingAsset.avgBuyPrice);

      await existingAsset.save();
    } else {
      // console.log("Creando nuevo asset...");
      //  Validar que el asset exista en AssetPriceModel
      const priceEntry = await AssetPriceModel.findOne({ symbol, type });
      // console.log("Precio encontrado:", priceEntry ? "Sí" : "No");

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

      // console.log("Nuevo asset creado:", newAsset._id);

      portfolio.assets.push(newAsset._id);
    }

    await portfolio.save();
    // console.log("Portfolio guardado");

    //  Registrar transacción
    const now = new Date();
    await TransactionModel.create({
      userId,
      assetSymbol: symbol,
      actionType: "BUY",
      quantity,
      price: avgBuyPrice,
      date: {
      day: now.getDate(),
      month: now.getMonth() + 1,
      year: now.getFullYear()
      }
    });

    // console.log("Transacción registrada");

    return res.json({ success: true });

  } catch (err) {
    console.error("ERROR en POST /me/add:", err);
    return res.status(500).json({ error: err.message });
  }
});

auxiliar.post("/me/sell", async (req, res) => {
  try {
    const userId = (req as any).user.userId;
    const { symbol, quantity, sellPrice, type } = req.body;

    if (!userId) return res.status(401).json({ error: "Missing user ID" });

    if (!symbol || !quantity || !sellPrice || !type) {
      return res.status(400).json({ error: "Missing required fields" });
    }

    // 1️⃣ Buscar usuario + portfolio + assets
    const user = await UserModel.findById(userId).populate({
      path: "portfolio",
      populate: {
        path: "assets",
        model: "PortfolioAsset"
      }
    });

    if (!user) return res.status(404).json({ error: "User not found" });

    const portfolio = user.portfolio as any;

    // 2️⃣ Buscar si el asset existe
    const asset = portfolio.assets.find((a: any) => {
      if (a instanceof mongoose.Types.ObjectId) return false;
      return a.symbol === symbol && a.type === type;
    });

    if (!asset) {
      return res.status(404).json({
        error: `El usuario no tiene ${symbol} (${type}) en el portfolio`
      });
    }

    // 3️⃣ Comprobar cantidad suficiente
    if (asset.quantity < quantity) {
      return res.status(400).json({
        error: `No tienes suficientes unidades para vender: tienes ${asset.quantity}, intentas vender ${quantity}`
      });
    }

    // 4️⃣ Restar cantidad
    asset.quantity -= quantity;

    // Si queda en 0 → eliminar asset del portfolio
    if (asset.quantity === 0) {
      portfolio.assets = portfolio.assets.filter((a: any) => a._id.toString() !== asset._id.toString());
      await asset.deleteOne();
    } else {
      await asset.save();
    }

    // 5️⃣ Guardar portfolio actualizado
    await portfolio.save();

    // 6️⃣ Registrar la transacción SELL
    const now = new Date();
    await TransactionModel.create({
      userId,
      assetSymbol: symbol,
      actionType: "SELL",
      quantity,
      price: sellPrice,
      date: {
        day: now.getDate(),
        month: now.getMonth() + 1,
        year: now.getFullYear()
      }
    });

    return res.json({
      success: true,
      message: "Asset vendido correctamente"
    });

  } catch (err: any) {
    console.error("ERROR en /me/sell:", err);
    return res.status(500).json({ error: err.message });
  }
});

auxiliar.get("/me/recently-added", async (req, res) => {
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

    // Ordenar assets por fecha de creación (más recientes primero)
    const sortedAssets = portfolio.assets.sort((a: any, b: any) => {
      return b._id.getTimestamp().getTime() - a._id.getTimestamp().getTime();
    });

    // Tomar los 5 más recientes
    const recentAssets = sortedAssets.slice(0, 5);

    // Formatear la respuesta poniendo el precio según la base de datos AssetPriceModel
    const assetsResponse = [];
    for (const asset of recentAssets) {
      const priceEntry = await AssetPriceModel.findOne({ symbol: asset.symbol });
      const currentPrice = priceEntry ? priceEntry.price : null;
      
      assetsResponse.push({
        name: asset.name,
        currentPrice: currentPrice
      });
    }
    
    return res.status(200).json({ assets: assetsResponse });

  } catch (err: any) {
    console.error("ERROR EN /me/recently-added:", err);
    return res.status(500).json({ error: err.message });
  }
});

auxiliar.get("/all-data/top-assets", async (req: Request, res: Response) => {
  try {
    const STOCK_SYMBOLS = ["AAPL", "MSFT", "GOOGL", "NVDA", "META", "AMZN", "TSLA"];

    const topStocksData = await AssetPriceModel.find({
      symbol: { $in: STOCK_SYMBOLS },
      type: "stock"
    }).sort({ symbol: 1 });


    return res.status(200).json({
      stocks: topStocksData,
    });
  } catch (err: any) {
    console.error("ERROR EN /top-assets:", err);
    return res.status(500).json({ error: err.message });
  }
});

auxiliar.get("/all-data/top-crypto", async (req: Request, res: Response) => {
  try {
    const CRYPTO_SYMBOLS = ["ETHUSDT", "BTCUSDT", "SOLUSDT"];
    const topCryptosData = await AssetPriceModel.find({
      symbol: { $in: CRYPTO_SYMBOLS },
      type: "crypto"
    }).sort({ symbol: 1 });

    return res.status(200).json({
      cryptos: topCryptosData,
    });
  } catch (err: any) {
    console.error("ERROR EN /top-crypto:", err);
    return res.status(500).json({ error: err.message });
  }
});
