import { createRouter, createWebHistory } from 'vue-router'
import HomePage from '../views/HomePage.vue'
import AboutPage from '../views/AboutPage.vue'
import ResourcesPage from '../views/ResourcesPage.vue'
import ServicesPage from '../views/ServicesPage.vue'
import ServiceDetail from '../views/ServiceDetail.vue'
import GetInvolvedPage from '../views/GetInvolvedPage.vue'
import ContactPage from '../views/ContactPage.vue'
import LoginPage from '../views/LoginPage.vue'
import RegisterPage from '../views/RegisterPage.vue'
import DashboardPage from '../views/DashboardPage.vue'
import AdminDashboard from '../views/AdminDashboard.vue'

const routes = [
  { path: '/', name: 'Home', component: HomePage },
  { path: '/about', name: 'About', component: AboutPage },
  { path: '/resources', name: 'Resources', component: ResourcesPage },
  { path: '/services', name: 'Services', component: ServicesPage },
  { path: '/services/:id', name: 'ServiceDetail', component: ServiceDetail, meta: { requiresAuth: true } },
  { path: '/get-involved', name: 'GetInvolved', component: GetInvolvedPage },
  { path: '/contact', name: 'Contact', component: ContactPage },
  { path: '/login', name: 'Login', component: LoginPage, meta: { guestOnly: true } },
  { path: '/register', name: 'Register', component: RegisterPage, meta: { guestOnly: true } },
  { path: '/dashboard', name: 'Dashboard', component: DashboardPage, meta: { requiresAuth: true } },
  { path: '/admin', name: 'AdminDashboard', component: AdminDashboard, meta: { requiresAuth: true, roles: ['admin'] } },
  { path: '/:pathMatch(.*)*', redirect: '/' }
]

const router = createRouter({
  history: createWebHistory(),
  routes,
  scrollBehavior() {
    return { top: 0 }
  }
})

router.beforeEach((to, from, next) => {
  // useAuthStore needs to be called inside the guard function
  // because the store relies on reactive state initialized after app mount
  const authData = JSON.parse(localStorage.getItem('mindbridge_current_user') || 'null')

  // Routes that require authentication
  if (to.meta.requiresAuth) {
    if (!authData) {
      next({ name: 'Login', query: { redirect: to.fullPath } })
      return
    }
    // Check role-based access
    if (to.meta.roles && !to.meta.roles.includes(authData.role)) {
      next({ name: 'Dashboard' })
      return
    }
  }

  // Routes that are guest-only (login, register)
  if (to.meta.guestOnly && authData) {
    next({ name: 'Dashboard' })
    return
  }

  next()
})

export default router
