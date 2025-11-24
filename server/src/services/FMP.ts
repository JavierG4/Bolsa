
import dotenv from "dotenv";
import axios from 'axios'
import { ownDate } from "../models/friendInvite.js";

dotenv.config();

const API_KEY = process.env.API_KEY
const BASE_CRIPTO_URL = "https://api.binance.com/api/v3/ticker/price?"
const HISTORICAL_CRIPTO_URL = "https://api.binance.com/api/v3/klines?"
const BASE_URL = `https://financialmodelingprep.com/stable/quote?`
const HISTORICAL_URL = 'https://financialmodelingprep.com/stable/historical-price-eod/full?'

export enum TIME {
  ONE_HOUR = '1h',
  ONE_WEEK = '7D',
  ONE_MONTH = '1M',
}
export enum PRICE_TIME {
  DAY = 'D',
  WEEK = 'W',
  MONTH = 'M',
  SIX_MONTHS = '6M',
  YEAR = '1Y',
}

export async function getActionsData(fullPrice: boolean = false, symbol: string, fromInterval?: ownDate, toInterval?: ownDate)  {
  try {
    if (fullPrice) {
      if (!fromInterval || !toInterval) {
        throw new Error('Interval dates are required for full price data')
      }
      const from = `${String(fromInterval.year).padStart(4, '0')}-${String(fromInterval.month).padStart(2, '0')}-${String(fromInterval.day).padStart(2, '0')}`
      const to = `${String(toInterval.year).padStart(4, '0')}-${String(toInterval.month).padStart(2, '0')}-${String(toInterval.day).padStart(2, '0')}`
      const url = `${HISTORICAL_URL}symbol=${symbol}&from=${from}&to=${to}&apikey=${API_KEY}`
      //console.log(url)
      const response = await fetch(url)
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      else {
        const data = await response.json()
        return data
      }
    }
    else {
      const url = `${BASE_URL}symbol=${symbol}&apikey=${API_KEY}`
      const response = await fetch(url)
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      else {
        const data = await response.json()
        return data
      }
    }
  }
  catch (err) {
    return {error: err}
  }
}

export async function getCriptoData(fullPrice: boolean,symbol: string, priceTime?: PRICE_TIME) {
  try {
    if (!fullPrice) {
      const url = `${BASE_CRIPTO_URL}symbol=${symbol}USDT`
      const response = await fetch(url)
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      else {
        const data = await response.json()
        return data
      }
    }
    else {
      if (!priceTime) {
        throw new Error('Price time is required for full price data')
      }
      let limit: number = 0
      let interval: string = ''
      switch (priceTime) {
        case PRICE_TIME.DAY: 
          limit = 24
          interval = '1h'
          break
        case PRICE_TIME.WEEK:
          limit = 7
          interval = '1d'
          break
        case PRICE_TIME.MONTH:
          limit = 30
          interval = '1d'
          break
        case PRICE_TIME.SIX_MONTHS:
          limit = 26
          interval = '1w'
          break
        case PRICE_TIME.YEAR:
          limit = 52
          interval = '1w'
          break
        default:
          throw new Error('Invalid price time')
      }
      let url = `${HISTORICAL_CRIPTO_URL}symbol=${symbol}USDT&interval=${interval}&limit=${limit}`
      const response = await fetch(url)
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      else {
        const data = await response.json()
        return data
      }
    }
  }
  catch(err) {
    return {error: err}
  }
}

(async() => {
  //console.log(await getActionsData(true, 'AAPL')) //should fail
  //console.log(await getActionsData(true, 'AAPL', {day:1, month:1, year:2023}, {day:1, month:2, year:2023})) //should work
  //console.log(await getActionsData(false, 'AAPL')) //should work
  //console.log(await getCriptoData(false, 'BTC')) //should work
  //console.log(await getCriptoData(true, 'BTC', PRICE_TIME.DAY)) //should work
})()
  



