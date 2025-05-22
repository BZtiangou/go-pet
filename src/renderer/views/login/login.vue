<template>
    <div class="login-box">
      <!-- 登录表单… -->
      <button @click="doLogin">登录</button>
    </div>
  </template>
  
  <script setup>
  import { useRouter } from 'vue-router'
  const router = useRouter()
  
  function doLogin() {
    // 验证通过后
    router.push('/')   // 进入主界面
  }
  </script>
  