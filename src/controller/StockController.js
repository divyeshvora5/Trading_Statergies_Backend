const path = require('path');

const csv = require('csv-parser');
const stream = require('stream');



const { catchAsyncError } = require("../utils");
const ErrorHandler = require("../utils/ErrorHandler");
const StocksSymbol = require('../models/StocksSymbol');
const { startFetchingData } = require('../data/stockFilter');


exports.getIndicesAction = catchAsyncError(async (req, res, next) => {
  const indices = await StocksSymbol.distinct('indices');

  console.log('indices', indices)
  res.status(200).json(indices);
})

exports.insertStocksFromCsvAction = catchAsyncError(async (req, res, next) => {
  if (!req.file) {
    return next(new ErrorHandler("No file uploaded.", 400))
  }

  const indices = req.body.indices;

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
    .on('end', async () => {
      const symbols = [...new Set(results.map(row => row['SYMBOL \n'] ? `${row['SYMBOL \n'].trim()}.NS` : null).filter(Boolean))];
      const filteredSymbols = symbols.filter(symbol => !symbol.includes(' ')).map(symbol => ({ symbol, indices }));

      await StocksSymbol.insertMany(filteredSymbols);

      res.status(200).json(filteredSymbols);
    })
    .on('error', (err) => {
      res.status(500).send('Error processing file.');
    });
})

exports.setIndexForFilteredStocksAction = catchAsyncError(async (req, res, next) => {
  const indices = req.body;
  global.config.defaultIndices = indices;
  startFetchingData();
  res.status(200).json({ message: 'Indices set successfully' });
})