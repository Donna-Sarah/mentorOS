import { DM_Sans } from 'next/font/google'
import type { Metadata } from 'next'

const dmSans = DM_Sans({
  weight: ['400', '500', '600'],
  subsets: ['latin', 'latin-ext'],
  variable: '--font-hientruong-body',
})

export const metadata: Metadata = {
  title: 'Hiện trường — mentorOS',
  description: 'Ghi nhận hiện trường bằng giọng nói — AI tự tách cột — đồng bộ Google Sheets.',
}

export default function HienTruongLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <div
      className={`${dmSans.variable} px-page pb-16 pt-6 font-[family-name:var(--font-hientruong-body)] md:pt-8`}
    >
      {children}
    </div>
  )
}
