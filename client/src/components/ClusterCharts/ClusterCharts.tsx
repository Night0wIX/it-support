import {
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  Legend,
  Line,
  LineChart,
  ReferenceLine,
  ResponsiveContainer,
  Scatter,
  ScatterChart,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import type { ClusterResult, OptimalKResult } from "../../types";
import s from "./ClusterCharts.module.css";

interface ClusterChartsProps {
  clusterResult: ClusterResult;
  features: string[];
  colors: string[];
  optimalKResult: OptimalKResult | null;
}

const gridStyle = { stroke: "#e2e8f0", strokeDasharray: "4 4" };
const axisStyle = { fontSize: 11, fill: "#94a3b8" };
const labelStyle = { fontSize: 11, fill: "#64748b" };
const tooltipStyle = {
  borderRadius: 10,
  border: "1px solid #e2e8f0",
  boxShadow: "0 4px 12px rgba(0,0,0,0.08)",
  fontSize: 12,
};

export function ClusterCharts({
  clusterResult,
  features,
  colors,
  optimalKResult,
}: ClusterChartsProps) {
  const scatterData: Record<number, { x: number; y: number; name: string }[]> =
    {};
  clusterResult.labeledData.forEach((row) => {
    const cluster = row.cluster as number;
    if (!scatterData[cluster]) scatterData[cluster] = [];
    scatterData[cluster].push({
      x: Number(row[features[0]]) || 0,
      y: Number(row[features[1]]) || 0,
      name: String(row.clusterName),
    });
  });

  const barData = clusterResult.clusterStats.map((stat) => ({
    name: stat.name,
    count: stat.count,
    id: stat.id,
  }));

  return (
    <div className={s.charts}>
      {/* Scatter */}
      <div className={s.charts__item}>
        <h3 className={s.charts__heading}>
          <svg
            width="16"
            height="16"
            viewBox="0 0 24 24"
            fill="none"
            stroke="#6366f1"
            strokeWidth="2"
          >
            <circle cx="12" cy="12" r="3" />
            <circle cx="19" cy="5" r="2" />
            <circle cx="5" cy="19" r="2" />
            <circle cx="19" cy="19" r="2" />
          </svg>
          Розподіл клієнтів
        </h3>
        <ResponsiveContainer width="100%" height={320}>
          <ScatterChart margin={{ top: 10, right: 10, bottom: 30, left: 10 }}>
            <CartesianGrid {...gridStyle} />
            <XAxis
              dataKey="x"
              name={features[0]}
              type="number"
              tick={axisStyle}
              label={{
                value: features[0],
                position: "bottom",
                offset: 20,
                ...labelStyle,
              }}
            />
            <YAxis
              dataKey="y"
              name={features[1]}
              type="number"
              tick={axisStyle}
              label={{
                value: features[1],
                angle: -90,
                position: "insideLeft",
                ...labelStyle,
              }}
            />
            <Tooltip
              contentStyle={tooltipStyle}
              cursor={{ strokeDasharray: "4 4", stroke: "#94a3b8" }}
            />
            <Legend wrapperStyle={{ fontSize: 12 }} />
            {Object.entries(scatterData).map(([id, pts]) => (
              <Scatter
                key={id}
                name={
                  clusterResult.clusterStats[Number(id)]?.name ||
                  `Кластер ${id}`
                }
                data={pts}
                fill={colors[Number(id) % colors.length]}
                opacity={0.75}
              />
            ))}
          </ScatterChart>
        </ResponsiveContainer>
      </div>

      {/* Bar */}
      <div className={s.charts__item}>
        <h3 className={s.charts__heading}>
          <svg
            width="16"
            height="16"
            viewBox="0 0 24 24"
            fill="none"
            stroke="#f59e0b"
            strokeWidth="2"
          >
            <rect x="3" y="12" width="4" height="8" rx="1" />
            <rect x="10" y="8" width="4" height="12" rx="1" />
            <rect x="17" y="4" width="4" height="16" rx="1" />
          </svg>
          Розмір кластерів
        </h3>
        <ResponsiveContainer width="100%" height={320}>
          <BarChart
            data={barData}
            margin={{ top: 10, right: 10, bottom: 60, left: 10 }}
          >
            <CartesianGrid {...gridStyle} vertical={false} />
            <XAxis
              dataKey="name"
              tick={axisStyle}
              angle={-25}
              textAnchor="end"
            />
            <YAxis tick={axisStyle} />
            <Tooltip contentStyle={tooltipStyle} />
            <Bar
              dataKey="count"
              name="Клієнтів"
              radius={[8, 8, 0, 0]}
              animationDuration={800}
            >
              {barData.map((entry) => (
                <Cell key={entry.id} fill={colors[entry.id % colors.length]} />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </div>

      {/* Elbow + Silhouette (optional) */}
      {optimalKResult && (
        <>
          <div className={s.charts__item}>
            <h3 className={s.charts__heading}>
              <svg
                width="16"
                height="16"
                viewBox="0 0 24 24"
                fill="none"
                stroke="#ef4444"
                strokeWidth="2"
              >
                <polyline points="22 12 18 12 15 21 9 3 6 12 2 12" />
              </svg>
              Метод ліктя (Elbow)
            </h3>
            <ResponsiveContainer width="100%" height={320}>
              <LineChart
                data={optimalKResult.results}
                margin={{ top: 10, right: 20, bottom: 20, left: 10 }}
              >
                <CartesianGrid {...gridStyle} />
                <XAxis
                  dataKey="k"
                  tick={axisStyle}
                  label={{ value: "k", position: "bottom", ...labelStyle }}
                />
                <YAxis tick={axisStyle} />
                <Tooltip contentStyle={tooltipStyle} />
                <ReferenceLine
                  x={optimalKResult.bestK}
                  stroke="#6366f1"
                  strokeDasharray="6 4"
                  label={{
                    value: `k=${optimalKResult.bestK}`,
                    position: "top",
                    fill: "#6366f1",
                    fontSize: 11,
                  }}
                />
                <Line
                  type="monotone"
                  dataKey="inertia"
                  stroke="#f59e0b"
                  strokeWidth={2.5}
                  dot={{
                    r: 5,
                    fill: "#fff",
                    stroke: "#f59e0b",
                    strokeWidth: 2,
                  }}
                  activeDot={{ r: 7, stroke: "#f59e0b", strokeWidth: 2 }}
                  name="Inertia"
                  animationDuration={800}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>

          <div className={s.charts__item}>
            <h3 className={s.charts__heading}>
              <svg
                width="16"
                height="16"
                viewBox="0 0 24 24"
                fill="none"
                stroke="#10b981"
                strokeWidth="2"
              >
                <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" />
                <polyline points="22 4 12 14.01 9 11.01" />
              </svg>
              Silhouette Score
            </h3>
            <ResponsiveContainer width="100%" height={320}>
              <LineChart
                data={optimalKResult.results}
                margin={{ top: 10, right: 20, bottom: 20, left: 10 }}
              >
                <CartesianGrid {...gridStyle} />
                <XAxis
                  dataKey="k"
                  tick={axisStyle}
                  label={{ value: "k", position: "bottom", ...labelStyle }}
                />
                <YAxis tick={axisStyle} />
                <Tooltip contentStyle={tooltipStyle} />
                <ReferenceLine
                  x={optimalKResult.bestK}
                  stroke="#6366f1"
                  strokeDasharray="6 4"
                  label={{
                    value: `k=${optimalKResult.bestK}`,
                    position: "top",
                    fill: "#6366f1",
                    fontSize: 11,
                  }}
                />
                <Line
                  type="monotone"
                  dataKey="silhouette"
                  stroke="#10b981"
                  strokeWidth={2.5}
                  dot={{
                    r: 5,
                    fill: "#fff",
                    stroke: "#10b981",
                    strokeWidth: 2,
                  }}
                  activeDot={{ r: 7, stroke: "#10b981", strokeWidth: 2 }}
                  name="Silhouette"
                  animationDuration={800}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </>
      )}
    </div>
  );
}
