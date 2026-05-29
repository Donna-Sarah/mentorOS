export const NEXTUP_SYSTEM_PROMPT = `Bạn là thư ký AI chuyên nghiệp. Nhiệm vụ: lọc và tổng hợp ĐÚNG các việc cần làm theo ngày, KHÔNG liệt kê toàn bộ kế hoạch. Chỉ xuất việc có deadline phù hợp hoặc việc người dùng vừa thêm. Trả về JSON hợp lệ theo schema yêu cầu. KHÔNG thêm text, markdown hay backtick ngoài JSON. Priority: high=khẩn cấp/trễ deadline, medium=cần làm hôm nay, low=nên làm nếu có thể.`

export const NEXTUP_PARSE_PLAN_SYSTEM = `Phân loại văn bản kế hoạch thô thành các nhóm. Trả về JSON. KHÔNG thêm text hay backtick.`

export function buildTodayPrompt(date: string, plan: string, logs: string): string {
  return `Hôm nay là ngày ${date}.
Kế hoạch tổng thể (chỉ tham khảo):
${plan}
Việc người dùng cập nhật hôm nay:
${logs}
Chỉ liệt kê việc CẦN LÀM HÔM NAY: (1) việc người dùng vừa thêm, (2) việc có deadline hôm nay hoặc đã trễ. KHÔNG liệt kê việc tương lai chưa đến hạn.
JSON: {"tasks":[{"id":1,"title":"...","detail":"mô tả ngắn","priority":"high|medium|low","category":"...","time":"..."}]}`
}

export function buildTomorrowPrompt(tomorrow: string, plan: string, doneLogs: string): string {
  return `Ngày mai là ${tomorrow}.
Kế hoạch tổng thể:
${plan}
Hôm nay đã làm:
${doneLogs}
Liệt kê việc có deadline ngày mai và việc hôm nay chưa xong. KHÔNG liệt kê việc xa hơn.
JSON: {"tasks":[{"id":1,"title":"...","detail":"mô tả ngắn","priority":"high|medium|low","category":"...","time":"..."}]}`
}

export function buildWeekPrompt(plan: string, recentLogs: string): string {
  return `Kế hoạch tổng thể:
${plan}
Nhật ký gần đây:
${recentLogs}
Tạo kế hoạch tuần này, chỉ việc có deadline hoặc ngày cụ thể trong tuần. Bỏ qua việc không có thời hạn rõ.
JSON: {"days":[{"date":"YYYY-MM-DD","tasks":[{"id":1,"title":"...","priority":"high|medium|low","category":"..."}]}]}`
}

export function buildParsePlanPrompt(text: string): string {
  return `Phân loại kế hoạch sau thành các nhóm hợp lý. JSON: {"groups":[{"name":"Tên nhóm","icon":"emoji","items":[{"label":"nhãn ngắn","value":"nội dung"}]}]}\n\nKế hoạch:\n${text}`
}
