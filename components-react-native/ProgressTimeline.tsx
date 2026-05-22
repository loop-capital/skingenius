import React from 'react';
import { View, Text, Dimensions, ScrollView } from 'react-native';
import Svg, {
  Path,
  Circle,
  Defs,
  LinearGradient,
  Stop,
  G,
  Line,
} from 'react-native-svg';

interface DataPoint {
  date: string;   // ISO 8601 or display string, e.g. "Jan 15"
  score: number;  // 0–100
}

interface ProgressTimelineProps {
  data: DataPoint[];
  width?: number;
  height?: number;
  padding?: number; // Internal padding inside SVG
}

/**
 * ProgressTimeline — Line chart showing skin score over time
 *
 * Renders an SVG area chart with:
 *   • Smooth bezier curve through data points
 *   • Gradient fill under the curve
 *   • Interactive dot markers (could be extended with Tooltip)
 *   • Y-axis gridlines at 25 / 50 / 75
 *
 * Assumes data is sorted ascending by date.
 */
export const ProgressTimeline: React.FC<ProgressTimelineProps> = ({
  data,
  width = Dimensions.get('window').width - 32,
  height = 220,
  padding = 20,
}) => {
  if (data.length === 0) return null;

  const innerW = width - padding * 2;
  const innerH = height - padding * 2;

  // Scale helpers
  const xScale = (index: number) =>
    padding + (index / (data.length - 1)) * innerW;
  const yScale = (score: number) =>
    padding + innerH - (score / 100) * innerH;

  // Build path commands
  const points = data.map((d, i) => ({
    x: xScale(i),
    y: yScale(d.score),
    score: d.score,
    date: d.date,
  }));

  // Catmull-Rom or simple bezier smoothing — we use simple L for 2 points,
  // cubic bezier for 3+ points.
  const linePath = () => {
    if (points.length === 1) return `M ${points[0].x} ${points[0].y}`;
    if (points.length === 2) {
      return `M ${points[0].x} ${points[0].y} L ${points[1].x} ${points[1].y}`;
    }

    let d = `M ${points[0].x} ${points[0].y}`;
    for (let i = 0; i < points.length - 1; i++) {
      const p0 = points[i === 0 ? i : i - 1];
      const p1 = points[i];
      const p2 = points[i + 1];
      const p3 = points[i + 2] || p2;

      const cp1x = p1.x + (p2.x - p0.x) / 6;
      const cp1y = p1.y + (p2.y - p0.y) / 6;
      const cp2x = p2.x - (p3.x - p1.x) / 6;
      const cp2y = p2.y - (p3.y - p1.y) / 6;

      d += ` C ${cp1x} ${cp1y}, ${cp2x} ${cp2y}, ${p2.x} ${p2.y}`;
    }
    return d;
  };

  const areaPath = `${linePath()} L ${points[points.length - 1].x} ${height} L ${points[0].x} ${height} Z`;

  const gridY = [25, 50, 75].map((val) => ({
    y: yScale(val),
    label: val,
  }));

  return (
    <View className="bg-white rounded-2xl p-4 shadow-sm mx-4 mb-4">
      <Text className="text-lg font-bold text-slate-900 mb-1">
        Progress Timeline
      </Text>
      <Text className="text-sm text-slate-500 mb-4">
        Skin score over the last {data.length} check-ins
      </Text>

      <ScrollView horizontal showsHorizontalScrollIndicator={false}>
        <View>
          <Svg width={width} height={height}>
            <Defs>
              <LinearGradient id="areaGradient" x1="0" y1="0" x2="0" y2="1">
                <Stop offset="0%" stopColor="#10b981" stopOpacity={0.3} />
                <Stop offset="100%" stopColor="#10b981" stopOpacity={0.0} />
              </LinearGradient>
            </Defs>

            {/* Grid lines */}
            {gridY.map((g) => (
              <G key={g.label}>
                <Line
                  x1={padding}
                  y1={g.y}
                  x2={width - padding}
                  y2={g.y}
                  stroke="#e2e8f0"
                  strokeWidth={1}
                  strokeDasharray="4 4"
                />
                <Text
                  x={padding - 8}
                  y={g.y + 4}
                  textAnchor="end"
                  fontSize={10}
                  fill="#94a3b8"
                >
                  {g.label}
                </Text>
              </G>
            ))}

            {/* Area fill */}
            <Path d={areaPath} fill="url(#areaGradient)" />

            {/* Stroke line */}
            <Path
              d={linePath()}
              fill="none"
              stroke="#10b981"
              strokeWidth={3}
              strokeLinecap="round"
              strokeLinejoin="round"
            />

            {/* Data dots */}
            {points.map((p, i) => (
              <G key={i}>
                <Circle cx={p.x} cy={p.y} r={5} fill="#fff" stroke="#10b981" strokeWidth={2} />
                {/* Tooltip-style date label above every 3rd point to avoid clutter */}
                {i % Math.ceil(points.length / 5) === 0 && (
                  <Text
                    x={p.x}
                    y={p.y - 12}
                    textAnchor="middle"
                    fontSize={10}
                    fill="#64748b"
                  >
                    {p.date}
                  </Text>
                )}
              </G>
            ))}
          </Svg>
        </View>
      </ScrollView>

      {/* Legend / mini summary */}
      <View className="flex-row justify-between mt-3 px-2">
        <View className="items-center">
          <Text className="text-xs text-slate-400">First</Text>
          <Text className="text-sm font-semibold text-slate-700">{data[0].score}</Text>
        </View>
        <View className="items-center">
          <Text className="text-xs text-slate-400">Latest</Text>
          <Text className="text-sm font-semibold text-emerald-600">
            {data[data.length - 1].score}
          </Text>
        </View>
        <View className="items-center">
          <Text className="text-xs text-slate-400">Change</Text>
          <Text
            className={`text-sm font-semibold ${
              data[data.length - 1].score - data[0].score >= 0
                ? 'text-emerald-600'
                : 'text-rose-500'
            }`}
          >
            {data[data.length - 1].score - data[0].score > 0 ? '+' : ''}
            {data[data.length - 1].score - data[0].score}
          </Text>
        </View>
      </View>
    </View>
  );
};

/* ------------------------------------------------------------------ */
// Mock data
export const mockTimelineData: DataPoint[] = [
  { date: 'Jan 1', score: 52 },
  { date: 'Jan 8', score: 58 },
  { date: 'Jan 15', score: 61 },
  { date: 'Jan 22', score: 67 },
  { date: 'Jan 29', score: 72 },
  { date: 'Feb 5', score: 76 },
  { date: 'Feb 12', score: 81 },
  { date: 'Feb 19', score: 84 },
  { date: 'Feb 26', score: 89 },
  { date: 'Mar 5', score: 92 },
];

export const ProgressTimelineMock: React.FC = () => (
  <ProgressTimeline data={mockTimelineData} />
);
