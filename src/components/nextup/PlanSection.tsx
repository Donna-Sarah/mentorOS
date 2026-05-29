'use client'

import { useCallback, useRef, useState } from 'react'
import * as XLSX from 'xlsx'
import { useLanguage } from '@/lib/i18n'
import { planTextFromStruct, structGroupsFromRows } from '@/lib/nextup/excel'
import type { NextUpStructGroup } from '@/types/nextup'

interface PlanSectionProps {
  plan: string
  struct: NextUpStructGroup[] | null
  planMode: 'text' | 'upload'
  disabled?: boolean
  onPlanModeChange: (mode: 'text' | 'upload') => void
  onSavePlan: (text: string) => Promise<void>
  onConfirmUpload: (plan: string, struct: NextUpStructGroup[]) => void
}

export function PlanSection({
  plan,
  struct,
  planMode,
  disabled = false,
  onPlanModeChange,
  onSavePlan,
  onConfirmUpload,
}: PlanSectionProps) {
  const { t } = useLanguage()
  const [editing, setEditing] = useState(false)
  const [draft, setDraft] = useState('')
  const [accOpen, setAccOpen] = useState<Record<number, boolean>>({})
  const [uploadPreview, setUploadPreview] = useState<{
    plan: string
    struct: NextUpStructGroup[]
    fileName: string
  } | null>(null)
  const [uploadError, setUploadError] = useState<string | null>(null)
  const [dragOver, setDragOver] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)

  const toggleAcc = (index: number): void => {
    setAccOpen((prev) => ({ ...prev, [index]: !prev[index] }))
  }

  const openEdit = (): void => {
    setDraft(plan)
    setEditing(true)
    setUploadPreview(null)
    setUploadError(null)
  }

  const handleSaveText = async (): Promise<void> => {
    const text = draft.trim()
    if (!text) return
    await onSavePlan(text)
    setEditing(false)
  }

  const parseFile = useCallback((file: File): void => {
    setUploadError(null)
    const reader = new FileReader()
    reader.onload = (ev) => {
      try {
        const data = ev.target?.result
        const workbook = XLSX.read(data, { type: 'array' })
        const sheet = workbook.Sheets[workbook.SheetNames[0]]
        const rows = XLSX.utils.sheet_to_json<(string | number)[]>(sheet, {
          header: 1,
          defval: '',
        })

        const parsedRows = rows
          .map((row) => ({
            group: String(row[0] ?? '').trim(),
            label: String(row[1] ?? '').trim(),
            value: String(row[2] ?? '').trim(),
          }))
          .filter((r) => r.group || r.label || r.value)

        if (!parsedRows.length) {
          setUploadError(t.common.error)
          return
        }

        const structResult = structGroupsFromRows(parsedRows)
        const planText = planTextFromStruct(structResult)
        setUploadPreview({
          plan: planText,
          struct: structResult,
          fileName: file.name,
        })
      } catch {
        setUploadError(t.common.error)
      }
    }
    reader.onerror = () => setUploadError(t.common.error)
    reader.readAsArrayBuffer(file)
  }, [t.common.error])

  const handleFileChange = (file: File | undefined): void => {
    if (file) parseFile(file)
  }

  return (
    <section
      className="mt-4 rounded-[var(--nu-radius)] border p-5 md:px-6"
      style={{ borderColor: 'var(--nu-border)', backgroundColor: 'var(--nu-bg1)' }}
    >
      <div className="mb-4 flex items-center justify-between gap-2">
        <h2
          className="text-[11px] font-semibold uppercase tracking-widest"
          style={{ color: 'var(--nu-text3)' }}
        >
          {t.nextup.plan_section_title}
        </h2>
        <button
          type="button"
          disabled={disabled}
          onClick={() => (editing ? setEditing(false) : openEdit())}
          className="min-h-touch shrink-0 rounded-[6px] border px-2.5 text-[12px] disabled:cursor-not-allowed disabled:opacity-40"
          style={{
            borderColor: 'var(--nu-border2)',
            backgroundColor: 'var(--nu-bg2)',
            color: 'var(--nu-text2)',
          }}
        >
          ✎ {editing ? t.common.close : t.nextup.plan_edit}
        </button>
      </div>

      {!editing ? (
        <div>
          {struct && struct.length > 0 ? (
            <div className="space-y-1.5">
              {struct.map((group, i) => {
                const isOpen = accOpen[i] === true
                return (
                  <div
                    key={`${group.g}-${i}`}
                    className="overflow-hidden rounded-[10px] border"
                    style={{ borderColor: 'var(--nu-border)' }}
                  >
                    <button
                      type="button"
                      onClick={() => toggleAcc(i)}
                      className="flex w-full items-center gap-2 px-3.5 py-2.5 text-left transition-colors"
                      style={{ backgroundColor: 'var(--nu-bg2)' }}
                    >
                      <span className="text-[11px] font-semibold uppercase tracking-widest" style={{ color: 'var(--nu-text3)' }}>
                        {group.g}
                        {group.items.length > 0 ? (
                          <span
                            className="ml-2 inline-block rounded-full border px-1.5 py-0 text-[10px] font-normal normal-case"
                            style={{
                              borderColor: 'var(--nu-border)',
                              backgroundColor: 'var(--nu-bg3)',
                            }}
                          >
                            {group.items.length}
                          </span>
                        ) : null}
                      </span>
                      <span
                        className="ml-auto text-[10px] transition-transform"
                        style={{
                          color: 'var(--nu-text3)',
                          transform: isOpen ? 'rotate(90deg)' : 'none',
                        }}
                        aria-hidden
                      >
                        ▶
                      </span>
                    </button>
                    {isOpen ? (
                      <ul className="border-t" style={{ borderColor: 'var(--nu-border)' }}>
                        {group.items.map((item, j) => (
                          <li
                            key={`${item.l}-${j}`}
                            className="flex items-start gap-2.5 border-b px-3.5 py-2 text-[13px] last:border-b-0"
                            style={{
                              borderColor: 'rgba(255,255,255,0.04)',
                              color: 'var(--nu-text2)',
                            }}
                          >
                            <span
                              className="mt-1.5 h-1 w-1 shrink-0 rounded-full opacity-50"
                              style={{ backgroundColor: 'var(--nu-gold)' }}
                              aria-hidden
                            />
                            <span className="min-w-[70px] shrink-0 text-[11px]" style={{ color: 'var(--nu-text3)' }}>
                              {item.l}
                            </span>
                          </li>
                        ))}
                      </ul>
                    ) : null}
                  </div>
                )
              })}
            </div>
          ) : plan ? (
            <p className="whitespace-pre-wrap text-[13px] leading-relaxed" style={{ color: 'var(--nu-text2)' }}>
              {plan}
            </p>
          ) : (
            <p className="text-[13px]" style={{ color: 'var(--nu-text3)' }}>
              {t.nextup.no_plan}
            </p>
          )}
        </div>
      ) : (
        <div>
          <div className="mb-3.5 flex gap-1">
            {(['text', 'upload'] as const).map((mode) => (
              <button
                key={mode}
                type="button"
                onClick={() => onPlanModeChange(mode)}
                className="rounded-[6px] border px-3.5 py-1.5 text-[12px] transition-all"
                style={{
                  borderColor:
                    planMode === mode
                      ? 'rgba(201, 168, 76, 0.3)'
                      : 'var(--nu-border)',
                  backgroundColor:
                    planMode === mode ? 'var(--nu-gold-dim)' : 'transparent',
                  color: planMode === mode ? 'var(--nu-gold)' : 'var(--nu-text3)',
                }}
              >
                {mode === 'text' ? t.nextup.plan_mode_text : t.nextup.plan_mode_upload}
              </button>
            ))}
          </div>

          {planMode === 'text' ? (
            <>
              <textarea
                value={draft}
                onChange={(e) => setDraft(e.target.value)}
                placeholder={t.nextup.plan_placeholder}
                className="min-h-[120px] w-full resize-y rounded-[var(--nu-radius-sm)] border px-3.5 py-2.5 leading-relaxed outline-none"
                style={{
                  fontSize: '16px',
                  borderColor: 'var(--nu-border)',
                  backgroundColor: 'var(--nu-bg2)',
                  color: 'var(--nu-text)',
                }}
              />
              <div className="mt-2.5 flex gap-2">
                <button
                  type="button"
                  disabled={disabled}
                  onClick={() => void handleSaveText()}
                  className="min-h-touch rounded-[6px] border px-3 text-[12px] font-semibold disabled:cursor-not-allowed disabled:opacity-50"
                  style={{
                    borderColor: 'var(--nu-gold)',
                    backgroundColor: 'var(--nu-gold)',
                    color: 'var(--nu-bg)',
                  }}
                >
                  {t.nextup.plan_save_btn}
                </button>
                <button
                  type="button"
                  onClick={() => setEditing(false)}
                  className="min-h-touch rounded-[6px] border px-3 text-[12px]"
                  style={{
                    borderColor: 'var(--nu-border2)',
                    backgroundColor: 'var(--nu-bg2)',
                    color: 'var(--nu-text2)',
                  }}
                >
                  {t.common.cancel}
                </button>
              </div>
            </>
          ) : (
            <>
              <div
                role="button"
                tabIndex={0}
                onClick={() => fileInputRef.current?.click()}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' || e.key === ' ') fileInputRef.current?.click()
                }}
                onDragOver={(e) => {
                  e.preventDefault()
                  setDragOver(true)
                }}
                onDragLeave={() => setDragOver(false)}
                onDrop={(e) => {
                  e.preventDefault()
                  setDragOver(false)
                  const file = e.dataTransfer.files[0]
                  handleFileChange(file)
                }}
                className="cursor-pointer rounded-[10px] border border-dashed p-8 text-center transition-all"
                style={{
                  borderColor: dragOver
                    ? 'rgba(201, 168, 76, 0.5)'
                    : 'rgba(201, 168, 76, 0.2)',
                  backgroundColor: dragOver ? 'var(--nu-gold-dim)' : 'var(--nu-gold-glow)',
                }}
              >
                <p className="mb-1.5 text-[14px] font-medium" style={{ color: 'var(--nu-text2)' }}>
                  {t.nextup.upload_hint}
                </p>
                <p className="text-[12px]" style={{ color: 'var(--nu-text3)' }}>
                  {t.nextup.upload_formats}
                </p>
                <p className="mt-2 text-[11px] opacity-70" style={{ color: 'var(--nu-text3)' }}>
                  {t.nextup.upload_columns}
                </p>
              </div>
              <input
                ref={fileInputRef}
                type="file"
                accept=".xlsx,.xls,.csv"
                className="hidden"
                onChange={(e) => handleFileChange(e.target.files?.[0])}
              />

              {uploadError ? (
                <p className="mt-3 text-[13px]" style={{ color: 'var(--nu-red)' }}>
                  ⚠ {uploadError}
                </p>
              ) : null}

              {uploadPreview ? (
                <div
                  className="mt-3 rounded-[var(--nu-radius-sm)] border p-3"
                  style={{
                    borderColor: 'rgba(76, 175, 125, 0.25)',
                    backgroundColor: 'var(--nu-green-bg)',
                  }}
                >
                  <p className="mb-2 text-[13px]" style={{ color: 'var(--nu-green)' }}>
                    ✓{' '}
                    {t.nextup.upload_success
                      .replace('{file}', uploadPreview.fileName)
                      .replace('{count}', String(uploadPreview.struct.length))}
                  </p>
                  <div className="flex gap-2">
                    <button
                      type="button"
                      onClick={() => {
                        onConfirmUpload(uploadPreview.plan, uploadPreview.struct)
                        setUploadPreview(null)
                        setEditing(false)
                      }}
                      className="min-h-touch rounded-[6px] border px-3 text-[12px] font-semibold"
                      style={{
                        borderColor: 'var(--nu-gold)',
                        backgroundColor: 'var(--nu-gold)',
                        color: 'var(--nu-bg)',
                      }}
                    >
                      {t.nextup.upload_confirm}
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        setUploadPreview(null)
                        if (fileInputRef.current) fileInputRef.current.value = ''
                      }}
                      className="min-h-touch rounded-[6px] border px-3 text-[12px]"
                      style={{
                        borderColor: 'var(--nu-border2)',
                        backgroundColor: 'var(--nu-bg2)',
                        color: 'var(--nu-text2)',
                      }}
                    >
                      {t.nextup.upload_cancel}
                    </button>
                  </div>
                </div>
              ) : null}
            </>
          )}
        </div>
      )}
    </section>
  )
}
