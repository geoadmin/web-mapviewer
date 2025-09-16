import Vuex from 'vuex'
import type { Router, RouterHistory } from 'vue-router'

declare global {
    /** All the things we expose to Cypress */
    interface Window {
        store: typeof Vuex.Store
        vueRouterHistory: RouterHistory
        vueRouter: Router
    }
}
