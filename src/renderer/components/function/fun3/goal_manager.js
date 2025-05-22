import { ref, reactive } from 'vue'

export function useAchievements() {
  // ─────────── 假数据 ────────────
  const achievements = ref([
    { id: 1, name: 'Calm Navigator', desc: '连续 3 天完成心情记录', cat: '情绪', progress: 100, stars: 50, done: true },
    { id: 2, name: 'Wellness Explorer', desc: '连续 7 天完成自我关怀打卡', cat: '正念', progress: 40, stars: 100, done: false },
    { id: 3, name: 'Fox Costume', desc: '累计 5 天完成目标，解锁狐狸服装', cat: '服装', progress: 80, stars: 120, done: false },
    { id: 4, name: 'Health Tracker', desc: '连续 30 天记录健康数据', cat: '正念', progress: 50, stars: 150, done: false },
    { id: 5, name: 'The Creator', desc: '完成 10 项创作任务', cat: '情绪', progress: 20, stars: 200, done: false },
    { id: 6, name: 'Fashion Icon', desc: '解锁 5 款服装', cat: '服装', progress: 60, stars: 300, done: false },
    { id: 7, name: 'Night Owl', desc: '连续 14 天熬夜并保持任务进度', cat: '情绪', progress: 100, stars: 100, done: true },
    { id: 8, name: 'Mindful Traveler', desc: '每周记录 3 次冥想数据', cat: '正念', progress: 80, stars: 120, done: false },
    { id: 9, name: 'Dreamer', desc: '每晚按时睡觉并记录', cat: '情绪', progress: 100, stars: 200, done: true },
    { id: 10, name: 'Jungle Explorer', desc: '走访 10 个新景点', cat: '社交', progress: 50, stars: 150, done: false },
    { id: 11, name: 'Perfect Dresser', desc: '每天更换不同服装', cat: '服装', progress: 40, stars: 120, done: false },
    { id: 12, name: 'Healthy Eater', desc: '连续 10 天吃素', cat: '正念', progress: 90, stars: 200, done: false },
    { id: 13, name: 'Fast Learner', desc: '30 天内学会 3 种新技能', cat: '情绪', progress: 60, stars: 180, done: false },
    { id: 14, name: 'Big Thinker', desc: '完成 20 次个人成长任务', cat: '情绪', progress: 100, stars: 250, done: true },
    { id: 15, name: 'Healthy Mind', desc: '每天冥想 15 分钟', cat: '正念', progress: 30, stars: 100, done: false },
    { id: 16, name: 'Social Butterfly', desc: '每周参与至少 2 次社交活动', cat: '社交', progress: 70, stars: 160, done: false },
    { id: 17, name: 'Photo Master', desc: '拍摄 100 张不同主题的照片', cat: '社交', progress: 50, stars: 150, done: false },
    { id: 18, name: 'Weekend Wanderer', desc: '每月参加一次旅行活动', cat: '社交', progress: 80, stars: 200, done: false },
    { id: 19, name: 'Runner', desc: '连续跑步 30 天', cat: '正念', progress: 100, stars: 180, done: true },
    { id: 20, name: 'Super Chef', desc: '尝试 20 种不同的食谱', cat: '社交', progress: 40, stars: 130, done: false },
    { id: 21, name: 'Water Drinker', desc: '连续 30 天每天喝足 8 杯水', cat: '正念', progress: 60, stars: 150, done: false },
    { id: 22, name: 'Yogi', desc: '每天做 30 分钟瑜伽', cat: '情绪', progress: 50, stars: 170, done: false },
    { id: 23, name: 'Giver', desc: '参与 5 个公益活动', cat: '社交', progress: 100, stars: 300, done: true },
    { id: 24, name: 'Art Collector', desc: '收集 10 件艺术品', cat: '社交', progress: 80, stars: 220, done: false },
    { id: 25, name: 'Fashionista', desc: '搭配 20 种不同的时尚服饰', cat: '服装', progress: 40, stars: 120, done: false },
    { id: 26, name: 'Running Coach', desc: '帮助他人完成跑步挑战', cat: '社交', progress: 60, stars: 180, done: false },
    { id: 27, name: 'Artist', desc: '每周创作一幅画作', cat: '社交', progress: 30, stars: 120, done: false },
    { id: 28, name: 'Mindful Designer', desc: '设计 10 种创意作品', cat: '情绪', progress: 50, stars: 200, done: false },
    { id: 29, name: 'Music Lover', desc: '参加 5 次音乐会', cat: '社交', progress: 80, stars: 150, done: false },
    { id: 30, name: 'Bookworm', desc: '读完 30 本书', cat: '情绪', progress: 70, stars: 210, done: false }
  ])

  // categories
const categories = ['ALL','情绪','正念','社交','服装']


  const stars = ref(
    achievements.value.filter(a => a.done).reduce((s, a) => s + a.stars, 0)
  )

  return { achievements, categories, stars }
}

export const filters = ['ALL', 'Unlocked', 'Locked']
