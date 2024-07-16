const schedule = require('node-schedule');
const StockData = require('../models/StockData');

function getNextFetchTime(marketOpenTime, intervalMinutes) {
    const now = new Date();
    const nextFetchTime = new Date(now);

    const minutesSinceOpen = ((now.getHours() * 60 + now.getMinutes()) - (marketOpenTime.hour * 60 + marketOpenTime.minute));
    const minutesUntilNextFetch = intervalMinutes - (minutesSinceOpen % intervalMinutes);

    nextFetchTime.setMinutes(nextFetchTime.getMinutes() + minutesUntilNextFetch);
    nextFetchTime.setSeconds(0, 0);

    return nextFetchTime;
}

function scheduleFetch({ fetchFunction }) {
    const marketOpenTime = global.config.marketOpenTime;
    const marketCloseTime = global.config.marketCloseTime;
    const intervalMinutes = global.config.intervalMinutes;

    // Fetch data immediately
    fetchFunction();

    // Calculate the next fetch time
    const nextFetchTime = getNextFetchTime(marketOpenTime, intervalMinutes);
    console.log(`Next fetch scheduled at: ${nextFetchTime}`);

    // Schedule the initial fetch
    const initialDelay = nextFetchTime - new Date();
    setTimeout(() => {
        fetchFunction();
        // Set up the recurring schedule
        const rule = new schedule.RecurrenceRule();
        rule.minute = new schedule.Range(0, 59, intervalMinutes);

        schedule.scheduleJob(rule, async () => {
            const now = new Date();
            const marketOpen = new Date();
            marketOpen.setHours(marketOpenTime.hour, marketOpenTime.minute, 0, 0);

            const marketClose = new Date();
            marketClose.setHours(marketCloseTime.hour, marketCloseTime.minute, 0, 0);

            if (now >= marketOpen && now <= marketClose) {
                await StockData.deleteMany();
                await fetchFunction();
            } else {
                console.log('Market is closed. Skipping fetch.');
            }
        });
    }, initialDelay);
}

module.exports = { scheduleFetch };
