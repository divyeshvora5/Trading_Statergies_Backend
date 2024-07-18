const yahooFinance = require('yahoo-finance2').default;

async function getSixMonthsData(symbol) {
  try {
    const today = new Date();
    const sixMonthsAgo = new Date(today);
    sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 6);

    const period1 = sixMonthsAgo.toISOString();
    const period2 = today.toISOString();

    const queryOptions = { period1, period2, interval: '1d' };
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

getSixMonthsData('SBIN.NS'); // Replace 'AAPL' with the stock symbol you want to query
