const express = require("express");
const multer = require('multer');
const { insertStocksFromCsvAction, getIndicesAction, setIndexForFilteredStocksAction } = require("../controller/StockController");


const router = express.Router();

const storage = multer.memoryStorage();
const upload = multer({ storage: storage });

router.get("/index", getIndicesAction)
router.post("/", upload.single("file"), insertStocksFromCsvAction);
router.post("/index", setIndexForFilteredStocksAction);

module.exports = router;
