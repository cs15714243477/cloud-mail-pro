<script setup>
import { computed, onMounted } from 'vue';
import { useI18n } from 'vue-i18n';
import { useAgentStore } from '@/store/agent';

const store = useAgentStore();
const { t } = useI18n();
const enabled = computed(() => store.settings.agentEnabled);

onMounted(async () => {
  if (!store.hydrated) await store.hydrate();
});

function toggle() {
  store.panelVisible = !store.panelVisible;
}
</script>

<template>
  <button
    class="agent-toggle icon-item"
    :class="{ active: store.panelVisible, disabled: !enabled }"
    :title="enabled ? t('aiAgentChatTitle') : t('aiAgentEnable')"
    @click="toggle"
  >
    <span class="agent-toggle-spark">✨</span>
    <span class="agent-toggle-label">{{ $t('aiAgentChatTitle') }}</span>
  </button>
</template>

<style scoped>
.agent-toggle.icon-item {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  background: var(--cm-accent-soft);
  border: 1px solid var(--cm-accent-border);
  border-radius: 8px;
  padding: 8px 18px;
  min-width: 128px;
  width: auto;
  cursor: pointer;
  font-size: 13px;
  font-weight: 600;
  color: var(--el-color-primary);
  transition: background-color var(--cm-motion-fast) ease,
    border-color var(--cm-motion-fast) ease,
    color var(--cm-motion-fast) ease,
    transform var(--cm-motion-fast) var(--cm-motion-ease);
  margin: 0 6px;
  white-space: nowrap;
  flex-shrink: 0;
  height: 36px;
  line-height: 1;
}
@media (max-width: 768px) {
  .agent-toggle.icon-item {
    min-width: 0;
    padding: 6px 9px;
    margin: 0;
    width: auto;
    height: 32px;
  }
  .agent-toggle-label { display: none; }
}
.agent-toggle.icon-item:hover { background: var(--choose-account-background); border-color: var(--el-color-primary); }
.agent-toggle.icon-item.active {
  background: var(--el-color-primary);
  color: var(--cm-on-primary);
}
.agent-toggle.icon-item.disabled {
  background: var(--cm-accent-soft);
  border-color: var(--cm-accent-border);
  color: var(--el-text-color-regular);
}
.agent-toggle-spark { font-size: 16px; }
</style>
