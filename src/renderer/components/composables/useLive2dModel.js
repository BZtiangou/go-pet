// File: useLive2dModel.js
import { ref, onMounted, onBeforeUnmount } from 'vue'
import * as PIXI from 'pixi.js'
import { Live2DModel, MotionPreloadStrategy, MotionPriority } from 'pixi-live2d-display/cubism2'
import { setModelId, setModelTexturesId, updateMessageArray, getMessageArray } from '../utils/config.js'
import showMessage from '../utils/message.js'
import modelList from '../utils/modelList.js'
import tips from '../utils/tips.js'

export function useLive2dModel(modelContainer, updateImgSize) {
  const VIEW = 290
  const DPR = window.devicePixelRatio || 1
  let app = null
  let live2dInst = null
  let autoTimer = null

  const roleIdx = ref(0)
  const skinIdx = ref(0)
  const isDragging = ref(false)

  let motionNames = []
  let expressionNames = []

  /**
   * 多模式说话函数：
   * - 如果 custom 是顶层 key（array-of-arrays），直接播那段
   * - 如果 custom 是 array-of-arrays，flatten 后播
   * - 如果 custom 是 selector 字符串，在 tips 对象中递归查找对应 .text 数组
   * - 否则回退到默认随机全部 tips
   */
  function speak(custom = null) {
    // 1) 顶层 key，比如 'visibilitychange'
    if (typeof custom === 'string' && Array.isArray(tips[custom])) {
      const flat = tips[custom].flat()
      showMessage(
        { model: live2dInst, app, tips: null, modelMotions: motionNames, modelExpressions: expressionNames },
        flat,
        4000,
        10
      )
      return
    }

    // 2) array-of-arrays
    if (Array.isArray(custom) && Array.isArray(custom[0])) {
      const flat = custom.flat()
      showMessage(
        { model: live2dInst, app, tips: null, modelMotions: motionNames, modelExpressions: expressionNames },
        flat,
        4000,
        10
      )
      return
    }

    // 3) selector 字符串，在 tips 对象里 dfs 找 .selector
    if (typeof custom === 'string') {
      let found = null
      const dfs = obj => {
        if (!obj || typeof obj !== 'object') return
        if (Array.isArray(obj)) {
          obj.forEach(item => dfs(item))
        } else {
          if (obj.selector === custom && Array.isArray(obj.text)) {
            found = obj.text
          }
          Object.values(obj).forEach(v => dfs(v))
        }
      }
      dfs(tips)
      if (found) {
        const flat = found.flat()
        showMessage(
          { model: live2dInst, app, tips: null, modelMotions: motionNames, modelExpressions: expressionNames },
          flat,
          4000,
          10
        )
        return
      }
    }

    // 4) 回退到默认全部 tips（随机）
    updateMessageArray(tips)
    showMessage(
      { model: live2dInst, app, tips, modelMotions: motionNames, modelExpressions: expressionNames },
      getMessageArray(),
      4000,
      10
    )
  }

  async function loadModel(modelId, textureId) {
    // 1) 处理索引越界
    if (modelId >= modelList.length) modelId %= modelList.length
    if (textureId >= modelList[modelId].length) textureId %= modelList[modelId].length
    setModelId(modelId)
    setModelTexturesId(textureId)

    // 2) 卸载旧实例
    if (live2dInst) {
      app.stage.removeChild(live2dInst)
      live2dInst.destroy()
      live2dInst = null
    }
    clearInterval(autoTimer)

    // 3) 拼 idxUrl
    const rel = modelList[modelId][textureId]
    const base = import.meta.env.BASE_URL        // dev: '/', build: './'
    const idxUrl = `${base}model/${rel}/index.json`

    console.log('[useLive2dModel] Loading JSON:', idxUrl)
    const indexJson = await fetch(idxUrl).then(r => r.json())
    indexJson.url = idxUrl

    // 4) 补齐 idle 动作/表情
    if (!indexJson.motions.idle && indexJson.motions.idle01) {
      indexJson.motions.idle = indexJson.motions.idle01
    }
    if (!indexJson.expressions.find(e => e.name === 'idle')) {
      const i01 = indexJson.expressions.find(e => e.name === 'idle01')
      if (i01) indexJson.expressions.push({ name: 'idle', file: i01.file })
    }

    // 5) 保存动作和表情名字
    motionNames = Object.keys(indexJson.motions)
    expressionNames = indexJson.expressions.map(e => e.name)

    // 6) 初始化 PIXI 应用
    if (!app) {
      Live2DModel.registerTicker(PIXI.Ticker)
      app = new PIXI.Application({
        width:        VIEW,
        height:       VIEW,
        resolution:   DPR,
        autoDensity:  true,
        backgroundAlpha: 0,
        antialias:    true
      })
      app.view.style.pointerEvents = ''
      modelContainer.value.appendChild(app.view)
    } else {
      app.stage.removeChildren()
    }

    // 7) 创建并添加 Live2D 模型
    live2dInst = await Live2DModel.from(indexJson, { motionPreload: MotionPreloadStrategy.ALL })
    live2dInst.anchor.set(0.5, 0.9)
    live2dInst.scale.set(0.17)
    live2dInst.position.set(app.view.width / 2, app.view.height)
    live2dInst.interactive = true
    app.stage.addChild(live2dInst)

    // 8) 动作播放逻辑
    const motions = indexJson.motions
    const groups = Object.keys(motions).filter(g => !/idle/i.test(g))
    const fallback = ['idle']
    const playRandom = (force = false) => {
      if (!force && isDragging.value) return
      if (!force && !live2dInst.animator.isFinished) return
      const list = groups.length ? groups : fallback
      const g = list[Math.floor(Math.random() * list.length)]
      const arr = motions[g] || []
      if (!arr.length) return
      const ix = Math.floor(Math.random() * arr.length)
      live2dInst.motion(g, ix, force ? MotionPriority.FORCE : MotionPriority.NORMAL)
        .then(() => {
          const exp = indexJson.expressions.find(e => e.name === g)
          if (exp) live2dInst.expression(exp.name)
        })
        .catch(() => {})
    }

    const start = () => {
      updateImgSize()
      playRandom()
      autoTimer = setInterval(() => playRandom(false), 10000)
    }
    if (live2dInst.internalModel.ready) start()
    else live2dInst.once('ready', start)

    // 点击模型时：动作 + 随机（默认）对白
    live2dInst.on('pointertap', () => {
      playRandom(true)
      speak()
    })

    // 首次加载时：第一个角色问候
    if (roleIdx.value === 0 && skinIdx.value === 0) {
      speak('visibilitychange')
    } else {
      speak()
    }
  }

  onMounted(() => loadModel(0, 0))
  onBeforeUnmount(() => {
    clearInterval(autoTimer)
    live2dInst?.destroy()
    app?.destroy(true, { children: true })
  })

  // 切角色
  async function nextModel() {
    roleIdx.value = (roleIdx.value + 1) % modelList.length
    skinIdx.value = 0
    await loadModel(roleIdx.value, 0)
    speak('#waifu-tool-switch-model')
  }
  // 换贴图
  async function nextTexture() {
    skinIdx.value = (skinIdx.value + 1) % modelList[roleIdx.value].length
    await loadModel(roleIdx.value, skinIdx.value)
    speak('#waifu-tool-switch-texture')
  }

  return { roleIdx, skinIdx, isDragging, nextModel, nextTexture, speak }
}










