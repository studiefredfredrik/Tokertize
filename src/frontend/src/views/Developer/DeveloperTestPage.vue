<template>
  <div>
    <div v-if="isLoggedIn">Logged in</div>
    <div v-if="!isLoggedIn">NOT LOGGED IN</div>
    <v-btn @click="interactWithSmartContract()">Test smart contract interaction 1</v-btn>
    <v-btn @click="interactWithSmartContract2()">Test smart contract interaction 2</v-btn>
    <v-btn @click="interactWithSmartContract3()">Test smart contract interaction 3</v-btn>
    <v-btn @click="interactWithSmartContract4()">Test smart contract interaction 4</v-btn>
    <textarea v-model="log"></textarea>
  </div>
</template>

<script>
import axios from 'axios'
export default {
  name: "DeveloperTestPage",
  data(){
    return {
      log: '',
      web3: null,
      contractAddress: '0xcC9C4868188D49E23E68DB483A103f49C6739E2a',
      contractAbi: []
    }
  },
  async mounted() {
    let contractRes = await axios.get('/api/contract/abi')
    this.contractAbi = contractRes.data.AdBasedNFTs.abi
    this.contractAddress = contractRes.data.AdBasedNFTs.address;//getTokenData
  },
  methods: {
    async interactWithSmartContract() {
      // let web3 = await this.$moralis.Web3.enableWeb3();
      // let contract = new web3.eth.Contract(this.contractAbi, this.contractAddress);
      // let name = await contract.methods.getValue().call();
      // console.log(name)

      let web3 = await this.$moralis.Web3.enableWeb3();
      let contract = new web3.eth.Contract(this.contractAbi, this.contractAddress);
      let name = await contract.methods.getTokenData().call();
      console.log(name)
      console.log(JSON.stringify(name))
      // let contractRes = await axios.get('/contracts/NftMarathon.json')
      // let contractAbi = contractRes.data
      // let contract = new web3.eth.Contract(contractAbi.abi, this.contractAddress);
      // let name = await contract.methods.getAll().call();
      // console.log(name)
      // this.log = name;
    },
    async interactWithSmartContract2() {
      let userWalletAddress = this.$store.state.user?.attributes?.ethAddress ?? ''
      if(!userWalletAddress) return alert('Address not found')

      const options = {
        contractAddress: this.contractAddress,
        functionName: "mintUniqueTokenWithData",
        abi: this.contractAbi,
        params: {
          _data: 'gotcash1',
        },
      };
      const allowance = await this.$moralis.Web3.executeFunction(options);
      console.log(allowance)
    },
    async interactWithSmartContract3(){
      let contractRes = await axios.get('/contracts/NftMarathon.json')
      let contractAbi = contractRes.data.abi

      let web3 = await this.$moralis.Web3.enableWeb3();
      let contract = new web3.eth.Contract(contractAbi, this.contractAddress);
      let name = await contract.methods.getValue().call();
      console.log(name)
    },
    async interactWithSmartContract4(){
      let contractInfo = this.$store.state.smartContract
      let web3 = await this.$moralis.Web3.enableWeb3();
      console.log(this.$store.state.smartContract.AdBasedNFTs)
      let contract = new web3.eth.Contract(contractInfo.AdBasedNFTs.abi, contractInfo.AdBasedNFTs.address);
      let name = await contract.methods.getTokenData().call();
      console.log(name)
    }
  },
  computed: {
    isLoggedIn() {
      return this.$store.state.user
    },
  }
}
</script>

<style scoped>

</style>