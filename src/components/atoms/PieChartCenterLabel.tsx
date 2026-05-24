import * as React from 'react';

interface PieChartCenterLabelProps {
  /** Percentage value to display */
  percentage: number;
  /** Label text to display below percentage */
  label: string;
  /** ViewBox from Recharts Label component */
  viewBox?: {
    cx?: number;
    cy?: number;
  };
}

/**
 * PieChartCenterLabel atom component.
 * Displays centered text in a pie chart (typically used in doughnut charts).
 * Shows a percentage value and a label text below it.
 * Used in DeliveryStatusPieChart.
 */
export default function PieChartCenterLabel({
  percentage,
  label,
  viewBox,
}: PieChartCenterLabelProps): React.JSX.Element | null {
  if (!viewBox || typeof viewBox.cx !== 'number' || typeof viewBox.cy !== 'number') {
    return null;
  }

  const centerY = viewBox.cy || 0;

  return (
    <g>
      <text
        x={viewBox.cx}
        y={centerY - 12}
        textAnchor="middle"
        dominantBaseline="middle"
        className="fill-gray-900"
        style={{ fontSize: '2.25rem', fontWeight: '700', fontFamily: 'inherit' }}
      >
        {percentage}%
      </text>
      <text
        x={viewBox.cx}
        y={centerY + 12}
        textAnchor="middle"
        dominantBaseline="middle"
        className="fill-gray-600"
        style={{ fontSize: '1rem ', fontWeight: '400', fontFamily: 'inherit' }}
      >
        {label}
      </text>
    </g>
  );
}
