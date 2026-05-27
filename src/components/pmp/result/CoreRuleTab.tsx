'use client'

interface CoreRuleTabProps {
  coreRule: string
  trapName: string
}

export default function CoreRuleTab({ coreRule, trapName }: CoreRuleTabProps) {
  return (
    <div className="flex flex-col items-center py-8 px-4 text-center">
      <div className="mb-6 mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-pmp-surface">
        <svg
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="1.5"
          strokeLinecap="round"
          strokeLinejoin="round"
          className="h-8 w-8 text-pmp-accent"
          aria-hidden
        >
          <path d="M9 21h6M12 3a6 6 0 0 1 6 6c0 2.22-1.21 4.16-3 5.2V17H9v-2.8C7.21 13.16 6 11.22 6 9a6 6 0 0 1 6-6z" />
        </svg>
      </div>

      <div className="mb-3 font-body text-caption font-bold uppercase tracking-widest text-ash-text">CORE RULE</div>

      <div className="font-display text-[24px] md:text-[32px] tracking-[-0.02em] leading-snug text-midnight-ink font-bold max-w-[400px]">
        {coreRule}
      </div>

      <div className="mt-6 inline-flex items-center gap-2 rounded-md bg-amber-glow p-3">
        <div className="font-body text-body-sm text-slate-text">Áp dụng khi gặp bẫy:</div>
        <div className="font-body text-body-sm font-semibold text-midnight-ink">{trapName}</div>
      </div>

      <div className="mt-4 font-body text-caption text-ash-text">Screenshot câu này để ôn lại sau 💡</div>
    </div>
  )
}

