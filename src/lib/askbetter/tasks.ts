import type { AskBetterCategory, AskBetterTask } from '@/types/askbetter'

export const CATEGORIES: AskBetterCategory[] = [
  { id: 'all', label: 'Tất cả' },
  { id: 'write', label: '✍️ Viết lách' },
  { id: 'analyze', label: '📊 Phân tích' },
  { id: 'comms', label: '💬 Giao tiếp' },
  { id: 'plan', label: '🗂️ Lên kế hoạch' },
  { id: 'learn', label: '📚 Học & nghiên cứu' },
]

export const TASKS: AskBetterTask[] = [
  { id: 1, cat: 'write', title: 'Viết email chuyên nghiệp', desc: 'Soạn email công việc rõ ràng, đúng tone, đúng ngữ cảnh.', example: 'Viết email xin lỗi khách hàng vì giao hàng trễ, tone chuyên nghiệp nhưng thân thiện.' },
  { id: 2, cat: 'write', title: 'Viết proposal dịch vụ', desc: 'Tạo proposal thuyết phục theo cấu trúc: vấn đề → giải pháp → lợi ích → CTA.', example: 'Viết proposal tư vấn marketing cho một SME ngành F&B muốn tăng doanh thu online.' },
  { id: 3, cat: 'write', title: 'Viết mô tả sản phẩm', desc: 'Mô tả sản phẩm hấp dẫn, nêu bật lợi ích thay vì chỉ liệt kê tính năng.', example: 'Viết mô tả cho bình giữ nhiệt 500ml, target khách đi làm văn phòng.' },
  { id: 4, cat: 'write', title: 'Viết bài đăng LinkedIn', desc: 'Bài viết chuyên môn có insight, thu hút tương tác, đúng giọng tác giả.', example: 'Viết bài LinkedIn về bài học từ lần đầu pitching investor bị từ chối.' },
  { id: 5, cat: 'write', title: 'Viết báo cáo tóm tắt', desc: 'Chuyển thông tin dài thành báo cáo ngắn gọn, có cấu trúc rõ ràng.', example: 'Viết báo cáo tóm tắt kết quả chiến dịch marketing Q3 cho ban lãnh đạo.' },
  { id: 6, cat: 'write', title: 'Viết script video/podcast', desc: 'Tạo script tự nhiên, có flow, phù hợp với format audio/video.', example: 'Viết script 3 phút giới thiệu sản phẩm SaaS cho video demo YouTube.' },
  { id: 7, cat: 'write', title: 'Viết JD tuyển dụng', desc: 'Mô tả công việc thu hút ứng viên phù hợp, rõ yêu cầu và văn hóa công ty.', example: 'Viết JD tuyển Content Marketing Manager cho startup tech 50 người.' },
  { id: 8, cat: 'analyze', title: 'Phân tích dữ liệu Excel', desc: 'Tìm insight từ bảng số liệu, xu hướng, bất thường, và gợi ý hành động.', example: 'Phân tích bảng doanh thu 12 tháng, tìm sản phẩm tăng trưởng và sản phẩm cần xem lại.' },
  { id: 9, cat: 'analyze', title: 'Phân tích feedback khách hàng', desc: 'Tổng hợp và phân loại feedback thành insight có thể hành động.', example: 'Phân tích 50 đánh giá 1-3 sao trên Shopee, tìm vấn đề lặp lại nhiều nhất.' },
  { id: 10, cat: 'analyze', title: 'So sánh các lựa chọn', desc: 'Đánh giá ưu/nhược từng phương án theo tiêu chí cụ thể, đưa ra khuyến nghị.', example: 'So sánh 3 phần mềm quản lý dự án: Notion, Asana, Monday.com cho team 10 người.' },
  { id: 11, cat: 'analyze', title: 'Phân tích đối thủ cạnh tranh', desc: 'Tóm tắt điểm mạnh, yếu, cơ hội của đối thủ để định vị tốt hơn.', example: 'Phân tích 3 đối thủ chính của ứng dụng giao đồ ăn nội địa so với ShopeeFood.' },
  { id: 12, cat: 'analyze', title: 'Review tài liệu hợp đồng', desc: 'Chỉ ra điều khoản bất lợi, mơ hồ, hoặc cần clarify trước khi ký.', example: 'Review hợp đồng thuê văn phòng 2 năm, tìm các điều khoản có thể rủi ro cho bên thuê.' },
  { id: 13, cat: 'analyze', title: 'Phân tích nguyên nhân gốc rễ', desc: 'Dùng framework 5-Whys hoặc fishbone để tìm nguyên nhân thật của vấn đề.', example: 'Tìm nguyên nhân gốc rễ tại sao tỷ lệ khách hàng rời bỏ tăng 20% trong quý vừa rồi.' },
  { id: 14, cat: 'comms', title: 'Phản hồi khiếu nại khách hàng', desc: 'Soạn phản hồi chuyên nghiệp: xác nhận vấn đề, xin lỗi đúng mức, đưa giải pháp.', example: 'Phản hồi khách hàng nhận được hàng sai màu, muốn đổi trả nhưng đã quá 7 ngày.' },
  { id: 15, cat: 'comms', title: 'Chuẩn bị nội dung cuộc họp', desc: 'Tạo agenda rõ ràng, phân bổ thời gian, xác định mục tiêu từng mục.', example: 'Chuẩn bị agenda cho cuộc họp review chiến lược 2 giờ với team 8 người.' },
  { id: 16, cat: 'comms', title: 'Tóm tắt cuộc họp', desc: 'Chuyển ghi chú thô thành bản tóm tắt có action items, người phụ trách, deadline.', example: 'Tóm tắt buổi brainstorm ra mắt sản phẩm mới, liệt kê quyết định và việc cần làm tiếp.' },
  { id: 17, cat: 'comms', title: 'Viết tin nhắn khó nói', desc: 'Soạn thảo những tin nhắn nhạy cảm: từ chối, feedback tiêu cực, thương lượng.', example: 'Viết email từ chối ứng viên sau vòng phỏng vấn cuối, giữ mối quan hệ tốt.' },
  { id: 18, cat: 'comms', title: 'Chuẩn bị câu hỏi phỏng vấn', desc: 'Tạo bộ câu hỏi phỏng vấn đánh giá đúng năng lực và culture fit.', example: 'Tạo 10 câu hỏi phỏng vấn cho vị trí Sales Manager B2B, tập trung vào tư duy và kinh nghiệm thực chiến.' },
  { id: 19, cat: 'comms', title: 'Dịch và điều chỉnh văn phong', desc: 'Dịch tài liệu và điều chỉnh cho phù hợp với văn hóa, ngữ cảnh người nhận.', example: 'Dịch email chào hàng từ tiếng Anh sang tiếng Việt, phù hợp với khách hàng doanh nghiệp truyền thống.' },
  { id: 20, cat: 'plan', title: 'Lên kế hoạch dự án', desc: 'Tạo timeline, milestone, phân công công việc cho dự án có thời hạn cụ thể.', example: 'Lên kế hoạch launch website mới trong 6 tuần, team 4 người gồm dev, design, content.' },
  { id: 21, cat: 'plan', title: 'Lên kế hoạch marketing', desc: 'Xây dựng kế hoạch marketing theo kênh, ngân sách, và KPI đo lường.', example: 'Lên kế hoạch marketing tháng cho cửa hàng thời trang online, ngân sách 20 triệu.' },
  { id: 22, cat: 'plan', title: 'Tạo checklist quy trình', desc: 'Biến quy trình phức tạp thành checklist từng bước, không bỏ sót.', example: 'Tạo checklist onboarding nhân viên mới trong 30 ngày đầu cho công ty 30 người.' },
  { id: 23, cat: 'plan', title: 'Lập ngân sách đơn giản', desc: 'Tạo khung ngân sách cho dự án hoặc sự kiện với các hạng mục cần tính đến.', example: 'Lập ngân sách tổ chức team building 50 người trong 1 ngày tại Vũng Tàu.' },
  { id: 24, cat: 'plan', title: 'Tạo SOP (Quy trình chuẩn)', desc: 'Viết quy trình chuẩn hóa cho công việc lặp lại để dễ đào tạo và bàn giao.', example: 'Viết SOP quy trình xử lý đơn hàng từ khi nhận order đến khi giao hàng thành công.' },
  { id: 25, cat: 'plan', title: 'Brainstorm ý tưởng', desc: 'Mở rộng tư duy với nhiều góc tiếp cận đa dạng, phá vỡ lối suy nghĩ quen thuộc.', example: 'Brainstorm 15 ý tưởng content cho thương hiệu cà phê muốn tiếp cận Gen Z.' },
  { id: 26, cat: 'learn', title: 'Giải thích khái niệm phức tạp', desc: 'Breakdown khái niệm khó thành phần dễ hiểu, có ví dụ thực tế.', example: 'Giải thích unit economics trong startup là gì và tại sao quan trọng, dùng ví dụ cụ thể.' },
  { id: 27, cat: 'learn', title: 'Tóm tắt tài liệu dài', desc: 'Rút ra ý chính, insight quan trọng từ báo cáo, sách, bài nghiên cứu dài.', example: 'Tóm tắt báo cáo thị trường thương mại điện tử Việt Nam 2024, lấy 5 insight quan trọng nhất.' },
  { id: 28, cat: 'learn', title: 'Tạo quiz ôn tập', desc: 'Biến tài liệu học thành bộ câu hỏi trắc nghiệm hoặc tự luận để ôn tập hiệu quả.', example: 'Tạo 10 câu hỏi trắc nghiệm về kiến thức Digital Marketing cơ bản cho nhân viên mới.' },
  { id: 29, cat: 'learn', title: 'Nghiên cứu chủ đề nhanh', desc: 'Tổng hợp thông tin cần biết về một chủ đề mới trong thời gian ngắn.', example: 'Tóm tắt những điều cần biết về AI trong ngành logistics cho người mới tìm hiểu.' },
  { id: 30, cat: 'learn', title: 'Tạo tài liệu đào tạo', desc: 'Biến kiến thức chuyên môn thành tài liệu training rõ ràng, dễ tiếp thu.', example: 'Viết tài liệu đào tạo kỹ năng chăm sóc khách hàng cho nhân viên mới của chuỗi bán lẻ.' },
  { id: 31, cat: 'learn', title: 'Phân tích case study', desc: 'Rút bài học thực tiễn từ tình huống kinh doanh thực tế.', example: 'Phân tích lý do Starbucks thành công tại Việt Nam trong khi nhiều thương hiệu cà phê ngoại khác thất bại.' },
  { id: 32, cat: 'learn', title: 'Dịch & giải thích thuật ngữ', desc: 'Dịch thuật ngữ chuyên ngành và giải thích ý nghĩa thực tế trong ngữ cảnh công việc.', example: 'Giải thích các thuật ngữ tài chính phổ biến trong báo cáo thường niên cho người không chuyên.' },
]

export const QUICK_EXAMPLES = [
  'Viết proposal cho khách hàng',
  'Phân tích dữ liệu Excel',
  'Email phản hồi khiếu nại',
  'Lên kế hoạch marketing',
  'Tóm tắt cuộc họp',
] as const
