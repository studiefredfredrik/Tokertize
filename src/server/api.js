module.exports = {
  register: async function (memoryCache, mongoDataProvider, app, adRenderer, moralisUserDataProvider, contractDataProvider) {
    const getRequestIp = (req) => {
      let ip = req.headers['x-forwarded-for']?.split(',').shift() || req.socket?.remoteAddress
      if(ip === '127.0.0.1') return Math.random() // Just make dev life easier
      console.log('Ip:::', ip, 'Header:::', 'Socket:::', req.socket?.remoteAddress)
      console.log('Test:::', req.headers['X-Forwarded-For'])
      // return ip
      return Math.random() // TODO: this is just for testing, use above line
    }

    // GETs
    app.get('/api/link/:SITE/view', async function (req, res) { // Note: Changed url from /ads to /link since the first one was picked up by ad-block :D
      let SITE = parseInt(req.params.SITE)
      if(!memoryCache.allSites.some(x => x._id === SITE)){
        return res.status(400).send('Invalid site code') // Site not registered with us
      }

      // Selecting an ad from all the available ads
      let indexOfAdToShow = Math.floor(Math.random() * memoryCache.allAds.length);

      // Check for entry in IP filter, so we don't log spamming of endpoint in statistics. Return the ad regardless
      let requestIp = getRequestIp(req)
      if(memoryCache.ipFilterLastViewIp[requestIp] > Date.now()){
        adRenderer.renderAd(memoryCache.allAds[indexOfAdToShow], res, SITE)
        return
      }

      // Adding IP to filter dictionary
      memoryCache.ipFilterLastViewIp[requestIp] = Date.now() + (1000 * 60 * 5)

      // Register statistics and return the ad
      let selectedAdCode = memoryCache.allAds[indexOfAdToShow]._id
      memoryCache.siteAdViews[SITE] = (memoryCache.siteAdViews[SITE] || 0) + 1
      memoryCache.adCodeViews[selectedAdCode] = (memoryCache.adCodeViews[selectedAdCode] || 0) + 1
      adRenderer.renderAd(memoryCache.allAds[indexOfAdToShow], res, SITE)
    })

    app.get('/api/link/:SITE/click/:AD_CODE', async function (req, res) {
      let SITE = parseInt(req.params.SITE)
      let AD_CODE = parseInt(req.params.AD_CODE)
      if(!memoryCache.allSites.some(x => x._id === SITE)){
        return res.status(400).send('Invalid site code') // Site not registered with us
      }

      let selectedAd = memoryCache.allAds.find(x => x._id === AD_CODE)
      if(!selectedAd){
        return res.status(400).send('Invalid ad code') // Ad not registered with us
      }

      // Check for entry in IP filter, so we don't log spamming of endpoint in statistics. Redirect to url in ad regardless
      let requestIp = getRequestIp(req)
      if(memoryCache.ipFilterLastViewIp[requestIp] > Date.now()){
        res.redirect(selectedAd.url)
        return
      }

      // Adding IP to filter dictionary
      memoryCache.ipFilterLastViewIp[requestIp] = Date.now() + (1000 * 60 * 5)

      // Register statistics and redirect to url in ad
      memoryCache.siteAdCodeClicks[SITE] = (memoryCache.siteAdCodeClicks[SITE] || 0) + 1
      memoryCache.adCodeClicks[AD_CODE] = (memoryCache.adCodeClicks[AD_CODE] || 0) + 1
      res.redirect(selectedAd.url)
    })

    app.get('/api/statistics/contract/:FROM/:TO/', async function (req, res) {
      // TODO: We need several statistics endpoints, but priority 1 is the endpoint that will be called with the chainlink keeper to update contracts balances
      // To achieve this with a small but consistent result set we will group the results as two dictionaries <AD_CODE, CLICKS> and <SITE, CLICKS>
      // we will also group what we scrape from the cache and save to mongo by a set amount of milliseconds, same amount as defined in the 'readyForUpkeep'
      // in our smart contract. For example 3600 * 1000 (1hr) or 3600 * 1000 * 24 (1 day)
      // This endpoint will return the result sets from mongo that match between those FROM to TO milliseconds
    })

    app.get('/api/statistics/user/:SESSION_TOKEN', async function (req, res) {
      if (!req.params?.SESSION_TOKEN) {
        return res.status(400).send('400 - Invalid params')
      }
      let user = await moralisUserDataProvider.validateAndGetUserFromSessionIdWithMorailsApi(req.params.SESSION_TOKEN)
      if(!user.ethAddress) return res.status(500).send('500 - Unable to get user ethAddress')

      let adsForUser = await mongoDataProvider.getAdsByUserEthAddress(user.ethAddress);
      for (const ad of adsForUser) {
        let views = await mongoDataProvider.getAdCodeViewsTotal(ad._id)
        let clicks = await mongoDataProvider.getAdCodeClicksTotal(ad._id)
        ad.views = views
        ad.clicks = clicks
      }
      let sitesForUser = await mongoDataProvider.getSitesByUserEthAddress(user.ethAddress)
      for (const site of sitesForUser) {
        let views = await mongoDataProvider.getSiteAdViewsTotal(site._id)
        let clicks = await mongoDataProvider.getSiteAdCodeClicksTotal(site._id)
        site.views = views
        site.clicks = clicks
      }

      let userStatistics = {
        ads: adsForUser,
        sites: sitesForUser
      }
      res.status(200).send(userStatistics)
    })

    // Interaction API endpoints
    app.post('/api/subscribe', async function (req, res) {
      if (!req.body?.emailAddress || !req.body.emailAddress?.includes('@')) {
        return res.status(400).send('400 - Invalid payload')
      }
      await mongoDataProvider.addSubscriber(req.body.emailAddress)
      res.status(200).send({})
    })

    app.post('/api/register/site', async function (req, res) {
      if ( !req.body?.sessionToken
        || !req.body?.site
      ) {
        return res.status(400).send('400 - Invalid payload')
      }
      let user = await moralisUserDataProvider.validateAndGetUserFromSessionIdWithMorailsApi(req.body.sessionToken)
      if(!user.ethAddress) return res.status(500).send('500 - Unable to get user ethAddress')
      let savedSite = {
        userEthAddress: user.ethAddress,
        domain: req.body.site.domain,
      }
      await mongoDataProvider.saveSite(savedSite)
      memoryCache.allSites.push(savedSite)
      res.status(200).send({siteId: savedSite._id})
    })

    app.post('/api/register/ad', async function (req, res) {
      if ( !req.body?.sessionToken
        || !req.body.ad
      ) {
        return res.status(400).send('400 - Invalid payload')
      }
      let user = await moralisUserDataProvider.validateAndGetUserFromSessionIdWithMorailsApi(req.body.sessionToken)
      if(!user.ethAddress) return res.status(500).send('500 - Unable to get user ethAddress')
      let savedAd = {
        userEthAddress: user.ethAddress,
        type: req.body.ad.type,
        url: req.body.ad.url,
        line1: req.body.ad.line1,
        line2: req.body.ad.line2,
        line3: req.body.ad.line3,
        imgDataUrl: req.body.ad.imgDataUrl,
        size: req.body.ad.size
      }
      await mongoDataProvider.saveAd(savedAd)
      memoryCache.allAds.push(savedAd)
      res.status(200).send({adId: savedAd._id})
    })

    // Contract endpoints
    app.get('/api/contract/nfts', async function (req, res) {
      let result = await contractDataProvider.getAllNftObjects()
      res.status(200).send(result)
    })

    app.get('/api/contract/abi', async function (req, res) {
      let result = contractDataProvider.getContractAbi()
      if(result.networkId === 5777) result.networkId = 1337 // Mismatched dev stuff
      res.status(200).send(result)
    })

    app.get('/api/contract/sites', async function (req, res) {
      let sites = await contractDataProvider.GetAllSites()
      res.status(200).send(sites)
    })

    app.get('/api/contract/ads', async function (req, res) {
      let ads = await contractDataProvider.GetAllAds()
      res.status(200).send(ads)
    })

    app.get('/api/developer/memoryCache', async function (req, res) {
      let ads = memoryCache.allAds
      let sites = memoryCache.allSites
      res.status(200).send({
        ads: ads,
        sites: sites
      })
    })


    // Statistics getters
    app.get('/api/statistics/ads/:AD/views', async function (req, res) {
      let AD = parseInt(req.params.AD)
      let views = await mongoDataProvider.getAdCodeViewsTotal(AD)
      res.status(200).send({views: views})
    })

    app.get('/api/statistics/ads/:AD/views/:FROM/:TO', async function (req, res) {
      let AD = parseInt(req.params.AD)
      let FROM = parseInt(req.params.FROM)
      let TO = parseInt(req.params.TO)
      let views = await mongoDataProvider.getAdCodeViewsInPeriod(AD, FROM, TO)
      res.status(200).send({views: views})
    })

    app.get('/api/statistics/ads/:AD/clicks', async function (req, res) {
      let AD = parseInt(req.params.AD)
      let views = await mongoDataProvider.getAdCodeClicksTotal(AD)
      res.status(200).send({views: views})
    })

    app.get('/api/statistics/ads/:AD/clicks/:FROM/:TO', async function (req, res) {
      let AD = parseInt(req.params.AD)
      let FROM = parseInt(req.params.FROM)
      let TO = parseInt(req.params.TO)
      let views = await mongoDataProvider.getAdCodeClicksInPeriod(AD, FROM, TO)
      res.status(200).send({views: views})
    })

    app.get('/api/statistics/sites/:SITE/views', async function (req, res) {
      let SITE = parseInt(req.params.SITE)
      let views = await mongoDataProvider.getSiteAdViewsTotal(SITE)
      res.status(200).send({views: views})
    })

    app.get('/api/statistics/sites/:SITE/views/:FROM/:TO', async function (req, res) {
      let SITE = parseInt(req.params.SITE)
      let FROM = parseInt(req.params.FROM)
      let TO = parseInt(req.params.TO)
      let views = await mongoDataProvider.getSiteAdViewsInPeriod(SITE, FROM, TO)
      res.status(200).send({views: views})
    })

    app.get('/api/statistics/sites/:SITE/clicks', async function (req, res) {
      let SITE = parseInt(req.params.SITE)
      let views = await mongoDataProvider.getSiteAdCodeClicksTotal(SITE)
      res.status(200).send({views: views})
    })

    app.get('/api/statistics/sites/:SITE/clicks/:FROM/:TO', async function (req, res) {
      let SITE = parseInt(req.params.SITE)
      let FROM = parseInt(req.params.FROM)
      let TO = parseInt(req.params.TO)
      let views = await mongoDataProvider.getSiteAdCodeClicksInPeriod(SITE, FROM, TO)
      res.status(200).send({views: views})
    })

    // Chainlink endpoints
    app.get('/api/oracle/sites/:SITE/clicks/:FROM', async function (req, res) {
      let SITE = parseInt(req.params.SITE)
      let FROM = parseInt(req.params.FROM)
      let clicks = await mongoDataProvider.getSiteAdCodeClicksInPeriod(SITE, FROM, Date.now())
      res.status(200).send({clicks: clicks})
    })
    app.get('/api/oracle/ads/:AD/clicks/:FROM', async function (req, res) {
      let AD = parseInt(req.params.AD)
      let FROM = parseInt(req.params.FROM)
      let clicks = await mongoDataProvider.getAdCodeClicksInPeriod(AD, FROM, Date.now())
      res.status(200).send({clicks: clicks})
    })

    // NFT metadata endpoints
    app.get('/api/metadata/sites/:SITE', async function (req, res) {
      let SITE = parseInt(req.params.SITE)
      if(isNaN(SITE)) return res.status(500).send('Bad tokenId')

      if(memoryCache.siteMetadataCache[SITE]) return res.status(200).send(memoryCache.siteMetadataCache[SITE])

      let siteDoc = memoryCache.allSites.find(x => x._id === SITE)
      let clicks = await mongoDataProvider.getSiteAdCodeClicksTotal(SITE)
      let views = await mongoDataProvider.getSiteAdViewsTotal(SITE)

      let metadata = {
        "description": `wTKTZ tokenized website`,
        "external_url": "https://nftmarathon.xyz/#/", // TODO: Create a page for viewing sites and ads and put url here
        "image": "https://nftmarathon.xyz/android-chrome-192x192.png", // maybe remove this, and render an image as SVG and use image_data instead
        "name": `${siteDoc.domain}`,
        "background_color": '03a9f4', // blue
        "attributes": [
          {
            "display_type": "number",
            "trait_type": "Views",
            "value": views
          },
          {
            "display_type": "number",
            "trait_type": "Clicks",
            "value": clicks
          }
        ],
      }

      memoryCache.siteMetadataCache[SITE] = metadata

      res.status(200).send(metadata)
    })
    app.get('/api/metadata/ads/:AD', async function (req, res) {
      let AD = parseInt(req.params.AD)
      if(isNaN(AD)) return res.status(500).send('Bad tokenId')

      if(memoryCache.adMetadataCache[AD]) return res.status(200).send(memoryCache.adMetadataCache[AD])

      let adDoc = memoryCache.allAds.find(x => x._id === AD)
      let clicks = await mongoDataProvider.getAdCodeClicksTotal(AD)
      let views = await mongoDataProvider.getAdCodeViewsTotal(AD)

      let metadata = {
        "description": `aTKTZ tokenized ad`,
        "external_url": "https://nftmarathon.xyz/#/", // TODO: Create a page for viewing sites and ads and put url here
        "image": "https://nftmarathon.xyz/android-chrome-192x192.png", // maybe remove this, and render an image as SVG and use image_data instead
        "name": `${adDoc.url}`,
        "background_color": 'e91e63', // red
        "attributes": [
          {
            "display_type": "number",
            "trait_type": "Views",
            "value": views
          },
          {
            "display_type": "number",
            "trait_type": "Clicks",
            "value": clicks
          },
          {
            "trait_type": "Size",
            "value": adDoc.size
          },
        ],
      }

      memoryCache.adMetadataCache[AD] = metadata

      res.status(200).send(metadata)
    })

  }
}