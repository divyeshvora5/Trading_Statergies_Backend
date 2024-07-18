# Trading_Statergies_Backend


now fetch stocks data from yahoo-finance2 and filter stock by intraction that i'll give you

-if any stock have a bollinger band with like this (look in image) when bollinger bandwith band is touch the Lowest Contraction (it's ok if  not complety touch like we accept if it 0.4 below) after bolinger band rise to upward direction of a slop of grater han 0.5 add signal


Alphavintage Api key:-AWQA0SO4S1HRPGSC












const { SMA, SD, EMA } = require('technicalindicators');
const yahooFinance = require('yahoo-finance2').default; // Make sure you have this package installed

// Input parameters
const length = 20;
const mult = 2.0;
const lookback = 100;
const smaLength = 5;

// Function to calculate Bollinger Bands
function calculateBollingerBands(src, length, mult) {
    const sma = SMA.calculate({ period: length, values: src });
    const stdev = SD.calculate({ period: length, values: src });

    let upper = [];
    let lower = [];
    for (let i = 0; i < sma.length; i++) {
        upper.push(sma[i] + mult * stdev[i]);
        lower.push(sma[i] - mult * stdev[i]);
    }

    return { upper, lower, basis: sma };
}

// Function to calculate EMA
function calculateEMA(values, period) {
    return EMA.calculate({ period, values });
}

// Function to find the highest and lowest within a lookback period
function findExtremes(data, lookback) {
    let highest = [];
    let lowest = [];
    for (let i = lookback - 1; i < data.length; i++) {
        let slice = data.slice(i - lookback + 1, i + 1);
        highest.push(Math.max(...slice));
        lowest.push(Math.min(...slice));
    }
    return { highest, lowest };
}

// Main function to fetch data, calculate indicators, and add signals
async function processStockData(symbol) {
    try {
        const now = new Date();
        now.setHours(15, 30, 0, 0); // Adjust as needed
        const period2 = now;
        const period1 = new Date(period2.getTime() - (1000 * 5 * 60 * 1000)); // 5 minutes candles

        const queryOptions = { period1, period2, interval: '5m' };
        const result = await yahooFinance.chart(symbol, queryOptions);

        const closePrices = result.quotes.map(entry => entry.close);

        // Calculate Bollinger Bands
        const { upper, lower, basis } = calculateBollingerBands(closePrices, length, mult);

        // Calculate Bollinger Bandwidth using EMA
        const bandwidth = upper.map((u, i) => ((u - lower[i]) / basis[i]) * 100);
        const emaBandwidth = calculateEMA(bandwidth, smaLength);

        // Find the highest expansion and lowest contraction
        const { highest: highestExpansion, lowest: lowestContraction } = findExtremes(bandwidth, lookback);

        // Determine when the Bollinger Bandwidth is near the lowest contraction line and add a signal
        let signals = Array(emaBandwidth.length).fill(null);
        let signalActive = false;
        for (let i = lookback - 1; i < emaBandwidth.length; i++) {
            if (emaBandwidth[i] <= lowestContraction[i - lookback + 1] * 1.1 && !signalActive) { // Start signal
                signalActive = true;
                signals[i] = 'Signal';
            } else if (signalActive) {
                signals[i] = 'Signal';
                if (emaBandwidth[i] < emaBandwidth[i - 1]) { // Stop signal when bandwidth starts falling
                    signalActive = false;
                }
            }
        }

        // Prepare the result with signals
        const readableResult = result.quotes.map((entry, index) => ({
            date: new Date(entry.date).toLocaleString(),
            open: entry.open,
            high: entry.high,
            low: entry.low,
            close: entry.close,
            volume: entry.volume,
            signal: signals[index - (closePrices.length - emaBandwidth.length)] || null // Ensure index alignment
        }));

        console.table(readableResult);
    } catch (error) {
        console.error(error);
    }
}

// Replace 'AAPL' with your stock symbol
processStockData('INFY.NS');


this the final code i'll keep it i also add a singnal when band not touch lowest contraction but rising aftre grater falling look in the image
