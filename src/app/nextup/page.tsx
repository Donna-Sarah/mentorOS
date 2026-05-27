import { NextUpComingSoonClient } from '@/components/nextup/NextUpComingSoonClient'
import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'NextUp — mentorOS',
  description: 'Biết việc tiếp theo cần làm.',
}

export default function NextUpPage() {
  return <NextUpComingSoonClient />
}
