const yahooFinance = require("yahoo-finance2").default;
const SSLCciStrategy = require("../strategies/sslCciStrategy");
const { getYesterdayAtTime } = require("../utils");

function hasRecentSignal(data, lookbackPeriod) {
  for (let i = data.length - 1; i >= data.length - lookbackPeriod; i--) {
      if (i < 0) break;
      if (data[i].trade) {
          return data[i];
      }
  }
  return false;
}

const fetchData = async (symbol) => {
  const now = getYesterdayAtTime(15, 30);
  const period2 = new Date();
  const period1 = new Date(period2.getTime() - (3500 * 5 * 60 * 1000)); // 5 minutes candles

  //need 300 candle to calculate ema

  const result = await yahooFinance.chart(symbol, {
    interval: '5m',
    period1: Math.floor(period1.getTime() / 1000),
    period2: Math.floor(period2.getTime() / 1000),
  });


  if (result.quotes.length) {
    const strategy = new SSLCciStrategy({
      period: 13,
      cciLength: 40,
      cciLowerBand: -100,
      cciUpperBand: 100,
      cciLookbackBefore: 3,
      cciLookbackAfter: 3,
    });
    const enrichedData = strategy.apply(result.quotes);
    console.log(`Stock: ${symbol}`);

    // Filter for recent buy signals
  
    console.table(enrichedData, ['date', 'open', 'high', 'low', 'close', 'crossover', 'trade']);


    // return { symbol, enrichedData, recentSignal };
  } else {
    console.log(`Stock: ${symbol}, Not enough data`);
    // return { symbol, enrichedData: [], recentSignal: false };
  }

};

(async () => {
  await fetchData('SBIN.NS');
})();
