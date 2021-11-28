const Web3 = require('web3');
const fs = require('fs')
let web3 = null
let smartContractNetworkId = null

let contractAbiAdBasedNFTs = null
let contractAddressAdBasedNFTs = null

let contractAbiPaySplitter = null
let contractAddressPaySplitter = null

let contractAbiWebBasedNFTs = null
let contractAddressWebBasedNFTs = null


module.exports = {
  register: async function (config) {
    web3 = new Web3(config.web3ProviderUrl);

    let networkConfig = JSON.parse(fs.readFileSync("./contract-abi/NetworkConfig.json", "utf-8"))
    smartContractNetworkId = networkConfig.smartContractNetworkId

    let contractAdBasedNFTs = JSON.parse(fs.readFileSync("./contract-abi/AdBasedNFTs.json", "utf-8"))
    contractAbiAdBasedNFTs = contractAdBasedNFTs.abi
    contractAddressAdBasedNFTs = networkConfig.contractAddressAdBasedNFTs

    let contractPaySplitter = JSON.parse(fs.readFileSync("./contract-abi/PaySplitter.json", "utf-8"))
    contractAbiPaySplitter = contractPaySplitter.abi
    contractAddressPaySplitter = networkConfig.contractAddressPaySplitter

    let contractWebBasedNFTs = JSON.parse(fs.readFileSync("./contract-abi/WebBasedNFTs.json", "utf-8"))
    contractAbiWebBasedNFTs = contractWebBasedNFTs.abi
    contractAddressWebBasedNFTs = networkConfig.contractAddressWebBasedNFTs

  },
  getAllNftObjects: async function() {
    let contract = new web3.eth.Contract(contractAbi, contractAddress);
    let nfts = await contract.methods.getAllNftObjects().call();
    return nfts
  },
  getContractAbi(){
    return {
      AdBasedNFTs: {
        abi: contractAbiAdBasedNFTs,
        address: contractAddressAdBasedNFTs
      },
      AbiPaySplitter: {
        abi: contractAbiPaySplitter,
        address: contractAddressPaySplitter
      },
      WebBasedNFTs: {
        abi: contractAbiWebBasedNFTs,
        address: contractAddressWebBasedNFTs
      },
      networkId: smartContractNetworkId
    }
  },
  encodeParameters(typeList, valueList){
    return web3.eth.abi.encodeParameters(typeList, valueList);
  },
  GetAllSites: async function() { // TODO: change call
    let contract = new web3.eth.Contract(contractAbiWebBasedNFTs, contractAddressWebBasedNFTs);
    let resArray = await contract.methods.getTokenData().call();
    let nfts = resArray.map(x => {
      return {
        tokenId: x[0],
        ownerWalletAddress: x[1],
        clicks: x[2],
        amount: x[3],
        webURL: x[3],
      }
    })
    return nfts
  },
  GetAllAds: async function() { // TODO: change call
    let contract = new web3.eth.Contract(contractAbiAdBasedNFTs, contractAddressAdBasedNFTs);
    let resArray = await contract.methods.getTokenData().call();
    let nfts = resArray.map(x => {
      return {
        tokenId: x[0],
        ownerWalletAddress: x[1],
        clicks: x[2],
        balance: x[3],
      }
    })
    return nfts
  },
  // TODO: GetAllSites
  // TODO: GetAllAds

}

