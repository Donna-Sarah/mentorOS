import type { Metadata } from 'next'
import { PMPClient } from '@/components/pmp'

export const metadata: Metadata = {
  title: 'PMP Thinking Coach — mentorOS',
  description: 'Luyện tư duy đọc đề và chọn đáp án PMP theo logic PMI.',
}

export default function PMPPage() {
  return <PMPClient />
}
