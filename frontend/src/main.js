import Vue from 'vue'
import BootstrapVue from "bootstrap-vue"
import VueRouter from 'vue-router'
import App from './App.vue'
import "bootstrap/dist/css/bootstrap.min.css"
import "bootstrap-vue/dist/bootstrap-vue.css"
import './assets/css/themes.scss';
import Map from './components/Map.vue';
import Forecasts from './components/Forecasts.vue';
import About from './components/About.vue'
import PageNotFound from './components/404.vue'
import i18n from './lang/i18n.js'
import store from './store'

Vue.use(BootstrapVue)
Vue.use(VueRouter)

const routes = [
  { path: '/', component: Map },
  { path: '/forecasts', component: Forecasts },
  { path: '/about', component: About },
  { path: '*', component: PageNotFound } //catch all 404
]

const router = new VueRouter({
  routes
})

new Vue({
  el: '#app',
  router,
  store,
  i18n,
  render: h => h(App)
})