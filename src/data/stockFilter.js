const { getSelectedStock } = require("../events/socket");
const StockData = require("../models/StockData");
const StocksSymbol = require("../models/StocksSymbol");
const SSLCciStrategy = require("../strategies/sslCciStrategy");
const { fetchStockData } = require("./stockDataFetcher");

function hasRecentSignal(data, lookbackPeriod) {
    for (let i = data.length - 1; i >= data.length - lookbackPeriod; i--) {
        if (i < 0) break;
        if (data[i].trade) {
            return data[i];
        }
    }
    return false;
}


async function processStockData(symbol, config) {
    try {
        const stockData = await fetchStockData(symbol, '5m', config.requiredCandles * 10, config);
        
        if (stockData.length) {
            const strategy = new SSLCciStrategy(config);
            const enrichedData = strategy.apply(stockData);
            console.log(`Stock: ${symbol}`);

            // Filter for recent buy signals
            const recentSignal = hasRecentSignal(enrichedData,
                config.lookbackPeriod,
            );

            return { symbol, enrichedData, recentSignal };
        } else {
            console.log(`Stock: ${symbol}, Not enough data`);
            return { symbol, enrichedData: [], recentSignal: false };
        }
    } catch (error) {
        console.error(`Error fetching data for ${symbol}:`, error.message);
        return { symbol, enrichedData: [], recentSignal: false };
    }
}

async function fetchAndFilterStocks({ config, stocks }) {
    const fetchPromises = stocks.map(symbol => processStockData(symbol, config));
    const results = await Promise.allSettled(fetchPromises);

    const savePromises = results.map(async result => {
        if (result.status === 'rejected') {
            console.error('Error:', result.reason);
        } else {
            const { enrichedData, symbol, recentSignal } = result.value;
            console.log('symbol', symbol)
            console.table(enrichedData.map(ele => ({...ele, date: new Date(ele.date).toLocaleString()})), ['date', 'open', 'high', 'low', 'close', 'crossover', 'trade']);
            if (recentSignal && typeof recentSignal === 'object') {
                console.log('recentSignal', recentSignal)
                console.log(`Stock with recent signal: ${symbol}`);
                const stockDocument = new StockData({
                    symbol,
                    ...recentSignal
                });
                await stockDocument.save();
            }
        }
    });

    await Promise.all(savePromises);

    return results;
}

async function startFetchingData() {

    const count = global.config.count;
    const pageSize = global.config.batchSize;

    const totalPages = Math.ceil(count / pageSize);

    const query = global.config.defaultIndices ? { indices: global.config.defaultIndices } : {};

    for (let i = 1; i <= totalPages; i++) {

        const stocks = await StocksSymbol.find(query).skip((i - 1) * pageSize).limit(pageSize).lean();
        const stocksSymbols = stocks.map(stock => stock.symbol);

        await fetchAndFilterStocks({ config: global.config, stocks: stocksSymbols });
    }

    getSelectedStock();

}

module.exports = { fetchAndFilterStocks, startFetchingData }