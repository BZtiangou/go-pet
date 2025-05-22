// File: pet.vue
<template>
  <!-- 整个宠物容器，设置为 relative 以便气泡定位 -->
  <!-- 整个宠物容器：宽高随模型大小变化 -->
  <div
    class="pet-wrapper"
    :class="'role-'+(roleIdx+1)"
    :style="{
      left: x + 'px',
      top:  y + 'px',
      position: 'absolute',
      width:  imgW + 'px',
      height: imgH + 'px'
    }"
    @mouseenter="showControls"
    @mouseleave="scheduleHide"
  >
    <!-- Live2D 容器 -->
    <div ref="modelContainer" class="pet-model" 
      @mousedown.prevent="handleStartDrag"
    @mouseup="handleEndDrag"
    />

    <!-- 对话气泡：相对于角色容器定位，置于模型下方 -->
    <div id="waifu-tips" class="waifu-tips"></div>

    <!-- 左侧按钮 -->
    <transition name="fade">
      <div
        v-if="ctrlVisible && !nearLeft"
        class="ctrl-col left"
        :style="leftStyle"
        @mouseenter="showControls"
        @mouseleave="scheduleHide"
      >
        <button class="btn icon info-btn"     @click="handleInfo('Info')">👤</button>
        <button class="btn icon settings-btn" @click="handleSettings('Settings')">⚙</button>
        <button id="waifu-tool-switch-model" class="btn circle switch-btn" @click="handleSwitchRole">S</button>
        <button id="waifu-tool-quit" class="btn circle exit-btn"   @click="handleExit">E</button>
      </div>
    </transition>

    <!-- 右侧按钮 -->
    <transition name="fade">
      <div
        v-if="ctrlVisible && !nearRight"
        class="ctrl-col right"
        :style="rightStyle"
        @mouseenter="showControls"
        @mouseleave="scheduleHide"
      >
        <!-- 换装按钮：先换装再触发 speak() -->
    <button
      id="waifu-tool-switch-texture"
      class="btn circle dress-btn"
      @click="handleDress"
    >D</button>
        <button class="btn rect chat-btn"    @click="handleChat('Chat')">Chat</button>
        <button
          v-if="!panelVisible"
          class="btn rect other-btn"
          @click.stop="handleOther"
        >Other</button>
      </div>
    </transition>

    <!-- 功能面板 -->
    <transition name="fade">
      <div
        v-if="panelVisible"
        ref="panelEl"
        class="panel"
        :style="panelPos"
        @mouseenter="showControls"
        @mouseleave="scheduleHide"
      >
        <div
          v-for="f in features"
          :key="f"
          class="panel-item"
          @click="handleFeature(f)"
        >{{ f }}</div>
      </div>
    </transition>
  </div>
</template>

<script setup>
import { onMounted, onBeforeUnmount } from 'vue'
import usePetLogic from './petLogic.js'
import { useLive2dModel } from '../composables/useLive2dModel.js'


// 基础控制/拖拽逻辑
const petApi = usePetLogic()
const {
  x, y,
  imgW, imgH,
  ctrlVisible, nearLeft, nearRight,
  leftStyle, rightStyle,
  showControls, scheduleHide, startDrag,
  togglePanel, exitApp,
  panelVisible, panelPos, panelEl, features,
  updateImgSize, modelContainer
} = petApi

// Live2D 组合函数：解构出 roleIdx 以便切换色调
const {
  roleIdx,
  nextModel: switchRole,
  nextTexture: switchDress,
  isDragging,
  speak
} = useLive2dModel(modelContainer, updateImgSize)

//拖拽
function handleStartDrag(e) {
  isDragging.value = true
  startDrag(e)
}
function handleEndDrag() {
  isDragging.value = false
  scheduleHide()
}

onMounted(() => window.addEventListener('mouseup', handleEndDrag))
onBeforeUnmount(() => window.removeEventListener('mouseup', handleEndDrag))

//我会说话了
const emit = defineEmits(['open'])
function handleFeature(feature) {
  speak()
  emit('open', feature)
}

function handleInfo() {
  speak('#waifu-tool-info')
  emit('open', 'Info')
}

function handleSettings() {
  speak('#waifu-tool-settings')
  emit('open', 'Settings')
}

function handleSwitchRole() {
  switchRole()
}

function handleChat() {
  speak('#waifu-tool-chat')
  emit('open', 'Chat')
}

function handleOther() {
  speak('#waifu-tool-fun')
  togglePanel()
}

async function handleExit() {
  speak('#waifu-tool-quit')
  setTimeout(() => exitApp(), 4000)
}

function handleDress() {
  // 换装：逻辑已移到 useLive2dModel.nextTexture()，会自己说话
  switchDress()
}



</script>

<style scoped src="./petStyle.css" />
<style scoped>

/* 对话气泡的像素风样式，左下角 */
.pet-wrapper .waifu-tips {
  position: absolute;
  bottom: calc(100% - 27px); 
  left: 0;
  transform: translateX(20%);
  width: 215px;                /* 固定宽度 */
  padding: 4px 6px;
  box-sizing: border-box;      /* 含边框在内 */
  font-family: 'Press Start 2P', monospace;
  font-size: 8px;
  line-height: 1.5;
  word-wrap: break-word;
  white-space: normal;
  border: 2px solid #000;
  border-radius: 8px;
  background: rgba(255,255,255,0.9);
  color: #000;
  box-shadow: 2px 2px 0 #000, -2px -2px 0 #000 inset;
  image-rendering: pixelated;
  opacity: 0;                   /* 默认隐藏 */
  transition: opacity 0.3s ease;
  pointer-events: none;
  z-index: 10;
}

/* 气泡尾巴：等宽三角形，指向下方 */
.pet-wrapper .waifu-tips::after {
  content: '';
  position: absolute;
  top: 100%;
  left: 50%;
  transform: translateX(-50%);
  border-left: 10px solid transparent;
  border-right: 10px solid transparent;
  border-top: 10px solid #000;   /* 与 border-color 保持一致 */
}

/* 激活态：4s 内 showMessage 会给这个类，触发淡入 */
#waifu-tips.waifu-tips-active {
  opacity: 1;
}

/* 五个角色的对话框css */

/* 灰色色调 → role-1 */
.pet-wrapper.role-1 .waifu-tips {
  background: rgba(239, 237, 237, 0.8);
  color: #000000;
}

/* 粉色色调（role-2） */
.pet-wrapper.role-2 .waifu-tips {
  background: rgba(253, 222, 226, 0.8);
  color: #000000;
}
/* 绿色色调（role-3） */
.pet-wrapper.role-3 .waifu-tips {
  background: rgba(199, 249, 199, 0.8);
  color: #000;
}
/* 黄色色调（role-4） */
.pet-wrapper.role-4 .waifu-tips {
  background: rgba(252, 252, 200, 0.8);
  color: #000;
}
/* 紫色色调（role-5） */
.pet-wrapper.role-5 .waifu-tips {
  background: rgba(255, 223, 255, 0.8);
  color: #000000;
}

</style>

<!-- 全局隐藏滚动条 把多余的拖动条隐藏-->
<style>
html, body {
  overflow: hidden !important;
}
</style>





