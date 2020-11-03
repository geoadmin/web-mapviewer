import Vue from 'vue'
import VueRouter from 'vue-router'
import MapView from "../views/MapView";
import LoadingView from "../views/LoadingView";
import store from "@/modules/store"

import routerAppLoadingManagement from "./router-app-loading-management";
import storeToUrlManagement from "./store-to-url-management";

Vue.use(VueRouter)

const routes = [
  {
    path: '/loading',
    name: 'LoadingView',
    component: LoadingView
  },
  {
    // the only "exceptional" params are lon/lat/zoom, other params will be handled by queries (?param1=...&param2=...)
    path: '/:lat/:lon/:zoom',
    name: 'MapView',
    component: MapView
  }
]

const router = new VueRouter({
  base: process.env.BASE_URL,
  routes
})

routerAppLoadingManagement(router, store);
storeToUrlManagement(router, store)

export default router
