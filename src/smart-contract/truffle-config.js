const HDWalletProvider = require("@truffle/hdwallet-provider");
let privateKey = "PRIVATE_KEY_GOES_HERE"

module.exports = {
  networks: {
    development: {
      host: "127.0.0.1",
      port: 7545,
      network_id: "*"
    },
    test: {
      host: "127.0.0.1",
      port: 7545,
      network_id: "*"
    },
    kovan: {
      provider: function (){
        return new HDWalletProvider({
          privateKeys: [privateKey],
          providerOrUrl: "https://kovan.infura.io/v3/API_KEY_GOES_HERE"
        })
      },
      network_id: 42
    },
  },
  compilers: {
    solc: {
      version: "0.8.0",
    },
  },
  plugins: [
    'truffle-plugin-verify'
  ],
  api_keys: {
    etherscan: 'API_KEY_GOES_HERE'
  }
};
