<template>
  <v-app light>
    <v-toolbar class="white" max-height="64px">
      <router-link tag="div" to="/" class="basic-link">
        <v-toolbar-title class="mx-0" to="/">NFT Marathon</v-toolbar-title>
      </router-link>
      <p @click="logUser">In development</p>
      <v-spacer></v-spacer>
      <v-toolbar-items>
        <v-btn class="primary mr-2" @click="goToStatistics" v-if="isLoggedIn">
          <div>
            <v-icon>mdi-account-cog</v-icon>
          </div>
        </v-btn>
        <v-btn class="secondary">
          <div v-if="!isLoggedIn" @click="login">
            <div>Sign In</div>
          </div>

          <div v-if="isLoggedIn" @click="logout">
            <div class="address-text">{{ethAddressTruncated}}</div>
            <div>Log out</div>
          </div>
        </v-btn>

      </v-toolbar-items>
    </v-toolbar>
    <router-view/>
  </v-app>
</template>

<script>
import axios from 'axios'
export default {
  name: 'App',
  methods: {
    goToStatistics(){
      if(this.$router.currentRoute.name === 'Statistics') return // This is my main gripe about Vue
      this.$router.push('/Statistics')
    },
    async login() {
      const user = await this.$moralis.Web3.authenticate()
      this.$store.commit('setUser', user)
    },
    async logout() {
      await this.$moralis.User.logOut()
      this.$store.commit('setUser', null)
    },
    async handleCurrentUser() {
      const user = this.$moralis.User.current()
      if (user) {
        this.$store.commit('setUser', user)
      }
    },
    logUser(){
      console.log(this.$store.state.user)
    },
    async setUpWeb3() {
      window.web3 = await this.$moralis.Web3.enableWeb3()
      await this.$moralis.Web3.switchNetwork(this.$store.state.smartContract.networkId)
    },
    async loadSmartContractInformation(){
      let response = await axios.get('/api/contract/abi')
      this.$store.commit('setSmartContract', response.data)
    },
    async init() {
      await this.loadSmartContractInformation()
      await this.setUpWeb3()
      await this.handleCurrentUser()

    }
  },
  computed: {
    isLoggedIn(){
      return this.$store.state.user
    },
    ethAddressTruncated(){
      let address = this.$store.state.user?.attributes?.ethAddress ?? ''
      if(!address) return ''
      return `${address.substr(0, 5)}...${address.substr(42-4, 42)}`
    }
  },
  mounted() {
    this.init()
  }
};
</script>

<style>
.v-application {
  background-color: #00a86b;
}
</style>

<style scoped>
 .basic-link {
   cursor: pointer;
 }
 .address-text{
  font-size: 10px;
 }
</style>


