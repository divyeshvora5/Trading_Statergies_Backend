const { BollingerBandsSignal } = require('../indicators/BollingerBandwith');

const yahooFinance = require('yahoo-finance2').default;

// Input parameters
const config = {
    length: 20,
    mult: 2.0,
    lookback: 100,
    smaLength: 5
};

const bollingerBandsSignal = new BollingerBandsSignal(config);

// Main function to fetch data, calculate indicators, and add signals
async function processStockData(symbol) {
    try {
        const now = new Date();
        now.setHours(15, 30, 0, 0); // Adjust as needed
        const period2 = now;
        const period1 = new Date(period2.getTime() - (1000 * 5 * 60 * 1000)); // 5 minutes candles

        const queryOptions = { period1, period2, interval: '5m' };
        const result = await yahooFinance.chart(symbol, queryOptions);

        const data = result.quotes.map(entry => ({
            date: new Date(entry.date).toLocaleString(),
            open: entry.open,
            high: entry.high,
            low: entry.low,
            close: entry.close,
            volume: entry.volume
        }));

        const enrichedData = bollingerBandsSignal.apply(data);

        console.table(enrichedData);
    } catch (error) {
        console.error(error);
    }
}

// Replace 'AAPL' with your stock symbol
processStockData('WIPRO.NS');
