//路由配置

import {createRouter, createWebHashHistory } from 'vue-router'

 import Main from '@renderer/views/mainpage/mainpage.vue'

 import Login  from '@renderer/views/login/login.vue'

 //路由


const routes = [
  { path: '/',      component: Login }, 
  { path : '/mainpage', component: Main, exact: true}
  // …其他页面
]

/* ----------------  创建路由实例 ---------------- */

const router = createRouter({
    history: createWebHashHistory(),
    routes
  })
  
  export default router
