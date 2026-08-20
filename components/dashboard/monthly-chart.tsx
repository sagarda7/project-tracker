"use client";

import { Line, LineChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";

export function MonthlyChart({ data }: { data: { month: string; count: number }[] }) {
  return (
    <ResponsiveContainer width="100%" height={280}>
      <LineChart data={data} margin={{ top: 8, right: 8, left: -16, bottom: 8 }}>
        <CartesianGrid strokeDasharray="3 3" stroke="#f3f4f6" vertical={false} />
        <XAxis dataKey="month" tick={{ fontSize: 12, fill: "#6b7280" }} axisLine={{ stroke: "#e5e7eb" }} tickLine={false} />
        <YAxis allowDecimals={false} tick={{ fontSize: 12, fill: "#6b7280" }} axisLine={false} tickLine={false} />
        <Tooltip contentStyle={{ borderRadius: 8, borderColor: "#e5e7eb", fontSize: 13 }} />
        <Line
          type="monotone"
          dataKey="count"
          stroke="rgb(0, 148, 218)"
          strokeWidth={2}
          dot={{ r: 3, fill: "rgb(0, 148, 218)" }}
        />
      </LineChart>
    </ResponsiveContainer>
  );
}
