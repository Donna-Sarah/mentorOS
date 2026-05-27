'use client'

import { useMemo, useState } from 'react'
import { cn } from '@/lib/utils/cn'

type MetricColor = 'green' | 'red' | 'orange' | 'neutral'

interface EvmInputs {
  bac: string
  pv: string
  ev: string
  ac: string
}

interface EvmComputed {
  cv: number
  sv: number
  cpi: number
  spi: number
  eac: number
  etc: number
  vac: number
  tcpi: number
  interpretation: string
  isHealthy: boolean
}

interface MetricDef {
  key: keyof Pick<EvmComputed, 'cv' | 'sv' | 'cpi' | 'spi' | 'eac' | 'etc' | 'vac' | 'tcpi'>
  label: string
  formula: string
  color: MetricColor
  isRatio: boolean
}

const colorClasses: Record<MetricColor, { card: string; value: string }> = {
  green: { card: 'border-success/20 bg-success/5', value: 'text-success' },
  red: { card: 'border-error/20 bg-error/5', value: 'text-error' },
  orange: { card: 'border-warning/20 bg-warning/5', value: 'text-warning' },
  neutral: { card: 'border-soft-gray bg-white-canvas', value: 'text-midnight-ink' },
}

function parsePositive(value: string): number | null {
  const n = parseFloat(value)
  if (!Number.isFinite(n) || n <= 0) return null
  return n
}

export default function EVMCalculator() {
  const [inputs, setInputs] = useState<EvmInputs>({ bac: '', pv: '', ev: '', ac: '' })

  const computed = useMemo((): EvmComputed | null => {
    const bac = parsePositive(inputs.bac)
    const pv = parsePositive(inputs.pv)
    const ev = parsePositive(inputs.ev)
    const ac = parsePositive(inputs.ac)

    if (bac === null || pv === null || ev === null || ac === null) return null

    const cv = ev - ac
    const sv = ev - pv
    const cpi = ev / ac
    const spi = ev / pv
    const eac = bac / cpi
    const etc = eac - ac
    const vac = bac - eac
    const tcpi = (bac - ev) / (eac - ac)

    if (!Number.isFinite(cpi) || !Number.isFinite(spi) || !Number.isFinite(eac) || !Number.isFinite(tcpi)) {
      return null
    }

    let interpretation: string
    if (cpi < 1 && spi < 1) {
      interpretation = '⚠️ Vượt chi và chậm tiến độ — cần corrective action ngay'
    } else if (cpi < 1 && spi >= 1) {
      interpretation = '⚠️ Đúng/sớm tiến độ nhưng vượt chi phí'
    } else if (cpi >= 1 && spi < 1) {
      interpretation = '⚠️ Trong ngân sách nhưng chậm tiến độ'
    } else {
      interpretation = '✅ Trong ngân sách và đúng/sớm tiến độ'
    }

    return {
      cv,
      sv,
      cpi,
      spi,
      eac,
      etc,
      vac,
      tcpi,
      interpretation,
      isHealthy: cpi >= 1 && spi >= 1,
    }
  }, [inputs])

  const metrics: MetricDef[] = computed
    ? [
        { key: 'cv', label: 'CV', formula: 'EV - AC', color: computed.cv >= 0 ? 'green' : 'red', isRatio: false },
        { key: 'sv', label: 'SV', formula: 'EV - PV', color: computed.sv >= 0 ? 'green' : 'red', isRatio: false },
        { key: 'cpi', label: 'CPI', formula: 'EV / AC', color: computed.cpi >= 1 ? 'green' : 'red', isRatio: true },
        { key: 'spi', label: 'SPI', formula: 'EV / PV', color: computed.spi >= 1 ? 'green' : 'red', isRatio: true },
        { key: 'eac', label: 'EAC', formula: 'BAC / CPI', color: 'neutral', isRatio: false },
        { key: 'etc', label: 'ETC', formula: 'EAC - AC', color: 'neutral', isRatio: false },
        { key: 'vac', label: 'VAC', formula: 'BAC - EAC', color: computed.vac >= 0 ? 'green' : 'red', isRatio: false },
        {
          key: 'tcpi',
          label: 'TCPI',
          formula: '(BAC-EV)/(EAC-AC)',
          color: computed.tcpi <= 1 ? 'green' : 'orange',
          isRatio: true,
        },
      ]
    : []

  const inputFields = [
    { key: 'bac' as const, label: 'BAC', hint: 'Budget at Completion' },
    { key: 'pv' as const, label: 'PV', hint: 'Planned Value' },
    { key: 'ev' as const, label: 'EV', hint: 'Earned Value' },
    { key: 'ac' as const, label: 'AC', hint: 'Actual Cost' },
  ]

  return (
    <div className="mx-auto max-w-[640px] px-4 py-8">
      <h2 className="mb-2 font-display text-heading-sm font-bold text-midnight-ink">📊 EVM Calculator</h2>
      <p className="mb-6 font-body text-body-sm text-slate-text">
        Nhập 4 giá trị để tính tất cả EVM metrics.
      </p>

      <div className="mb-6 grid grid-cols-2 gap-3">
        {inputFields.map(({ key, label, hint }) => (
          <div key={key}>
            <label className="mb-1 block font-body text-body-sm font-semibold text-midnight-ink">
              {label}
              <span className="mt-0.5 block font-body text-caption font-normal text-ash-text">{hint}</span>
            </label>
            <input
              type="number"
              min="0"
              step="any"
              placeholder="0"
              value={inputs[key]}
              onChange={(e) => setInputs((prev) => ({ ...prev, [key]: e.target.value }))}
              className="w-full rounded-md border border-soft-gray p-3 font-body text-body-sm text-midnight-ink transition-colors focus:border-pmp-primary focus:outline-none"
              style={{ fontSize: '16px' }}
            />
          </div>
        ))}
      </div>

      {computed && (
        <>
          <div
            className={cn(
              'mb-4 rounded-md border p-3 font-body text-body-sm font-semibold',
              computed.isHealthy
                ? 'border-success/20 bg-success/10 text-success'
                : 'border-warning/20 bg-warning/10 text-warning',
            )}
          >
            {computed.interpretation}
          </div>

          <div className="grid grid-cols-2 gap-3">
            {metrics.map((metric) => {
              const value = computed[metric.key]
              const formatted = metric.isRatio ? value.toFixed(2) : value.toFixed(0)
              const styles = colorClasses[metric.color]

              return (
                <div key={metric.key} className={cn('rounded-md border p-3', styles.card)}>
                  <div className="mb-1 font-body text-caption font-bold uppercase tracking-widest text-ash-text">
                    {metric.label}
                  </div>
                  <div className={cn('font-display text-[20px] font-bold', styles.value)}>{formatted}</div>
                  <div className="mt-0.5 font-body text-caption text-ash-text">{metric.formula}</div>
                </div>
              )
            })}
          </div>
        </>
      )}

      <div className="mt-8 overflow-hidden rounded-md border border-soft-gray">
        <div className="bg-soft-gray/20 p-3 font-body text-body-sm font-bold text-midnight-ink">
          Quick Reference
        </div>
        <table className="w-full text-left">
          <thead className="bg-soft-gray/10">
            <tr>
              {['Metric', 'Formula', '>1 means', '<1 means'].map((col) => (
                <th
                  key={col}
                  className="px-3 py-2 font-body text-caption font-bold uppercase tracking-widest text-ash-text"
                >
                  {col}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {[
              ['CV', 'EV-AC', 'Under budget', 'Over budget'],
              ['SV', 'EV-PV', 'Ahead of sched', 'Behind sched'],
              ['CPI', 'EV/AC', 'Under budget', 'Over budget'],
              ['SPI', 'EV/PV', 'Ahead of sched', 'Behind sched'],
            ].map((row) => (
              <tr key={row[0]} className="border-t border-soft-gray">
                {row.map((cell) => (
                  <td key={cell} className="px-3 py-2 font-body text-body-sm text-midnight-ink">
                    {cell}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}
