let axios = require('axios')
let currentConfig = {}
let userCacheDictionary2 = {}

module.exports = {
  register: async function (config) {

    currentConfig = config
  },
  validateAndGetUserFromSessionIdWithMorailsApi: async function(sessionToken) { // TODO: Keep this method and purge rest of the file unless i find how to use the proper Moralis methods
    if(userCacheDictionary2[sessionToken]) return userCacheDictionary2[sessionToken]

    let res = await axios.post(`${currentConfig.moralisServerUrl}/classes/_User`, {
      "_ApplicationId": currentConfig.moralisAppId,
      "_InstallationId": currentConfig.moralisInstallationId,
      "limit": 1,
      "_SessionToken": sessionToken,
      "_method": "GET"
    })
    if(res.status !== 200) return null
    if(res.data?.results?.length === 0) return null
    let user = res.data?.results[0]
    userCacheDictionary2[sessionToken] = user
    return user
  },
}
