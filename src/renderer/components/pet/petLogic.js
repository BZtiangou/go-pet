// petLogic.js
import { ref, computed, nextTick, onMounted, onBeforeUnmount } from 'vue'

export default function usePetLogic() {
  // —— 资源 & Electron 接口 —— 
  const petSrc = new URL('../../common/images/mxr.png', import.meta.url).href
  const electronAPI = window.electronAPI || null
  const safeIgnore = flag => electronAPI?.setIgnoreMouseEvents(flag)

  // —— 拖拽定位 —— 
  const x = ref(200), y = ref(200)
  const isDragging = ref(false)
  let offsetX = 0, offsetY = 0
  const imgEl = ref(null)
  const imgW = ref(120), imgH = ref(120)

  function updateImgSize() {
    imgW.value = imgEl.value.offsetWidth
    imgH.value = imgEl.value.offsetHeight
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

  // —— 控件显隐 —— 
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

  // —— 左右列位置计算 —— 
  const M = 6, CW = 80, CH = 120
  const nearLeft  = computed(() => x.value < CW + M)
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

  // —— Other 面板 —— 
  const features     = ['Fun1', 'Fun2', 'Fun3']
  const panelVisible = ref(false)
  const panelPos     = ref({ left: '0px', top: '0px' })
  const panelEl      = ref(null)

  function togglePanel() {
    panelVisible.value = !panelVisible.value
    if (panelVisible.value) nextTick(placePanel)
    else scheduleHide()
  }
  function placePanel() {
    const btn = document.querySelector('.chat-btn')
    if (!btn || !panelEl.value) return
    const r = btn.getBoundingClientRect()
    const w = panelEl.value.offsetWidth, h = panelEl.value.offsetHeight
    let px = Math.min(Math.max(M, r.left + (r.width - w)/2), window.innerWidth - w - M)
    let py = r.bottom + M
    if (py + h > window.innerHeight - M) py = r.top - h - M
    panelPos.value = { left: px + 'px', top: py + 'px' }
  }
  onMounted(() => window.addEventListener('resize', onResize))
  onBeforeUnmount(() => window.removeEventListener('resize', onResize))
  function onResize() { if (panelVisible.value) placePanel() }

  // —— 退出 —— 
  function exitApp() { electronAPI?.exitApp?.() }

  return {
    x, y, isDragging, petSrc,
    imgEl, updateImgSize,
    ctrlVisible, nearLeft, nearRight,
    leftStyle, rightStyle,
    panelVisible, panelPos, panelEl,
    showControls, scheduleHide,
    startDrag, togglePanel,
    exitApp, features
  }
}
