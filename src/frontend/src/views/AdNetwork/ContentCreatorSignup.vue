<template>
  <v-main>
    <v-layout row wrap align-center>
      <v-flex xs12 md6 class="mx-auto">
        <v-card class="elevation-0 transparent">
          <v-card-title primary-title class="layout justify-center">
            <div class="headline text-xs-center primary--text">Monetize your site</div>
          </v-card-title>
          <v-card-text>
            Monetizing your site by placing ads is a great way to generate a revenue stream from the projects you love. <br/>
            By signing up with us you get to mint an NFT that you can sell on the open market place. <br/>
            This can allow you to kickstart your next big idea <br/>
            And we'll track your site's performance, so your NFT will build a reputation and increase in value as time goes on <br/>
            in case you don't want to sell out right away 🙂
          </v-card-text>
        </v-card>
      </v-flex>
    </v-layout>
    <v-row class="my-4 mx-auto col-6  align-center">
      <v-col>
        <div>
          <v-text-field :rules="domainRules" label="Tell us your domain name" placeholder="www.my-domain.com" v-model="site.domain"></v-text-field>
        </div>
      </v-col>
    </v-row>
    <v-row>
      <v-col v-if="site.domain && !domainRules">
        <v-layout row wrap align-center>
          <v-flex xs12 md12>
            <v-card class="elevation-0 transparent">
              <v-card-title primary-title class="layout justify-center">
                <div class="headline text-xs-center primary--text">Not bad 😎</div>
              </v-card-title>
              <v-card-text>
                <div class="d-flex justify-center align-center mb-4 warning--text" v-if="!isLoggedIn">
                  To complete this you first need to sign in by connecting your wallet using the 'Sign in' button at the top right
                </div>
                <div class="d-flex justify-center align-center mb-4" v-if="isLoggedIn">
                  As easy as that! Now you just have to mint it and we're good to go!
                </div>
                <div class="d-flex justify-center align-center mb-4">
                  <v-btn class="primary" @click="finishUp">Good enough! Let's go 👍</v-btn>
                </div>
              </v-card-text>
            </v-card>

          </v-flex>
        </v-layout>
      </v-col>

    </v-row>
    <v-dialog v-model="dialogOpen" width="800" persistent>
      <v-card v-if="createdSiteId" :loading="loadingMint">
        <template slot="progress">
          <v-progress-linear
              color="primary"
              height="10"
              indeterminate
          ></v-progress-linear>
        </template>
        <v-card-title class="text-h5 grey primary">
          Time to mint the NFT
        </v-card-title>
        <v-card-text>
          <div class="d-flex justify-center align-center mt-5">Minting NFT for siteId: {{createdSiteId}}</div>
          <div class="d-flex justify-center align-center mt-5">
            <v-btn @click="mintSiteNft">Mint!</v-btn>
          </div>
        </v-card-text>
      </v-card>
      <v-card v-if="!createdSiteId">
        <v-card-title class="text-h5 grey primary">
          That was a success
        </v-card-title>
        <v-card-text>
          <div class="d-flex justify-center align-center mt-5">Your site has been registered on the ad network</div>
          <div class="d-flex justify-center align-center">Include the following code snippet on your site to start earning revenue</div>
          <div class="d-flex justify-center align-center mt-5"><pre style="border: black solid 1px; padding: 30px;">{{site.adCodeSnippet}}</pre></div>
          <div class="d-flex justify-center align-center mt-5">
            You can view the performance of your site on the statistics page
          </div>
        </v-card-text>
        <v-divider></v-divider>
        <v-card-actions>
          <v-spacer></v-spacer>
          <v-btn class="ml-2 primary" to="Statistics">Open statistics</v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>
  </v-main>
</template>

<script>
import axios from "axios"

export default {
  name: "ContentCreatorSignup",
  data(){
    return {
      site: {
        domain: '',
        adCodeSnippet: ''
      },
      dialogOpen: false,
      createdSiteId: null,
      loadingMint: false
    }
  },
  methods: {
    async finishUp() {
      console.log(this.site)
      console.log(this.$store.state.user)
      // TODO: Do some interaction with the smart contract here
      try {
        let res = await axios.post('/api/register/site', {site: this.site, sessionToken: this.$store.state.user.attributes.sessionToken })
        this.createdSiteId = res.data.siteId
        this.site.adCodeSnippet = this.createAdCodeSnippet(res.data.siteId)
        this.dialogOpen = true
      } catch (ex) {
        alert('Sorry but saving this ad failed 🤔')
      }
    },
    async mintSiteNft(){
      this.loadingMint = true
      let contractInfo = this.$store.state.smartContract.WebBasedNFTs

      const options = {
        contractAddress: contractInfo.address,
        functionName: "mintWebToken",
        abi: contractInfo.abi,
        params: {
          _webCode: this.createdSiteId,
          webURL: this.site.domain,
        },
      };
      try{
        await this.$moralis.Web3.executeFunction(options);
        this.createdSiteId = null
      } catch (ex){
        console.log(ex)
      } finally
      {
        this.loadingMint = false
      }
    },
    createAdCodeSnippet(siteId){
      return `
<iframe
    style="width: 400px;
    height: 150px;
    border: 0px none;
    padding: 0px;
    overflow: hidden;
    background-color: transparent;"
    src="https://nftmarathon.xyz/api/link/${siteId}/view">
</iframe>
        `
    },
    closeDialog(){
      this.dialogOpen = false
      this.site = {
        domain: '',
        adCodeSnippet: ''
      }
    }
  },
  computed: {
    isLoggedIn(){
      return this.$store.state.user
    },
    domainRules() {
      if(!this.site.domain) return ['Domain must be filled']
      if(!this.site.domain.includes('.')) return ['Not a valid domain']
      if(this.site.domain.includes('/')) return ['We only need the domain, not the full url']
    },
  }
}
</script>

<style scoped>

</style>