import Vue from 'vue';
import Vuetify from 'vuetify/lib/framework';

Vue.use(Vuetify);

const vuetify = new Vuetify({
  theme: {
    themes: {
      light: {
        primary: '#03a9f4',
        secondary: '#e91e63',
        accent: '#9c27b0',
        error: '#f44336',
        warning: '#ff5722',
        info: '#009688',
        success: '#4caf50'
      },
    },
  },
})

export default vuetify