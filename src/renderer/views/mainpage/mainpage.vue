<template>
  <!-- 永驻的桌宠 -->
  <DeskPet @open="openPanel" />

  <div v-if="panel" class="main-container">
    <!-- 动态渲染当前面板：同时监听 close 和 openpanel 事件 -->
    <component
      :is="panelMap[panel]"
      class="panel"
      @close="panel = null"
      @openpanel="openPanel"
    />
  </div>
</template>

<script setup>
import { ref } from 'vue'

// 桌宠组件
import DeskPet    from '@renderer/components/pet/pet.vue'
// 你的成就面板（Fun3Panel 即 goal_manager.vue）
import Fun3Panel  from '@renderer/components/function/fun3/goal_manager.vue'
// 你的角色详情页
import Character  from '@renderer/components/function/fun3/character/character.vue'

const panel = ref(null)

// 统一一个打开面板的方法：
// 如果传进来的是字符串，就直接切；
// 如果是对象（{ type: 'character' }），就取它的 .type
function openPanel(payload) {
  const key = typeof payload === 'string'
    ? payload
     : payload.type
   panel.value = key
}

const panelMap = {
  Fun3:      Fun3Panel,
  character: Character,
}
</script>

<style scoped>
.main-container {
  position: fixed;
  left: 40px;
  top: 40px;
  width: 420px;
  height: 480px;
  background: #00000000;
  margin-left: 160px;
}
</style>


  
  