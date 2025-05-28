<template>
  <div class="login-container">
    <div class="login-box">
      <h2>系统登录</h2>
      <!--
      <div class="form-item">
        <label>用户名</label>
        <input v-model="username" type="text" placeholder="请输入用户名" />
        <div v-if="usernameError" class="error-tip">{{ usernameError }}</div>
      </div>
      <div class="form-item">
        <label>密码</label>
        <input v-model="password" type="password" placeholder="请输入密码" />
        <div v-if="passwordError" class="error-tip">{{ passwordError }}</div>
      </div>
      <button class="login-btn" @click="doLogin" :disabled="isLoading">
        {{ isLoading ? '登录中...' : '登录' }}
      </button>
      <div v-if="loginError" class="error-message">{{ loginError }}</div>
      
      <div v-if="accessToken" class="token-container">
        <h3>登录成功！</h3>
        <div class="token-info">
          <span>您的Access Token:</span>
          <div class="token-value">{{ accessToken }}</div>
        </div>
      </div>
      -->
      <p>登录功能已暂时禁用。</p>
    </div>
  </div>
</template>
  
<script setup>
/*
import { ref } from 'vue'
// import { useRouter } from 'vue-router' // 暂时注释，后续会用到

// const router = useRouter() // 暂时注释，后续会用到
const username = ref('')
const password = ref('')
const usernameError = ref('')
const passwordError = ref('')
const loginError = ref('')
const isLoading = ref(false)
const accessToken = ref('')

function validateForm() {
  let valid = true
  
  // 重置错误信息
  usernameError.value = ''
  passwordError.value = ''
  loginError.value = ''
  
  if (!username.value.trim()) {
    usernameError.value = '用户名不能为空'
    valid = false
  }
  
  if (!password.value) {
    passwordError.value = '密码不能为空'
    valid = false
  }
  
  return valid
}

async function doLogin() {
  if (!validateForm()) return
  
  isLoading.value = true
  accessToken.value = ''
  loginError.value = '' // 清除之前的错误信息
  
  // try {
  //   const response = await fetch('https://gps.primedigitaltech.com:9220/api/login/', {
  //     method: 'POST',
  //     headers: {
  //       'Content-Type': 'application/json',
  //     },
  //     body: JSON.stringify({
  //       username: username.value,
  //       password: password.value,
  //     }),
  //   })

  //   isLoading.value = false

  //   if (response.ok) {
  //     const data = await response.json()
  //     // 响应包含: "username", "refresh", "access", "expire"
  //     accessToken.value = data.access // 用于在登录成功后显示
      
  //     // 保存登录状态和token
  //     localStorage.setItem('isLoggedIn', 'true')
  //     localStorage.setItem('username', data.username) // 保存从API获取的用户名
  //     localStorage.setItem('accessToken', data.access) // 保存从API获取的access token
  //     // 如果需要，也可以存储 refresh token 和 expire 信息
  //     // localStorage.setItem('refreshToken', data.refresh)
  //     // localStorage.setItem('tokenExpire', data.expire)
      
  //     // 显示3秒后跳转到首页 (保持原有逻辑，以便用户看到成功信息和Token)
  //     setTimeout(() => {
  //       router.push('/')
  //     }, 3000)
  //   } else {
  //     const errorData = await response.json().catch(() => null) // 尝试解析错误响应体
  //     if (response.status === 401 || response.status === 400) {
  //       loginError.value = errorData?.detail || '用户名或密码错误'
  //     } else {
  //       loginError.value = `登录失败，请稍后再试 (状态码: ${response.status})`
  //     }
  //   }
  // } catch (error) {
  //   isLoading.value = false
  //   loginError.value = '网络请求失败，请检查您的网络连接。'
  //   console.error('Login API call failed:', error)
  // }

  // --- 临时替代逻辑 ---
  // 模拟登录成功，但不调用API或存储Token
  console.log('登录按钮被点击，但登录逻辑已被注释。');
  console.log('用户名:', username.value);
  console.log('密码:', password.value);
  isLoading.value = false;
  loginError.value = '登录功能暂时禁用。';
  // --- 临时替代逻辑结束 ---
}
*/
</script>

<style scoped>
.login-container {
  display: flex;
  justify-content: center;
  align-items: center;
  height: 100vh;
  background-color: #f5f5f5;
}

.login-box {
  width: 400px;
  padding: 30px;
  background: white;
  border-radius: 8px;
  box-shadow: 0 2px 12px rgba(0, 0, 0, 0.1);
}

h2 {
  text-align: center;
  margin-bottom: 24px;
  color: #333;
}

.form-item {
  margin-bottom: 16px;
}

label {
  display: block;
  margin-bottom: 8px;
  font-weight: bold;
}

input {
  width: 100%;
  padding: 10px;
  border: 1px solid #ddd;
  border-radius: 4px;
  box-sizing: border-box;
}

.login-btn {
  width: 100%;
  padding: 12px;
  background: #42b983;
  color: white;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  font-size: 16px;
  margin-top: 8px;
}

.login-btn:hover {
  background: #3ca576;
}

.login-btn:disabled {
  background: #9fd9c0;
  cursor: not-allowed;
}

.error-tip {
  color: #f56c6c;
  font-size: 12px;
  margin-top: 4px;
}

.error-message {
  color: #f56c6c;
  text-align: center;
  margin-top: 16px;
}

/* Token相关样式 */
.token-container {
  margin-top: 20px;
  padding: 15px;
  background-color: #f0f9eb;
  border-radius: 4px;
  border-left: 4px solid #67c23a;
}

.token-container h3 {
  margin-top: 0;
  margin-bottom: 10px;
  color: #67c23a;
  font-size: 16px;
}

.token-info {
  font-size: 14px;
}

.token-value {
  margin-top: 6px;
  padding: 8px;
  background-color: #f8f8f8;
  border: 1px solid #e0e0e0;
  border-radius: 4px;
  font-family: monospace;
  word-break: break-all;
  max-height: 60px;
  overflow-y: auto;
  font-size: 12px;
}
</style>
  