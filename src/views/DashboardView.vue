<script setup lang="ts">
import { computed, onMounted, onUnmounted, ref, watch } from 'vue'
import * as echarts from 'echarts'
import { usePacsStore } from '@/stores/pacs'

const pacs = usePacsStore()
const modalityRef = ref<HTMLDivElement | null>(null)
const statusRef = ref<HTMLDivElement | null>(null)
let modalityChart: echarts.ECharts | null = null
let statusChart: echarts.ECharts | null = null

const cards = computed(() => [
  {
    label: '设备在线率',
    value: `${pacs.stats.onlineRate}%`,
    sub: `${pacs.stats.devicesOnline}/${pacs.stats.devicesTotal} 台在线`,
  },
  {
    label: '今日接诊量',
    value: String(pacs.stats.patientsToday),
    sub: '入院/检查人次',
  },
  {
    label: '危急值告警',
    value: String(pacs.stats.studiesCritical),
    sub: 'CRITICAL 检查单',
    danger: pacs.stats.studiesCritical > 0,
  },
  {
    label: '待阅片',
    value: String(pacs.stats.studiesPending),
    sub: `共 ${pacs.stats.studiesTotal} 例检查`,
  },
])

function renderCharts() {
  if (modalityRef.value) {
    modalityChart ??= echarts.init(modalityRef.value)
    modalityChart.setOption({
      color: ['#0891b2', '#0e7490', '#14b8a6', '#64748b'],
      tooltip: { trigger: 'item' },
      series: [
        {
          type: 'pie',
          radius: ['42%', '68%'],
          data: pacs.stats.modalityRows.map((r) => ({ name: r.modality, value: r.c })),
          label: { color: '#082028' },
        },
      ],
    })
  }
  if (statusRef.value) {
    statusChart ??= echarts.init(statusRef.value)
    const labels = pacs.stats.statusRows.map((r) => r.status)
    const values = pacs.stats.statusRows.map((r) => r.c)
    statusChart.setOption({
      color: ['#0891b2'],
      grid: { left: 48, right: 16, top: 24, bottom: 32 },
      xAxis: { type: 'category', data: labels, axisLabel: { color: '#475569' } },
      yAxis: { type: 'value', minInterval: 1, axisLabel: { color: '#475569' } },
      series: [{ type: 'bar', data: values, barWidth: 28, itemStyle: { borderRadius: [6, 6, 0, 0] } }],
      tooltip: { trigger: 'axis' },
    })
  }
}

function onResize() {
  modalityChart?.resize()
  statusChart?.resize()
}

onMounted(() => {
  pacs.refresh()
  renderCharts()
  window.addEventListener('resize', onResize)
})

watch(
  () => pacs.stats,
  () => renderCharts(),
  { deep: true },
)

onUnmounted(() => {
  window.removeEventListener('resize', onResize)
  modalityChart?.dispose()
  statusChart?.dispose()
})
</script>

<template>
  <div class="space-y-6">
    <section class="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
      <div
        v-for="c in cards"
        :key="c.label"
        class="rounded-2xl border border-navy/10 bg-white/85 p-5 shadow-sm"
      >
        <p class="text-xs tracking-wide text-ink/45 uppercase">{{ c.label }}</p>
        <p
          class="mt-2 text-3xl font-semibold"
          :class="c.danger ? 'text-danger' : 'text-ink'"
        >
          {{ c.value }}
        </p>
        <p class="mt-1 text-xs text-ink/50">{{ c.sub }}</p>
      </div>
    </section>

    <section class="grid gap-4 lg:grid-cols-2">
      <div class="rounded-2xl border border-navy/10 bg-white/85 p-5 shadow-sm">
        <h3 class="text-sm font-semibold text-ink">模态分布 CT / MRI / DR / US</h3>
        <div ref="modalityRef" class="mt-3 h-64" />
      </div>
      <div class="rounded-2xl border border-navy/10 bg-white/85 p-5 shadow-sm">
        <h3 class="text-sm font-semibold text-ink">检查单状态</h3>
        <div ref="statusRef" class="mt-3 h-64" />
      </div>
    </section>

    <section class="rounded-2xl border border-navy/10 bg-white/85 p-5 shadow-sm">
      <div class="mb-4 flex flex-wrap items-end justify-between gap-2">
        <div>
          <h3 class="text-sm font-semibold text-ink">影像全景态势 · 近期检查</h3>
          <p class="mt-1 text-xs text-ink/45">预算 ¥{{ (pacs.stats.budget / 10000).toFixed(0) }} 万 · 合同 30 日内交付调试</p>
        </div>
        <span
          v-if="pacs.blindMode"
          class="rounded-full bg-amber/15 px-3 py-1 text-xs text-amber"
        >
          双盲脱敏模式开启
        </span>
      </div>
      <div class="overflow-x-auto">
        <table class="min-w-full text-left text-sm">
          <thead class="border-b border-navy/10 text-xs text-ink/45">
            <tr>
              <th class="px-2 py-2 font-medium">Study UID</th>
              <th class="px-2 py-2 font-medium">患者</th>
              <th class="px-2 py-2 font-medium">模态</th>
              <th class="px-2 py-2 font-medium">时间</th>
              <th class="px-2 py-2 font-medium">状态</th>
            </tr>
          </thead>
          <tbody>
            <tr
              v-for="s in pacs.studies.slice(0, 6)"
              :key="s.study_uid"
              class="border-b border-navy/5"
            >
              <td class="max-w-[180px] truncate px-2 py-2.5 font-mono text-xs">{{ s.study_uid }}</td>
              <td class="px-2 py-2.5">
                {{ pacs.patients.find((p) => p.patient_id === s.patient_id)?.name ?? s.patient_id }}
              </td>
              <td class="px-2 py-2.5">{{ s.modality }}</td>
              <td class="px-2 py-2.5 text-ink/60">{{ s.study_date }}</td>
              <td class="px-2 py-2.5">
                <span
                  class="rounded-full px-2 py-0.5 text-xs"
                  :class="{
                    'bg-danger/10 text-danger': s.status === 'CRITICAL',
                    'bg-success/10 text-success': s.status === 'COMPLETED',
                    'bg-amber/15 text-amber': s.status === 'IN_PROGRESS',
                    'bg-ice text-navy': s.status === 'PENDING',
                  }"
                >
                  {{ s.status }}
                </span>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </section>
  </div>
</template>
