<template>
  <div>
    <v-card-title>User statistics</v-card-title>
    <v-card-subtitle v-if="!userStatistics || (userStatistics.sites.length === 0 && userStatistics.ads.length === 0)">Nothing to show here ...</v-card-subtitle>

    <v-card max-width="1000" class="mx-auto mt-12" v-if="userStatistics.sites.length > 0">
      <v-card-title>Sites</v-card-title>
      <v-list three-line>
        <template v-for="(site, index) in userStatistics.sites">
          <v-divider></v-divider>
          <v-list-item>
            <v-list-item-avatar>
              <v-img src="android-chrome-192x192.png"></v-img>
            </v-list-item-avatar>
            <v-list-item-content>
              <v-layout row wrap align-center>
                <v-flex xs12 md12>
                  <v-card class="elevation-0 transparent ml-12">
                    <v-card-text align="left" class="font-weight-bold ma-0 pa-0"><span class="black--text">Domain:</span> {{site.domain}}</v-card-text>
                    <v-card-text align="left" class="font-weight-bold ma-0 pa-0"><span class="black--text">Token:</span> {{site._id}}</v-card-text>
                    <v-card-text align="left" class="font-weight-bold ma-0 pa-0"><span class="black--text">Owner:</span> {{site.userEthAddress}}</v-card-text>
                  </v-card>
                </v-flex>
                <v-flex xs12 md4>
                  <v-card class="elevation-0 transparent">
                    <v-card-title primary-title class="layout justify-center">
                      <div class="primary--text">Clicks</div>
                    </v-card-title>
                    <v-card-text align="center" class="font-weight-bold">{{site.clicks}} clicks</v-card-text>
                  </v-card>
                </v-flex>
                <v-flex xs12 md4>
                  <v-card class="elevation-0 transparent">
                    <v-card-title primary-title class="layout justify-center">
                      <div class="primary--text">Views</div>
                    </v-card-title>
                    <v-card-text align="center" class="font-weight-bold">{{site.views}} views</v-card-text>
                  </v-card>
                </v-flex>
                <v-flex xs12 md4>
                  <v-card class="elevation-0 transparent">
                    <v-card-title primary-title class="layout justify-center">
                      <div class="primary--text">Earnings</div>
                    </v-card-title>
                    <v-card-text align="center" class="font-weight-bold">{{site.earnings}} ??? eth</v-card-text>
                  </v-card>
                </v-flex>
              </v-layout>
            </v-list-item-content>
          </v-list-item>
        </template>
      </v-list>
    </v-card>

    <v-spacer class="mt-12"></v-spacer>

    <v-card max-width="1000" class="mx-auto mt-12" v-if="userStatistics.ads.length > 0">
      <v-card-title>Ads</v-card-title>
      <v-list three-line>
        <template v-for="(ad, index) in userStatistics.ads">
          <v-divider></v-divider>
          <v-list-item>
            <v-list-item-avatar>
              <v-img src="android-chrome-192x192.png"></v-img>
            </v-list-item-avatar>
            <v-list-item-content>
              <v-layout row wrap align-center>
                <v-flex xs12 md12>
                  <v-card class="elevation-0 transparent ml-12">
                    <v-card-text align="left" class="font-weight-bold ma-0 pa-0"><span class="black--text">Domain:</span> {{ad.domain}}</v-card-text>
                    <v-card-text align="left" class="font-weight-bold ma-0 pa-0"><span class="black--text">Token:</span> {{ad._id}}</v-card-text>
                    <v-card-text align="left" class="font-weight-bold ma-0 pa-0"><span class="black--text">Owner:</span> {{ad.userEthAddress}}</v-card-text>
                  </v-card>
                </v-flex>
                <v-flex xs12 md4>
                  <v-card class="elevation-0 transparent">
                    <v-card-title primary-title class="layout justify-center">
                      <div class="primary--text">Clicks</div>
                    </v-card-title>
                    <v-card-text align="center" class="font-weight-bold">{{ad.clicks}} clicks</v-card-text>
                  </v-card>
                </v-flex>
                <v-flex xs12 md4>
                  <v-card class="elevation-0 transparent">
                    <v-card-title primary-title class="layout justify-center">
                      <div class="primary--text">Views</div>
                    </v-card-title>
                    <v-card-text align="center" class="font-weight-bold">{{ad.views}} views</v-card-text>
                  </v-card>
                </v-flex>
                <v-flex xs12 md4>
                  <v-card class="elevation-0 transparent">
                    <v-card-title primary-title class="layout justify-center">
                      <div class="primary--text">Balance</div>
                    </v-card-title>
                    <v-card-text align="center" class="font-weight-bold">{{ad.balance}} ??? eth</v-card-text>
                  </v-card>
                </v-flex>
              </v-layout>
            </v-list-item-content>
          </v-list-item>
        </template>
      </v-list>
    </v-card>
  </div>
</template>

<script>
import axios from 'axios'
export default {
  name: "Statistics",
  data(){
    return {
      userStatistics: {
        ads: [],
        sites: []
      }
    }
  },
  mounted () {
    this.interval = setInterval(() => {
      if(!this.$store.state.user) return
      this.refreshUserStatistics()
      clearInterval(this.interval)
    }, 100)
  },
  methods: {
    async refreshUserStatistics() {
      console.log(this.$store.state.user)
      let res = await axios.get(`/api/statistics/user/${this.$store.state.user.attributes.sessionToken}`)
      this.userStatistics = res.data
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