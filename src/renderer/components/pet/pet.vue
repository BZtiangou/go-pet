<template>
  <div
    class="pet-wrapper"
    :style="{ left: x + 'px', top: y + 'px' }"
    @mouseenter="showControls"
    @mouseleave="scheduleHide"
    @mousedown.prevent="startDrag"
  >
    <!-- Pet Image -->
  <img
    ref="imgEl"
    class="pet-img"
    :src="petSrc"
    alt="pet"
    @load="updateImgSize"
    @mousedown.prevent="startDrag"
    :style="{
      width:  imgW  + 'px',
      height: imgH  + 'px',
      cursor: isDragging ? 'grabbing' : 'grab'
    }"
  />

    <!-- 左侧按钮 -->
    <transition name="fade">
      <div
        v-if="ctrlVisible && !nearLeft"
        class="ctrl-col left"
        :style="leftStyle"
        @mouseenter="showControls"
        @mouseleave="scheduleHide"
      >
        <button class="btn icon info-btn"     @click="onClick('Info')">👤</button>
        <button class="btn icon settings-btn" @click="onClick('Settings')">⚙</button>
        <button class="btn circle switch-btn" @click="onClick('Switch')">S</button>
        <button class="btn circle exit-btn"   @click="exitApp">E</button>
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
        <button class="btn circle dress-btn" @click="onClick('Dress')">D</button>
        <button class="btn rect chat-btn"    @click="onClick('Chat')">Chat</button>
        <button
          v-if="!panelVisible"
          class="btn rect other-btn"
          @click.stop="togglePanel"
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
          @click="onClick(f)"
        >{{ f }}</div>
      </div>
    </transition>
  </div>
</template>

<script setup>
// —— 事件定义 ——  
const emit = defineEmits(['open'])

// —— 业务逻辑 ——  
import usePetLogic from './petLogic.js'
const {
  x, y, isDragging, petSrc,
  imgEl, updateImgSize,
  ctrlVisible, nearLeft, nearRight,
  leftStyle, rightStyle,
  panelVisible, panelPos, panelEl,
  showControls, scheduleHide,
  startDrag, togglePanel,
  exitApp,
  features
} = usePetLogic()

// —— 点击抛事件给父组件 ——  
function onClick(feature) {
  emit('open', feature)
}
</script>

<style scoped src="./petStyle.css"></style>

