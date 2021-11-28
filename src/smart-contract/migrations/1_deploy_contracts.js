const PaySplitter = artifacts.require("./PaySplitter.sol");
const AdBasedNFTs = artifacts.require("./AdBasedNFTs.sol");
const WebBasedNFTs = artifacts.require("./WebBasedNFTs.sol");
const baseTokenUriAds = "https://nftmarathon.xyz/api/metadata/ads/"
const baseTokenUriSites = "https://nftmarathon.xyz/api/metadata/sites/"
let address0 = "0x0000000000000000000000000000000000000000";
let testNetLinkAddress = "0xcbd9f14eAc13C2A4d508abC4FC294E4af298d4DB";

module.exports = async function(deployer, network) {
  let linkAddress = ['development', 'test'].includes(network) ? testNetLinkAddress : address0 // null address will be auto resolved by contract

  await deployer.deploy(PaySplitter, linkAddress)

  const instanceOfPaySplitter = await PaySplitter.deployed()
  const instanceOfAdBasedNFTs = await deployer.deploy(AdBasedNFTs, baseTokenUriAds, instanceOfPaySplitter.address, linkAddress)
  const instanceOfWebBasedNFTs = await deployer.deploy(WebBasedNFTs, baseTokenUriSites, instanceOfPaySplitter.address, linkAddress)
  console.log('---------INSTANCE ADDRESSES--------------')
  console.log('PaySplitter:')
  console.log(instanceOfPaySplitter.address)
  console.log('AdBasedNFTs:')
  console.log(instanceOfAdBasedNFTs.address)
  console.log('WebBasedNFTs:')
  console.log(instanceOfWebBasedNFTs.address)
  console.log('--object--')
  console.log(JSON.stringify({
    "contractAddressAdBasedNFTs": instanceOfAdBasedNFTs.address,
    "contractAddressPaySplitter": instanceOfPaySplitter.address,
    "contractAddressWebBasedNFTs": instanceOfWebBasedNFTs.address,
    "smartContractNetworkId": network
  }))
  console.log('---------INSTANCE ADDRESSES--------------')
};