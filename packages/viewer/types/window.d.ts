import type { Pinia } from 'pinia'
import type { Router, RouterHistory } from 'vue-router'

declare global {
    /** All the things we expose to Cypress */
    interface Window {
        store: Pinia
        vueRouterHistory: RouterHistory
        vueRouter: Router
    }
}
