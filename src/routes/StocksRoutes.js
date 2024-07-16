const express = require("express");
const multer = require('multer');
const { insertStocksFromCsvAction } = require("../controller/StockController");


const router = express.Router();

const storage = multer.memoryStorage();
const upload = multer({ storage: storage });

router.post("/", upload.single("file"), insertStocksFromCsvAction);

module.exports = router;
