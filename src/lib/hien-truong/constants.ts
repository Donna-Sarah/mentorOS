export const DEFAULT_SHEETS_URL =
  'https://script.google.com/macros/s/AKfycbyFI268Opg1e2l3_j_3JbPzy8ov7esAYvK1WS_ddmtjdPrx2ahLYIHc1cE2V22Y0KeYYg/exec'

export const APPS_SCRIPT_CODE = `function doPost(e) {
  try {
    var data = JSON.parse(e.postData.contents);
    var ss = SpreadsheetApp.getActiveSpreadsheet();
    var sheet = ss.getSheetByName("HienTruong") || ss.insertSheet("HienTruong");
    if (sheet.getLastRow() === 0) {
      sheet.appendRow(["STT","Ngày","Địa điểm","Hạng mục","Hiện trạng",
        "Đề xuất","Người phụ trách","Ngày hoàn thành","Ghi chú","Thời gian ghi"]);
      sheet.getRange(1,1,1,10).setFontWeight("bold");
    }
    var rows = data.rows;
    var n = sheet.getLastRow();
    rows.forEach(function(r, i) {
      sheet.appendRow([n+i, r.ngay, r.dia_diem, r.hang_muc, r.hien_trang,
        r.de_xuat, r.nguoi_phu_trach, r.ngay_hoan_thanh, r.ghi_chu,
        new Date().toLocaleString("vi-VN")]);
    });
    return ContentService.createTextOutput(
      JSON.stringify({ok:true,added:rows.length})
    ).setMimeType(ContentService.MimeType.JSON);
  } catch(err) {
    return ContentService.createTextOutput(
      JSON.stringify({ok:false,error:err.message})
    ).setMimeType(ContentService.MimeType.JSON);
  }
}

function doGet() {
  return ContentService.createTextOutput(
    JSON.stringify({ok:true,msg:"Connected!"})
  ).setMimeType(ContentService.MimeType.JSON);
}`
