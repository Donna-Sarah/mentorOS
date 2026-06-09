export interface InspectionRow {
  ngay: string
  dia_diem: string
  hang_muc: string
  hien_trang: string
  de_xuat: string
  nguoi_phu_trach: string
  ngay_hoan_thanh: string
  ghi_chu: string
}

export type StatusType = 'ok' | 'error' | 'loading' | 'info' | ''

export interface StatusMessage {
  type: StatusType
  msg: string
}
