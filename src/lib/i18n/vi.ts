export const vi = {
  nav: {
    home: 'Trang chủ',
    products: 'Sản phẩm',
    pmp: 'PMP Thinking Coach',
    askbetter: 'AskBetter',
    nextup: 'NextUp',
    bidmentor: 'BidMentor',
    try_free: 'Dùng thử miễn phí',
    open_menu: 'Mở menu',
    close_menu: 'Đóng menu',
  },
  home: {
    hero_badge: 'AI-native Cognition System',
    hero_title: 'Think clearer.',
    hero_title_2: 'Learn faster.',
    hero_title_3: 'Work smarter with AI.',
    hero_sub:
      'mentorOS là hệ sinh thái công cụ AI giúp bạn hiểu vấn đề rõ hơn, học đúng hơn và làm việc hiệu quả hơn.',
    cta_primary: 'Dùng AskBetter miễn phí',
    cta_secondary: 'Khám phá PMP Coach',
    products_title: 'Bốn công cụ. Một hệ sinh thái.',
    products_sub:
      'Mỗi công cụ giải quyết một pain point thật — cùng xây trên nền tư duy rõ ràng.',
    philosophy_label: 'Triết lý',
    philosophy_title: 'Not more content. Better thinking.',
    philosophy_body:
      'Kiến thức không còn khan hiếm. Điều khan hiếm là sự rõ ràng — biết vấn đề thật sự là gì, biết mình đang sai ở đâu, biết bước tiếp theo cần làm gì. mentorOS xây xung quanh lớp giá trị đó.',
    cta_strip_title: 'Bắt đầu suy nghĩ rõ hơn ngay hôm nay.',
    cta_strip_sub:
      'AskBetter và NextUp miễn phí. PMP Thinking Coach có 3 ngày dùng thử.',
  },
  products: {
    pmp: {
      name: 'PMP Thinking Coach',
      tagline: 'Luyện tư duy đọc đề và chọn đáp án theo logic PMI.',
      badge: 'AI-powered',
      cta: 'Khám phá',
      features: {
        f1: 'Mood 1 — Thinking Analysis',
        f2: 'Mood 2 — Reading Decode',
        f3: 'Glossary PMI thuật ngữ',
        f4: 'Upload ảnh câu hỏi',
      },
    },
    askbetter: {
      name: 'AskBetter',
      tagline: 'Hỏi AI rõ hơn. Nhận kết quả tốt hơn.',
      badge: 'Miễn phí',
      cta: 'Dùng ngay',
      features: {
        f1: 'Clarify My Request',
        f2: 'Phân tích yêu cầu còn thiếu gì',
        f3: 'Gợi ý cải thiện prompt',
        f4: 'Thư viện AI task văn phòng',
      },
    },
    nextup: {
      name: 'NextUp',
      tagline: 'Biết việc tiếp theo cần làm.',
      badge: 'Miễn phí',
      cta: 'Dùng ngay',
      features: {
        f1: 'Nhập task bằng ngôn ngữ tự nhiên',
        f2: 'AI tách deadline và ưu tiên',
        f3: 'Xem theo Today / Week / Month',
        f4: 'Daily clarity summary',
      },
    },
    bidmentor: {
      name: 'BidMentor',
      tagline: 'Học và làm việc thông minh hơn trong đấu thầu.',
      badge: 'AI-powered',
      cta: 'Mở BidMentor',
    },
  },
  footer: {
    tagline: 'AI-native cognition system.',
    products: 'Sản phẩm',
    company: 'mentorOS',
    rights: '© 2025 mentorOS. All rights reserved.',
  },
  coming_soon: {
    label: 'Đang xây dựng',
    title: 'Sắp ra mắt',
    body: 'Tính năng này đang được phát triển. Quay lại sớm nhé.',
    back: 'Về trang chủ',
    building_mvp: 'Đang xây MVP',
  },
  common: {
    error: 'Đã có lỗi xảy ra. Vui lòng thử lại.',
    loading: 'Đang tải...',
    ai_powered: 'AI-powered',
    free: 'Miễn phí',
    by_mentoross: 'by mentorOS',
  },
} as const

type WidenStringsDeep<T> = T extends string
  ? string
  : T extends readonly (infer U)[]
    ? readonly WidenStringsDeep<U>[]
    : T extends object
      ? { [K in keyof T]: WidenStringsDeep<T[K]> }
      : T

export type Translations = WidenStringsDeep<typeof vi>
