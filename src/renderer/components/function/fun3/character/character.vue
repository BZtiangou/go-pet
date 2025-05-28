<template>
  <div
    ref="wrapperRef"
    class="char-selection"
    :style="{ left: posX + 'px', top: posY + 'px' }"
    @mousedown="onMouseDown"
    @mouseenter="disableClick"
    @mouseleave="enableClick"
  >
    <div class="top-bar">
      <button
        class="return-btn pixel-frame"
        @mousedown.stop
        @click.stop="goBack"
      >
        Return
      </button>
    </div>

    <div class="panels">
      <div
        v-for="(c, i) in characters"
        :key="i"
        class="panel pixel-frame"
        :style="{
          backgroundColor: c.color,
          backgroundImage: 'url('+c.image+')',
          opacity: c.opacity
        }"
        @click="select(c)"
      >
        <div class="label pixel-box">{{ c.name }}</div>
      </div>
    </div>

    <!-- 角色详情面板 -->
    <div v-if="selectedCharacter" class="character-detail pixel-frame">
      <!-- 上部：头像 + 两行文字 -->
      <div class="detail-top">
        <div class="avatar">
          <img
            :src="selectedCharacter.avatarImage"
            alt="头像"
            style="width:100%; height:100%; object-fit:cover;"
          />
        </div>
        <div class="details">
          <div class="info-row">
            <span class="info-title">Char.:</span>
            <span class="info-text">{{ selectedCharacter.name }}</span>
          </div>
          <div class="info-row">
            <span class="info-title">Pers.:</span>
            <span class="info-text">{{ selectedCharacter.personality }}</span>
          </div>
        </div>
      </div>

      <!-- 中部：解锁数量 -->
      <div class="unlock-panel pixel-frame">
        Skins unlocked:{{ selectedCharacter.skinUnlocked }} / {{ selectedCharacter.totalSkins }}
      </div>

      <!-- 底部：两个按钮 -->
      <div class="detail-footer">
        <button class="draw-btn pixel-frame" @click="drawSkin">
          Extr. (300 stars)
        </button>
        <button class="close-btn pixel-frame" @click="closeDetail">
          Close
        </button>
      </div>
    </div>

    <!-- 弹窗（不动） -->
    <div v-if="showPopup" class="draw-popup">
      <div class="popup-content pixel-frame">
        <p class="popup-text">
  Congratulations!<br>
  Get new skin:<br>{{ lastSkinName }}
</p>
        <button class="popup-btn" @click="closePopup">
          I know
        </button>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, onBeforeUnmount } from 'vue'
import img1 from './pic/1.png'
import img2 from './pic/2.png'
import img3 from './pic/3.png'
import img4 from './pic/4.png'
import img5 from './pic/5.png'
import av1  from './pic/11.jpg'
import av2  from './pic/22.jpg'
import av3  from './pic/33.jpg'
import av4  from './pic/44.jpg'
import av5  from './pic/55.jpg'

const emit = defineEmits(['openpanel','select'])

const wrapperRef = ref(null)
const posX        = ref(100)
const posY        = ref(100)
const panelW      = ref(0)
const panelH      = ref(0)

// 拖拽状态
let possibleDrag = false  // mousedown 后先标记“可能拖拽” 边界和拖拽的对应的位置！！ 把「点一下」和「拖拽」两件事分开处理，避免点选时因为手指或鼠标的细微抖动误触成拖拽
let dragging     = false  // 真正进入拖拽
let startX = 0, startY = 0
let offX   = 0, offY   = 0

const characters = ref([
  { name:'Rana',   color:'#EFFEEA', image:img1, opacity:0.8, skinUnlocked:5, totalSkins:10, personality:'Mysterious', avatarImage:av1 },
  { name:'Anon',   color:'#FFE9F2', image:img2, opacity:0.8, skinUnlocked:3, totalSkins:7,  personality:'Energetic', avatarImage:av2 },
  { name:'Tomori', color:'#ECECE7', image:img3, opacity:0.8, skinUnlocked:7, totalSkins:10, personality:'Introverted', avatarImage:av3 },
  { name:'Soyo',   color:'#FFF7DC', image:img4, opacity:0.8, skinUnlocked:2, totalSkins:5,  personality:'Supportive', avatarImage:av4 },
  { name:'Taki',   color:'#ECE5FF', image:img5, opacity:0.8,skinUnlocked:4, totalSkins:8,  personality:'Blunt', avatarImage:av5 },
])

const selectedCharacter = ref(null)
const showPopup    = ref(false)
const lastSkinName = ref('')

const electronAPI = window?.electronAPI ?? null
onMounted(() => {
  panelW.value = wrapperRef.value.offsetWidth
  panelH.value = wrapperRef.value.offsetHeight
  electronAPI?.setIgnoreMouseEvents(false)
})
onBeforeUnmount(() => {
  electronAPI?.setIgnoreMouseEvents(true)
})

// 鼠标按下：标记可能拖拽，并记录起始点
function onMouseDown(e) {
  if (e.button !== 0) return
  possibleDrag = true
  startX = e.clientX
  startY = e.clientY
  offX   = e.clientX - posX.value
  offY   = e.clientY - posY.value
  window.addEventListener('mousemove', onMouseMove)
  window.addEventListener('mouseup',   onMouseUp)
}

// 鼠标移动：判断是否超过阈值，开始拖拽后 clamp
function onMouseMove(e) {
  const dx = Math.abs(e.clientX - startX)
  const dy = Math.abs(e.clientY - startY)

  // 超过 5px 视为拖拽
  if (!dragging && possibleDrag && (dx > 5 || dy > 5)) {
    dragging = true
    document.body.style.cursor = 'move'
  }

  if (dragging) {
    const w  = panelW.value
    const h  = panelH.value
    const vw = window.visualViewport?.width  ?? window.innerWidth
    const vh = window.visualViewport?.height ?? window.innerHeight

    const newX = e.clientX - offX
    const newY = e.clientY - offY

    posX.value = Math.min(-190+Math.max(newX, 0), vw - w-210)
    posY.value = Math.min(-40+Math.max(newY, 0), vh - h-50)
  }
}

// 鼠标抬起：重置状态
function onMouseUp() {
  possibleDrag = false
  dragging     = false
  document.body.style.cursor = ''
  window.removeEventListener('mousemove', onMouseMove)
  window.removeEventListener('mouseup',   onMouseUp)
}

// 其余逻辑
function goBack()      { emit('openpanel','Fun3') }
function select(c)     { selectedCharacter.value = c }
function closeDetail() { selectedCharacter.value = null }
function drawSkin() {
  lastSkinName.value = `${selectedCharacter.value.name} Skin`
  showPopup.value    = true
}
function closePopup() { showPopup.value = false }
function disableClick(){ electronAPI?.setIgnoreMouseEvents(false) }
function enableClick() { electronAPI?.setIgnoreMouseEvents(true) }
</script>

<style scoped>
@import url('https://fonts.googleapis.com/css2?family=Press+Start+2P&display=swap');

.char-selection {
  position: fixed;
  width:500px; height:320px;
  background:#d8c4b2;
  border:2px solid #000;
  border-radius:10px 10px 16px 16px;
  box-shadow:3px 3px 0 #000;
  font-family:'Press Start 2P',monospace;
  user-select:none;
}

/* Return */
.return-btn {
  position:absolute; top:4px; right:4px;
  background:#f4edd9; border:3px solid #000;
  box-shadow:2px 2px 0 #000,-1px -1px 0 #000 inset;
  padding:4px 8px; font-size:8px; z-index:10;
}

.panels {
  display:flex; height:calc(100% - 40px); margin-top:33px;
}
.panel {
  flex:1; margin:0 3px; position:relative;
  background-size:cover; background-position:center;
  border:2px solid #000; box-shadow:2px 2px 0 #000 inset;
  transition:transform .2s,box-shadow .2s; cursor:pointer;
}
.panel:hover { transform:scale(1.03); box-shadow:2px 2px 0 #000; }

.panel .label {
  position:absolute; top:80%; left:50%;
  transform:translateX(-50%);
  background:#d7d6d1; border:1px solid #000;
  box-shadow:2px 2px 0 #000,-1px -1px 0 #000 inset;
  padding:4px 14px; font-size:8px; pointer-events:none;
}

/* 详情面板 */
/* ——— 重新排版的详情面板 ——— */
.character-detail {
  position: absolute;
  top: 50%; left: 50%;
  transform: translate(-50%, -50%);
  width: 320px;
  background: #f4e5e2;
  border: 3px solid #000;
  border-radius: 8px;
  padding: 20px;
  box-shadow: 4px 4px 0 #000;
  z-index: 5;
}

/* 上部：头像 + 文字 */
.detail-top {
  display: flex;
  align-items: center;
  gap: 12px;
}
.detail-top .avatar {
  width: 80px;
  height: 80px;
  border: 3px solid #000;
  background: #fff;
  border-radius: 4px;
}
.details {
  flex: 1;
}
.details .info-row {
  margin-bottom: 8px;
  font-size: 10px;
}
.info-title {
  display: inline-block;
  width: 65px;
  font-weight: bold;
}
.info-text {
  display: inline-block;
}

/* 中部：大面板 */
.unlock-panel {
  width: 100%;
  height: 32px;
  background: #ffd4c7;
  border: 2px solid #000;
  box-shadow: 2px 2px 0 #000, -1px -1px 0 #000 inset;
  border-radius: 1px;
  line-height: 32px;
  text-align: center;
  font-size: 10px;
  margin: 12px 0;
}

/* 底部：按钮行 */
.detail-footer {
  display: flex;
  justify-content: space-between;
}
.draw-btn{
  width: 150px;
  height: 32px;
  line-height: 32px;
  background: #ffc79f;
  color: #fff;
  border: none;
  box-shadow: 2px 2px 0 #000;
  border-radius: 4px;
  font-size:8px;
  cursor: pointer;
  text-align: center; 
}

.close-btn {
  width: 100px;
  height: 32px;
  line-height: 32px;
  background: #fbaeae;
  color: #fff;
  border: none;
  box-shadow: 2px 2px 0 #000;
  border-radius: 4px;
  font-size:8px;
  cursor: pointer;
  text-align: center; 
}
.draw-btn:hover{
  transform: scale(1.05);
  background: #fcd55f;
}

.close-btn:hover {
  transform: scale(1.05);
  background: #f66767;
}
/* 抽取弹窗 */
.draw-popup {
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  z-index: 10;
  animation: float 2s ease-in-out infinite; /* 添加浮动动画 */
}

@keyframes float {
  0%, 100% { transform: translate(-50%, -52%); }
  50% { transform: translate(-50%, -48%); }
}

.popup-content {
  background: #fad5c3;
  border: 3px solid #000;
  box-shadow: 
    4px 4px 0 #000,
    8px 8px 16px rgba(0,0,0,0.1); /* 柔和外阴影 */
  border-radius: 12px;
  padding: 20px;
  width: 200px;
  text-align: center;
  font-family: 'Press Start 2P', monospace;
  position: relative;
  overflow: hidden;
}

/* 添加装饰性像素边框 */
.popup-content::before {

  position: absolute;
  top: 2px;
  left: 2px;
  right: 2px;
  bottom: 2px;
  border: 2px dashed rgba(255,255,255,0.3);
  border-radius: 8px;
  pointer-events: none;
}

.popup-text {
  font-size: 9px;
  margin-bottom: 16px;
  line-height: 1.6;
  text-shadow: 1px 1px 0 rgba(255,255,255,0.5); /* 文字描边 */
  color: #5a3921; 
}

.popup-btn {
  background: #ff9a76;
  color: #000;
  border: 2px solid #000;
  box-shadow: 
    2px 2px 0 #000; 
  padding: 8px 16px;
  border-radius: 8px;
  font-size: 9px;
  cursor: pointer;
  transition: all 0.2s ease;
  position: relative;
  overflow: hidden;
}

.popup-btn:hover {
  filter: brightness(1.1);
  transform: translate(-1px, -1px);
  box-shadow: 
    3px 3px 0 #000;
}

.popup-btn:active {
  transform: translate(1px, 1px);
  box-shadow: 
    1px 1px 0 #000;
}

/* 添加按钮的像素风装饰 */
.popup-btn::after {
  content: "";
  position: absolute;
  top: -10%;
  left: -10%;
  width: 120%;
  height: 120%;
  background: linear-gradient(
    45deg,
    transparent 25%,
    rgba(255,255,255,0.1) 25%,
    rgba(255,255,255,0.1) 50%,
    transparent 50%,
    transparent 75%,
    rgba(255,255,255,0.1) 75%
  );
  background-size: 4px 4px;
  opacity: 0.5;
  pointer-events: none;
}
</style>








  




  
  
  
  
  
  
