import Vue from 'vue'
import App from './App.vue'
import store from '@/modules/store'
import i18n from '@/modules/i18n'
import './registerServiceWorker'

Vue.config.productionTip = false;

new Vue({
    store,
    i18n,
    render: h => h(App)
}).$mount('#app');

// if we are testing with Cypress, we expose the store
if (window.Cypress) {
    window.store = store;
}
