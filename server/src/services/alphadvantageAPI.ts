
import dotenv from "dotenv";
import axios from 'axios'

dotenv.config();

const API_KEY = process.env.ALPHA_KEY

export enum PRICE_TIME {
  ACTUAL = 'GLOBAL_QUOTE',
  DAILY = 'TIME_SERIES_DAILY_ADJUSTED',
  INTERVAL_DAILY = 'TIME_SERIES_INTRADAY',
  WEEKLY = 'TIME_SERIES_WEEKLY_ADJUSTED',
  MONTHLY = 'TIME_SERIES_MONTHLY_ADJUSTED',
  CRIPTO = 'CURRENCY_EXCHANGE_RATE'
}

export type Interval = '1min' | '5min' | '15min' | '30min' | '60min' | -1

export async function getActionsData(time: PRICE_TIME, symbol: string, interval: Interval = -1)  {
  if (time == PRICE_TIME.CRIPTO) {
    return 'Error: to consult cripto data getCriptoData() must be invocated'
  }
  let url: string = ''
  if (interval !== -1) {
    url = `https://www.alphavantage.co/query?function=${time}&symbol=${symbol}&interval=${interval}&apikey=${API_KEY}`
  }
  else {
    url = `https://www.alphavantage.co/query?function=${time}&symbol=${symbol}&apikey=${API_KEY}`
  }
  try{
    const response = await axios.get(url)
    return response.data
  }
  catch(err) {
    return err
  }
}

export async function getCriptoData(symbol: string, currency: string) {
  const url = `https://www.alphavantage.co/query?function=${PRICE_TIME.CRIPTO}&from_currency=${symbol}&to_currency=${currency}&apikey=${API_KEY}`
  try {
    const response = await axios.get(url)
    return response.data
  }
  catch(err) {
    return err
  }
}

(async() => {
  //console.log('First request')
  //console.log(await getActionsData(PRICE_TIME.ACTUAL, 'IBM' ))
  console.log('Second request')
  console.log(await getActionsData(PRICE_TIME.DAILY, 'IBM'))
  //console.log('Third request')
  //console.log(await getActionsData(PRICE_TIME.INTERVAL_DAILY, 'IBM', '1min'))
  //console.log('Fourth request')
  //console.log(await getActionsData(PRICE_TIME.WEEKLY, 'IBM' ))
  //console.log('Fifth request')
  //console.log(await getActionsData(PRICE_TIME.MONTHLY, 'IBM'))
  //console.log('Cripto request')
  //console.log(await getCriptoData('BTC', 'EUR'))
})()
  




