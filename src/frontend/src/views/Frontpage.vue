<template>
  <v-main>
    <section>
      <v-parallax src="pexels-snapwire-6989.jpg" height="600">
        <v-layout column align-center justify-center class="white--text">
          <h1 class="white--text mb-2 display-1 text-xs-center" style="font-weight: 900; text-shadow: 3px 2px #000000">
            Reach your potential customers efficiently and securely
          </h1>
          <div class="white--text subheading mb-3 text-xs-center" style="font-weight: 900; text-shadow: 2px 2px #000000">
            Advertise on a crypto native ad network
          </div>
          <v-btn class="secondary mt-5" dark large to="/AdFrontpage">
            Get Started
          </v-btn>
        </v-layout>
      </v-parallax>
    </section>

    <section>
      <v-layout
          column
          wrap
          class="my-5"
          align-center
      >
        <v-flex xs12 sm4 class="my-3">
          <div class="text-xs-center">
            <h2 class="headline">Create ads as NFT's</h2>
            <span class="subheading">
              Cash in on expectations, and use the funding to fulfill them
            </span>
          </div>
        </v-flex>
        <v-flex xs12>
          <v-container grid-list-xl>
            <v-layout row wrap align-center>
              <v-flex xs12 md4>
                <v-card class="elevation-0 transparent">
                  <v-card-title primary-title class="layout justify-center">
                    <div class="headline text-xs-center primary--text">Reach the world</div>
                  </v-card-title>
                  <v-card-text>
                    An amazing marketplace, brings your projects to the whole world. And let anyone invest in your dreams
                  </v-card-text>
                </v-card>
              </v-flex>
              <v-flex xs12 md4>
                <v-card class="elevation-0 transparent">
                  <v-card-title primary-title class="layout justify-center">
                    <div class="headline text-xs-center primary--text">Secure</div>
                  </v-card-title>
                  <v-card-text>
                    Using blockchain to secure transactions is becoming an industry standard, and something you can rely on
                  </v-card-text>
                </v-card>
              </v-flex>
              <v-flex xs12 md4>
                <v-card class="elevation-0 transparent">
                  <v-card-title primary-title class="layout justify-center">
                    <div class="headline text-xs-center primary--text">Getting involved</div>
                  </v-card-title>
                  <v-card-text>
                    By letting people own a part of future revenue, incentives are aligned for backers and producers. Be a part of the synergy!
                  </v-card-text>
                </v-card>
              </v-flex>

            </v-layout>
          </v-container>
        </v-flex>
      </v-layout>
    </section>

    <section>
      <v-parallax src="pexels-brett-sayles-3217676.jpg" height="380">
        <v-layout column align-center justify-center class="white--text">
          <h1 class="primary--text mb-2 display-1 text-xs-center" style="font-weight: 900; text-shadow: 3px 2px #000000">
            Fund your projects by selling ad revenue as a tradable NFT
          </h1>
          <div class="primary--text subheading mb-3 text-xs-center" style="font-weight: 900; text-shadow: 2px 2px #000000">
            Implement it on your site in less than 15 minutes
          </div>
          <v-btn class="secondary mt-5" dark large to="/AdFrontpage">
            Get Started
          </v-btn>
        </v-layout>
      </v-parallax>
    </section>

    <section>
      <v-container grid-list-md>

        <v-layout row wrap>
          <v-flex xs12 text-xs-center class="mt-5">
            <div class="headline">Are you amazed? Stay tuned!</div>
            <br>
            <div>We are lunching the beta shortly. Sign up for the newsletter and we'll let you know when you can dive in</div>
          </v-flex>
          <v-flex xs8 offset-xs2>

            <v-card class="elevation-0 transparent">

              <v-card-text>
                <v-flex xs12 v-if="!subscribed">
                  <v-text-field label="Email address" v-model="email" hint="Enter your email!" persistent-hint></v-text-field>
                </v-flex>
                <v-flex xs12 class="text-xs-center" v-if="!subscribed">
                  <v-btn class="primary mb-5" dark large @click="subscribe">Get in touch</v-btn>
                </v-flex>
                <v-flex xs12 class="text-xs-center" v-if="subscribed">
                  <v-btn class="success mb-5" dark large>Welcome on board!</v-btn>
                </v-flex>
              </v-card-text>

            </v-card>

          </v-flex>
        </v-layout>
      </v-container>
    </section>

    <section>
      <v-parallax src="pexels-clem-onojeghuo-375898.jpg" height="380">
        <v-layout column align-center justify-center>
          <div class="headline white--text mb-3 text-xs-center">Follow us on twitter to stay in the loop and get cool news as we go</div>
        </v-layout>
      </v-parallax>
    </section>

    <section>
      <v-container grid-list-md>

        <v-layout row wrap>
          <v-flex xs12 text-xs-center class="mt-5">
            <div class="headline">Still not amazed??? Look at these ads!</div>
            <br>
            <div>We're testing out ad revenue right in our own site now!</div>
          </v-flex>
          <v-flex xs8 offset-xs2>

<!--            <iframe-->
<!--                style="width: 400px;-->
<!--                height: 150px;-->
<!--                border: 0px none;-->
<!--                padding: 0px;-->
<!--                overflow: hidden;-->
<!--                background-color: transparent;"-->
<!--                src="http://localhost:8080/api/link/21/view">-->
<!--            </iframe>-->
            <iframe
                style="width: 400px;
                height: 150px;
                border: 0px none;
                padding: 0px;
                overflow: hidden;
                background-color: transparent;"
                src="https://nftmarathon.xyz/api/link/1004/view">
            </iframe>

<!--            <iframe-->
<!--                style="width: 400px;-->
<!--                height: 150px;-->
<!--                border: 0px none;-->
<!--                padding: 0px;-->
<!--                overflow: hidden;-->
<!--                background-color: transparent;"-->
<!--                src="https://nftmarathon.xyz/api/link/1000/view">-->
<!--            </iframe>-->

          </v-flex>
        </v-layout>
      </v-container>
    </section>


  </v-main>
</template>

<script>
import axios from 'axios'

export default {
  name: "App",
  data: function() {
    return {
      subscribed: false,
      email: ''
    };
  },
  methods: {
    subscribe: async function () {
      if (!this.email?.includes('@')) {
        return window.alert('Not an actual email address is it? 😄')
      }

      try{
        await axios.post('/api/subscribe', {emailAddress: this.email})
      } catch (ex){
        window.alert('Sorry, but our API seems to have some bugs 😥')
        return;
      }
      this.subscribed = true
      window.localStorage.setItem('subscribed', 'true')
    },
    sorryAlert(){
      window.alert('Not implemented yet, stay tuned 😅')
    }
  },
  computed: {

  },
  mounted: function() {
    this.subscribed = window.localStorage.getItem('subscribed')
  },
};
</script>

<style scoped>

</style>
