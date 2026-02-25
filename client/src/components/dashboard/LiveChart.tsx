"use client";

import { Card } from "@/components/ui";
import { Heading } from "@/components/typography";
import {
    LineChart,
    Line,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    ResponsiveContainer,
    Area,
    AreaChart,
} from "recharts";

interface DataPoint {
    timestamp: number;
    current: number;
}

interface LiveChartProps {
    data: DataPoint[];
    critical?: boolean;
}

export function LiveChart({ data, critical = false }: LiveChartProps) {
    const formatTime = (timestamp: number) => {
        const date = new Date(timestamp);
        return date.toLocaleTimeString([], {
            hour: "2-digit",
            minute: "2-digit",
            second: "2-digit",
        });
    };

    const lineColor = critical ? "#ef4444" : "#3b82f6";
    const gradientId = critical ? "criticalGradient" : "normalGradient";

    return (
        <Card className="w-full">
            <div className="mb-4">
                <Heading level={3}>Current vs Time</Heading>
                <p className="text-sm text-slate-400 mt-1">
                    Real-time current monitoring
                </p>
            </div>

            <div className="h-80">
                <ResponsiveContainer width="100%" height="100%">
                    <AreaChart
                        data={data}
                        margin={{ top: 5, right: 20, left: 10, bottom: 5 }}
                    >
                        <defs>
                            <linearGradient
                                id={gradientId}
                                x1="0"
                                y1="0"
                                x2="0"
                                y2="1"
                            >
                                <stop
                                    offset="0%"
                                    stopColor={lineColor}
                                    stopOpacity={0.2}
                                />
                                <stop
                                    offset="100%"
                                    stopColor={lineColor}
                                    stopOpacity={0}
                                />
                            </linearGradient>
                        </defs>
                        <CartesianGrid
                            strokeDasharray="3 3"
                            stroke="#334155"
                            opacity={0.3}
                        />
                        <XAxis
                            dataKey="timestamp"
                            stroke="#94a3b8"
                            tickFormatter={formatTime}
                            style={{ fontSize: "12px" }}
                        />
                        <YAxis
                            stroke="#94a3b8"
                            style={{ fontSize: "12px" }}
                            label={{
                                value: "Current (A)",
                                angle: -90,
                                position: "insideLeft",
                                fill: "#94a3b8",
                            }}
                        />
                        <Tooltip
                            contentStyle={{
                                backgroundColor: "#0f172a",
                                border: "1px solid #334155",
                                borderRadius: "8px",
                                color: "#f1f5f9",
                            }}
                            labelFormatter={formatTime}
                            formatter={(value: number) => [
                                `${value.toFixed(2)} A`,
                                "Current",
                            ]}
                        />
                        <Area
                            type="monotone"
                            dataKey="current"
                            stroke={lineColor}
                            strokeWidth={2}
                            fill={`url(#${gradientId})`}
                            animationDuration={300}
                        />
                    </AreaChart>
                </ResponsiveContainer>
            </div>
        </Card>
    );
}
