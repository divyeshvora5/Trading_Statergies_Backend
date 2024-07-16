const StockData = require("../models/StockData");


function configureSocket(io) {
    global.io = io;
    io.on("connection", (socket) => {
        console.log("Connection established with socketId: ", socket?.id)
    })
}


async function getSelectedStock() {
    const stocks = await StockData.find().lean()
    global.io.emit("FilteredStocks", stocks)
}

module.exports = { configureSocket, getSelectedStock };