import type { Metadata } from 'next'
import { PMPClient } from '@/components/pmp'

export const metadata: Metadata = {
  title: 'PMP Thinking Coach — mentorOS',
  description: 'Luyện tư duy đọc đề và chọn đáp án PMP theo logic PMI.',
}

export default function PMPPage() {
  return (
    <div className="min-h-[calc(100vh-56px)] bg-amber-glow md:min-h-[calc(100vh-64px)]">
      <PMPClient />
    </div>
  )
}
