import { createApp } from 'vue'
// 全局样式
import '@renderer/common/styles/frame.styl'
import ElementPlus from 'element-plus'
import 'element-plus/dist/index.css'
//import App from '@renderer/views/home/home.vue'
//import App from '@renderer/components/function/fun3/goal_manager.vue'
//import App from '@renderer/components/pet/pet.vue'
import App from '@renderer/App.vue'
//import App from '@renderer/views/mainpage/mainpage.vue'
//import App from '@renderer/components/function/fun3/character/character.vue'
import router from './router'

const app = createApp(App)
app.use(ElementPlus)
app.use(router)
app.mount('#app')


