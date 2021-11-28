import Vue from 'vue'
import App from './App.vue'
import router from './router'
import store from './store'
import vuetify from './plugins/vuetify'
import moralis from './plugins/moralis'

Vue.config.productionTip = false

Vue.prototype.$moralis = moralis
Vue.prototype.$store = store

new Vue({
  router,
  store,
  vuetify,
  render: h => h(App)
}).$mount('#app')
