import Vue from 'vue'
import VueRouter from 'vue-router'
import Frontpage from "../views/Frontpage"
import AdFrontpage from "../views/AdNetwork/AdFrontpage"
import AdvertiserSignup from "../views/AdNetwork/AdvertiserSignup"
import ContentCreatorSignup from "../views/AdNetwork/ContentCreatorSignup"
import Statistics from "../views/AdNetwork/Statistics"
import DeveloperTestPage from "../views/Developer/DeveloperTestPage"

Vue.use(VueRouter)

const routes = [
  {
    path: '/',
    name: 'Frontpage',
    component: Frontpage
  },
  {
    path: '/AdFrontpage',
    name: 'AdFrontpage',
    component: AdFrontpage
  },
  {
    path: '/AdvertiserSignup',
    name: 'AdvertiserSignup',
    component: AdvertiserSignup
  },
  {
    path: '/ContentCreatorSignup',
    name: 'ContentCreatorSignup',
    component: ContentCreatorSignup
  },
  {
    path: '/Statistics',
    name: 'Statistics',
    component: Statistics
  },
  {
    path: '/DeveloperTestPage', // TODO: Remember to remove this :)
    name: 'DeveloperTestPage',
    component: DeveloperTestPage
  },
]

const router = new VueRouter({
  routes
})

export default router
