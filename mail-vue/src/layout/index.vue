<template>
  <el-container class="layout">
    <el-aside
        class="aside"
        :class="uiStore.asideShow ? 'aside-show' : 'el-aside-hide'">
      <Aside />
    </el-aside>
    <div
        :class="(uiStore.asideShow && isMobile)? 'overlay-show':'overlay-hide'"
        @click="uiStore.asideShow = false"
    ></div>
    <el-container class="main-container">
      <el-main>
        <el-header>
            <Header />
        </el-header>
        <Main />
      </el-main>
    </el-container>
  </el-container>
  <writer ref="writerRef" />
  <AgentSidePanel :visible="agentStore.panelVisible" @close="agentStore.panelVisible = false" />
</template>

<script setup>
import Aside from '@/layout/aside/index.vue'
import Header from '@/layout/header/index.vue'
import Main from '@/layout/main/index.vue'
import { ref, onMounted, onBeforeUnmount } from 'vue'
import {useUiStore} from "@/store/ui.js";
import {useAgentStore} from "@/store/agent.js";
import writer from '@/layout/write/index.vue'
import AgentSidePanel from '@/components/agent/AgentSidePanel.vue'

const uiStore = useUiStore();
const agentStore = useAgentStore();
const writerRef = ref({})
const isMobile = ref(window.innerWidth < 1025)
const handleResize = () => {
  isMobile.value = window.innerWidth < 1025
  uiStore.asideShow = window.innerWidth > 1024;
}

onMounted(() => {
  uiStore.writerRef = writerRef

  window.addEventListener('resize', handleResize)
  handleResize()
})

onBeforeUnmount(() => {
  window.removeEventListener('resize', handleResize)
})
</script>

<style lang="scss" scoped>
.el-aside-hide {
  position: fixed;
  left: 0;
  height: 100%;
  z-index: 100;
  transform: translateX(-100%);
  opacity: 0;
  pointer-events: none;
}

.aside-show {
  -webkit-box-shadow: var(--aside-right-border);
  box-shadow: var(--aside-right-border);
  transform: translateX(0);
  opacity: 1;
  z-index: 101;
  @media (max-width: 1025px) {
    position: fixed;
    top: 0;
    left: 0;
    z-index: 101;
    height: 100%;
    background: var(--el-bg-color);
  }
}

.el-aside {
  width: auto;
  flex-shrink: 0;
  background: var(--aside-backgound);
  transition: transform var(--cm-motion-slow) var(--cm-motion-ease),
    opacity var(--cm-motion-base) ease;
}

.layout {
  height: 100%;
  position: fixed;
  width: 100%;
  top: 0;
  left: 0;
  overflow: hidden;
}

.main-container {
  min-width: 0;
  min-height: 100%;
  background: var(--el-bg-color);
  overflow-y: auto;
  -webkit-overflow-scrolling: touch;
}

.el-main {
  padding: 0;
  min-width: 0;
}

.el-header {
  position: relative;
  z-index: 20;
  background: var(--el-bg-color);
  background: linear-gradient(180deg, var(--cm-glass-highlight), transparent 70%), var(--cm-glass-surface);
  backdrop-filter: blur(14px) saturate(115%);
  -webkit-backdrop-filter: blur(14px) saturate(115%);
  box-shadow: inset 0 1px var(--cm-glass-highlight);
  border-bottom: solid 1px var(--el-border-color);
  padding: 0 20px 0 4px;
  @media (max-width: 767px) {
    padding: 0 8px 0 0;
  }
}

.overlay-show, .overlay-hide {
  position: fixed;
  top: 0;
  left: 0;
  width: 100vw;
  height: 100vh;
  background: var(--cm-backdrop);
  backdrop-filter: blur(2px);
  z-index: 99;
  transition: opacity var(--cm-motion-base) ease;
}

.overlay-show { opacity: 1; }

.overlay-hide {
  pointer-events: none;
  opacity: 0;
}
</style>
