let express = require('express');
let bodyParser = require('body-parser');
let cookieParser = require('cookie-parser');
let swaggah = require('./swaggah');
let contractDataProvider = require('./contract-dataprovider')
let mongoDataProvider = require('./mongo-dataprovider')
let moralisUserDataProvider = require('./moralis-user-provider')
let adRenderer = require('./ad-renderer')
let api = require('./api')
let scheduledJobs = require('./scheduled-jobs')


let config = {
  port: 5000,
  mongoConnectionString: process.env.MONGO_URL ?? 'mongodb://HASTILY_REDACTED/nftmarathon?authSource=admin',
  mongoDataBaseName: process.env.MONGO_DATABASE_NAME ?? 'nftmarathon',
  moralisServerUrl: process.env.VUE_APP_MORALIS_SERVER_URL ?? 'https://HASTILY_REDACTED.usemoralis.com:2053/server',
  moralisAppId: process.env.VUE_APP_MORALIS_APP_ID ?? 'HASTILY_REDACTED',
  moralisInstallationId: process.env.VUE_APP_MORALIS_INSTALLATION_ID ?? 'HASTILY_REDACTED',
  statisticsSaveInterval: process.env.STATISTICS_SAVE_INTERVAL ?? 1000 * 60 * 2, // Note that even tho the ENV variable is a string it doesn't matter since this is javascript :D
  baseUrl: process.env.AD_BASE_URL ?? 'http://localhost:8080',
  web3ProviderUrl: process.env.WEB3_PROVIDER_URL ?? 'http://127.0.0.1:7545',
  smartContractAddress: process.env.SMART_CONTRACT_ADDRESS ?? null,
  smartContractNetworkId: process.env.SMART_CONTRACT_NETWORK_ID ?? null,
}

let start = async () => {
  let app = express();
  app.use('/', express.static('./../frontend/dist'))
  app.use(cookieParser());
  app.use(bodyParser.json({ limit: '1mb' })); // base64 string images in ads
  app.use(bodyParser.urlencoded({extended: true}));


  // Infrastructure
  let memoryCache = {
    ipFilterLastViewIp: {},
    allAds: [], // TODO: Create scheduled job that syncs  allAds and allSites from what is saved in the smart contract
    allSites: [],
    adCodeViews: {},
    siteAdViews: {},
    adCodeClicks: {},
    siteAdCodeClicks: {},
    adMetadataCache: {},
    siteMetadataCache: {},
  }

  await contractDataProvider.register(config)
  await mongoDataProvider.register(app, config)
  await moralisUserDataProvider.register(config)
  await adRenderer.register(config)
  await scheduledJobs.register(memoryCache, mongoDataProvider, contractDataProvider, config)
  await api.register(memoryCache, mongoDataProvider, app, adRenderer, moralisUserDataProvider, contractDataProvider)
  swaggah.register(app)

  process.on('uncaughtException', (error)  => {
    console.log(error);
  })

  process.on('unhandledRejection', (error, promise) => {
    console.log('unhandledRejection', error);
  });

  console.log(`Server running on port: ${config.port}`)
  app.listen(config.port)
}

start().then(x => {

}).catch(ex => {
  console.log(ex)
})
