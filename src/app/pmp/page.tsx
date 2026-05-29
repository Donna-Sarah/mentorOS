import type { Metadata } from 'next'
import PMPLayout from '@/components/pmp/PMPLayout'

export const metadata: Metadata = {
  title: 'PMP Thinking Coach — mentorOS',
  description: 'Luyện tư duy đọc đề và chọn đáp án PMP theo logic PMI.',
}

export default function PMPPage() {
  return <PMPLayout />
}
