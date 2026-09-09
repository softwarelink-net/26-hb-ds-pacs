<script setup lang="ts">
import { onMounted } from 'vue'
import { useAuthStore } from '@/stores/auth'
import { usePacsStore } from '@/stores/pacs'
import type { DeviceRow } from '@/utils/db'

const auth = useAuthStore()
const pacs = usePacsStore()

onMounted(() => pacs.refresh())

function setStatus(id: string, status: DeviceRow['status']) {
  if (!auth.canAdmin() && auth.role !== 'manager') return
  pacs.setDeviceStatus(id, status)
}

const statusClass: Record<string, string> = {
  ONLINE: 'bg-success/10 text-success',
  OFFLINE: 'bg-ink/10 text-ink/50',
  MAINTENANCE: 'bg-amber/15 text-amber',
}
</script>

<template>
  <div class="space-y-6">
    <section class="grid gap-4 sm:grid-cols-3">
      <div class="rounded-2xl border border-navy/10 bg-white/85 p-5 shadow-sm">
        <p class="text-xs text-ink/45">设备总数</p>
        <p class="mt-2 text-3xl font-semibold">{{ pacs.devices.length }}</p>
      </div>
      <div class="rounded-2xl border border-navy/10 bg-white/85 p-5 shadow-sm">
        <p class="text-xs text-ink/45">在线</p>
        <p class="mt-2 text-3xl font-semibold text-success">
          {{ pacs.devices.filter((d) => d.status === 'ONLINE').length }}
        </p>
      </div>
      <div class="rounded-2xl border border-navy/10 bg-white/85 p-5 shadow-sm">
        <p class="text-xs text-ink/45">维保 / 离线</p>
        <p class="mt-2 text-3xl font-semibold text-amber">
          {{ pacs.devices.filter((d) => d.status !== 'ONLINE').length }}
        </p>
      </div>
    </section>

    <section class="rounded-2xl border border-navy/10 bg-white/85 p-5 shadow-sm">
      <h3 class="mb-1 text-sm font-semibold text-ink">设备资产全生命周期</h3>
      <p class="mb-4 text-xs text-ink/45">GE / Siemens / Philips 等主流厂商 · 采购合同、维保与更换周期</p>
      <div class="overflow-x-auto">
        <table class="min-w-full text-left text-sm">
          <thead class="border-b border-navy/10 text-xs text-ink/45">
            <tr>
              <th class="px-2 py-2">设备编号</th>
              <th class="px-2 py-2">厂商</th>
              <th class="px-2 py-2">型号</th>
              <th class="px-2 py-2">位置</th>
              <th class="px-2 py-2">状态</th>
              <th class="px-2 py-2">上次维保</th>
              <th class="px-2 py-2">质保到期</th>
              <th class="px-2 py-2">操作</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="d in pacs.devices" :key="d.device_id" class="border-b border-navy/5">
              <td class="px-2 py-3 font-mono text-xs">{{ d.device_id }}</td>
              <td class="px-2 py-3">{{ d.manufacturer }}</td>
              <td class="px-2 py-3">{{ d.model }}</td>
              <td class="px-2 py-3 text-ink/65">{{ d.location }}</td>
              <td class="px-2 py-3">
                <span class="rounded-full px-2 py-0.5 text-xs" :class="statusClass[d.status]">
                  {{ d.status }}
                </span>
              </td>
              <td class="px-2 py-3 text-ink/60">{{ d.last_maintenance ?? '—' }}</td>
              <td class="px-2 py-3 text-ink/60">{{ d.warranty_expiry ?? '—' }}</td>
              <td class="px-2 py-3">
                <select
                  class="rounded border border-navy/15 bg-sand/50 px-2 py-1 text-xs disabled:opacity-40"
                  :value="d.status"
                  :disabled="auth.role === 'decider'"
                  @change="setStatus(d.device_id, ($event.target as HTMLSelectElement).value as DeviceRow['status'])"
                >
                  <option value="ONLINE">ONLINE</option>
                  <option value="OFFLINE">OFFLINE</option>
                  <option value="MAINTENANCE">MAINTENANCE</option>
                </select>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </section>
  </div>
</template>
