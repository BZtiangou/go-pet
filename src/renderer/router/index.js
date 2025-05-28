//路由配置

import {createRouter, createWebHashHistory } from 'vue-router'

import Main from '@renderer/views/mainpage/mainpage.vue'
// 预加载stats组件
import MoodStats from '@renderer/views/mood/stats.vue'

// import Login  from '@renderer/views/login/login.vue'

//路由


const routes = [
  // { 
  //   path: '/login',
  //   name: 'Login',
  //   component: Login 
  // },
  { 
    path : '/mainpage', 
    component: Main, 
    meta: { requiresAuth: true }, 
    exact: true
  },
  {
    path: '/mood',
    name: 'MoodTracker',
    component: () => import('@renderer/views/mood/mood.vue'),
    meta: { requiresAuth: true }
  },
  {
    path: '/moodstats', // 简化路径，避免嵌套路由可能产生的问题
    name: 'MoodStats',
    component: MoodStats, // 直接使用导入的组件
    meta: { requiresAuth: true }
  },
  {
    path: '/goal',
    name: 'GoalManager',
    component: () => import('@renderer/components/function/fun3/goal_manager.vue'),
    meta: { requiresAuth: true }
  },
  {
    path: '/home',
    name: 'Home',
    component: () => import('@renderer/views/home/home.vue'),
    meta: { requiresAuth: true }
  },
  // 默认路由重定向到主页或登录页
  { 
    path: '/', 
    redirect: () => {
      // return localStorage.getItem('isLoggedIn') === 'true' ? '/home' : '/login'
      return '/home' // Directly redirect to home
    }
  }
  // …其他页面
]

/* ----------------  创建路由实例 ---------------- */

const router = createRouter({
  history: createWebHashHistory(),
  routes,
  // 确保路由正确解析
  strict: true
})

// 导航到不存在的路由时，重定向到首页
router.onError((error) => {
  console.error('路由错误:', error)
})

// 全局前置守卫
// router.beforeEach((to, from, next) => {
//   // 检查路由是否需要登录权限
//   const requiresAuth = to.matched.some(record => record.meta.requiresAuth)
//   // 检查用户是否已登录
//   const isLoggedIn = localStorage.getItem('isLoggedIn') === 'true'
  
//   // 如果需要登录权限但用户未登录，重定向到登录页
//   if (requiresAuth && !isLoggedIn) {
//     next('/login')
//   } else {
//     // 其他情况正常放行
//     next()
//   }
// })
  
export default router
