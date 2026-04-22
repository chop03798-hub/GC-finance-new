interface FunnelChartItem {
  label: string
  count: number
  value: number
  color: string
}

interface FunnelChartProps {
  items: FunnelChartItem[]
  fmtSAR: (value: number) => string
}

export default function FunnelChart({ items, fmtSAR }: FunnelChartProps) {
  const max = Math.max(...items.map((item) => item.value), 1)

  return (
    <div className="funnel-chart">
      <div className="section-title">Conversion Funnel</div>
      <div className="funnel-chart-stack">
        {items.map((item, index) => {
          const width = 100 - index * 9
          const alpha = Math.max(item.value / max, 0.18)
          return (
            <div key={item.label} className="funnel-chart-row">
              <svg viewBox="0 0 100 28" preserveAspectRatio="none" className="funnel-chart-shape" aria-hidden="true">
                <polygon
                  points={`${(100 - width) / 2},0 ${100 - (100 - width) / 2},0 ${100 - (100 - width) / 2 - 5},28 ${(100 - width) / 2 + 5},28`}
                  fill={item.color}
                  opacity={alpha}
                />
              </svg>
              <div className="funnel-chart-content">
                <strong>{item.label}</strong>
                <span>{item.count} deals</span>
                <span>{fmtSAR(item.value)}</span>
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}
