<template>
  <div class="relative z-10 w-full max-w-3xl">
    <article class="rounded-2xl border border-navy/10 bg-white/95 p-8 shadow-xl shadow-navy/10">
      <p class="text-xs tracking-[0.2em] text-navy uppercase">公开招标公告</p>
      <h1 class="mt-2 text-2xl font-semibold leading-snug text-ink">
        河北省深州市医院影像诊断系统采购项目（二次）
      </h1>
      <p class="mt-2 text-sm text-ink/55">项目编号 HB2026073610070027 · 发布日期 2026-09-02</p>

      <dl class="mt-6 grid gap-3 text-sm sm:grid-cols-2">
        <div class="rounded-xl bg-sand/70 p-4">
          <dt class="text-xs text-ink/45">采购主体</dt>
          <dd class="mt-1 font-medium">河北省深州市医院</dd>
        </div>
        <div class="rounded-xl bg-sand/70 p-4">
          <dt class="text-xs text-ink/45">预算金额</dt>
          <dd class="mt-1 font-medium">¥1,050,000（最高限价同预算）</dd>
        </div>
        <div class="rounded-xl bg-sand/70 p-4">
          <dt class="text-xs text-ink/45">履约期限</dt>
          <dd class="mt-1 font-medium">签订合同后 30 日内供货安装调试完毕</dd>
        </div>
        <div class="rounded-xl bg-sand/70 p-4">
          <dt class="text-xs text-ink/45">项目性质</dt>
          <dd class="mt-1 font-medium">专门面向小微企业 · 双盲评审 · 不接受联合体</dd>
        </div>
      </dl>

      <section class="mt-8 space-y-3 text-sm leading-relaxed text-ink/75">
        <h2 class="text-base font-semibold text-ink">技术要点</h2>
        <ol class="list-decimal space-y-2 pl-5">
          <li>支持 DICOM 3.0，覆盖 CT / MRI / DR 等多模态影像处理。</li>
          <li>预留 AI 辅助诊断接口，提升阅片效率与诊断精准度。</li>
          <li>满足《数据安全法》要求，具备日志审计与数据脱敏，适配双盲评审。</li>
        </ol>
      </section>

      <section class="mt-8 rounded-xl border border-amber/30 bg-amber/5 p-4 text-xs leading-relaxed text-ink/65">
        <p class="font-semibold text-amber">免责声明（摘要）</p>
        <p class="mt-2">
          本演示站内容基于公开渠道标讯信息由算法推演生成，仅供技术研究与学习参考，不构成对任何第三方权利的侵犯。
        </p>
      </section>

      <div class="mt-8 flex flex-wrap gap-3">
        <router-link
          class="rounded-lg bg-navy-bright px-4 py-2.5 text-sm font-medium text-white hover:bg-navy"
          to="/login"
        >
          进入演示系统
        </router-link>
        <a
          class="rounded-lg border border-navy/20 px-4 py-2.5 text-sm text-ink hover:border-navy-bright hover:text-navy-bright"
          href="https://github.com/softwarelink-net/26-hb-ds-pacs"
          target="_blank"
          rel="noopener noreferrer"
        >
          查看源码仓库
        </a>
      </div>
    </article>
  </div>
</template>
