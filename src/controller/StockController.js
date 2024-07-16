const path = require('path');

const csv = require('csv-parser');
const stream = require('stream');



const { catchAsyncError } = require("../utils");
const ErrorHandler = require("../utils/ErrorHandler");



exports.insertStocksFromCsvAction = catchAsyncError(async (req, res, next) => {
    if (!req.file) {
        return next(new ErrorHandler("No file uploaded.", 400))
    }

    const results = [];
  const fileStream = new stream.Readable();
  fileStream.push(req.file.buffer);
  fileStream.push(null);

  fileStream
    .pipe(csv())
    .on('data', (data) => {
      // Clean up the keys in the data object
      const cleanedData = {};
      for (let key in data) {
        const cleanedKey = key.trim().replace(/^"|"$/g, ''); // Trim spaces and remove surrounding quotes
        cleanedData[cleanedKey] = data[key];
      }
      results.push(cleanedData);
    })
    .on('end', () => {

        console.log('results', results)
      const symbols = [...new Set(results.map(row => row['SYMBOL \n'] ? row['SYMBOL \n'].trim() : null).filter(Boolean))];
      res.json(symbols);
    })
    .on('error', (err) => {
      res.status(500).send('Error processing file.');
    });
})