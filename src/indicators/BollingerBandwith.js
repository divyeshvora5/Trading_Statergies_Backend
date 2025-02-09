const { SMA, SD, EMA } = require('technicalindicators');

class BollingerBandsSignal {
    constructor(config) {
        this.config = config;
    }

    calculateBollingerBands(src, length, mult) {
        const sma = SMA.calculate({ period: length, values: src });
        const stdev = SD.calculate({ period: length, values: src });

        const upper = sma.map((value, index) => value + mult * stdev[index]);
        const lower = sma.map((value, index) => value - mult * stdev[index]);

        return { upper, lower, basis: sma };
    }

    calculateEMA(values, period) {
        return EMA.calculate({ period, values });
    }

    findExtremes(data, lookback) {
        const highest = [];
        const lowest = [];
        for (let i = lookback - 1; i < data.length; i++) {
            const slice = data.slice(i - lookback + 1, i + 1);
            highest.push(Math.max(...slice));
            lowest.push(Math.min(...slice));
        }
        return { highest, lowest };
    }

    calculateSignals(closePrices) {
        const { length, mult, lookback, smaLength } = this.config;
        const { upper, lower, basis } = this.calculateBollingerBands(closePrices, length, mult);
        const bandwidth = upper.map((u, i) => ((u - lower[i]) / basis[i]) * 100);
        const emaBandwidth = this.calculateEMA(bandwidth, smaLength);
        const smaBandwidth = SMA.calculate({ period: smaLength, values: bandwidth });
        const { highest: highestExpansion, lowest: lowestContraction } = this.findExtremes(bandwidth, lookback);

        let signals = Array(emaBandwidth.length).fill('falling');
        let signalActive = false;

        for (let i = lookback - 1; i < emaBandwidth.length; i++) {
            if ((emaBandwidth[i] <= lowestContraction[i - lookback + 1] * 1.1 && emaBandwidth[i] > smaBandwidth[i]) || signalActive) {
                signals[i] = !signalActive ? 'openSignal' : (emaBandwidth[i] > emaBandwidth[i - 1] ? 'rising' : 'falling');
                signalActive = true;
                if (emaBandwidth[i] < emaBandwidth[i - 1]) {
                    signals[i] = 'falling';
                    signalActive = false;
                }
            }
        }

        for (let i = 1; i < emaBandwidth.length; i++) {
            if (emaBandwidth[i] > emaBandwidth[i - 1] && emaBandwidth[i - 1] < emaBandwidth[i - 2]) {
                signals[i] = 'openSignal';
                signalActive = true;
                for (let j = i; j < emaBandwidth.length; j++) {
                    signals[j] = emaBandwidth[j] > emaBandwidth[j - 1] ? 'rising' : 'falling';
                    if (emaBandwidth[j] < emaBandwidth[j - 1]) {
                        signals[j] = 'falling';
                        signalActive = false;
                        break;
                    }
                }
            }
        }

        return signals;
    }

    apply(data) {
        const closePrices = data.map(entry => entry.close);
        const signals = this.calculateSignals(closePrices);

        const enrichedData = data.map((entry, index) => {
            const signalIndex = index - (closePrices.length - signals.length);
            return {
                ...entry,
                signal: signalIndex >= 0 ? signals[signalIndex] : 'falling' // Ensure index alignment
            };
        });

        return enrichedData;
    }
}

module.exports = { BollingerBandsSignal };
