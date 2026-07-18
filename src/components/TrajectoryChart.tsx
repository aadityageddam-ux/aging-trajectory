'use client'

import { motion } from 'framer-motion'
import { useEffect, useState } from 'react'
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ReferenceArea,
  ReferenceLine,
  ResponsiveContainer,
} from 'recharts'
import type { Checkpoint } from '@/lib/simulation/trajectory'
import type { DivergenceAnnotation } from '@/lib/simulation/divergence'
import { PROXY_LABEL } from '@/lib/simulation/grimage-proxy'

const COLORS = {
  chrono: '#71717A',
  pheno: '#16A34A',
  proxy: '#6366F1',
  diverge: '#FEF3C7',
  divergeLine: '#D97706',
  branch: '#0EA5E9',
}

interface Props {
  checkpoints: Checkpoint[]
  annotation: DivergenceAnnotation | null
  activeYear: number
  branchYear: number | null
  onSelectYear: (year: number) => void
}

interface Row {
  year: number
  chrono: number
  pheno: number
  proxy: number
}

interface TooltipEntry {
  payload: Row
}

function CustomTooltip({
  active,
  payload,
  label,
}: {
  active?: boolean
  payload?: TooltipEntry[]
  label?: number
}) {
  if (!active || !payload?.length) return null
  const d = payload[0]!.payload
  return (
    <div className="max-w-[240px] space-y-1.5 rounded-lg border border-[#E4E4E7] bg-white px-4 py-3 text-xs shadow-lg">
      <p className="font-semibold text-[#18181B]">Year {label}</p>
      <p className="flex items-center justify-between gap-4 font-mono">
        <span className="text-[#71717A]">Chronological</span>
        <span className="text-[#18181B]">{d.chrono.toFixed(1)}</span>
      </p>
      <p className="flex items-center justify-between gap-4 font-mono">
        <span style={{ color: COLORS.pheno }}>PhenoAge</span>
        <span className="text-[#18181B]">{d.pheno.toFixed(1)}</span>
      </p>
      <p className="flex items-center justify-between gap-4 font-mono">
        <span style={{ color: COLORS.proxy }}>{PROXY_LABEL}</span>
        <span className="text-[#18181B]">{d.proxy.toFixed(1)}</span>
      </p>
    </div>
  )
}

export function TrajectoryChart({
  checkpoints,
  annotation,
  activeYear,
  branchYear,
  onSelectYear,
}: Props) {
  const [isMobile, setIsMobile] = useState(false)
  useEffect(() => {
    const check = () => setIsMobile(window.innerWidth < 640)
    check()
    window.addEventListener('resize', check)
    return () => window.removeEventListener('resize', check)
  }, [])

  const data: Row[] = checkpoints.map((c) => ({
    year: c.yearIndex,
    chrono: c.chronologicalAge,
    pheno: c.phenoAge,
    proxy: c.grimProxyAge,
  }))

  const allVals = data.flatMap((d) => [d.chrono, d.pheno, d.proxy])
  const yMin = Math.floor(Math.min(...allVals) - 2)
  const yMax = Math.ceil(Math.max(...allVals) + 2)

  return (
    <motion.section
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, ease: 'easeOut' }}
      className="rounded-xl border border-[#E4E4E7] bg-white p-4 sm:p-6"
    >
      <div className="mb-4 flex flex-wrap items-baseline justify-between gap-2">
        <h2 className="text-sm font-semibold text-[#18181B]">
          Two clocks over time
        </h2>
        <p className="text-xs text-[#71717A]">Click the chart to inspect a year</p>
      </div>

      <div style={{ height: isMobile ? 300 : 400 }}>
        <ResponsiveContainer width="100%" height="100%">
          <LineChart
            data={data}
            margin={{ top: 8, right: isMobile ? 8 : 24, bottom: 8, left: isMobile ? -8 : 8 }}
            onClick={(e: { activeLabel?: string | number }) => {
              if (e && e.activeLabel != null) onSelectYear(Number(e.activeLabel))
            }}
          >
            <CartesianGrid stroke="#F1F1F3" vertical={false} />

            {annotation && (
              <ReferenceArea
                x1={annotation.bandStart}
                x2={annotation.bandEnd}
                fill={COLORS.diverge}
                fillOpacity={0.7}
                stroke="none"
                ifOverflow="extendDomain"
              />
            )}

            <ReferenceLine
              x={activeYear}
              stroke="#A1A1AA"
              strokeWidth={1}
              strokeDasharray="2 2"
            />

            {branchYear != null && (
              <ReferenceLine
                x={branchYear}
                stroke={COLORS.branch}
                strokeWidth={1.5}
                strokeDasharray="4 3"
                label={{ value: 'branch', position: 'insideTopRight', fontSize: 10, fill: COLORS.branch }}
              />
            )}

            <XAxis
              dataKey="year"
              tick={{ fontSize: 11, fill: '#71717A' }}
              axisLine={{ stroke: '#E4E4E7' }}
              tickLine={false}
              label={{ value: 'Years from start', position: 'insideBottom', offset: -4, fontSize: 11, fill: '#71717A' }}
              height={40}
            />
            <YAxis
              domain={[yMin, yMax]}
              tick={{ fontSize: 11, fill: '#71717A' }}
              axisLine={false}
              tickLine={false}
              width={44}
              label={
                isMobile
                  ? undefined
                  : { value: 'Age (years)', angle: -90, position: 'insideLeft', fontSize: 11, fill: '#71717A' }
              }
            />
            <Tooltip content={<CustomTooltip />} />
            <Legend
              wrapperStyle={{ fontSize: 12, paddingTop: 8 }}
              iconType="plainline"
            />

            <Line
              type="monotone"
              dataKey="chrono"
              name="Chronological age"
              stroke={COLORS.chrono}
              strokeWidth={1.5}
              strokeDasharray="5 4"
              dot={false}
              isAnimationActive
              animationDuration={500}
            />
            <Line
              type="monotone"
              dataKey="pheno"
              name="PhenoAge"
              stroke={COLORS.pheno}
              strokeWidth={2.5}
              dot={false}
              isAnimationActive
              animationDuration={500}
            />
            <Line
              type="monotone"
              dataKey="proxy"
              name={PROXY_LABEL}
              stroke={COLORS.proxy}
              strokeWidth={2.5}
              dot={false}
              isAnimationActive
              animationDuration={500}
            />
          </LineChart>
        </ResponsiveContainer>
      </div>

      {annotation && (
        <div className="mt-4 rounded-lg border border-[#FDE68A] bg-[#FFFBEB] px-4 py-3">
          <p className="mb-1 text-xs font-semibold text-[#B45309]">
            Divergence · years {annotation.bandStart}–{annotation.bandEnd} (peak ~{annotation.peakGap} yr)
          </p>
          <p className="text-xs leading-relaxed text-[#78350F]">{annotation.note}</p>
        </div>
      )}
    </motion.section>
  )
}
