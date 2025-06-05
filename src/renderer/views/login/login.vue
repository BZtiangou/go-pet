<template>
  <div class="login-container">
    <div class="login-box">
      <h2>System Login</h2>
      <div class="form-item">
        <label>Username</label>
        <input v-model="username" type="text" placeholder="Please enter username" />
        <div v-if="usernameError" class="error-tip">{{ usernameError }}</div>
      </div>
      <div class="form-item">
        <label>Password</label>
        <input v-model="password" type="password" placeholder="Please enter password" />
        <div v-if="passwordError" class="error-tip">{{ passwordError }}</div>
      </div>
      <button class="login-btn" :disabled="isLoading" @click="doLogin">
        {{ isLoading ? 'Logging in...' : 'Login' }}
      </button>
      <div v-if="loginError" class="error-message">{{ loginError }}</div>
      
      <div v-if="accessToken" class="token-container">
        <h3>Login Successful!</h3>
        <div class="token-info">
          <span>Your Access Token:</span>
          <div class="token-value">{{ accessToken }}</div>
        </div>
      </div>
    </div>
  </div>
</template>
  
<script setup>
import { ref } from 'vue'
import { useRouter } from 'vue-router'

const router = useRouter()
const username = ref('')
const password = ref('')
const usernameError = ref('')
const passwordError = ref('')
const loginError = ref('')
const isLoading = ref(false)
const accessToken = ref('')

function validateForm() {
  let valid = true
  
  // Reset error messages
  usernameError.value = ''
  passwordError.value = ''
  loginError.value = ''
  
  if (!username.value.trim()) {
    usernameError.value = 'Username cannot be empty'
    valid = false
  }
  
  if (!password.value) {
    passwordError.value = 'Password cannot be empty'
    valid = false
  }
  
  return valid
}

async function doLogin() {
  if (!validateForm()) return
  
  isLoading.value = true
  accessToken.value = ''
  loginError.value = '' // Clear previous error messages
  
  try {
    const response = await fetch('https://gps.primedigitaltech.com:9220/api/login/', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        username: username.value,
        password: password.value,
      }),
    })

    isLoading.value = false

    if (response.ok) {
      const data = await response.json()
      // Response contains: "username", "refresh", "access", "expire"
      accessToken.value = data.access // For display after successful login
      
      // Save login status and token
      localStorage.setItem('isLoggedIn', 'true')
      localStorage.setItem('username', data.username) // Save username from API
      localStorage.setItem('accessToken', data.access) // Save access token from API
      // If needed, can also store refresh token and expire info
      // localStorage.setItem('refreshToken', data.refresh)
      // localStorage.setItem('tokenExpire', data.expire)
      
      // Show for 3 seconds then redirect to home (keep original logic for user to see success message and Token)
      setTimeout(() => {
        router.push('/')
      }, 3000)
    } else {
      const errorData = await response.json().catch(() => null) // Try to parse error response
      if (response.status === 401 || response.status === 400) {
        loginError.value = errorData?.detail || 'Invalid username or password'
      } else {
        loginError.value = `Login failed, please try again later (Status: ${response.status})`
      }
    }
  } catch (error) {
    isLoading.value = false
    loginError.value = 'Network request failed, please check your internet connection.'
    console.error('Login API call failed:', error)
  }
}
</script>

<style scoped>
/* 8-bit 像素风格，与主页一致 */
@import url('https://fonts.googleapis.com/css2?family=Press+Start+2P&display=swap');

.login-container {
  display: flex;
  justify-content: center;
  align-items: center;
  height: 100vh;
  background: linear-gradient(45deg, #FFB3BA, #FFDFBA, #FFFFBA, #BAFFC9, #BAE1FF);
  background-size: 400% 400%;
  animation: gradientShift 8s ease infinite;
  font-family: 'Press Start 2P', monospace;
  image-rendering: pixelated;
}

@keyframes gradientShift {
  0% { background-position: 0% 50%; }
  50% { background-position: 100% 50%; }
  100% { background-position: 0% 50%; }
}

.login-box {
  width: 420px;
  padding: 25px;
  background: #FAE1DD;
  border: 4px solid #000;
  box-shadow: 
    6px 6px 0 #000,
    -3px -3px 0 #000 inset;
  border-radius: 8px;
  image-rendering: pixelated;
}

h2 {
  text-align: center;
  margin-bottom: 24px;
  color: #000;
  font-family: 'Press Start 2P', monospace;
  font-size: 16px;
  text-shadow: 2px 2px 0 #ccc;
}

.form-item {
  margin-bottom: 20px;
}

label {
  display: block;
  margin-bottom: 8px;
  font-family: 'Press Start 2P', monospace;
  font-size: 10px;
  color: #000;
  text-shadow: 1px 1px 0 #fff;
}

input {
  width: 100%;
  padding: 12px;
  border: 3px solid #000;
  box-shadow: 
    2px 2px 0 #000,
    -1px -1px 0 #000 inset;
  border-radius: 4px;
  box-sizing: border-box;
  background: #fff;
  font-family: 'Press Start 2P', monospace;
  font-size: 10px;
  image-rendering: pixelated;
}

input:focus {
  outline: none;
  background: #f0f8ff;
  filter: brightness(1.1);
}

input::placeholder {
  color: #666;
  font-family: 'Press Start 2P', monospace;
  font-size: 8px;
}

.login-btn {
  width: 100%;
  padding: 15px;
  background: #BDE0FE;
  color: #000;
  border: 3px solid #000;
  box-shadow: 
    4px 4px 0 #000,
    -2px -2px 0 #000 inset;
  border-radius: 4px;
  cursor: pointer;
  font-family: 'Press Start 2P', monospace;
  font-size: 12px;
  margin-top: 8px;
  transition: none;
  image-rendering: pixelated;
}

.login-btn:hover {
  filter: brightness(1.3);
  transform: translate(1px, 1px);
  box-shadow: 
    3px 3px 0 #000,
    -2px -2px 0 #000 inset;
}

.login-btn:disabled {
  background: #ddd;
  color: #999;
  cursor: not-allowed;
  filter: none;
  transform: none;
}

.error-tip {
  color: #ff0000;
  font-family: 'Press Start 2P', monospace;
  font-size: 8px;
  margin-top: 4px;
  text-shadow: 1px 1px 0 #fff;
}

.error-message {
  color: #ff0000;
  text-align: center;
  margin-top: 16px;
  font-family: 'Press Start 2P', monospace;
  font-size: 8px;
  text-shadow: 1px 1px 0 #fff;
}

/* Token related styles - 8-bit 风格 */
.token-container {
  margin-top: 20px;
  padding: 15px;
  background: #f0f9eb;
  border: 3px solid #000;
  box-shadow: 
    4px 4px 0 #000,
    -2px -2px 0 #000 inset;
  border-radius: 6px;
  image-rendering: pixelated;
}

.token-container h3 {
  margin-top: 0;
  margin-bottom: 12px;
  color: #000;
  font-family: 'Press Start 2P', monospace;
  font-size: 12px;
  text-shadow: 1px 1px 0 #67c23a;
}

.token-info {
  font-family: 'Press Start 2P', monospace;
  font-size: 10px;
  color: #000;
}

.token-value {
  margin-top: 8px;
  padding: 10px;
  background: #f8f8f8;
  border: 2px solid #000;
  box-shadow: 
    2px 2px 0 #000,
    -1px -1px 0 #000 inset;
  border-radius: 4px;
  font-family: 'Courier New', monospace;
  word-break: break-all;
  max-height: 80px;
  overflow-y: auto;
  font-size: 10px;
  image-rendering: pixelated;
}

/* 滚动条样式 - 8-bit 风格 */
.token-value::-webkit-scrollbar {
  width: 12px;
}

.token-value::-webkit-scrollbar-track {
  background: #f1f1f1;
  border: 1px solid #000;
}

.token-value::-webkit-scrollbar-thumb {
  background: #888;
  border: 1px solid #000;
}

.token-value::-webkit-scrollbar-thumb:hover {
  background: #555;
}
</style>
