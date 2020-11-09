import Vue from 'vue'
import VueRouter from 'vue-router'
import MapView from "../views/MapView";
import LoadingView from "../views/LoadingView";
import store from "../modules/store"

import routerAppLoadingManagement from "./router-app-loading-management";
import storeToUrlManagement from "./store-to-url-management";
import legacyPermalinkManagement from "./legacy-permalink-management";

Vue.use(VueRouter)

const routes = [
  {
    path: '/',
    redirect: { name: 'LoadingView' }
  },
  {
    path: '/loading',
    name: 'LoadingView',
    component: LoadingView
  },
  {
    path: '/map',
    name: 'MapView',
    component: MapView
  }
]

const router = new VueRouter({
  // mode: 'history',
  // base: process.env.BASE_URL,
  routes
})

routerAppLoadingManagement(router, store);
storeToUrlManagement(router, store)
legacyPermalinkManagement(router, store);

export default router
