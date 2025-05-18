"use client"

import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from "recharts"

interface ChartData {
  time: string
  [key: string]: any
}

interface LineConfig {
  key: string
  name: string
  color: string
}

interface ChartComponentProps {
  data: ChartData[]
  type: string
  lines: LineConfig[]
  yDomain?: [number, number]
}

export default function ChartComponent({ data, type, lines, yDomain }: ChartComponentProps) {
  return (
    <ResponsiveContainer width="100%" height="100%">
      <LineChart data={data} margin={{ top: 5, right: 30, left: 20, bottom: 70 }}>
        <CartesianGrid strokeDasharray="3 3" />
        <XAxis dataKey="time" angle={-45} textAnchor="end" height={70} tick={{ fontSize: 12 }} />
        <YAxis domain={yDomain} />
        <Tooltip />
        <Legend />
        {lines.map((line) => (
          <Line
            key={line.key}
            type="monotone"
            dataKey={line.key}
            stroke={line.color}
            name={line.name}
            strokeWidth={2}
            dot={{ r: 1 }}
            activeDot={{ r: 5 }}
          />
        ))}
      </LineChart>
    </ResponsiveContainer>
  )
}
