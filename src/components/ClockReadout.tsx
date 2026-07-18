'use client'

import type { Checkpoint } from '@/lib/simulation/trajectory'
import { PROXY_LABEL } from '@/lib/simulation/grimage-proxy'

function accelText(age: number, clockAge: number) {
  const d = Math.round((clockAge - age) * 10) / 10
  if (d > 0) return { text: `+${d.toFixed(1)} yr older`, color: '#DC2626' }
  if (d < 0) return { text: `${d.toFixed(1)} yr younger`, color: '#16A34A' }
  return { text: 'on par', color: '#71717A' }
}

export function ClockReadout({ checkpoint }: { checkpoint: Checkpoint }) {
  const { chronologicalAge, phenoAge, grimProxyAge, grim } = checkpoint
  const phenoAccel = accelText(chronologicalAge, phenoAge)
  const grimAccel = accelText(chronologicalAge, grimProxyAge)

  return (
    <div className="rounded-xl border border-[#E4E4E7] bg-white p-4 sm:p-6">
      <h2 className="mb-4 text-sm font-semibold text-[#18181B]">
        At year {checkpoint.yearIndex}
      </h2>

      <div className="grid grid-cols-3 gap-3">
        <Metric label="Chronological" value={chronologicalAge} color="#71717A" />
        <Metric label="PhenoAge" value={phenoAge} color="#16A34A" sub={phenoAccel} />
        <Metric label={PROXY_LABEL} value={grimProxyAge} color="#6366F1" sub={grimAccel} />
      </div>

      <div className="mt-4 border-t border-[#F1F1F3] pt-3">
        <p className="mb-1.5 text-[0.7rem] font-medium tracking-wide text-[#A1A1AA] uppercase">
          Proxy breakdown (years added)
        </p>
        <div className="flex flex-wrap gap-x-4 gap-y-1 font-mono text-xs text-[#71717A]">
          <span>smoking {fmt(grim.terms.smoking)}</span>
          <span>inflammation {fmt(grim.terms.inflammation)}</span>
          <span>sex {fmt(grim.terms.sex)}</span>
        </div>
      </div>
    </div>
  )
}

function fmt(n: number) {
  return `${n >= 0 ? '+' : ''}${n.toFixed(1)}`
}

function Metric({
  label,
  value,
  color,
  sub,
}: {
  label: string
  value: number
  color: string
  sub?: { text: string; color: string }
}) {
  return (
    <div>
      <p className="mb-1 text-[0.7rem] leading-tight text-[#71717A]">{label}</p>
      <p className="font-serif text-3xl leading-none italic" style={{ color }}>
        {value.toFixed(1)}
      </p>
      {sub && (
        <p className="mt-1 text-[0.7rem]" style={{ color: sub.color }}>
          {sub.text}
        </p>
      )}
    </div>
  )
}
