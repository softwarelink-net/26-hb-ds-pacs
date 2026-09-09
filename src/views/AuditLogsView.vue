<script setup lang="ts">
import { onMounted } from 'vue'
import { usePacsStore } from '@/stores/pacs'

const pacs = usePacsStore()
onMounted(() => pacs.refresh())
</script>

<template>
  <div class="rounded-2xl border border-navy/10 bg-white/85 p-5 shadow-sm">
    <div class="mb-4">
      <h3 class="text-sm font-semibold text-ink">医疗数据合规审计</h3>
      <p class="mt-1 text-xs text-ink/45">
        基于前端 sql.js 的 ds_audit_logs：记录影像调阅、报告修改、配置变更与登录事件。
      </p>
    </div>
    <div class="overflow-x-auto">
      <table class="min-w-full text-left text-sm">
        <thead class="border-b border-navy/10 text-xs text-ink/45">
          <tr>
            <th class="px-2 py-2">时间</th>
            <th class="px-2 py-2">用户 ID</th>
            <th class="px-2 py-2">动作</th>
            <th class="px-2 py-2">资源</th>
            <th class="px-2 py-2">IP</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="row in pacs.audits" :key="row.id" class="border-b border-navy/5">
            <td class="px-2 py-2.5 whitespace-nowrap text-ink/60">{{ row.timestamp }}</td>
            <td class="px-2 py-2.5">{{ row.user_id ?? '—' }}</td>
            <td class="px-2 py-2.5 font-medium">{{ row.action }}</td>
            <td class="max-w-xs truncate px-2 py-2.5 font-mono text-xs">{{ row.target_resource }}</td>
            <td class="px-2 py-2.5 text-ink/55">{{ row.ip_address }}</td>
          </tr>
        </tbody>
      </table>
    </div>
  </div>
</template>
