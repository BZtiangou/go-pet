<template>
  <div class="mood-tracker">
    <!-- 日期导航 -->
    <div class="date-nav">
      <button class="nav-btn prev-btn" @click="prevDay">◄</button>
      <div class="current-date">{{ currentDate }}</div>
      <button class="nav-btn next-btn" @click="nextDay">►</button>
      <!-- 修改统计按钮 -->
      <button class="stats-btn" 
        @click="goToStats" 
        @mouseenter="handleMouseEnter" 
        @mouseleave="handleMouseLeave">统计</button>
    </div>
    
    <!-- 心情选择区 -->
    <div class="mood-section">
      <h3>今日心情</h3>
      <div class="mood-grid">
        <div 
          v-for="mood in moods" 
          :key="mood.value" 
          class="mood-item"
          :class="{ 'selected': selectedMood === mood.value }"
          @click="selectMood(mood.value)"
        >
          <div class="emoji">{{ mood.emoji }}</div>
          <div class="mood-label">{{ mood.label }}</div>
        </div>
      </div>
    </div>

    <!-- 心情小记 -->
    <div class="note-section">
      <h3>心情小记</h3>
      <textarea 
        v-model="moodNote" 
        placeholder="写下今天的心情..."
        rows="5"
      ></textarea>
    </div>

    <!-- 保存按钮 -->
    <button class="save-btn" @click="saveMood">保存</button>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue';
import { useRouter } from 'vue-router';

const router = useRouter();

// 心情选项数据
const moods = [
  { emoji: '😊', label: '开心', value: 'happy' },
  { emoji: '🎉', label: '兴奋', value: 'excited' },
  { emoji: '😌', label: '平静', value: 'calm' },
  { emoji: '😪', label: '疲惫', value: 'tired' },
  { emoji: '🥺', label: '难过', value: 'sad' },
  { emoji: '😠', label: '生气', value: 'angry' }
];



// 状态变量
const selectedMood = ref('');
const moodNote = ref('');
const currentDateObj = ref(new Date());
const moodHistory = ref({});

// 计算当前日期的格式化字符串
const currentDate = computed(() => {
  const date = currentDateObj.value;
  const year = date.getFullYear();
  const month = date.getMonth() + 1;
  const day = date.getDate();
  return `${year}年${month}月${day}日`;
});

// 计算当前日期的唯一标识符（用于存储）
const dateKey = computed(() => {
  const date = currentDateObj.value;
  return `${date.getFullYear()}-${date.getMonth() + 1}-${date.getDate()}`;
});

// 页面加载时从localStorage获取历史记录
onMounted(() => {
  const savedHistory = localStorage.getItem('moodHistory');
  if (savedHistory) {
    moodHistory.value = JSON.parse(savedHistory);
    loadMoodForCurrentDate();
  }
});

// 加载当前日期的心情记录
function loadMoodForCurrentDate() {
  const key = dateKey.value;
  if (moodHistory.value[key]) {
    selectedMood.value = moodHistory.value[key].mood;
    moodNote.value = moodHistory.value[key].note || '';
  } else {
    selectedMood.value = '';
    moodNote.value = '';
  }
}

// 选择心情
function selectMood(mood) {
  selectedMood.value = mood;
}

// 导航到前一天
function prevDay() {
  const date = new Date(currentDateObj.value);
  date.setDate(date.getDate() - 1);
  currentDateObj.value = date;
  loadMoodForCurrentDate();
}

// 导航到后一天
function nextDay() {
  const date = new Date(currentDateObj.value);
  date.setDate(date.getDate() + 1);
  currentDateObj.value = date;
  loadMoodForCurrentDate();
}

// 保存心情记录
function saveMood() {
  if (!selectedMood.value) return;
  
  const key = dateKey.value;
  moodHistory.value[key] = {
    mood: selectedMood.value,
    note: moodNote.value,
    date: currentDate.value
  };
  
  // 保存到localStorage
  localStorage.setItem('moodHistory', JSON.stringify(moodHistory.value));
}

// 跳转到统计页面
function goToStats() {
  // 确保窗口可以接收鼠标事件
  window.electronAPI?.setIgnoreMouseEvents(false);
  router.push({ name: 'MoodStats' })
    .catch(err => {
      console.error('路由跳转失败:', err);
    });
}

// 鼠标进入按钮时
function handleMouseEnter() {
  window.electronAPI?.setIgnoreMouseEvents(false);
}

// 鼠标离开按钮时
function handleMouseLeave() {
  window.electronAPI?.setIgnoreMouseEvents(true);
}
</script>

<style scoped>
.mood-tracker {
  max-width: 600px;
  margin: 0 auto;
  font-family: 'Microsoft YaHei', sans-serif;
  background-color: #FFE4E1;
  border: 4px solid black;
  border-radius: 4px;
  box-shadow: 0 0 0 4px black;
  overflow: hidden;
}

/* 日期导航 */
.date-nav {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 10px;
  background-color: #FFD1DC;
  border-bottom: 4px solid black;
}

.current-date {
  font-size: 18px;
  font-weight: bold;
  text-align: center;
  flex: 1;
}

.nav-btn {
  width: 40px;
  height: 30px;
  background: #FFD1DC;
  border: 2px solid black;
  border-radius: 4px;
  cursor: pointer;
  font-weight: bold;
  display: flex;
  justify-content: center;
  align-items: center;
}

.nav-btn:hover {
  background: #FFC0CB;
}

.stats-btn {
  background: #FFD1DC;
  border: 2px solid black;
  border-radius: 4px;
  padding: 5px 10px;
  font-weight: bold;
  cursor: pointer;
  margin-left: 10px;
}

.stats-btn:hover {
  background: #FFC0CB;
}

/* 心情选择区 */
.mood-section {
  padding: 15px;
  border-bottom: 4px solid black;
}

h3 {
  margin-top: 0;
  margin-bottom: 15px;
}

.mood-grid {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  grid-gap: 10px;
}

.mood-item {
  background-color: #FFE4E1;
  border: 3px solid black;
  border-radius: 4px;
  padding: 15px 5px;
  cursor: pointer;
  display: flex;
  flex-direction: column;
  align-items: center;
  transition: background-color 0.2s;
}

.mood-item:hover {
  background-color: #FFC0CB;
}

.mood-item.selected {
  background-color: #FFC0CB;
  transform: scale(0.95);
  box-shadow: inset 0 0 6px rgba(0, 0, 0, 0.3);
}

.emoji {
  font-size: 24px;
  margin-bottom: 5px;
}

.mood-label {
  font-size: 14px;
}

/* 心情小记 */
.note-section {
  padding: 15px;
  border-bottom: 4px solid black;
}

textarea {
  width: 100%;
  background-color: #FFE4E1;
  border: 3px solid black;
  border-radius: 4px;
  padding: 10px;
  font-family: 'Microsoft YaHei', sans-serif;
  resize: none;
}

/* 保存按钮 */
.save-btn {
  display: block;
  width: 100%;
  padding: 15px;
  background-color: #FFE4E1;
  border: none;
  border-top: 4px solid black;
  font-size: 16px;
  font-weight: bold;
  cursor: pointer;
  transition: background-color 0.2s;
}

.save-btn:hover {
  background-color: #FFC0CB;
}
</style> 