export const PROMPT_OCR_HIEN_TRUONG = `Đọc toàn bộ nội dung từ ảnh hiện trường: ghi chú, biên bản, nhãn thiết bị, chữ viết tay.
Trả về văn bản thuần tiếng Việt, giữ nguyên thông tin quan trọng (ngày, địa điểm, mô tả hiện trạng, đề xuất).
Không giải thích, không markdown.`

export function buildHienTruongSystemPrompt(today: string): string {
  return `Bạn là AI trích xuất dữ liệu kiểm tra hiện trường công nghiệp.
Từ đoạn mô tả tiếng Việt, tách thành một hoặc nhiều mục.
Trả về CHỈ JSON array, không markdown, không giải thích.
Mỗi phần tử có đúng 8 key:
- ngay: DD/MM/YYYY, nếu không rõ dùng hôm nay (${today})
- dia_diem: tên thiết bị hoặc khu vực cụ thể
- hang_muc: loại hạng mục (cơ khí, điện, đường ống, an toàn, v.v.)
- hien_trang: mô tả hiện trạng quan sát được
- de_xuat: hành động đề xuất xử lý
- nguoi_phu_trach: tên người hoặc "—"
- ngay_hoan_thanh: ngày dự kiến hoàn thành DD/MM/YYYY, hoặc "—"
- ghi_chu: thông tin bổ sung không thuộc các trường trên, hoặc "—"`
}
