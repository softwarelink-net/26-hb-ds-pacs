<script setup lang="ts">
import { computed } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import StickyTopBanner from '@/components/StickyTopBanner.vue'
import { useAuthStore } from '@/stores/auth'

const route = useRoute()
const router = useRouter()
const auth = useAuthStore()

const nav = computed(() => {
  const items = [
    { to: '/dashboard', name: 'dashboard', label: '态势大屏', icon: '◈' },
    { to: '/diagnosis/workbench', name: 'diagnosis', label: '诊断工作台', icon: '◎' },
    { to: '/bid/blind-review', name: 'blind-review', label: '双盲评审', icon: '▣' },
    { to: '/assets/management', name: 'assets', label: '设备资产', icon: '▤' },
    { to: '/audit/logs', name: 'audit-logs', label: '审计日志', icon: '▦' },
    { to: '/tender/details', name: 'tender', label: '招标公告', icon: '※' },
  ]
  return items.filter((item) => auth.canAccess(item.name))
})

function logout() {
  auth.logout()
  router.push({ name: 'login' })
}

const roleLabel: Record<string, string> = {
  admin: '系统管理员',
  manager: '科主任',
  doctor: '主治医师',
  decider: '院领导',
}
</script>

<template>
  <div class="min-h-screen pt-10">
    <StickyTopBanner />
    <div class="mx-auto flex min-h-[calc(100vh-40px)] max-w-[1440px]">
      <aside class="hidden w-60 shrink-0 border-r border-navy/15 bg-slate-deep text-ice md:flex md:flex-col">
        <div class="border-b border-white/10 px-5 py-6">
          <p class="text-xs tracking-[0.2em] text-cyan-200/80 uppercase">Deepzhou · PACS</p>
          <h1 class="mt-1 text-lg font-semibold leading-snug text-white">
            影像诊断协同
          </h1>
          <p class="mt-2 text-xs text-ice/70">HB2026073610070027</p>
        </div>
        <nav class="flex flex-1 flex-col gap-1 p-3">
          <router-link
            v-for="item in nav"
            :key="item.to"
            :to="item.to"
            class="flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm transition"
            :class="
              route.path === item.to
                ? 'bg-navy-bright text-white shadow-lg shadow-black/20'
                : 'text-ice/80 hover:bg-white/5 hover:text-white'
            "
          >
            <span class="w-4 text-center opacity-80">{{ item.icon }}</span>
            {{ item.label }}
          </router-link>
        </nav>
        <div class="border-t border-white/10 p-4 text-xs text-ice/60">
          <p>角色：{{ roleLabel[auth.role] ?? auth.role }}</p>
          <p class="mt-1 truncate">{{ auth.user?.real_name ?? auth.user?.username }}</p>
        </div>
      </aside>

      <div class="flex min-w-0 flex-1 flex-col">
        <header class="flex items-center justify-between gap-4 border-b border-navy/10 bg-white/70 px-4 py-3 backdrop-blur md:px-6">
          <div class="min-w-0">
            <p class="truncate text-sm text-ink/50">河北省深州市医院 · 影像诊断系统演示环境</p>
            <h2 class="truncate text-base font-semibold text-ink md:text-lg">
              {{ nav.find((n) => n.to === route.path)?.label ?? '态势大屏' }}
            </h2>
          </div>
          <div class="flex items-center gap-2">
            <div class="hidden items-center gap-2 rounded-full bg-ice px-3 py-1.5 text-xs text-navy sm:flex">
              <span class="h-2 w-2 rounded-full bg-success" />
              sql.js · 本地 SQLite
            </div>
            <button
              class="rounded-lg border border-navy/20 bg-white px-3 py-1.5 text-sm text-ink transition hover:border-navy-bright hover:text-navy-bright"
              type="button"
              @click="logout"
            >
              退出
            </button>
          </div>
        </header>

        <div class="flex gap-1 overflow-x-auto border-b border-navy/10 bg-white/60 px-2 py-2 md:hidden">
          <router-link
            v-for="item in nav"
            :key="item.to"
            :to="item.to"
            class="shrink-0 rounded-full px-3 py-1.5 text-xs"
            :class="
              route.path === item.to
                ? 'bg-navy-bright text-white'
                : 'bg-sand text-ink/70'
            "
          >
            {{ item.label }}
          </router-link>
        </div>

        <main class="flex-1 p-4 md:p-6">
          <router-view />
        </main>
      </div>
    </div>
  </div>
</template>
