<template>
  <span ref="marker" class="selection-indicator" aria-hidden="true" :style="markerStyle" />
</template>

<script setup>
import { computed, onBeforeUnmount, onMounted, ref, watch } from 'vue'

const props = defineProps({
  activeKey: [String, Number],
  selector: { type: String, required: true },
  inset: { type: Number, default: 10 }
})
const marker = ref(null)
const position = ref({ top: 0, height: 0, visible: false })
const markerStyle = computed(() => ({
  transform: `translateY(${position.value.top}px)`,
  height: `${position.value.height}px`,
  opacity: position.value.visible ? 1 : 0
}))
let root, resizeObserver, mutationObserver, frame

function measure() {
  const selected = root?.querySelector(props.selector)
  if (!selected || !selected.getClientRects().length) {
    position.value = { ...position.value, visible: false }
    return
  }
  const row = selected.getBoundingClientRect()
  const parent = root.getBoundingClientRect()
  position.value = {
    top: row.top - parent.top + root.scrollTop + props.inset,
    height: Math.max(0, row.height - props.inset * 2),
    visible: true
  }
}

function schedule() {
  cancelAnimationFrame(frame)
  frame = requestAnimationFrame(measure)
}

watch(() => props.activeKey, schedule, { flush: 'post' })
onMounted(() => {
  root = marker.value.parentElement
  resizeObserver = new ResizeObserver(schedule)
  resizeObserver.observe(root)
  mutationObserver = new MutationObserver(schedule)
  mutationObserver.observe(root, { subtree: true, childList: true, attributes: true, attributeFilter: ['class'] })
  measure()
})
onBeforeUnmount(() => {
  cancelAnimationFrame(frame)
  resizeObserver?.disconnect()
  mutationObserver?.disconnect()
})
</script>

<style scoped>
.selection-indicator {
  position: absolute;
  top: 0;
  left: var(--selection-left, 12px);
  width: 3px;
  border-radius: 3px;
  background: var(--selection-color, var(--el-color-primary));
  z-index: 1;
  pointer-events: none;
  transition: transform var(--cm-motion-slow) var(--cm-motion-ease),
    height var(--cm-motion-slow) var(--cm-motion-ease),
    opacity var(--cm-motion-fast) ease;
}
</style>
