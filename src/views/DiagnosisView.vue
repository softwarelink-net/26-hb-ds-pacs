<script setup lang="ts">
import { computed, onMounted, ref, watch } from 'vue'
import { useAuthStore } from '@/stores/auth'
import { usePacsStore } from '@/stores/pacs'
import type { StudyRow } from '@/utils/db'

const auth = useAuthStore()
const pacs = usePacsStore()
const selectedUid = ref('')
const report = ref('')
const status = ref<StudyRow['status']>('COMPLETED')

const selected = computed(() => pacs.studies.find((s) => s.study_uid === selectedUid.value) ?? null)
const patient = computed(() =>
  selected.value
    ? pacs.patients.find((p) => p.patient_id === selected.value!.patient_id) ?? null
    : null,
)

const seriesTree = computed(() => {
  if (!selected.value) return []
  const mod = selected.value.modality
  return [
    { id: 'S1', label: `${mod} Series 001`, slices: 48 },
    { id: 'S2', label: `${mod} Series 002`, slices: 32 },
    { id: 'S3', label: 'Localizer', slices: 3 },
  ]
})

function selectStudy(uid: string) {
  selectedUid.value = uid
  pacs.viewStudy(uid)
  const s = pacs.studies.find((x) => x.study_uid === uid)
  report.value = s?.report_summary ?? ''
  status.value = s?.status === 'CRITICAL' ? 'CRITICAL' : s?.status === 'COMPLETED' ? 'COMPLETED' : 'IN_PROGRESS'
}

function save() {
  if (!selectedUid.value || !auth.canDiagnose()) return
  pacs.saveReport(selectedUid.value, report.value.trim() || '（空报告）', status.value)
}

onMounted(() => {
  pacs.refresh()
  if (pacs.studies[0]) selectStudy(pacs.studies[0].study_uid)
})

watch(
  () => pacs.studies.length,
  () => {
    if (!selectedUid.value && pacs.studies[0]) selectStudy(pacs.studies[0].study_uid)
  },
)
</script>

<template>
  <div class="grid gap-4 xl:grid-cols-[240px_1fr_300px]">
    <aside class="rounded-2xl border border-navy/10 bg-white/85 p-3 shadow-sm">
      <h3 class="mb-2 px-2 text-xs font-semibold tracking-wide text-ink/50 uppercase">影像序列树</h3>
      <button
        v-for="s in pacs.studies"
        :key="s.study_uid"
        class="mb-1 w-full rounded-lg px-3 py-2.5 text-left text-sm transition"
        :class="
          selectedUid === s.study_uid
            ? 'bg-navy-bright text-white'
            : 'hover:bg-ice text-ink/80'
        "
        type="button"
        @click="selectStudy(s.study_uid)"
      >
        <div class="font-medium">{{ s.modality }} · {{ s.description }}</div>
        <div class="mt-0.5 truncate text-xs opacity-70">{{ s.patient_id }}</div>
      </button>
      <div v-if="selected" class="mt-4 border-t border-navy/10 pt-3">
        <p class="mb-2 px-2 text-xs text-ink/45">Series</p>
        <div
          v-for="node in seriesTree"
          :key="node.id"
          class="rounded-md px-3 py-2 text-xs text-ink/70"
        >
          {{ node.label }}
          <span class="text-ink/40">· {{ node.slices }} 层</span>
        </div>
      </div>
    </aside>

    <section class="rounded-2xl border border-navy/10 bg-slate-deep p-4 text-ice shadow-sm">
      <div class="mb-3 flex items-center justify-between text-xs text-ice/60">
        <span>WebGL 三维重建预览（示意）</span>
        <span v-if="selected">{{ selected.modality }} · DICOM 3.0</span>
      </div>
      <div
        class="relative flex aspect-[4/3] items-center justify-center overflow-hidden rounded-xl border border-white/10"
        style="background:
          radial-gradient(circle at 45% 42%, rgba(224,247,250,0.35), transparent 28%),
          radial-gradient(circle at 55% 48%, rgba(8,145,178,0.25), transparent 40%),
          linear-gradient(145deg, #041820 0%, #0a3a44 55%, #062a32 100%);"
      >
        <div class="absolute inset-6 rounded-full border border-cyan-300/20" />
        <div class="absolute inset-16 rounded-full border border-cyan-200/15" />
        <div class="text-center">
          <p class="text-sm tracking-[0.3em] text-cyan-100/80 uppercase">Viewport</p>
          <p class="mt-2 font-mono text-xs text-ice/50">
            {{ selected?.study_uid ?? '未选择检查' }}
          </p>
          <p v-if="patient" class="mt-4 text-sm text-ice/80">
            {{ patient.name }} · {{ patient.gender }} · {{ patient.birth_date }}
          </p>
        </div>
        <div class="absolute right-3 bottom-3 rounded bg-black/40 px-2 py-1 font-mono text-[10px] text-ice/70">
          W/L · Zoom · MPR
        </div>
      </div>
      <div class="mt-3 grid grid-cols-3 gap-2 text-center text-[11px] text-ice/55">
        <div class="rounded-lg bg-white/5 py-2">轴位 Axial</div>
        <div class="rounded-lg bg-white/5 py-2">冠状 Coronal</div>
        <div class="rounded-lg bg-white/5 py-2">矢状 Sagittal</div>
      </div>
    </section>

    <aside class="rounded-2xl border border-navy/10 bg-white/85 p-4 shadow-sm">
      <h3 class="text-sm font-semibold text-ink">结构化诊断报告</h3>
      <p class="mt-1 text-xs text-ink/45">AI 辅助诊断接口预留 · 本地 sql.js 落库</p>

      <label class="mt-4 block text-xs text-ink/60">报告结论</label>
      <textarea
        v-model="report"
        class="mt-1 h-40 w-full rounded-lg border border-navy/15 bg-sand/50 p-3 text-sm outline-none ring-navy-bright focus:ring-2"
        :disabled="!auth.canDiagnose()"
        placeholder="填写影像所见与诊断意见…"
      />

      <label class="mt-3 block text-xs text-ink/60">状态</label>
      <select
        v-model="status"
        class="mt-1 w-full rounded-lg border border-navy/15 bg-sand/50 px-3 py-2 text-sm"
        :disabled="!auth.canDiagnose()"
      >
        <option value="IN_PROGRESS">IN_PROGRESS</option>
        <option value="COMPLETED">COMPLETED</option>
        <option value="CRITICAL">CRITICAL</option>
        <option value="PENDING">PENDING</option>
      </select>

      <button
        class="mt-4 w-full rounded-lg bg-navy-bright py-2.5 text-sm font-medium text-white transition hover:bg-navy disabled:opacity-50"
        type="button"
        :disabled="!auth.canDiagnose() || !selectedUid"
        @click="save"
      >
        保存报告并写入审计
      </button>

      <div
        v-if="selected?.status === 'CRITICAL'"
        class="mt-4 rounded-lg border border-danger/30 bg-danger/5 p-3 text-xs text-danger"
      >
        危急值预警：请优先完成复核与临床通知闭环。
      </div>
    </aside>
  </div>
</template>
