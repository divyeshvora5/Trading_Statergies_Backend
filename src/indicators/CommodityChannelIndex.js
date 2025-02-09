const { SMA } = require('technicalindicators');

function calculateCCI(data, length) {
    const typicalPrices = data.map(candle => (candle.high + candle.low + candle.close) / 3);

    const smaTypicalPrices = SMA.calculate({ period: length, values: typicalPrices });

    const meanDeviations = [];
    for (let i = length - 1; i < typicalPrices.length; i++) {
        const meanDeviation = typicalPrices.slice(i - length + 1, i + 1).reduce((sum, price) => sum + Math.abs(price - smaTypicalPrices[i - length + 1]), 0) / length;
        meanDeviations.push(meanDeviation);
    }

    const cci = typicalPrices.slice(length - 1).map((price, index) => {
        const sma = smaTypicalPrices[index];
        const meanDeviation = meanDeviations[index];
        return (price - sma) / (0.015 * meanDeviation);
    });

    return Array(length - 1).fill(null).concat(cci);
}

module.exports = { calculateCCI };


