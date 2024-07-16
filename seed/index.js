require('dotenv').config();
const db = require('../src/config/DbConnect');
const Config = require('../src/models/Config');
const StocksSymbol = require('../src/models/StocksSymbol');


const stocksSymbols = [
    { symbol: 'RELIANCE.NS' },
    { symbol: 'TCS.NS' },
    { symbol: 'HDFCBANK.NS' },
    { symbol: 'INFY.NS' },
    { symbol: 'HINDUNILVR.NS' },
];



const seed = async () => {
    try {

        await Config.deleteMany();
        await StocksSymbol.deleteMany();

        const config = new Config({
            period: 13,
            requiredCandles: 13,
            batchSize: 10,
            cciLength: 40,
            cciLowerBand: -100,
            cciUpperBand: 100,
            cciLookbackBefore: 3,
            cciLookbackAfter: 3,
            fetchInterval: 5 * 60 * 1000 + 5000, // 5 minutes and 5 seconds
            marketOpenTime: { hour: 9, minute: 15 },
            marketCloseTime: { hour: 15, minute: 30 },
            intervalMinutes: 5,
            lookbackPeriod: 2
        });

        await config.save();

        await StocksSymbol.insertMany(stocksSymbols)
        console.log('Configuration initialized');
        process.exit(0);
    } catch (err) {
        console.log('err', err)
    }
}

db.on('error', console.error.bind(console, 'MongoDB connection error:'));
db.once('open', () => {
    console.log('Connected to MongoDB');

    seed()
});
