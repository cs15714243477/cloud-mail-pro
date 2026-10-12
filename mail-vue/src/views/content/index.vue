<template>
  <div class="box">
    <div class="header-actions">
      <Icon class="icon" icon="material-symbols-light:arrow-back-ios-new" width="20" height="20" @click="handleBack"/>
      <Icon v-perm="'email:delete'" class="icon" icon="uiw:delete" width="16" height="16" @click="handleDelete"/>
      <el-tooltip :content="$t('exportEml')" placement="top">
        <Icon class="icon" icon="mdi:download" width="18" height="18" @click="handleExport"/>
      </el-tooltip>
      <span class="star" v-if="emailStore.contentData.showStar">
        <Icon class="icon" @click="changeStar" v-if="email.isStar" icon="fluent-color:star-16" width="20" height="20"/>
        <Icon class="icon" @click="changeStar" v-else icon="solar:star-line-duotone" width="18" height="18"/>
      </span>
      <Icon class="icon" v-if="emailStore.contentData.showReply" v-perm="'email:send'"  @click="openReply" icon="la:reply" width="21" height="21" />
      <Icon class="icon" v-if="emailStore.contentData.showReply" v-perm="'email:send'"  @click="openForward" icon="iconoir:arrow-up-right" width="20" height="20" />
      <el-tooltip
          v-if="settingStore.settings.aiEnabled"
          :content="translationState === 'translated' ? $t('showOriginal') : $t('translate')"
          placement="top">
        <Icon
            class="icon"
            :class="{ 'translating': translationState === 'loading' }"
            v-perm="'email:translate'"
            :icon="translationState === 'translated' ? 'mdi:translate-off' : 'mdi:translate'"
            width="20" height="20"
            @click="toggleTranslation"/>
      </el-tooltip>
    </div>
    <div></div>
    <el-scrollbar class="scrollbar">
      <div class="container">
        <h1 class="email-title">
          {{ displaySubject }}
        </h1>
        <div class="content">
          <div class="email-info">
            <div>
              <div class="send"><span class="send-source">{{$t('from')}}</span>
                <div class="send-name">
                  <span class="send-name-title">{{ email.name }}</span>
                  <span><{{ email.sendEmail }}></span>
                </div>
              </div>
              <div class="receive"><span class="source">{{$t('recipient')}}</span><span class="receive-email">{{  formateReceive(email.recipient) }}</span></div>
              <div class="date">
                <div>{{ formatDetailDate(email.createTime) }}</div>
              </div>
            </div>
            <el-alert v-if="email.status === 3" :closable="false" :title="toMessage(email.message)" class="email-msg" type="error" show-icon />
            <el-alert v-if="email.status === 4" :closable="false" :title="$t('complained')" class="email-msg" type="warning" show-icon />
            <el-alert v-if="email.status === 5" :closable="false" :title="$t('delayed')" class="email-msg" type="warning" show-icon />
          </div>
          <el-alert
              v-if="translationState === 'translated'"
              type="info"
              :closable="false"
              class="translation-banner"
              show-icon>
            <span>{{ $t('translatedFrom', { lang: sourceLang || $t('langUnknown') }) }}</span>
            <el-link type="primary" @click="toggleTranslation">&nbsp;{{ $t('showOriginal') }}</el-link>
          </el-alert>
          <el-scrollbar class="htm-scrollbar" :class="email.attList.length === 0 ? 'bottom-distance' : ''">
            <ShadowHtml class="shadow-html" :html="formatImage(displayContent)" v-if="displayContent" />
            <pre v-else class="email-text" >{{email.text}}</pre>
          </el-scrollbar>
          <div class="att" v-if="email.attList.length > 0">
            <div class="att-title">
              <span>{{$t('attachments')}}</span>
              <span>{{$t('attCount',{total: email.attList.length})}}</span>
            </div>
            <div class="att-box">

              <div class="att-item" v-for="att in email.attList" :key="att.attId">
                <div class="att-icon" @click="showImage(att.key)">
                  <Icon v-bind="getIconByName(att.filename)" />
                </div>
                <div class="att-name" :title="att.filename" @click="showImage(att.key)">
                  {{ att.filename }}
                </div>
                <div class="att-size">{{ formatBytes(att.size) }}</div>
                <div class="opt-icon att-icon">
                  <Icon v-if="isImage(att.filename)" icon="hugeicons:view" width="22" height="22" @click="showImage(att.key)"/>
                  <a :href="cvtR2Url(att.key)" download>
                    <Icon icon="system-uicons:push-down" width="22" height="22"/>
                  </a>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </el-scrollbar>
    <el-image-viewer
        v-if="showPreview"
        :url-list="srcList"
        show-progress
        @close="showPreview = false"
    />
  </div>
</template>
<script setup>
import ShadowHtml from '@/components/shadow-html/index.vue'
import {reactive, ref, computed, watch, onMounted, onUnmounted} from "vue";
import {useRouter} from 'vue-router'
import {ElMessage, ElMessageBox} from 'element-plus'
import {emailDelete, emailRead, emailExport} from "@/request/email.js";
import {Icon} from "@iconify/vue";
import {useEmailStore} from "@/store/email.js";
import {useAccountStore} from "@/store/account.js";
import {formatDetailDate} from "@/utils/day.js";
import {starAdd, starCancel} from "@/request/star.js";
import {getExtName, formatBytes} from "@/utils/file-utils.js";
import {cvtR2Url,toOssDomain} from "@/utils/convert.js";
import {getIconByName} from "@/utils/icon-utils.js";
import {useSettingStore} from "@/store/setting.js";
import {allEmailDelete} from "@/request/all-email.js";
import {useUiStore} from "@/store/ui.js";
import {useI18n} from "vue-i18n";
import {EmailUnreadEnum} from "@/enums/email-enum.js";
import {translateEmail} from "@/request/translation.js";

const uiStore = useUiStore();
const settingStore = useSettingStore();
const accountStore = useAccountStore();
const emailStore = useEmailStore();
const router = useRouter()
const email = emailStore.contentData.email
const showPreview = ref(false)
const srcList = reactive([])

const { t, locale } = useI18n()

const translationState = ref('idle') // 'idle' | 'loading' | 'translated'
const translatedSubject = ref('')
const translatedContent = ref('')
const sourceLang = ref('')

const targetLang = computed(() => {
  return (locale.value || 'en').split(/[-_]/)[0].toLowerCase()
})

const displaySubject = computed(() =>
  translationState.value === 'translated' ? translatedSubject.value : email.subject
)
const displayContent = computed(() =>
  translationState.value === 'translated' ? translatedContent.value : email.content
)

watch(() => email.emailId, () => {
  translationState.value = 'idle'
  translatedSubject.value = ''
  translatedContent.value = ''
  sourceLang.value = ''
})

async function toggleTranslation() {
  if (translationState.value === 'loading') return
  if (translationState.value === 'translated') {
    translationState.value = 'idle'
    return
  }
  if (translatedContent.value) {
    translationState.value = 'translated'
    return
  }
  translationState.value = 'loading'
  try {
    const data = await translateEmail(email.emailId, targetLang.value)
    if (data && data.alreadyInTargetLang) {
      ElMessage.info(t('alreadyInTargetLang'))
      translationState.value = 'idle'
      return
    }
    translatedSubject.value = data.translatedSubject
    translatedContent.value = data.translatedContent
    sourceLang.value = data.sourceLang || ''
    translationState.value = 'translated'
  } catch (err) {
    console.error(err)
    ElMessage.error(t('translationFailed'))
    translationState.value = 'idle'
  }
}

watch(() => accountStore.currentAccountId, () => {
  handleBack()
})

onMounted(() => {
  if (emailStore.contentData.showUnread && email.unread === EmailUnreadEnum.UNREAD) {
    email.unread = EmailUnreadEnum.READ;
    emailRead([email.emailId]);
  }
})

onUnmounted(() => {
  emailStore.contentData.showUnread = false;
})

function openReply() {
  uiStore.writerRef.openReply(email)
}

function openForward() {
  uiStore.writerRef.openForward(email)
}

function toMessage(message) {
  return  message ? JSON.parse(message).message : '';
}

function formatImage(content) {
  content = content || '';
  const domain = settingStore.settings.r2Domain;
  return  content.replace(/{{domain}}/g, toOssDomain(domain) + '/');
}

function showImage(key) {
  if (!isImage(key)) return;
  const url = cvtR2Url(key)
  srcList.length = 0
  srcList.push(url)
  showPreview.value = true
}

function isImage(filename) {
  return ['png', 'jpg', 'jpeg', 'bmp', 'gif','jfif'].includes(getExtName(filename))
}

function formateReceive(recipient) {
  recipient = JSON.parse(recipient)
  return recipient.map(item => item.address).join(', ')
}

function changeStar() {
  if (email.isStar) {
    email.isStar = 0;
    starCancel(email.emailId).then(() => {
      email.isStar = 0;
      emailStore.cancelStarEmailId = email.emailId
      setTimeout(() => emailStore.cancelStarEmailId = 0)
      emailStore.starScroll?.deleteEmail([email.emailId])
    }).catch((e) => {
      console.error(e)
      email.isStar = 1;
    })
  } else {
    email.isStar = 1;
    starAdd(email.emailId).then(() => {
      email.isStar = 1;
      emailStore.addStarEmailId = email.emailId
      setTimeout(() => emailStore.addStarEmailId = 0)
      emailStore.starScroll?.addItem(email)
    }).catch((e) => {
      console.error(e)
      email.isStar = 0;
    })
  }
}

const handleBack = () => {
  router.back()
}

const handleExport = () => {
  emailExport(email.emailId).then(blob => {
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `email-${email.emailId}.eml`
    a.click()
    URL.revokeObjectURL(url)
    ElMessage({ message: t('exportSuccess'), type: 'success', plain: true })
  }).catch(() => {
    ElMessage({ message: t('exportFailed'), type: 'error', plain: true })
  })
}

const handleDelete = () => {
  ElMessageBox.confirm(t('delEmailConfirm'), {
    confirmButtonText: t('confirm'),
    cancelButtonText: t('cancel'),
    type: 'warning'
  }).then(() => {
    if (emailStore.contentData.delType === 'logic') {
      emailDelete(email.emailId).then(() => {
        ElMessage({
          message: t('delSuccessMsg'),
          type: 'success',
          plain: true,
        })
        emailStore.deleteIds = [email.emailId]
      })
    } else  {

      allEmailDelete(email.emailId).then(() => {
        ElMessage({
          message: t('delSuccessMsg'),
          type: 'success',
          plain: true,
        })
        emailStore.deleteIds = [email.emailId]
      })
    }

    router.back()
  })
}
</script>
<style scoped lang="scss">
.box {
  height: 100%;
  min-width: 0;
  overflow: hidden;
}

.header-actions {
  height: 52px;
  box-sizing: border-box;
  padding: 0 18px;
  display: flex;
  align-items: center;
  gap: 8px;
  border-bottom: 1px solid var(--el-border-color-lighter);
  background: var(--cm-glass-surface);
  box-shadow: inset 0 1px var(--cm-glass-highlight);
  color: var(--el-text-color-regular);
  font-size: 18px;
  .star { display: flex; align-items: center; justify-content: center; }
  .icon {
    cursor: pointer;
    flex-shrink: 0;
    padding: 8px;
    box-sizing: content-box;
    border-radius: 8px;
    transition: background-color var(--cm-motion-fast), color var(--cm-motion-fast);
    &:hover { background: var(--cm-accent-soft); color: var(--el-color-primary); }
  }
}

.scrollbar {
  height: calc(100% - 52px);
  width: 100%;
}

.container {
  box-sizing: border-box;
  width: 100%;
  max-width: 880px;
  margin: 0 auto;
  padding: 32px 36px 40px;
  font-size: 14px;

  .email-title {
    margin: 0 0 24px;
    font-size: clamp(23px, 2.2vw, 30px);
    font-weight: 650;
    line-height: 1.4;
    letter-spacing: -.035em;
    overflow-wrap: anywhere;
    color: var(--el-text-color-primary);
  }

  .content { display: flex; flex-direction: column; min-width: 0; }

  .email-info {
    border-bottom: 1px solid var(--el-border-color-light);
    padding-bottom: 24px;
    margin-bottom: 28px;
    font-size: 13px;
    line-height: 1.6;

    .send, .receive {
      display: flex;
      align-items: baseline;
      gap: 12px;
      margin-bottom: 8px;
      min-width: 0;
    }
    .send-name { display: flex; flex-wrap: wrap; column-gap: 6px; min-width: 0; overflow-wrap: anywhere; }
    .send-name-title { color: var(--el-text-color-primary); font-weight: 600; }
    .send-name > span:last-child, .receive-email { color: var(--el-text-color-regular); overflow-wrap: anywhere; }
    .send-source, .source { flex: 0 0 52px; white-space: nowrap; color: var(--el-text-color-secondary); font-size: 12px; }
    .date { padding-left: 64px; color: var(--el-text-color-secondary); font-size: 12px; }
    .email-msg { max-width: 100%; width: fit-content; margin-top: 16px; }
  }

  .htm-scrollbar {
    border-radius: 10px;
    background: var(--cm-reading-paper);
    padding: 20px;
    &:has(.email-text) { background: var(--el-bg-color); padding: 0; }
  }

  .att {
    margin-top: 32px;
    padding-top: 22px;
    border-top: 1px solid var(--el-border-color-light);
    width: 100%;
    min-width: 0;

    .att-title {
      margin-bottom: 12px;
      display: flex;
      align-items: baseline;
      justify-content: space-between;
      gap: 12px;
      span:first-child { font-weight: 600; font-size: 13px; }
      span:last-child { color: var(--el-text-color-secondary); font-size: 12px; }
    }
    .att-box { display: grid; gap: 8px; }
    .att-item {
      display: grid;
      grid-template-columns: 36px minmax(0, 1fr) auto auto;
      align-items: center;
      gap: 12px;
      padding: 12px 14px;
      min-width: 0;
      border: 1px solid var(--el-border-color-light);
      background: var(--el-fill-color-lighter);
      border-radius: 10px;
      transition: border-color var(--cm-motion-fast), background-color var(--cm-motion-fast);
      &:hover { border-color: var(--cm-accent-border); background: var(--cm-accent-soft); }
      .att-icon { display: flex; align-items: center; justify-content: center; }
      > .att-icon:not(.opt-icon) { width: 36px; height: 36px; border-radius: 8px; background: var(--el-bg-color); cursor: pointer; }
      .att-name { font-size: 13px; font-weight: 550; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; cursor: pointer; }
      .att-size { color: var(--el-text-color-secondary); font-size: 11px; white-space: nowrap; font-variant-numeric: tabular-nums; }
      .opt-icon {
        display: flex; gap: 4px; color: var(--el-text-color-secondary);
        > .iconify, a { display: flex; align-items: center; justify-content: center; cursor: pointer; padding: 5px; border-radius: 6px; color: inherit; }
        > .iconify:hover, a:hover { color: var(--el-color-primary); background: var(--el-bg-color); }
      }
    }
  }
}

.shadow-html { position: relative; }
.shadow-html::after {
  content: "";
  position: absolute;
  inset: 0;
  background: var(--cm-reading-overlay);
  pointer-events: none;
}
.email-text {
  font-family: inherit;
  font-size: 15px;
  line-height: 1.85;
  white-space: pre-wrap;
  overflow-wrap: anywhere;
  margin: 0;
  color: var(--el-text-color-primary);
  background: var(--el-bg-color);
}
.bottom-distance { margin-bottom: 0; }
.icon.translating { animation: spin 1s linear infinite; opacity: .6; }
@keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }
.translation-banner { margin: 0 0 20px; }

@media (max-width: 767px) {
  .header-actions { padding: 0 10px; gap: 4px; }
  .container {
    padding: 24px 18px 32px;
    .email-title { font-size: 23px; margin-bottom: 20px; }
    .email-info { padding-bottom: 20px; margin-bottom: 24px; }
    .htm-scrollbar { padding: 16px; }
    .att .att-item {
      gap: 8px;
      padding: 10px;
      grid-template-columns: 30px minmax(0, 1fr) auto;
      > .att-icon:not(.opt-icon) { width: 30px; height: 30px; grid-row: 1 / 3; }
      .att-name { grid-column: 2; }
      .att-size { grid-column: 2; grid-row: 2; }
      .opt-icon { grid-column: 3; grid-row: 1 / 3; }
    }
  }
}
</style>
