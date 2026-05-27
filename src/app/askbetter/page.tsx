import { AskBetterComingSoonClient } from '@/components/askbetter/AskBetterComingSoonClient'
import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'AskBetter — mentorOS',
  description: 'Hỏi AI rõ hơn. Nhận kết quả tốt hơn.',
}

export default function AskBetterPage() {
  return <AskBetterComingSoonClient />
}
