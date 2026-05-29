interface ErrorBoxProps {
  message: string | null
}

export function ErrorBox({ message }: ErrorBoxProps) {
  if (!message) return null

  return (
    <div
      className="mb-4 flex items-start gap-2.5 rounded-[var(--nu-radius-sm)] border px-4 py-3 text-[13px]"
      style={{
        borderColor: 'rgba(224, 82, 82, 0.3)',
        backgroundColor: 'var(--nu-red-bg)',
        color: 'var(--nu-red)',
      }}
      role="alert"
    >
      <span aria-hidden>⚠</span>
      <span>{message}</span>
    </div>
  )
}
