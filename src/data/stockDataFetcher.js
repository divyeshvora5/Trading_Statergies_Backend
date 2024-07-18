
const yahooFinance = require('yahoo-finance2').default;
const { isMarketOpen, getMarketCloseTime } = require('../utils');

//for debug perpos
const calculatePasteDate = () => {
    const currentDate =  getMarketCloseTime();
    const millisecondsToAdd = 130 * 5 * 60 * 1000;
    const futureDate = new Date(currentDate.getTime() - millisecondsToAdd);
    return futureDate;
};

const getYesterdayAtTime = (hours, minutes) => {
    const now = new Date();
    const yesterday = new Date(now);
    yesterday.setDate(now.getDate() - 1);
    yesterday.setHours(hours, minutes, 0, 0);
    return yesterday;
  };

  //end section


const alignToMarket5Minutes = (date) => {
    const marketOpen = new Date(date);
    marketOpen.setHours(global.config.marketOpenTime.hour, global.config.marketOpenTime.minute, 0, 0);
    const minutesFromMarketOpen = Math.floor((date - marketOpen) / (1000 * 60));
    const alignedMinutes = Math.floor(minutesFromMarketOpen / 5) * 5;
    const alignedDate = new Date(marketOpen.getTime() + alignedMinutes * 60 * 1000);
    alignedDate.setSeconds(0, 0); // Ensure seconds and milliseconds are 00
    return alignedDate;
};

async function fetchStockData(symbol, interval = '5m', periods) {

    const now = new Date();

    // const now = getYesterdayAtTime(15,30);


    const period2 = isMarketOpen() ? now : getMarketCloseTime();



    // const period2 = alignToMarket5Minutes(now);
    
    
    //uncomment during live market
    const period1 = new Date(period2.getTime() - (periods * 5 * 60 * 1000)); // 5 minutes candles


//for debug after market close
// const period1 = new Date(calculatePasteDate().getTime() - (periods * 5 * 60 * 1000)); // 5 minutes candles


    try {
        const queryOptions = {
            period1: Math.floor(period1.getTime() / 1000),
            period2: Math.floor(period2.getTime() / 1000),
            interval: interval
        };

        const result = await yahooFinance.chart(symbol, queryOptions);

        if (result && result.quotes) {
            const candles = result.quotes.map(quote => ({
                symbol,
                date: new Date(quote.date),
                open: quote.open,
                high: quote.high,
                low: quote.low,
                close: quote.close,
                volume: quote.volume
            }));
            // await StockData.insertMany(candles);
            return candles.slice(-periods);

            // return candles;
        }
        console.log(`No data fetched for ${symbol}`);
        return [];
    } catch (error) {
        console.error(`Error fetching data for ${symbol}:`, error.message);
        return [];
    }
}

module.exports = { fetchStockData };
