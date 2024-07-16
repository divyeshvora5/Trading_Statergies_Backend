const mongoose = require('mongoose');

const configSchema = new mongoose.Schema({
    period: Number,
    requiredCandles: Number,
    batchSize: Number,
    cciLength: Number,
    cciLowerBand: Number,
    cciUpperBand: Number,
    cciLookbackBefore: Number,
    cciLookbackAfter: Number,
    fetchInterval: Number,
    intervalMinutes: Number,
    lookbackPeriod: Number,
    marketOpenTime: {
        hour: Number,
        minute: Number
    },
    marketCloseTime: {
        hour: Number,
        minute: Number
    }
});

const Config = mongoose.model('Config', configSchema);

module.exports = Config;
