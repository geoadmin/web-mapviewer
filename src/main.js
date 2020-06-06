import Vue from 'vue'
import App from './App.vue'
import store from '@/modules/store'
import './registerServiceWorker'

Vue.config.productionTip = false;

new Vue({
    store,
    render: h => h(App)
}).$mount('#app');

// if we are testing with Cypress, we expose the store
if (window.Cypress) {
    window.store = store;
}
