const mongoose = require('mongoose');

const tradeDataSchema = new mongoose.Schema({
    symbol: String,
});

const StocksSymbol = mongoose.model('StocksSymbol', tradeDataSchema);

module.exports = StocksSymbol;
