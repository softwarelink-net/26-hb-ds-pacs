<script setup lang="ts">
import { onMounted } from 'vue'
import { useAuthStore } from '@/stores/auth'
import { usePacsStore } from '@/stores/pacs'

const auth = useAuthStore()
const pacs = usePacsStore()

onMounted(() => pacs.refresh())

function toggleBlind(on: boolean) {
  pacs.setConfig('blind_review_mode', on ? 'true' : 'false')
}
</script>

<template>
  <div class="space-y-6">
    <section class="rounded-2xl border border-navy/10 bg-white/85 p-6 shadow-sm">
      <div class="flex flex-wrap items-start justify-between gap-4">
        <div>
          <h3 class="text-lg font-semibold text-ink">双盲评审模拟舱</h3>
          <p class="mt-1 max-w-2xl text-sm text-ink/55">
            模拟招投标「明标 / 暗标」数据隔离：投标人身份与报价在暗标阶段脱敏展示，评审过程写入本地审计库。
          </p>
        </div>
        <label class="flex items-center gap-3 rounded-full border border-navy/15 bg-ice px-4 py-2 text-sm">
          <span>暗标脱敏</span>
          <input
            type="checkbox"
            class="h-4 w-4 accent-navy-bright"
            :checked="pacs.blindMode"
            :disabled="!auth.canReview()"
            @change="toggleBlind(($event.target as HTMLInputElement).checked)"
          />
        </label>
      </div>

      <div class="mt-6 grid gap-4 md:grid-cols-3">
        <div class="rounded-xl border border-navy/10 bg-sand/60 p-4">
          <p class="text-xs text-ink/45">阶段</p>
          <p class="mt-1 font-semibold text-ink">{{ pacs.blindMode ? '暗标评审中' : '明标复核' }}</p>
        </div>
        <div class="rounded-xl border border-navy/10 bg-sand/60 p-4">
          <p class="text-xs text-ink/45">数据包</p>
          <p class="mt-1 font-semibold text-ink">{{ pacs.packages.length }} 份密封包</p>
        </div>
        <div class="rounded-xl border border-navy/10 bg-sand/60 p-4">
          <p class="text-xs text-ink/45">合规要点</p>
          <p class="mt-1 font-semibold text-ink">小微企业 · 不接受联合体</p>
        </div>
      </div>
    </section>

    <section class="rounded-2xl border border-navy/10 bg-white/85 p-5 shadow-sm">
      <h3 class="mb-4 text-sm font-semibold text-ink">投标文件加密打包与脱敏预览</h3>
      <div class="overflow-x-auto">
        <table class="min-w-full text-left text-sm">
          <thead class="border-b border-navy/10 text-xs text-ink/45">
            <tr>
              <th class="px-2 py-2">包号</th>
              <th class="px-2 py-2">投标人</th>
              <th class="px-2 py-2">技术分</th>
              <th class="px-2 py-2">价格分</th>
              <th class="px-2 py-2">摘要</th>
              <th class="px-2 py-2">操作</th>
            </tr>
          </thead>
          <tbody>
            <tr
              v-for="p in pacs.packages"
              :key="p.id"
              class="border-b border-navy/5 align-top"
            >
              <td class="px-2 py-3 font-mono text-xs">{{ p.package_code }}</td>
              <td class="px-2 py-3">{{ p.bidder_alias }}</td>
              <td class="px-2 py-3">{{ p.tech_score ?? '—' }}</td>
              <td class="px-2 py-3">{{ p.price_score ?? '—' }}</td>
              <td class="max-w-xs px-2 py-3 text-ink/65">{{ p.summary }}</td>
              <td class="px-2 py-3">
                <button
                  class="rounded-lg border border-navy/20 px-3 py-1.5 text-xs transition hover:border-navy-bright hover:text-navy-bright disabled:opacity-40"
                  type="button"
                  :disabled="!auth.canReview() || !p.sealed || pacs.blindMode"
                  @click="pacs.unseal(p.id)"
                >
                  {{ p.sealed ? '解密拆封' : '已拆封' }}
                </button>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
      <p class="mt-3 text-xs text-ink/40">
        关闭「暗标脱敏」后，科主任/管理员可执行拆封；过程写入 ds_audit_logs。
      </p>
    </section>
  </div>
</template>
