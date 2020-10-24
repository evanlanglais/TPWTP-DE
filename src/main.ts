import Vue from 'vue'
import App from './App.vue'
import Buefy from 'buefy'
import 'buefy/dist/buefy.css'
import VueApollo from 'vue-apollo'
import {v2Provider} from "./data/v2/APIv2";

Vue.use(Buefy);
Vue.use(VueApollo);
Vue.config.productionTip = false;

new Vue({
  apolloProvider: v2Provider,
  render: h => h(App)
}).$mount('#app');
