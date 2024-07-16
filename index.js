require('dotenv').config();
const express = require("express");
const http = require("http");
const { Server } = require("socket.io");
const cors = require("cors");

const db = require("./src/config/DbConnect");
const { getConfig } = require('./src/config/fetchConfig');
const { fetchAndFilterStocks } = require('./src/data/stockFilter');
const StockData = require('./src/models/StockData');
const StocksSymbol = require('./src/models/StocksSymbol');
const { scheduleFetch } = require('./src/scheduler/marketScheduler');
const { configureSocket, getSelectedStock } = require('./src/events/socket');


const whiteList = [
    "http://localhost:3000",
    "http://127.0.0.1:3000",
    "http://localhost:3001",
    "http://127.0.0.1:3001",
];



const app = express();
const server = http.createServer(app);
const io = new Server(server, { cors: { origin: whiteList } });


const corsOptions = {
    origin: (origin, callback) => {
        if (whiteList.indexOf(origin) !== -1) {
            callback(null, true);
        } else {

            callback(new Error('Not allowed by CORS'));
        }
    },
    credentials: true, // enable set cookie
    optionsSuccessStatus: 200,
};

app.use(cors(corsOptions));


async function startFetchingData() {

    const count = global.config.count;
    const pageSize =  global.config.batchSize;

    const totalPages = Math.ceil(count / pageSize);

    for(let i = 1; i <= totalPages; i++) {

        const stocks = await StocksSymbol.find({}).skip((i - 1) * pageSize).limit(pageSize).lean();
        const stocksSymbols = stocks.map(stock => stock.symbol);

        await fetchAndFilterStocks({ config: global.config, stocks: stocksSymbols });
    }

    getSelectedStock();

}


//end section

configureSocket(io)


db.once('open', async () => {
    await initialize();
    server.listen(process.env.PORT, () => {
		console.log(`server is running on port ${process.env.PORT}`);
	});
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