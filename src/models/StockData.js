const mongoose = require('mongoose');

const stockDataSchema = new mongoose.Schema({
    symbol: String,
    date: Date,
    open: Number,
    high: Number,
    low: Number,
    close: Number,
    volume: Number
});

const StockData = mongoose.model('StockData', stockDataSchema);

module.exports = StockData;
