const Config = require("../models/Config");

async function getConfig() {
    const config = await Config.findOne({});
    if (!config) {
        throw new Error('Configuration not found. Please initialize the configuration.');
    }
    return config.toObject();
}

module.exports = { getConfig };
