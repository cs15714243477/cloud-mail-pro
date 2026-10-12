<template>
  <el-scrollbar class="scroll">
    <div>
      <div class="title" >
        <Icon icon="mdi:email-outline" width="24" height="24" />
        <div>{{settingStore.settings.title}}</div>
      </div>
      <el-menu :collapse="false" text-color="var(--cm-sidebar-text)" active-text-color="var(--cm-accent)" style="margin-top: 10px">
        <SelectionIndicator :active-key="route.meta.name" selector=".choose-item" />
        <el-menu-item @click="router.push({name: 'email'})" index="email"
                      :class="route.meta.name === 'email' ? 'choose-item' : ''">
          <Icon icon="hugeicons:mailbox-01" width="20" height="20" />
          <span class="menu-name" style="margin-left: 21px">{{$t('inbox')}}</span>
        </el-menu-item>
        <el-menu-item @click="router.push({name: 'send'})" index="send" v-perm="'email:send'"
                      :class="route.meta.name === 'send' ? 'choose-item' : ''">
          <Icon icon="cil:send" width="20" height="20" />
          <span class="menu-name" style="margin-left: 21px">{{$t('sent')}}</span>
        </el-menu-item>
        <el-menu-item @click="router.push({name: 'draft'})" index="draft" v-perm="'email:send'"
                      :class="route.meta.name === 'draft' ? 'choose-item' : ''">
          <Icon icon="ep:document" width="19" height="19" />
          <span class="menu-name" style="margin-left: 22px">{{$t('drafts')}}</span>
        </el-menu-item>
        <el-menu-item @click="router.push({name: 'star'})" index="star"
                      :class="route.meta.name === 'star' ? 'choose-item' : ''">
          <Icon icon="solar:star-line-duotone" width="20" height="20" />
          <span class="menu-name" style="margin-left: 21px">{{$t('starred')}}</span>
        </el-menu-item>
        <el-menu-item @click="router.push({name: 'junk'})" index="junk"
                      :class="route.meta.name === 'junk' ? 'choose-item' : ''">
          <Icon icon="solar:danger-triangle-line-duotone" width="20" height="20" />
          <span class="menu-name" style="margin-left: 21px">{{$t('junk')}}</span>
        </el-menu-item>
        <el-menu-item @click="router.push({name: 'archive'})" index="archive"
                      :class="route.meta.name === 'archive' ? 'choose-item' : ''">
          <Icon icon="solar:archive-line-duotone" width="20" height="20" />
          <span class="menu-name" style="margin-left: 21px">{{$t('archive')}}</span>
        </el-menu-item>
        <el-menu-item @click="router.push({name: 'setting'})" index="setting"
                      :class="route.meta.name === 'setting' ? 'choose-item' : ''">
          <Icon icon="fluent:settings-48-regular" width="20" height="20" />
          <span class="menu-name" style="margin-left: 21px">{{$t('settings')}}</span>
        </el-menu-item>
        <div class="manage-title" v-perm="['all-email:query','user:query','role:query','setting:query','analysis:query','reg-key:query']">
          <div>{{$t('manage')}}</div>
        </div>
        <el-menu-item @click="router.push({name: 'analysis'})" index="analysis" v-perm="'analysis:query'"
                      :class="route.meta.name === 'analysis' ? 'choose-item' : ''">
          <Icon icon="fluent:data-pie-20-regular" width="24" height="24" />
          <span class="menu-name" style="margin-left: 18px">{{$t('analytics')}}</span>
        </el-menu-item>
        <el-menu-item @click="router.push({name: 'user'})" index="setting" v-perm="'user:query'"
                      :class="route.meta.name === 'user' ? 'choose-item' : ''">
          <Icon icon="si:user-alt-2-line" width="20" height="20" />
          <span class="menu-name" style="margin-left: 21px">{{$t('allUsers')}}</span>
        </el-menu-item>
        <el-menu-item @click="router.push({name: 'all-email'})" index="all-email" v-perm="'all-email:query'"
                      :class="route.meta.name === 'all-email' ? 'choose-item' : ''">
          <Icon icon="fluent:mail-list-28-regular" width="22" height="22" />
          <span class="menu-name" style="margin-left: 20px">{{$t('allMail')}}</span>
        </el-menu-item>
        <el-menu-item @click="router.push({name: 'role'})" index="setting" v-perm="'role:query'"
                      :class="route.meta.name === 'role' ? 'choose-item' : ''">
          <Icon icon="fluent:lock-closed-16-regular" width="22" height="22" />
          <span class="menu-name" style="margin-left: 20px">{{$t('permissions')}}</span>
        </el-menu-item>
        <el-menu-item @click="router.push({name: 'reg-key'})" index="reg-key" v-perm="'reg-key:query'"
                      :class="route.meta.name === 'reg-key' ? 'choose-item' : ''">
          <Icon icon="fluent:fingerprint-20-filled" width="22" height="22" />
          <span class="menu-name" style="margin-left: 20px">{{$t('inviteCode')}}</span>
        </el-menu-item>
        <el-menu-item @click="router.push({name: 'sys-setting'})" index="sys-setting" v-perm="'setting:query'"
                      :class="route.meta.name === 'sys-setting' ? 'choose-item' : ''">
          <Icon icon="eos-icons:system-ok-outlined" width="18" height="18" style="margin-left: 2px" />
          <span class="menu-name" style="margin-left: 22px">{{$t('SystemSettings')}}</span>
        </el-menu-item>
      </el-menu>
    </div>
  </el-scrollbar>
</template>

<script setup>
import router from "@/router/index.js";
import { useRoute } from "vue-router";
import {Icon} from "@iconify/vue";
import {useSettingStore} from "@/store/setting.js";
import SelectionIndicator from '@/components/selection-indicator/index.vue'

const settingStore = useSettingStore();
const route = useRoute();

</script>

<style lang="scss" scoped>

.title {
  margin: 0 20px;
  height: 70px;
  border-radius: 0;
  display: flex;
  position: relative;
  font-size: 20px;
  font-weight: 650;
  letter-spacing: -.035em;
  align-items: center;
  justify-content: flex-start;
  gap: 12px;
  color: var(--cm-sidebar-text);
  background: transparent;
  transition: all 0.3s ease;
  max-width: 240px;
  padding: 0;
  > .iconify {
    color: var(--cm-accent);
    flex-shrink: 0;
    width: 28px;
    height: 28px;
  }
  > div {
    overflow: hidden;
    white-space: nowrap;
    text-overflow: ellipsis;
    max-width: calc(240px - 20px - 30px);
  }

  :deep(.el-icon) {
    flex-shrink: 0;
    font-size: 20px;
  }

  .user-right-icon {
    align-self: center;
    position: absolute;
    font-size: 12px;
    right: 8px;
    color: #ffffff;
  }

}


.manage-title {
  margin: 22px 22px 12px;
  padding-top: 18px;
  border-top: 1px solid #ffffff14;
  color: var(--cm-sidebar-muted);
  font-size: 12px;
  font-weight: 500;
  letter-spacing: .09em;
}

.el-menu-item {
  margin: 4px 12px !important;
  border-radius: 8px;
  height: 48px;
  padding: 12px 14px !important;
  position: relative;
  font-size: 15px;
  letter-spacing: .015em;
  > .iconify {
    flex-shrink: 0;
    opacity: .86;
  }
  .menu-name {
    margin-left: 15px !important;
  }
}

.el-menu-item:not(.choose-item) {
  color: var(--cm-sidebar-text);
}

.choose-item {
  font-weight: 600;
  color: var(--cm-accent) !important;
  background: var(--cm-sidebar-active) !important;
}

@media (hover: hover) {
  .el-menu-item:hover {
    background: #ffffff07 !important;
    color: #fff;
  }
  .choose-item:hover {
    background: var(--cm-sidebar-active) !important;
  }
}

.menu-name {
  user-select: none;
}


:deep(.el-scrollbar__wrap--hidden-default ) {
  background: var(--aside-backgound) !important;
}

:deep(.el-menu-item) {
  background: var(--aside-backgound);
}

:deep(.el-menu) {
  background: var(--aside-backgound);
}

.el-menu {
  position: relative;
  --selection-color: var(--cm-accent);
  border-right: 0;
  width: var(--cm-sidebar-width);
  padding-bottom: 24px;
}

:deep(.el-divider__text) {
  background: var(--aside-backgound);
  color: #FFFFFF;
}

.scroll {

}
</style>
