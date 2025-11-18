import express from "express";
import { PortfolioModel } from "../models/portfolio.js";
import { UserModel } from "../models/user.js";



export const auxiliar = express.Router();

/**
 * @route GET /me/patrimonio
 * @desc Returns total user portfolio value
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

    console.log("Paso 4: Resultado de UserModel.findById:", user);

    if (!user) {
      console.log("Paso 4.1: No se encontró usuario");
      return res.status(404).json({ error: "User not found" });
    }

    if (!user.portfolio) {
      console.log("Paso 4.2: El usuario NO tiene portfolio");
      return res.status(404).json({ error: "User has no portfolio" });
    }

    console.log("Paso 5: Portfolio encontrado:", user.portfolio);

    const portfolio = user.portfolio as any;

    if (!portfolio.assets) {
      console.log("Paso 5.1: Portfolio sin assets → devolviendo 0");
      return res.status(200).json({ patrimonio: 0 });
    }

    console.log("Paso 6: Assets del portfolio:", portfolio.assets);

    let patrimonio = 0;

    for (const asset of portfolio.assets) {
      console.log("Paso 7: Procesando asset:", asset);

      if (asset?.quantity && asset?.avgBuyPrice) {
        patrimonio += asset.quantity * asset.avgBuyPrice;
      } else {
        console.log("Paso 7.1: Asset sin quantity o avgBuyPrice", asset);
      }
    }

    console.log("Paso 8: Patrimonio final calculado =", patrimonio);

    return res.status(200).json({ patrimonio });

  } catch (err: any) {
    console.error("Paso ERROR: Excepción atrapada:", err);
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