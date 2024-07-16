require('dotenv').config();

const db = require("./src/config/DbConnect");
const { getConfig } = require('./src/config/fetchConfig');
const { fetchStockData } = require('./src/data/stockDataFetcher');
const { fetchAndFilterStocks } = require('./src/data/stockFilter');
const StockData = require('./src/models/StockData');
const StocksSymbol = require('./src/models/StocksSymbol');
const { scheduleFetch } = require('./src/scheduler/marketScheduler');



//remove after check section

const nifty50Stocks = [
    'RELIANCE.NS', 'TCS.NS', 'HDFCBANK.NS', 'INFY.NS', 'HINDUNILVR.NS'
];








async function startFetchingData() {

    const count = global.config.count;
    const pageSize =  2;
    // global.config.batchSize

    const totalPages = Math.ceil(count / pageSize);

    for(let i = 1; i <= totalPages; i++) {

        const stocks = await StocksSymbol.find({}).skip((i - 1) * pageSize).limit(pageSize).lean();
        const stocksSymbols = stocks.map(stock => stock.symbol);

        await fetchAndFilterStocks({ config: global.config, stocks: stocksSymbols });

    }



}


//end section




db.once('open', () => {
    initialize();
});

db.on('error', console.error.bind(console, 'MongoDB connection error:'));


async function initialize() {
    try {
        const config = await getConfig();
        const count = await StocksSymbol.countDocuments();
        global.config = {
            ...config,
            count
        };
        await StockData.deleteMany();
        scheduleFetch({ fetchFunction: startFetchingData });
    } catch (err) {
        console.log('err', err)
    }
}