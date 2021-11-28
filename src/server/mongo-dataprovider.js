let db = null
const mongodb = require('mongodb');
const MongoClient = require('mongodb').MongoClient;
const ObjectID = require('mongodb').ObjectID;

let getNextSequence = async (db, name) => {
  let ret = await db.collection('counters').findOneAndUpdate({_id: name}, {$inc: {seq: 1}});
  return ret.value.seq;
}

module.exports = {
  register: async function (app, config) {
    const client = new MongoClient(config.mongoConnectionString);
    try {
      await client.connect();
      db = client.db(config.mongoDataBaseName);
      try{
        await db.createCollection('counters').catch(() => console.log('Collection counters exists')); // Used for numeric id's
        await db.collection('counters').insertOne({_id: "sites", seq: 1000 }).catch(() => console.log('Counter for sites exists'))
        await db.collection('counters').insertOne({_id: "ads", seq: 1000 }).catch(() => console.log('Counter for ads exists'))

        await db.createCollection('subscribers').catch(() => console.log('Collection subscribers exists'));
        await db.createCollection('ads').catch(() => console.log('Collection ads exists'));
        await db.createCollection('sites').catch(() => console.log('Collection sites exists'));
        await db.createCollection('adCodeViews').catch(() => console.log('Collection adCodeViews exists'));
        await db.createCollection('siteAdViews').catch(() => console.log('Collection siteAdViews exists'));
        await db.createCollection('adCodeClicks').catch(() => console.log('Collection adCodeClicks exists'));
        await db.createCollection('siteAdCodeClicks').catch(() => console.log('Collection siteAdCodeClicks exists'));

        // await db.collection('ads').createIndex( { "pendingSince": 1 }, { expireAfterSeconds: 3600 } ) .catch(() => console.log('Ads index 1 exists'));
        await db.collection('adCodeViews').createIndex( { "ad": 1 } ) .catch(() => console.log('Ads index 2 exists'));
        await db.collection('adCodeClicks').createIndex( { "ad": 1 } ) .catch(() => console.log('Ads index 3 exists'));
        // await db.collection('sites').createIndex( { "pendingSince": 1 }, { expireAfterSeconds: 3600 } ) .catch(() => console.log('Sites index 1 exists'));
        await db.collection('siteAdViews').createIndex( { "site": 1 } ) .catch(() => console.log('Sites index 2 exists'));
        await db.collection('siteAdCodeClicks').createIndex( { "site": 1 } ) .catch(() => console.log('Sites index 3 exists'));
      } catch (ex1){
        console.log(`Mongo init warning: ${ex1.message}`)
      }
      // TODO: Should have indexes on all queried fields in statistics collections
    } catch (ex){
      console.log('Mongo init error:')
      console.log(ex)
      process.exit(1);
    }
  },
  // Mail subscriptions
  getSubscribers: async function() {
    return db.collection('subscribers').find({}).toArray()
  },
  addSubscriber: async function (emailAddress) {
    let info = {
      emailAddress: emailAddress,
      subscribedAt: Date.now()
    }
    await db.collection('subscribers').updateOne({emailAddress: emailAddress}, {$set: {info: info}}, {upsert: true})
  },

  // Ads
  getAds: async function() {
    return db.collection('ads').find({}).toArray()
  },
  getAdsByUserEthAddress: async function(userEthAddress) {
    return db.collection('ads').find({userEthAddress: userEthAddress}).toArray()
  },
  saveAd: async function(ad) {
    ad._id = await getNextSequence(db, 'ads')
    ad.active = false
    ad.pendingSince = new Date()
    await db.collection('ads').insertOne(ad)
    return ad._id // Mongo magic
  },
  setAdActiveStatus: async function(id, status) {
    await db.collection('ads').updateOne({_id: id}, {$set: {active: status}})
  },

  // Sites
  getSites: async function() {
    return db.collection('sites').find({}).toArray()
  },
  getSitesByUserEthAddress: async function(userEthAddress) {
    return db.collection('sites').find({userEthAddress: userEthAddress}).toArray()
  },
  saveSite: async function(site) {
    site._id = await getNextSequence(db, 'sites')
    site.active = false
    site.pendingSince = new Date()
    await db.collection('sites').insertOne(site)
    return site._id
  },
  setSiteActiveStatus: async function(id, status) {
    await db.collection('sites').updateOne({_id: id}, {$set: {active: status}})
  },

  // Statistics inserts
  insertAdCodeViews: async function(adCodeViews) {
    let adCodeViewsArray = Object.keys(adCodeViews).map(ad => {
      return {
        ad: parseInt(ad),
        views: adCodeViews[ad],
        timestamp: Date.now()
      }
    })
    if(!adCodeViewsArray.some(i => true)) return
    await db.collection('adCodeViews').insertMany(adCodeViewsArray)
  },
  insertSiteAdViews: async function(siteAdViews) {
    let siteAdViewsArray = Object.keys(siteAdViews).map(site => {
      return {
        site: parseInt(site),
        views: siteAdViews[site],
        timestamp: Date.now()
      }
    })
    if(!siteAdViewsArray.some(i => true)) return
    await db.collection('siteAdViews').insertMany(siteAdViewsArray)
  },
  insertAdCodeClicks: async function(adCodeClicks) {
    let adCodeClicksArray = Object.keys(adCodeClicks).map(ad => {
      return {
        ad: parseInt(ad),
        clicks: adCodeClicks[ad],
        timestamp: Date.now()
      }
    })
    if(!adCodeClicksArray.some(i => true)) return
    await db.collection('adCodeClicks').insertMany(adCodeClicksArray)
  },
  insertSiteAdCodeClicks: async function(siteAdCodeClicks) {
    let siteAdCodeClicksArray = Object.keys(siteAdCodeClicks).map(site => {
      return {
        site: parseInt(site),
        clicks: siteAdCodeClicks[site],
        timestamp: Date.now()
      }
    })
    if(!siteAdCodeClicksArray.some(i => true)) return
    await db.collection('siteAdCodeClicks').insertMany(siteAdCodeClicksArray)
  },

  // Statistics getters
  getAdCodeViewsTotal: async function(ad) {
    let cursor = await db.collection('adCodeViews').aggregate(
      [
        { $match: { ad: ad } },
        { $group: { _id: ad, views: { $sum:"$views" } } }
      ])
    let arr = await cursor.toArray()
    if(arr && arr.length >= 1) return arr[0].views
    return 0
  },
  getAdCodeViewsInPeriod: async function(ad, from, to) {
    let cursor = await db.collection('adCodeViews').aggregate(
      [
        { $match: {
          $and: [
            { ad: ad },
            { timestamp: {$gt: from }},
            { timestamp: {$lt: to }}
          ]}},
        { $group: { _id: ad, views: { $sum:"$views" } } }
      ])
    let arr = await cursor.toArray()
    if(arr && arr.length >= 1) return arr[0].views
    return 0
  },
  getAdCodeClicksTotal: async function(ad) {
    let cursor = await db.collection('adCodeClicks').aggregate(
      [
        { $match: { ad: ad } },
        { $group: { _id: ad, clicks: { $sum:"$clicks" } } }
      ])
    let arr = await cursor.toArray()
    if(arr && arr.length >= 1) return arr[0].clicks
    return 0
  },
  getAdCodeClicksInPeriod: async function(ad, from, to) {
    let cursor = await db.collection('adCodeClicks').aggregate(
      [
        { $match: {
            $and: [
              { ad: ad },
              { timestamp: {$gt: from }},
              { timestamp: {$lt: to }}
            ]}},
        { $group: { _id: ad, clicks: { $sum:"$clicks" } } }
      ])
    let arr = await cursor.toArray()
    if(arr && arr.length >= 1) return arr[0].clicks
    return 0
  },


  getSiteAdViewsTotal: async function(site) {
    let cursor = await db.collection('siteAdViews').aggregate(
      [
        { $match: { site: site } },
        { $group: { _id: site, views: { $sum:"$views" } } }
      ])
    let arr = await cursor.toArray()
    if(arr && arr.length >= 1) return arr[0].views
    return 0
  },
  getSiteAdViewsInPeriod: async function(site, from, to) {
    let cursor = await db.collection('siteAdViews').aggregate(
      [
        { $match: {
            $and: [
              { site: site },
              { timestamp: {$gt: from }},
              { timestamp: {$lt: to }}
            ]}},
        { $group: { _id: site, views: { $sum:"$views" } } }
      ])
    let arr = await cursor.toArray()
    if(arr && arr.length >= 1) return arr[0].views
    return 0
  },
  getSiteAdCodeClicksTotal: async function(site) {
    let cursor = await db.collection('siteAdCodeClicks').aggregate(
      [
        { $match: { site: site } },
        { $group: { _id: site, clicks: { $sum:"$clicks" } } }
      ])
    let arr = await cursor.toArray()
    if(arr && arr.length >= 1) return arr[0].clicks
    return 0
  },
  getSiteAdCodeClicksInPeriod: async function(site, from, to) {
    let cursor = await db.collection('siteAdCodeClicks').aggregate(
      [
        { $match: {
            $and: [
              { ad: site },
              { timestamp: {$gt: from }},
              { timestamp: {$lt: to }}
            ]}},
        { $group: { _id: site, clicks: { $sum:"$clicks" } } }
      ])
    let arr = await cursor.toArray()
    if(arr && arr.length >= 1) return arr[0].clicks
    return 0
  },


}

