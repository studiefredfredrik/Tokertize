<template>
  <v-main>
    <v-row class="my-4">
      <v-col class="col-xl-2 hidden-lg-and-down"></v-col>
      <v-col class="col-md-6 col-12 col-xl-4">
        <section>
          <v-parallax src="pexels-kaboompics-com-6224.jpg" alt="Photo by Kaboompics .com from Pexels" height="600">
            <v-layout column align-center justify-center class="white--text">
              <h1 class="white--text mb-2 display-1 text-xs-center" style="font-weight: 900; text-shadow: 3px 2px #000000">
                Get started as a content provider
              </h1>
              <div class="white--text subheading mb-3 text-xs-center" style="font-weight: 900; text-shadow: 2px 2px #000000">
                You have a website with traffic that you want to monetize
              </div>
              <v-btn class="secondary mt-5" dark large to="/ContentCreatorSignup">
                Monetize your site
              </v-btn>
            </v-layout>
          </v-parallax>
        </section>
      </v-col>

      <v-col class="col-md-6 col-12 col-xl-4">
        <section>
          <v-parallax src="pexels-dominika-roseclay-905163.jpg" alt="Photo by Dominika Roseclay from Pexels" height="600">
            <v-layout column align-center justify-center class="white--text">
              <h1 class="white--text mb-2 display-1 text-xs-center" style="font-weight: 900; text-shadow: 3px 2px #000000">
                Get started as an advertiser
              </h1>
              <div class="white--text subheading mb-3 text-xs-center" style="font-weight: 900; text-shadow: 2px 2px #000000">
                You have a product that you want the world to know about
              </div>
              <v-btn class="secondary mt-5" dark large to="/AdvertiserSignup">
                Advertise your product
              </v-btn>
            </v-layout>
          </v-parallax>
        </section>
      </v-col>
      <v-col class="col-xl-2 hidden-lg-and-down"></v-col>
    </v-row>


  </v-main>
</template>

<script>
export default {
  name: "AdFrontpage"
}
</script>

<style scoped>

</style>