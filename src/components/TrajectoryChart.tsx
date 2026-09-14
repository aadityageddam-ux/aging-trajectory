'use client'

import { useEffect, useState } from 'react'
import {
  CartesianGrid,
  Legend,
  Line,
  LineChart,
  ReferenceLine,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts'
import type { Checkpoint } from '@/lib/simulation/trajectory'

interface Row {
  year: number
  chronological: number
  baseline: number
  edited: number
}

export function TrajectoryChart({
  baseline,
  edited,
  activeYear,
  branchYear,
  onSelectYear,
}: {
  baseline: Checkpoint[]
  edited: Checkpoint[]
  activeYear: number
  branchYear: number | null
  onSelectYear: (year: number) => void
}) {
  const [isMobile, setIsMobile] = useState(false)
  useEffect(() => {
    const update = () => setIsMobile(window.innerWidth < 640)
    update()
    window.addEventListener('resize', update)
    return () => window.removeEventListener('resize', update)
  }, [])

  const rows: Row[] = baseline.map((checkpoint, index) => ({
    year: checkpoint.yearIndex,
    chronological: checkpoint.chronologicalAge,
    baseline: checkpoint.phenotypicAge,
    edited: edited[index]!.phenotypicAge,
  }))
  const values = rows.flatMap((row) => [row.chronological, row.baseline, row.edited])
  const yMin = Math.floor(Math.min(...values) - 2)
  const yMax = Math.ceil(Math.max(...values) + 2)

  return (
    <section className="rounded-2xl border border-zinc-200 bg-white p-4 sm:p-6" aria-labelledby="chart-heading">
      <div className="flex flex-wrap items-baseline justify-between gap-2">
        <h2 id="chart-heading" className="text-sm font-semibold text-zinc-950">Clinical Phenotypic Age sensitivity</h2>
        <p className="text-xs text-zinc-500">Use the year control or select a chart point</p>
      </div>
      <p id="chart-description" className="mt-2 text-xs leading-5 text-zinc-500">Baseline and edited curves overlap until the first applied edit. Chronological age is context for the formula output.</p>
      <div className="mt-4" style={{ height: isMobile ? 310 : 410 }} role="img" aria-describedby="chart-description">
        <ResponsiveContainer width="100%" height="100%">
          <LineChart
            data={rows}
            margin={{ top: 8, right: isMobile ? 6 : 24, bottom: 12, left: isMobile ? -12 : 8 }}
            onClick={(event: { activeLabel?: string | number }) => {
              if (event.activeLabel != null) onSelectYear(Number(event.activeLabel))
            }}
          >
            <CartesianGrid stroke="#E4E4E7" vertical={false} />
            <XAxis dataKey="year" tick={{ fontSize: 11, fill: '#52525B' }} tickLine={false} label={{ value: 'Years from start', position: 'insideBottom', offset: -8, fontSize: 11, fill: '#52525B' }} height={46} />
            <YAxis domain={[yMin, yMax]} tick={{ fontSize: 11, fill: '#52525B' }} tickLine={false} axisLine={false} width={44} />
            <Tooltip formatter={(value, name) => [`${Number(value).toFixed(1)} years`, name]} labelFormatter={(label) => `Year ${label}`} />
            <Legend wrapperStyle={{ fontSize: 12, paddingTop: 8 }} />
            <ReferenceLine x={activeYear} stroke="#A1A1AA" strokeDasharray="2 2" />
            {branchYear != null && <ReferenceLine x={branchYear} stroke="#047857" strokeDasharray="4 3" label={{ value: 'first edit', position: 'insideTopRight', fontSize: 10, fill: '#047857' }} />}
            <Line type="monotone" dataKey="chronological" name="Chronological age" stroke="#52525B" strokeDasharray="5 4" dot={false} isAnimationActive={false} />
            <Line type="monotone" dataKey="baseline" name="Baseline Phenotypic Age" stroke="#4338CA" strokeWidth={2.5} dot={false} isAnimationActive={false} />
            <Line type="monotone" dataKey="edited" name="Edited Phenotypic Age" stroke="#047857" strokeWidth={2.5} dot={{ r: 2 }} activeDot={{ r: 5 }} isAnimationActive={false} />
          </LineChart>
        </ResponsiveContainer>
      </div>

      <details className="mt-4 border-t border-zinc-100 pt-4">
        <summary className="cursor-pointer text-sm font-medium text-zinc-700">View chart data as a table</summary>
        <div className="mt-3 overflow-x-auto">
          <table className="w-full min-w-[560px] border-collapse text-left text-xs">
            <caption className="sr-only">Baseline, edited, and chronological age values by synthetic year</caption>
            <thead><tr className="border-b border-zinc-200 text-zinc-600"><th className="p-2">Year</th><th className="p-2">Chronological</th><th className="p-2">Baseline Phenotypic Age</th><th className="p-2">Edited Phenotypic Age</th><th className="p-2">Edited − baseline</th></tr></thead>
            <tbody>{rows.map((row) => <tr key={row.year} className="border-b border-zinc-100"><td className="p-2 font-mono">{row.year}</td><td className="p-2 font-mono">{row.chronological.toFixed(1)}</td><td className="p-2 font-mono">{row.baseline.toFixed(1)}</td><td className="p-2 font-mono">{row.edited.toFixed(1)}</td><td className="p-2 font-mono">{(row.edited - row.baseline).toFixed(1)}</td></tr>)}</tbody>
          </table>
        </div>
      </details>
    </section>
  )
}
