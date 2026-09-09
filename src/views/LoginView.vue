<script setup lang="ts">
import { ref } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useAuthStore } from '@/stores/auth'

const auth = useAuthStore()
const router = useRouter()
const route = useRoute()

const username = ref('admin')
const password = ref('admin123')
const error = ref('')
const loading = ref(false)

const demos = [
  { username: 'admin', password: 'admin123', label: '超管 Admin' },
  { username: 'dept_head', password: 'med2026', label: '科主任 Manager' },
  { username: 'dr_zhang', password: 'doctor123', label: '医师 Doctor' },
  { username: 'president', password: 'admin999', label: '院领导 Decider' },
]

function fill(u: string, p: string) {
  username.value = u
  password.value = p
  error.value = ''
}

function submit() {
  loading.value = true
  error.value = ''
  const res = auth.login(username.value, password.value)
  loading.value = false
  if (!res.ok) {
    error.value = res.message
    return
  }
  const redirect = (route.query.redirect as string) || '/dashboard'
  router.replace(redirect)
}
</script>

<template>
  <div class="relative z-10 w-full max-w-md">
    <div class="rounded-2xl border border-navy/10 bg-white/90 p-8 shadow-xl shadow-navy/10 backdrop-blur">
      <div class="mb-6">
        <p class="text-xs tracking-[0.25em] text-navy uppercase">HB2026073610070027</p>
        <h1 class="mt-2 text-2xl font-semibold text-ink">深州市医院影像诊断系统</h1>
        <p class="mt-2 text-sm text-ink/55">PACS 协同平台演示 · 预算 ¥105 万 · 双盲评审</p>
      </div>

      <form class="space-y-4" @submit.prevent="submit">
        <label class="block text-sm">
          <span class="mb-1.5 block text-ink/70">账号</span>
          <input
            v-model="username"
            autocomplete="username"
            class="w-full rounded-lg border border-navy/15 bg-sand/60 px-3 py-2.5 outline-none ring-navy-bright focus:ring-2"
            type="text"
          />
        </label>
        <label class="block text-sm">
          <span class="mb-1.5 block text-ink/70">密码</span>
          <input
            v-model="password"
            autocomplete="current-password"
            class="w-full rounded-lg border border-navy/15 bg-sand/60 px-3 py-2.5 outline-none ring-navy-bright focus:ring-2"
            type="password"
          />
        </label>
        <p v-if="error" class="text-sm text-danger">{{ error }}</p>
        <button
          class="w-full rounded-lg bg-navy-bright py-2.5 text-sm font-medium text-white transition hover:bg-navy disabled:opacity-60"
          type="submit"
          :disabled="loading"
        >
          {{ loading ? '登录中…' : '进入系统' }}
        </button>
      </form>

      <div class="mt-6">
        <p class="mb-2 text-xs text-ink/45">演示账号快捷填充</p>
        <div class="grid grid-cols-2 gap-2">
          <button
            v-for="d in demos"
            :key="d.username"
            class="rounded-lg border border-navy/10 bg-ice/50 px-2 py-2 text-left text-xs text-ink/80 transition hover:border-navy-bright hover:text-navy-bright"
            type="button"
            @click="fill(d.username, d.password)"
          >
            {{ d.label }}
          </button>
        </div>
      </div>

      <p class="mt-6 text-center text-xs text-ink/45">
        <router-link class="text-navy-bright hover:underline" to="/tender/details">
          查看招标公告详情
        </router-link>
      </p>
    </div>
  </div>
</template>
