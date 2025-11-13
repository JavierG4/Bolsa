
//import dotenv from "dotenv";
import axios from 'axios'

//dotenv.config();

const API_KEY = import.meta.env.VITE_ALPHA_KEY;

export const PRICE_TIME = {
  ACTUAL: 'GLOBAL_QUOTE',
  DAILY: 'TIME_SERIES_DAILY',
  INTERVAL_DAILY: 'TIME_SERIES_INTRADAY',
  WEEKLY: 'TIME_SERIES_WEEKLY_ADJUSTED',
  MONTHLY: 'TIME_SERIES_MONTHLY_ADJUSTED',
  CRIPTO: 'CURRENCY_EXCHANGE_RATE'
} as const;

export type PRICE_TIME = typeof PRICE_TIME[keyof typeof PRICE_TIME];

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


//console.log('Fourth request')
//console.log(await getActionsData(PRICE_TIME.ACTUAL, 'IBM' ))

/*
{
  'Global Quote': {
    '01. symbol': 'IBM',
    '02. open': '306.8200',
    '03. high': '309.9400',
    '04. low': '304.2300',
    '05. price': '309.1300',
    '06. volume': '2975188',
    '07. latest trading day': '2025-11-10',
    '08. previous close': '304.7239',
    '09. change': '4.4061',
    '10. change percent': '1.4459%'
  }
}
*/

  




