module.exports = {
  register: async function (memoryCache, mongoDataProvider, contractDataProvider, config) {
    setInterval(async () => {
      // Saving statistics
      try {
        await mongoDataProvider.insertAdCodeViews(memoryCache.adCodeViews)
        memoryCache.adCodeViews = {}
        await mongoDataProvider.insertSiteAdViews(memoryCache.siteAdViews)
        memoryCache.siteAdViews = {}
        await mongoDataProvider.insertAdCodeClicks(memoryCache.adCodeClicks)
        memoryCache.adCodeClicks = {}
        await mongoDataProvider.insertSiteAdCodeClicks(memoryCache.siteAdCodeClicks)
        memoryCache.siteAdCodeClicks = {}
      } catch (ex) {
        console.log('statisticsSaveInterval is broken', ex)
      }

      // Resetting metadata cache
      memoryCache.siteMetadataCache = {}
      memoryCache.adMetadataCache = {}

    }, config.statisticsSaveInterval)

    setInterval(async () => {
      // Fetching sites and ads from mongo and
      try{
        let allAdsInContract = await contractDataProvider.GetAllAds()
        let allSitesInContract = await contractDataProvider.GetAllSites()

        let allAdsInMongo = await mongoDataProvider.getAds()
        let allSitesInMongo = await mongoDataProvider.getSites()

        let allAdsWithBalance = []
        let allSitesMinted = []

        allAdsInContract.forEach(ad => {
          let adInMongo = allAdsInMongo.find(x => x._id === parseInt(ad.tokenId))
          if(!adInMongo) return
          if(!adInMongo.active && parseFloat(ad.balance) > 0){
            mongoDataProvider.setAdActiveStatus(adInMongo._id, true)
          }
          if(adInMongo.active && parseFloat(ad.balance) < 0.1){
            mongoDataProvider.setAdActiveStatus(adInMongo._id, false)
          }
          if(parseFloat(ad.balance) > 0){
            allAdsWithBalance.push(adInMongo)
          }
        })

        allSitesInContract.forEach(site => {
          let siteInMongo = allSitesInMongo.find(x => x._id === parseInt(site.tokenId))
          if(!siteInMongo) return
          if(!siteInMongo.active) mongoDataProvider.setSiteActiveStatus(siteInMongo._id, true)
          allSitesMinted.push(siteInMongo)
        })

        memoryCache.allAds = allAdsWithBalance
        memoryCache.allSites = allSitesMinted

      } catch (ex)
      {
        console.log('fetching sites/ads from mongo/contract is broken', ex)
      }
    }, config.statisticsSaveInterval)

    memoryCache.allAds = await mongoDataProvider.getAds()
    memoryCache.allSites = await mongoDataProvider.getSites()
  }
}