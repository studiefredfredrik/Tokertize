<template>
  <v-main>
    <v-layout row wrap align-center>
      <v-flex xs12 md6 class="mx-auto">
        <v-card class="elevation-0 transparent">
          <v-card-title primary-title class="layout justify-center">
            <div class="headline text-xs-center primary--text">Create an ad, reach the world</div>
          </v-card-title>
          <v-card-text>
            Create a text based ad or upload your own custom artwork.
            This is still just a beta, so ad size is 400px by 150px
          </v-card-text>
        </v-card>
      </v-flex>
    </v-layout>
    <v-row class="my-4 mx-auto col-lg-6 col-12  align-center">
      <v-col class="col-md-6 col-12">
        <v-radio-group v-model="ad.type" label="What sort of ad do you want to create?">
          <v-radio
              key="text"
              label="Text based ad"
              value="text"
          ></v-radio>
          <v-radio
              key="graphic"
              label="Image"
              value="graphic"
          ></v-radio>
        </v-radio-group>
      </v-col>
      <v-col class="col-md-6 col-12">
        <div v-if="ad.type === 'text'">
          <v-text-field :rules="linkRules" label="What url should the ad be pointing to?" v-model="ad.url"></v-text-field>
          <v-text-field label="First line of text in ad" v-model="ad.line1"></v-text-field>
          <v-text-field label="Second line of text in ad" v-model="ad.line2"></v-text-field>
          <v-text-field label="Third line of text in ad" v-model="ad.line3"></v-text-field>
        </div>
        <div v-if="ad.type === 'graphic'">
          <v-text-field label="What url should the ad be pointing to?" v-model="ad.url"></v-text-field>
          <v-btn @click="show = true">Select an image to use</v-btn>
          <my-upload field="img" v-if="show"
                     @crop-success="cropSuccess"
                     @crop-upload-success="cropUploadSuccess"
                     @crop-upload-fail="cropUploadFail"
                     @input="inputOrClose"
                     :value.sync="show"
                     :width="398"
                     :height="148"
                     :lang-ext="uploaderLangSet"
                     :params="params"
                     img-format="png"></my-upload>
        </div>
      </v-col>

      <v-col >
        <v-layout row wrap align-center>
          <v-flex xs12 md12>
            <v-card class="elevation-0 transparent">
              <v-card-title primary-title class="layout justify-center">
                <div class="headline text-xs-center primary--text">Preview of the ad</div>
              </v-card-title>
              <v-card-text>
                <div class="d-flex justify-center align-center mb-4">
                  Just to give you a feel of how this ad will look on a website
                </div>
              </v-card-text>
            </v-card>
            <div class="d-flex justify-center align-center" v-if="ad.type === 'text'">
              <div class="ad-box-1" @click="goTo(ad.url)">
                <div class="head">{{ad.line1}}</div>
                <div class="mid">{{ad.line2}}</div>
                <div class="low">{{ad.line3}}</div>
              </div>
            </div>
            <div class="d-flex justify-center align-center" v-if="ad.type === 'graphic'">
              <div class="ad-box-1" @click="goTo(ad.url)">
                <img v-if="ad.imgDataUrl" :src="ad.imgDataUrl">
                <div v-if="!ad.imgDataUrl">No image selected</div>
              </div>
            </div>
          </v-flex>
        </v-layout>
      </v-col>
    </v-row>
    <v-col v-if="(ad.type === 'text' && ad.line1) || (ad.type === 'graphic' && ad.imgDataUrl)">
      <v-layout row wrap align-center>
        <v-flex xs12 md12>
          <v-card class="elevation-0 transparent">
            <v-card-title primary-title class="layout justify-center">
              <div class="headline text-xs-center primary--text">Looking good 😎</div>
            </v-card-title>
            <v-card-text>
              <div class="d-flex justify-center align-center mb-4 warning--text" v-if="!isLoggedIn">
                To complete this you first need to sign in by connecting your wallet using the 'Sign in' button at the top right
              </div>
              <div class="d-flex justify-center align-center mb-4" v-if="isLoggedIn">
                As easy as that! Now you just have to mint it and we're good to go!
              </div>
              <div class="d-flex justify-center align-center mb-4">
                <v-btn class="primary" :disabled="!isLoggedIn" @click="finishUp">Good enough! Let's go 👍</v-btn>
              </div>
            </v-card-text>
          </v-card>
        </v-flex>
      </v-layout>
    </v-col>
    <v-dialog v-model="dialogOpen" width="800" persistent>
      <v-card v-if="createdAdId" :loading="loadingMint">
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
          <div class="d-flex justify-center align-center mt-5">Minting NFT for ad code: {{createdAdId}}</div>
          <div class="d-flex justify-center align-center mt-5">
            <v-btn @click="mintAdNft">Mint!</v-btn>
          </div>
        </v-card-text>
      </v-card>
      <v-card v-if="!createdAdId">
        <v-card-title class="text-h5 grey primary">
          That was a success
        </v-card-title>
        <v-card-text>
          <div class="d-flex justify-center align-center mt-5">Your ad has been created and will be served on our ad network shortly</div>
          <div class="d-flex justify-center align-center mt-5">
            You can view the performance of your campaign on the statistics page
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
import myUpload from 'vue-image-crop-upload/upload-2.vue'
export default {
  name: "AdvertiserSignup",
  data() {
    return {
      show: false,
      params: {
        token: '123456798',
        name: 'avatar'
      },
      uploaderLangSet: {
        hint: 'Click or drag the file here to upload',
        loading: 'Uploading…',
        noSupported: 'Browser is not supported, please use IE10+ or other browsers',
        success: 'Upload success',
        fail: 'Upload failed',
        preview: 'Preview',
        btn: {
          off: 'Cancel',
          close: 'Close',
          back: 'Back',
          save: 'Save'
        },
        error: {
          onlyImg: 'Image only',
          outOfSize: 'Image exceeds size limit: ',
          lowestPx: 'Image\'s size is too low. Expected at least: '
        }
      },
      ad: {
        type: 'text',
        url: '',
        line1: '',
        line2: '',
        line3: '',
        imgDataUrl: '',
        size: '400x150'
      },
      dialogOpen: false,
      createdAdId: null,
      loadingMint: false
    }
  },
  methods: {
    goTo(url){
      window.open(url)
    },
    cropSuccess(imgDataUrl, field){
      console.log('-------- crop success --------');
      this.ad.imgDataUrl = imgDataUrl;
    },
    cropUploadSuccess(jsonData, field){
      console.log('-------- upload success --------');
      console.log(jsonData);
      console.log('field: ' + field);
    },
    cropUploadFail(status, field){
      console.log('-------- upload fail --------');
      console.log(status);
      console.log('field: ' + field);
    },
    inputOrClose(val){
      // Somewhat brain dead way of listening to a close event, but whatever
      if(val===false) this.show = false
    },
    async finishUp() {
      console.log(this.ad)
      console.log(this.$store.state.user)
      // TODO: Do some interaction with the smart contract here
      try {
        let response = await axios.post('/api/register/ad', {ad: this.ad, sessionToken: this.$store.state.user.attributes.sessionToken})
        this.createdAdId = response.data.adId
        this.dialogOpen = true
        this.ad = {
          type: 'text',
          url: '',
          line1: '',
          line2: '',
          line3: '',
          imgDataUrl: '',
          size: '400x150'
        }
      } catch (ex) {
        alert('Sorry but saving this ad failed 🤔')
      }
    },
    async mintAdNft(){
      this.loadingMint = true
      let contractInfo = this.$store.state.smartContract.AdBasedNFTs

      const options = {
        contractAddress: contractInfo.address,
        functionName: "mintAdToken",
        abi: contractInfo.abi,
        params: {
          _adCode: this.createdAdId,
        },
        msgValue: '10000000000000000' // 0.01 eth
      };
      try{
        await this.$moralis.Web3.executeFunction(options);
        this.createdAdId = null
      } catch (ex){
        console.log(ex)
      } finally
      {
        this.loadingMint = false
      }
    },
  },
  components: {
    'my-upload': myUpload
  },
  computed: {
    isLoggedIn(){
      return this.$store.state.user
    },
    linkRules() {
      if(!this.ad.url) return ['Url must be filled']
      if(!this.ad.url.includes('.') || (!this.ad.url.includes('http://') && !this.ad.url.includes('https://'))) return ['Not a valid url (must contain https:// part)']
    },
  }
}
</script>

<style scoped>
.ad-box-1{
  /*note that i'm adding 2px to allow for correct border even when image is correct size due to overflow css ugh*/
  width: 402px;
  height: 152px;
  text-align: center;
  border: solid 1px black;
  cursor: pointer;
}
.ad-box-1 .head{
  color: blue;
  font-size: 32px;
}
.ad-box-1 .mid{
  font-size: 22px;
}
.ad-box-1 .low{
  margin: 10px;
  font-size: 12px;
}
</style>