import { DM_Sans, DM_Serif_Display } from 'next/font/google'
import type { Metadata } from 'next'

const dmSerif = DM_Serif_Display({
  weight: '400',
  subsets: ['latin'],
  variable: '--font-nextup-display',
})

const dmSans = DM_Sans({
  weight: ['400', '500', '600'],
  subsets: ['latin'],
  variable: '--font-nextup-body',
})

export const metadata: Metadata = {
  title: 'NextUp — mentorOS',
  description: 'Biết việc tiếp theo cần làm.',
}

export default function NextUpLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <div
      className={`nextup-shell ${dmSerif.variable} ${dmSans.variable} px-4 pb-16 pt-6 md:px-6 md:pt-8`}
    >
      {children}
    </div>
  )
}
