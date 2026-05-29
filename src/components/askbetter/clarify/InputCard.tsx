'use client'

import { useLanguage } from '@/lib/i18n'

interface InputCardProps {
  value: string
  loading: boolean
  onChange: (value: string) => void
  onSubmit: () => void
}

export function InputCard({
  value,
  loading,
  onChange,
  onSubmit,
}: InputCardProps): React.ReactElement {
  const { t } = useLanguage()

  const handleSubmit = (e: React.FormEvent): void => {
    e.preventDefault()
    onSubmit()
  }

  return (
    <form
      onSubmit={handleSubmit}
      className="rounded-md bg-white-canvas p-6 shadow-card md:p-7"
    >
      <textarea
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={t.askbetter.input_placeholder}
        rows={5}
        disabled={loading}
        className="w-full resize-none rounded-md border-none bg-transparent font-body outline-none"
        style={{ fontSize: '16px', color: 'var(--ab-text)' }}
      />
      <div className="mt-6 flex justify-end border-t border-soft-gray pt-5">
        <button
          type="submit"
          disabled={loading || !value.trim()}
          className="min-h-touch rounded-md px-6 py-3 font-body text-[14px] font-semibold text-white-canvas transition-opacity disabled:cursor-not-allowed disabled:opacity-50"
          style={{ background: 'var(--ab-grad)' }}
        >
          {loading ? t.askbetter.analyzing : t.askbetter.analyze_btn}
        </button>
      </div>
    </form>
  )
}
