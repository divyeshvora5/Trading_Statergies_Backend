const { isMarketOpen } = require('../utils');

const yahooFinance = require('yahoo-finance2').default;


const alignToMarket5Minutes = (date) => {
    const marketOpen = new Date(date);
    marketOpen.setHours(9, 15, 0, 0);
    const minutesFromMarketOpen = Math.floor((date - marketOpen) / (1000 * 60));
    const alignedMinutes = Math.floor(minutesFromMarketOpen / 5) * 5;
    const alignedDate = new Date(marketOpen.getTime() + alignedMinutes * 60 * 1000);
    alignedDate.setSeconds(0, 0); // Ensure seconds and milliseconds are 00
    return alignedDate;
};

async function getFifteenMinutesData(symbol) {
  try {
    const now = new Date();



    const period2 =  now;

    console.log(period2.getMinutes() + ":" + period2.getSeconds())


    // const period2 = alignToMarket5Minutes(now);
    
    
    //uncomment during live market
    const period1 = new Date(period2.getTime() - (200 * 5 * 60 * 1000)); // 5 minutes candles
    console.log(period1.getMinutes() + ":" + period1.getSeconds())

    const queryOptions = { period1, period2, interval: '5m' };
    const result = await yahooFinance.chart(symbol, queryOptions);

    const readableResult = result.quotes.map(entry => ({
      date: new Date(entry.date).toLocaleString(), // Convert to readable format with date and time
      open: entry.open,
      high: entry.high,
      low: entry.low,
      close: entry.close,
      volume: entry.volume
    }));

    console.table(readableResult);
  } catch (error) {
    console.error(error);
  }
}

getFifteenMinutesData('SBIN.NS'); // Replace 'AAPL' with the stock symbol you want to query
