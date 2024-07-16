const { calculateSSLChannel } = require('../indicators/sslChannel');
const { calculateCCI } = require('../indicators/CommodityChannelIndex');

class SSLCciStrategy  {
    constructor(config) {
        this.config = config;
    }

    apply(data) {
        const crossovers = calculateSSLChannel(data, this.config.period);
        const cci = calculateCCI(data, this.config.cciLength);

        const enrichedData = data.map((candle, index) => {
            let trade = null;
            if (crossovers[index]) {
                const cciSignalBefore = this.checkCCISignalBefore(cci, index);
                const cciSignalAfter = this.checkCCISignalAfter(cci, index);
                if (cciSignalBefore || cciSignalAfter) {
                    if (crossovers[index] === 'upward') {
                        trade = 'buy';
                    } else if (crossovers[index] === 'downward') {
                        trade = 'sell';
                    }
                }
            }

            return {
                ...candle,
                crossover: crossovers[index] || null,
                trade: trade
            };
        });

        return enrichedData;
    }

    checkCCISignalBefore(cci, index) {
        if (index < this.config.cciLookbackBefore) return false;
        const lowerCross = cci.slice(index - this.config.cciLookbackBefore, index).some(value => value !== null && value < this.config.cciLowerBand);
        const upperCross = cci.slice(index - this.config.cciLookbackBefore, index).some(value => value !== null && value > this.config.cciUpperBand);
        return lowerCross || upperCross;
    }

    checkCCISignalAfter(cci, index) {
        if (index + this.config.cciLookbackAfter >= cci.length) return false;
        const lowerCross = cci.slice(index, index + this.config.cciLookbackAfter).some(value => value !== null && value < this.config.cciLowerBand);
        const upperCross = cci.slice(index, index + this.config.cciLookbackAfter).some(value => value !== null && value > this.config.cciUpperBand);
        return lowerCross || upperCross;
    }
}

module.exports = SSLCciStrategy;
