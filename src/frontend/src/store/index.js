import Vue from 'vue'
import Vuex from 'vuex'

Vue.use(Vuex)

export default new Vuex.Store({
  state: {
    user: null,
    smartContract: null
  },
  mutations: {
    setUser(state, payload){
      state.user = payload
    },
    setSmartContract(state, payload){
      state.smartContract = payload
    }
  },
  actions: {
  },
  modules: {
  }
})
