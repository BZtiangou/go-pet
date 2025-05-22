<template>

  <div
    ref="wrapperRef"
    class="achv-wrap"
    :style="{ left: posX + 'px', top: posY + 'px' }"
    @mousedown="startDrag"
    @mouseenter="disableClick"
    @mouseleave="enableClick"
  >
    <!-- 顶部栏 -->
    <div class="top-bar">
      <div class="search-btn pixel-frame" @click.stop="openSearch">
        <svg class="icon search" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none"
          stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
          <circle cx="11" cy="11" r="8" />
          <line x1="21" y1="21" x2="16.65" y2="16.65" />
        </svg>
      </div>

      <div class="filter btn rect" @click.stop="cycleFilter">
        {{ filterOptions[filterIdx] }}
        <svg @click.stop class="change-icon" xmlns="http://www.w3.org/2000/svg" width="14" height="14"
             viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"
             stroke-linecap="round" stroke-linejoin="round">
          <path d="M2 12h20M9 5l-7 7 7 7" />
        </svg>
      </div>

      <div class="char-slot pixel-frame" @click.stop="goToCharacter">
        character
      </div>

      <div class="star-counter pixel-frame">
        stars:&nbsp;{{ stars }}/999999
      </div>

      <div class="close-btn pixel-frame" @click.stop="closePage">✕</div>
    </div>

    <div class="content-area">
      <!-- 左列类别 -->
      <div class="left-col">
        <div class="cat-title pixel-box" @click="resetAll">成就浏览</div>
        <div class="cat-title pixel-box sel-title" @click.stop="toggleCategoryList">
          <span class="filter-label">
            成就类别
            <svg class="arrow-icon" xmlns="http://www.w3.org/2000/svg" width="12" height="12"
                 viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"
                 stroke-linecap="round" stroke-linejoin="round">
              <polyline points="6 9 12 15 18 9"></polyline>
            </svg>
          </span>
        </div>

        <el-scrollbar class="cat-scroll" v-show="showCategoryList">
          <div
            v-for="c in categories"
            :key="c"
            class="cat-item pixel-frame"
            @click.stop="selectCategory(c)"
          >{{ c }}</div>
        </el-scrollbar>
      </div>

      <!-- 右侧成就列表 -->
      <el-scrollbar class="right-col">
        <div
          v-for="a in filteredAchievements"
          :key="a.id"
          class="achv-card pixel-frame"
          :class="{ done: a.done }"
          @click.stop="openDetail(a)"
        >
          <div class="icon-circle pixel-frame">
            <img v-if="a.icon" :src="a.icon" />
          </div>

          <div class="achv-info">
            <div class="title">{{ a.name }}</div>
            <div class="desc">{{ a.desc }}</div>

            <div class="progress-row">
              <span class="label">进度</span>
              <div class="prog-bar bg-pixel">
                <div
                  class="fill"
                  :style="{ width: a.progress + '%' }"
                ></div>
              </div>
              <span class="prog-num">{{ a.progress }}%</span>
            </div>
          </div>

          <div class="reward-box pixel-frame">
            <span class="stars-display">
              <svg class="icon star" xmlns="http://www.w3.org/2000/svg" width="14" height="14"
                   viewBox="0 0 24 24" fill="#FFD700">
                <path d="M12 .587l3.668 7.568L24 9.423l-6 5.91 1.417
                         8.58L12 18.897l-7.417 4.996L6 15.333
                         0 9.423l8.332-1.268z"/>
              </svg>
              {{ a.stars }}
            </span>
            <span v-if="a.done" class="tick">✔</span>
          </div>
        </div>
      </el-scrollbar>
    </div>

    <!-- 搜索弹窗 -->
    <div v-if="showSearch" class="search-modal pixel-frame" @mousedown.stop>
      <div v-if="errorMsg" class="error-msg">{{ errorMsg }}</div>
      <div class="search-box pixel-box">
        <label>输入想找的成就:</label>
        <input v-model="searchTerm" class="search-input" />
      </div>
      <div class="search-buttons">
        <button class="btn rect" @click="confirmSearch">确定</button>
        <button class="btn rect" @click="cancelSearch">退出</button>
      </div>
    </div>

    <!-- 未找到提示弹窗 -->
    <div v-if="msgModal.show" class="msg-modal pixel-frame" @mousedown.stop>
      <div class="msg-content pixel-box">{{ msgModal.text }}</div>
      <div class="msg-buttons">
        <button class="btn rect" @click="msgModal.show = false">确定</button>
      </div>
    </div>

    <div class="heart">❤</div>
  </div>
</template>

<script setup>

import { ref, reactive, computed, onMounted, onBeforeUnmount, nextTick } from 'vue'
import { useAchievements } from './goal_manager.js'

const { achievements, categories, stars } = useAchievements()

// 容器 & 拖拽
const wrapperRef = ref(null)
const panelW = ref(0), panelH = ref(0)
const posX = ref(0), posY = ref(0)
onMounted(async () => {
  await nextTick()
  panelW.value = wrapperRef.value.offsetWidth
  panelH.value = wrapperRef.value.offsetHeight
  posX.value = (window.innerWidth - panelW.value) / 2
  posY.value = (window.innerHeight - panelH.value) / 2
})
let dragging = false, offX = 0, offY = 0
function startDrag(e) {
  dragging = true
  offX = e.clientX - posX.value
  offY = e.clientY - posY.value
  window.addEventListener('mousemove', onDrag)
  window.addEventListener('mouseup',   endDrag)
}
function onDrag(e) {
  if (!dragging) return
  const w = panelW.value, h = panelH.value
  posX.value = Math.min(Math.max(e.clientX - offX, 0), window.innerWidth - w)
  posY.value = Math.min(Math.max(e.clientY - offY, 0), window.innerHeight - h)
}
function endDrag() {
  dragging = false
  window.removeEventListener('mousemove', onDrag)
  window.removeEventListener('mouseup',   endDrag)
}

// 鼠标穿透
const electronAPI = window?.electronAPI ?? null
function disableClick() { electronAPI?.setIgnoreMouseEvents(false) }
function enableClick()  { electronAPI?.setIgnoreMouseEvents(true)  }
onBeforeUnmount(() => enableClick())

// 过滤 & 分类
const filterOptions   = ['ALL','Unlocked','Locked']
const filterIdx       = ref(0)
function cycleFilter() { filterIdx.value = (filterIdx.value + 1) % 3 }

const showCategoryList = ref(false)
function toggleCategoryList() {
  showCategoryList.value = !showCategoryList.value
}

const curCat = ref('ALL')
function selectCategory(c) { curCat.value = c }

// 搜索 & 提示
const showSearch    = ref(false)
const searchTerm    = ref('')
const searchResults = ref(null)
const errorMsg      = ref('')
const msgModal      = reactive({ show:false, text:'' })

function openSearch() {
  showSearch.value = true
}
function confirmSearch() {
  const term = searchTerm.value.trim().toLowerCase()
  if (!term) {
    errorMsg.value = '请输入内容'
    return
  }
  const results = achievements.value.filter(a =>
    a.name.toLowerCase().includes(term) ||
    a.desc.toLowerCase().includes(term)
  )
  if (results.length) {
    searchResults.value = results
    showSearch.value   = false
    errorMsg.value     = ''
  } else {
    showSearch.value = false
    errorMsg.value   = ''
    msgModal.text    = '未找到'
    msgModal.show    = true
  }
}
function cancelSearch() {
  showSearch.value    = false
  searchTerm.value    = ''
  searchResults.value = null
  errorMsg.value      = ''
}

function resetAll() {
  // 恢复 “全部” 分类
  curCat.value       = 'ALL'
  // 恢复 “ALL / Unlocked / Locked”
  filterIdx.value    = 0
  // 清空搜索
  searchResults.value = null
  searchTerm.value    = ''
  errorMsg.value      = ''
  // 同时关闭弹窗（如果打开的话）
  showSearch.value   = false
  msgModal.show      = false
  // 隐藏类别列表（可选）
  showCategoryList.value = false
}


// 最终列表：搜索优先，其次分类+锁定过滤
const filteredAchievements = computed(() => {
  if (searchResults.value !== null) {
    return searchResults.value
  }
  let list = achievements.value
  if (curCat.value !== 'ALL') {
    list = list.filter(a => a.cat === curCat.value)
  }
  if (filterIdx.value === 1)    list = list.filter(a => a.done)
  else if (filterIdx.value === 2) list = list.filter(a => !a.done)
  return list
})

// 详情 & 关闭


//function openDetail(a) { /* TODO 跳详情 */ }

//character
const emit = defineEmits(['openpanel', 'close'])

function goToCharacter() {
  // 通知父组件切换到角色详情
  emit('openpanel', { type: 'character' }) 
}

function closePage() {
  emit('close')
}
</script>

<style scoped src="./goal_manager.css"></style>


