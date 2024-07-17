const yahooFinance  = require("yahoo-finance2"). default;
const { MAEmperorinsiliconot } = require("../strategies/MaEmpororStatergy");
const { getYesterdayAtTime } = require("../utils");

const fetchData = async (symbol) => {
    const now = getYesterdayAtTime(15, 30);
    const period2 = now;
    const period1 = new Date(period2.getTime() - (3500 * 5 * 60 * 1000)); // 5 minutes candles

    //need 300 candle to calculate ema
  
    const result = await yahooFinance.chart(symbol, {
      interval: '5m',
      period1: Math.floor(period1.getTime() / 1000),
      period2: Math.floor(period2.getTime() / 1000),
    });

    const test = new MAEmperorinsiliconot({});

    const enrichedData = test.applyStrategy(result.quotes);

    console.table(enrichedData, ["date", "open", "close", "high", "low", "signal"]);
  
  };

  (async () => {
    await fetchData('SBIN.NS');
  })();
  