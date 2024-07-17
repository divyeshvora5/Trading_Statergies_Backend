const SMA = require('technicalindicators').SMA;

function elliottWaveOscillator(data, sma1length = 5, sma2length = 35, usePercent = true) {
    const closePrices = data.map(d => d.close);

    const sma1 = SMA.calculate({ period: sma1length, values: closePrices });
    const sma2 = SMA.calculate({ period: sma2length, values: closePrices });

    const smadif = [];
    for (let i = 0; i < sma2.length; i++) {
        const diff = sma1[i + (sma2length - sma1length)] - sma2[i];
        if (usePercent) {
            smadif.push((diff / closePrices[i + sma2length - 1]) * 100);
        } else {
            smadif.push(diff);
        }
    }

    const colors = smadif.map(value => value <= 0 ? 'red' : 'green');

    for (let i = 0; i < smadif.length; i++) {
        data[i + (sma2length - 1)].ewo = smadif[i];
        data[i + (sma2length - 1)].color = colors[i];
    }

    return data;
}

module.exports = { elliottWaveOscillator }