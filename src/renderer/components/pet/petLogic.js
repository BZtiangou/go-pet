import { ref, computed, nextTick, onMounted, onBeforeUnmount, watch } from 'vue'

export default function usePetLogic() {
  // —— 资源 & Electron 接口 ——  
  const petSrc = new URL('../../public/model/${rel}/index.json', import.meta.url).href
  const electronAPI = window.electronAPI || null
  // 接受可选 forward 参数
  const safeIgnore = (flag, options) => electronAPI?.setIgnoreMouseEvents(flag, options)

  // —— 拖拽定位 ——  
  const x = ref(200), y = ref(200)
  const isDragging = ref(false)
  let offsetX = 0, offsetY = 0
  const modelContainer = ref(null)
  const imgW = ref(180), imgH = ref(120)

  function updateImgSize() {
    if (!modelContainer.value || !modelContainer.value.firstChild) return
    const canvas = modelContainer.value.firstChild
    imgW.value = canvas.offsetWidth
    imgH.value = canvas.offsetHeight
  }

  function startDrag(e) {
    isDragging.value = true
    showControls()
    offsetX = e.clientX - x.value
    offsetY = e.clientY - y.value

    function onMove(ev) {
      if (!isDragging.value) return
      const tentativeX = ev.clientX - offsetX
      const center = tentativeX + imgW.value / 2
      const showLeftCol = center > threshold
      const showRightCol = center < window.innerWidth - threshold
      const extraLeft = showLeftCol ? threshold : 0
      const extraRight = showRightCol ? threshold : 0
      const minX = extraLeft - 45
      const maxX = window.innerWidth - imgW.value - extraRight - 23
      x.value = Math.min(Math.max(minX, tentativeX), maxX)

      const tentativeY = ev.clientY - offsetY
      const minY = 50
      const maxY = window.innerHeight - imgH.value - 171
      y.value = Math.min(Math.max(minY, tentativeY), maxY)
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
    clearTimeout(hideTimer)
    hideTimer = setTimeout(() => {
      ctrlVisible.value = false
      panelVisible.value = false
      // 由 watch 集中管理 safeIgnore
    }, 1000)
  }

  // —— 侧边列位置计算 ——  
  const M = 6, CW = 40, HO = -10
  const threshold = CW + M + Math.abs(HO)
  const centerX = computed(() => x.value + imgW.value / 2)
  const windowWidth = ref(window.innerWidth)
  const nearLeft = computed(() => centerX.value < threshold)
  const nearRight = computed(() => centerX.value > (windowWidth.value - threshold + 2))
  const leftStyle = computed(() => {
    const xOffset = nearLeft.value
      ? imgW.value + M + HO
      : -CW - M - HO
    return { left: `${xOffset + 45}px` }
  })
  const rightStyle = computed(() => {
    const xOffset = nearRight.value
      ? -CW - M - HO
      : imgW.value + M + HO
    return { left: `${xOffset + 90}px` }
  })

  // —— 面板 ——  
  const features = ['Fun1', 'Fun2', 'Fun3']
  const panelVisible = ref(false)
  const panelPos = ref({ left: '0px', top: '0px' })
  const panelEl = ref(null)
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
    let px = Math.min(Math.max(M, r.left + (r.width - w) / 2), window.innerWidth - w - M)
    let py = r.bottom + M
    if (py + h > window.innerHeight - M) py = r.top - h - M
    panelPos.value = { left: px + 'px', top: py + 'px' }
  }

  function updateWindowSize() {
    windowWidth.value = window.innerWidth
  }
  function onResize() {
    if (panelVisible.value) placePanel()
  }

  onMounted(() => {
    updateImgSize()
    window.addEventListener('resize', updateWindowSize)
    window.addEventListener('resize', onResize)
  })
  onBeforeUnmount(() => {
    window.removeEventListener('resize', updateWindowSize)
    window.removeEventListener('resize', onResize)
  })

  // —— 退出 ——  
  function exitApp() {
    electronAPI?.exitApp?.()
  }

  // —— 集中管理窗口穿透 ——  
  watch([ctrlVisible, panelVisible], ([ctrl, panel]) => {
    if (ctrl || panel) {
      safeIgnore(false)
    } else {
      safeIgnore(true, { forward: true })
    }
  }, { immediate: true })

  return {
    x,
    y,
    isDragging,
    petSrc,
    modelContainer,
    imgW,
    imgH,
    updateImgSize,
    ctrlVisible,
    nearLeft,
    nearRight,
    leftStyle,
    rightStyle,
    panelVisible,
    panelPos,
    panelEl,
    features,
    showControls,
    scheduleHide,
    startDrag,
    togglePanel,
    exitApp
  }
}

