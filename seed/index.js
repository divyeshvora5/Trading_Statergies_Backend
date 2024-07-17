require('dotenv').config();
// const { default: yahooFinance } = require('yahoo-finance2');
const db = require('../src/config/DbConnect');
const Config = require('../src/models/Config');
const StocksSymbol = require('../src/models/StocksSymbol');



const nifty200Symbols = [
    'RELIANCE.NS', 'TCS.NS', 'HDFCBANK.NS', 'INFY.NS', 'COALINDIA.NS', 'HINDPETRO.NS', 'KALYANKJIL.NS',
    'HINDUNILVR.NS', 'BPCL.NS', 'INDUSTOWER.NS', 'FACT.NS', 'GODREJPROP.NS', 'TITAN.NS', 'ASIANPAINT.NS',
    'IRFC.NS', 'ADANIGREEN.NS', 'ADANIPOWER.NS', 'SIEMENS.NS', 'BAJAJ-AUTO.NS', 'BAJAJFINSV.NS',
    'NESTLEIND.NS', 'BEL.NS', 'IOC.NS', 'JSWSTEEL.NS', 'JIOFIN.NS', 'VBL.NS', 'TATASTEEL.NS', 'DLF.NS',
    'ZOMATO.NS', 'TRENT.NS', 'TATAMOTORS.NS', 'SBIN.NS', 'ITC.NS', 'WIPRO.NS', 'HCLTECH.NS', 'LT.NS',
    'ICICIBANK.NS', 'AXISBANK.NS', 'TECHM.NS', 'BHARTIARTL.NS', 'MARUTI.NS', 'SUNPHARMA.NS', 'POWERGRID.NS',
    'ULTRACEMCO.NS', 'NTPC.NS', 'KOTAKBANK.NS', 'BAJFINANCE.NS', 'DRREDDY.NS', 'CIPLA.NS', 'GRASIM.NS',
    'ONGC.NS', 'HEROMOTOCO.NS', 'DIVISLAB.NS', 'EICHERMOT.NS', 'TATACONSUM.NS', 'PIDILITIND.NS',
    'DABUR.NS', 'ADANIPORTS.NS', 'SBILIFE.NS', 'HDFCLIFE.NS', 'HAVELLS.NS', 'BRITANNIA.NS', 'JSWSTEEL.NS',
    'M&M.NS', 'LUPIN.NS', 'INDUSINDBK.NS', 'MUTHOOTFIN.NS', 'UPL.NS', 'BIOCON.NS', 'BANDHANBNK.NS',
    'GLAND.NS', 'IPCALAB.NS', 'GAIL.NS', 'MFSL.NS', 'CHOLAFIN.NS', 'SHREECEM.NS', 'BOSCHLTD.NS', 'RECLTD.NS',
    'MGL.NS', 'SRF.NS', 'AMARAJABAT.NS', 'EXIDEIND.NS', 'ZEEL.NS', 'GMRINFRA.NS', 'APOLLOHOSP.NS', 'NMDC.NS',
    'AUROPHARMA.NS', 'PAGEIND.NS', 'BHEL.NS', 'TORNTPOWER.NS', 'SAIL.NS', 'CONCOR.NS', 'DALBHARAT.NS',
    'CANBK.NS', 'TVSMOTOR.NS', 'CUMMINSIND.NS', 'VOLTAS.NS', 'SRTRANSFIN.NS', 'OBEROIRLTY.NS', 'TRENT.NS',
    'HINDZINC.NS', 'MPHASIS.NS', 'COFORGE.NS', 'L&TFH.NS', 'AMBUJACEM.NS', 'RBLBANK.NS', 'BAJAJELEC.NS',
    'METROPOLIS.NS', 'NAM-INDIA.NS', 'SUNTV.NS', 'AUBANK.NS', 'BERGEPAINT.NS', 'LTI.NS', 'BEML.NS',
    'IDFCFIRSTB.NS', 'MFSL.NS', 'SYNGENE.NS', 'POLYCAB.NS', 'YESBANK.NS', 'IIFLWAM.NS', 'TRIDENT.NS',
    'AIAENG.NS', 'ALEMBICLTD.NS', 'ALKEM.NS', 'APLLTD.NS', 'ATUL.NS', 'BALKRISIND.NS', 'BATAINDIA.NS',
    'BEL.NS', 'BHARATFORG.NS', 'BHARATRAS.NS', 'BIRLACORPN.NS', 'BSOFT.NS', 'CENTRALBK.NS',
    'CGCL.NS', 'CREDITACC.NS', 'CSBBANK.NS', 'CUMMINSIND.NS', 'DEEPAKNTR.NS', 'EIHOTEL.NS', 'ESCORTS.NS',
    'FDC.NS', 'FLUOROCHEM.NS', 'FRETAIL.NS', 'GHCL.NS', 'GILLETTE.NS', 'GMDCLTD.NS', 'GODREJIND.NS',
    'GRANULES.NS', 'GSPL.NS', 'HATSUN.NS', 'HDFCAMC.NS', 'HINDCOPPER.NS', 'IBREALEST.NS', 'IDEA.NS',
    'IFCI.NS', 'IGL.NS', 'INDHOTEL.NS', 'INDIGOPNTS.NS', 'IRCTC.NS', 'IRCON.NS', 'JBCHEPHARM.NS',
    'JINDALSTEL.NS', 'JSL.NS', 'KAJARIACER.NS', 'KESORAMIND.NS', 'LAURUSLABS.NS', 'LICHSGFIN.NS',
    'MAHSCOOTER.NS', 'MAHSEAMLES.NS', 'MAZDOCK.NS', 'MOTILALOFS.NS',
    'NATIONALUM.NS', 'NAUKRI.NS', 'NCC.NS', 'NESCO.NS', 'NHPC.NS', 'NLCINDIA.NS', 'OIL.NS', 'PFC.NS',
    'PHOENIXLTD.NS', 'PNBHOUSING.NS', 'RAJESHEXPO.NS', 'RATNAMANI.NS', 'SBICARD.NS', 'SPICEJET.NS',
    'STARCEMENT.NS', 'SUMICHEM.NS', 'SUNDRMFAST.NS', 'SUPREMEIND.NS', 'SUZLON.NS', 'SWSOLAR.NS',
    'TATACHEM.NS', 'TATACOMM.NS', 'TATAELXSI.NS', 'TCIEXP.NS', 'THYROCARE.NS', 'TORNTPOWER.NS',
    'TRENT.NS', 'UJJIVAN.NS', 'VAKRANGEE.NS', 'VGUARD.NS', 'VSTIND.NS', 'WELCORP.NS',
    'ZENSARTECH.NS', 'ZEEL.NS'
];
const remove_dublicates = [...new Set(nifty200Symbols)].map(ele => ({ symbol: ele }));




const seed = async () => {
    try {
        // const quote = await yahooFinance.quote(['RELIANCE.NS']);

        // console.log('quote', quote)


        await Config.deleteMany();
        // await StocksSymbol.deleteMany();

        const config = new Config({
            period: 13,
            requiredCandles: 13,
            batchSize: 10,
            cciLength: 40,
            cciLowerBand: -100,
            cciUpperBand: 100,
            cciLookbackBefore: 3,
            cciLookbackAfter: 3,
            fetchInterval: 5 * 60 * 1000 + 5000, // 5 minutes and 5 seconds
            marketOpenTime: { hour: 9, minute: 15 },
            marketCloseTime: { hour: 15, minute: 30 },
            intervalMinutes: 5,
            lookbackPeriod: 2
        });

        await config.save();

        // await StocksSymbol.insertMany(remove_dublicates)
        console.log('Configuration initialized');
        process.exit(0);
    } catch (err) {
        console.log('err', err)
    }
}

db.on('error', console.error.bind(console, 'MongoDB connection error:'));
db.once('open', () => {
    console.log('Connected to MongoDB');

    seed()
});
