<template>
  <div
  class="pet-wrapper"
  :style="{ left: x + 'px', top: y + 'px' }"
  @mouseenter="showControls"
  @mouseleave="scheduleHide"
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
</div>

    <!-- Left Controls -->
    <transition name="fade">
      <div
        v-if="ctrlVisible && !nearLeft"
        class="ctrl-col left"
        :style="leftStyle"
        @mouseenter="showControls"
        @mouseleave="scheduleHide"
      >
        <!-- Info icon -->
        <button class="btn icon info-btn" @click="onClick('Info')">👤</button>
        <!-- Settings gear -->
        <button class="btn icon settings-btn" @click="onClick('Settings')">⚙</button>
        <!-- Switch -->
        <button class="btn circle switch-btn" @click="onClick('Switch')">S</button>
        <!-- Exit -->
        <button class="btn circle exit-btn" @click="exitApp">E</button>
      </div>
    </transition>

    <!-- Right Controls -->
    <transition name="fade">
      <div
        v-if="ctrlVisible && !nearRight"
        class="ctrl-col right"
        :style="rightStyle"
        @mouseenter="showControls"
        @mouseleave="scheduleHide"
      >
        <button class="btn circle dress-btn" @click="onClick('Dress')">D</button>
        <button class="btn rect chat-btn" @click="onClick('Chat')">Chat</button>
        <button
          v-if="!panelVisible"
          class="btn rect other-btn"
          @click.stop="togglePanel"
        >Other</button>
      </div>
    </transition>

    <!-- Other Panel -->
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

 
 <!-- <router-view /> -->
</template>

<script setup>

import { useRouter } from 'vue-router'
import { ref, computed, nextTick, onMounted, onBeforeUnmount } from 'vue'

const router = useRouter()

function go(path) {
  router.push(path)   // 直接跳
  scheduleHide()      // 收起面板（可选）
}

/* 原来的 onClick 直接改成 */
function onClick(tag) {
  if (tag === 'Fun3' || tag === 'Other') {
    go('/goal')
  } else if (tag === 'Info') {
    go('/home')
  } else {
    console.log('Clicked:', tag)
  }
}


const petSrc = new URL('../../common/images/mxr.png', import.meta.url).href
const electronAPI = window?.electronAPI ?? null
function safeIgnore(flag) { electronAPI?.setIgnoreMouseEvents(flag) }

const x = ref(200), y = ref(200)
const isDragging = ref(false)
let offsetX = 0, offsetY = 0

const imgEl = ref(null)
const imgW = ref(800), imgH = ref(1000)
function updateImgSize() {
  imgW.value = imgEl.value.offsetWidth
  imgH.value = imgEl.value.offsetHeight
}

const ctrlVisible = ref(false)
let hideTimer = null
function showControls() {
  clearTimeout(hideTimer)
  ctrlVisible.value = true
  safeIgnore(false)
}
function scheduleHide() {
  hideTimer = setTimeout(() => {
    ctrlVisible.value = false
    panelVisible.value = false
    safeIgnore(true)
  }, 1000)
}

function startDrag(e) {
  isDragging.value = true
  showControls()
  offsetX = e.clientX - x.value
  offsetY = e.clientY - y.value
  function onMove(ev) {
    if (!isDragging.value) return
    x.value = Math.min(Math.max(0, ev.clientX - offsetX), window.innerWidth - imgW.value)
    y.value = Math.min(Math.max(0, ev.clientY - offsetY), window.innerHeight - imgH.value)
  }
  function onUp() {
    isDragging.value = false
    window.removeEventListener('mousemove', onMove)
    window.removeEventListener('mouseup', onUp)
  }
  window.addEventListener('mousemove', onMove)
  window.addEventListener('mouseup', onUp)
}

const M = 6, CW = 80, CH = 120
const nearLeft = computed(() => x.value < CW + M)
const nearRight = computed(() => x.value + imgW.value > window.innerWidth - CW - M)

const leftStyle = computed(() => {
  const lx = nearLeft.value ? x.value + imgW.value + M : x.value - CW - M
  let ly = y.value + (imgH.value - CH) / 2
  ly = Math.max(M, Math.min(ly, window.innerHeight - CH - M))
  return { left: lx + 'px', top: ly + 'px' }
})
const rightStyle = computed(() => {
  const rx = nearRight.value ? x.value - CW - M : x.value + imgW.value + M
  let ry = y.value + (imgH.value - CH) / 2
  ry = Math.max(M, Math.min(ry, window.innerHeight - CH - M))
  return { left: rx + 'px', top: ry + 'px' }
})

const features = ['Fun1','Fun2','Fun3']
const panelVisible = ref(false)
const panelPos = ref({ left: '0px', top: '0px' })

function togglePanel() {
  panelVisible.value = !panelVisible.value
  if (panelVisible.value) nextTick(placePanel)
  else scheduleHide()
}

function placePanel() {
  const btn = document.querySelector('.chat-btn')
  if (!btn) return
  const r = btn.getBoundingClientRect()
  const pane = panelEl.value
  const w = pane.offsetWidth, h = pane.offsetHeight
  let px = r.left + (r.width - w) / 2
  px = Math.max(M, Math.min(px, window.innerWidth - w - M))
  let py = r.bottom + M
  if (py + h > window.innerHeight - M) py = r.top - h - M
  panelPos.value = { left: px + 'px', top: py + 'px' }
}

function onResize() { if (panelVisible.value) placePanel() }
onMounted(() => window.addEventListener('resize', onResize))
onBeforeUnmount(() => window.removeEventListener('resize', onResize))

function exitApp() { electronAPI?.exitApp?.() }
  


const panelEl = ref(null)

</script>

<style scoped>
@import url('https://fonts.googleapis.com/css2?family=Press+Start+2P&display=swap');

.pet-wrapper, .pet-wrapper * {
  pointer-events: auto;
}
.pet-wrapper {
  position: fixed;
  z-index: 9999;
  font-family: 'Press Start 2P', monospace;
}

/* 宠物图 */
.pet-img {
  width: 120px;
  transition: transform .2s;
}
.pet-img:hover {
  transform: scale(1.05);
}

/* 控件列 */
.ctrl-col {
  position: fixed;
  display: flex;
  flex-direction: column;
  gap: 6px;
  width: 80px;
}
/* 左侧列：所有圆形 & 图标按钮右对齐 */
.ctrl-col.left .circle,
.ctrl-col.left .icon {
  align-self: flex-end;
}

/* 按钮基础：8-bit 边框 + 倒影 + 内凹 */
.btn {
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 10px;
  color: #000;
  cursor: pointer;
  border: 3px solid #000;
  box-shadow:
    4px 4px 0 #000,       /* 右下拉伸 */
    -2px -2px 0 #000 inset; /* 左上内凹 */
  text-shadow: none;
  transition: none;
  image-rendering: pixelated;
}

/* 矩形按钮 */
.btn.rect {
  width: 80px;
  height: 28px;
  border-radius: 4px;
}

/* 椭圆按钮 */
.btn.circle {
  width: 28px;
  height: 28px;
  border-radius: 6px;
}

/* 图标按钮 */
.btn.icon {
  width: 28px;
  height: 28px;
  border-radius: 4px;
  font-size: 14px; /* 图标偏大一点 */
  line-height: 1;
}

/* 背景色 */
.info-btn       { background: #FFD7BA; }
.settings-btn   { background: #f9a4bc; }
.switch-btn     { background: #f9ad9c; }
.dress-btn      { background: #D8E2DC; }
.chat-btn       { background: #dadad7; }
.other-btn      { background: #faf6dd; }
.exit-btn       { background: #FCD5CE; }

/* Hover 高亮 */
.btn:hover {
  filter: brightness(1.3);
}

/* “Other” 面板 */
.panel {
  position: fixed;
  display: flex;
  flex-direction: column;
  gap: 4px;
  padding: 4px;
  background: #FAE1DD;
  border: 3px solid #000;
  box-shadow:
    4px 4px 0 #000,
    -2px -2px 0 #000 inset;
  border-radius: 4px;
  image-rendering: pixelated;
}

.panel-item {
  width: 80px;
  height: 24px;
  font-size: 10px;
  color: #000;
  background: #FEC89A;
  border: 3px solid #000;
  box-shadow:
    1.5px 1.5px 0 #000,
    -1px -1px 0 #000 inset;
  border-radius: 3px;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  transition: none;
  image-rendering: pixelated;
}
.panel-item:hover {
  filter: brightness(1.25);
}

/* 淡入淡出 */
.fade-enter-active,
.fade-leave-active {
  transition: opacity .2s;
}
.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}
</style>
