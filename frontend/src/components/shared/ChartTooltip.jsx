import React from 'react';

/**
 * Shared Tooltip Component for Recharts Bar & Line Charts
 */
export default function ChartTooltip({ active, payload, label, unit = '' }) {
  if (!active || !payload?.length) return null;

  return (
    <div
      style={{
        background: '#ffffff',
        padding: '10px 14px',
        border: '1px solid #e2e8f0',
        borderRadius: 8,
        boxShadow: '0 4px 12px rgba(0, 0, 0, 0.1)',
        minWidth: 120,
      }}
    >
      {label && (
        <p style={{ fontWeight: 700, marginBottom: 6, fontSize: '0.85rem', color: '#0f172a' }}>
          {label}
        </p>
      )}
      {payload.map((p, i) => (
        <div
          key={i}
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: 6,
            fontSize: '0.82rem',
            marginTop: 3,
            color: '#334155',
          }}
        >
          <span
            style={{
              width: 10,
              height: 10,
              borderRadius: '50%',
              background: p.fill || p.color || '#3b82f6',
              display: 'inline-block',
            }}
          />
          <span>{p.name}:</span>{' '}
          <strong style={{ color: '#0f172a' }}>
            {p.value} {unit}
          </strong>
        </div>
      ))}
    </div>
  );
}
