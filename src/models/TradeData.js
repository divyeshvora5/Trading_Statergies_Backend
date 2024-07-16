const mongoose = require('mongoose');

const tradeDataSchema = new mongoose.Schema({
    symbol: String,
    date: Date,
    trade: String,
    entryPrice: Number,
    exitPrice: Number,
    profit: Number,
    isWin: Boolean
});

const TradeData = mongoose.model('TradeData', tradeDataSchema);

module.exports = TradeData;
