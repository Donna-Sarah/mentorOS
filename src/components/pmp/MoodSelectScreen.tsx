'use client'

import type { PMPMood } from '@/types/pmp'
import { Button } from '@/components/ui/Button'

interface MoodSelectScreenProps {
  onSelect: (mood: PMPMood) => void
  onBack: () => void
}

const moodCardClassName =
  'cursor-pointer rounded-md border-2 border-[#F3F4F6] bg-white p-6 transition-all duration-150 hover:border-pmp-primary hover:shadow-card md:p-7'

export default function MoodSelectScreen({ onSelect, onBack }: MoodSelectScreenProps) {
  return (
    <section className="mx-auto max-w-[560px] px-5 py-12 md:px-8 md:py-16">
      <header className="mb-10">
        <Button variant="ghost" size="sm" onClick={onBack}>
          ← Đổi câu hỏi
        </Button>
        <h1 className="mt-5 font-display text-[28px] font-bold tracking-[-0.03em] text-[#111111] md:text-[32px]">
          Chọn chế độ luyện tập
        </h1>
        <p className="mt-4 font-body text-[15px] leading-[1.7] text-[#6B7280] md:text-[16px]">
          Câu hỏi đã sẵn sàng. Bạn muốn luyện theo hướng nào?
        </p>
      </header>

      <div className="mt-8 grid grid-cols-1 gap-5 sm:grid-cols-2 sm:gap-6">
        <button type="button" onClick={() => onSelect('mood1')} className={`${moodCardClassName} text-left`}>
          <div className="mb-4 flex items-center justify-between">
            <span className="font-body text-[16px] font-bold text-[#111111]">🧠 Mood 1</span>
            <span className="rounded-sm bg-[#F3F4F6] px-2 py-0.5 font-body text-[11px] font-semibold text-[#9CA3AF]">
              77 giây
            </span>
          </div>
          <p className="mb-3 font-body text-[15px] font-semibold text-[#374151]">Thinking Analysis</p>
          <p className="font-body text-[14px] leading-[1.65] text-[#9CA3AF]">
            Chọn đáp án → nhận phân tích đầy đủ tại sao đúng/sai, bẫy tư duy và Core Rule theo PMI.
          </p>
          <div className="mt-5 border-t border-[#F3F4F6] pt-4">
            <span className="font-body text-[14px] font-semibold text-pmp-accent">Chọn Mood 1 →</span>
          </div>
        </button>

        <button type="button" onClick={() => onSelect('mood2')} className={`${moodCardClassName} text-left`}>
          <div className="mb-4 flex items-center justify-between">
            <span className="font-body text-[16px] font-bold text-[#111111]">🔍 Mood 2</span>
            <span className="rounded-sm bg-[#F3F4F6] px-2 py-0.5 font-body text-[11px] font-semibold text-[#9CA3AF]">
              25 giây
            </span>
          </div>
          <p className="mb-3 font-body text-[15px] font-semibold text-[#374151]">Reading Decode</p>
          <p className="font-body text-[14px] leading-[1.65] text-[#9CA3AF]">
            Luyện đọc đề nhanh — nhận ra PMI signal trong 25 giây trước khi chọn đáp án.
          </p>
          <div className="mt-5 border-t border-[#F3F4F6] pt-4">
            <span className="font-body text-[14px] font-semibold text-askbetter-primary">Chọn Mood 2 →</span>
          </div>
        </button>
      </div>
    </section>
  )
}
