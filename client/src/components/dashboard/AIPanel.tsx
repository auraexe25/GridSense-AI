"use client";

import { Card } from "@/components/ui";
import { Heading, Body } from "@/components/typography";
import { Bot, AlertTriangle, CheckCircle, Info } from "lucide-react";
import type { GridContext } from "@/lib/api";

interface AIPanelProps {
    critical?: boolean;
    insights?: string[];
    gridContext?: GridContext | null;
    totalCurrent?: number;
}

export function AIPanel({
    critical = false,
    insights = [],
    gridContext = null,
    totalCurrent = 0,
}: AIPanelProps) {
    const defaultInsights = [
        "All systems operating within normal parameters",
        "Power consumption is optimal",
        "No anomalies detected in the last hour",
    ];

    const criticalInsights = [
        "Critical current threshold exceeded",
        "Immediate attention required for fault condition",
        "Consider reducing load or shutting down non-essential devices",
    ];

    const contextInsights: string[] = [];

    if (gridContext) {
        if (gridContext.pricing_tier === "HIGH") {
            contextInsights.push(
                `Peak pricing period ($${gridContext.electricity_price.toFixed(3)}/kWh). Running at ${Math.round(totalCurrent)}A costs ~$${(((totalCurrent * 230) / 1000) * gridContext.electricity_price).toFixed(2)}/hr.`,
            );
        } else if (gridContext.carbon_level === "HIGH") {
            contextInsights.push(
                `High carbon intensity (${Math.round(gridContext.carbon_intensity)} gCO2/kWh). Consider deferring non-critical loads.`,
            );
        } else if (
            gridContext.pricing_tier === "LOW" &&
            gridContext.carbon_level === "LOW"
        ) {
            contextInsights.push(
                `Optimal conditions: Low pricing and ${gridContext.grid_renewable_percentage.toFixed(0)}% renewable energy.`,
            );
        }

        if (gridContext.grid_renewable_percentage > 70) {
            contextInsights.push(
                `Grid is ${gridContext.grid_renewable_percentage.toFixed(0)}% renewable. Clean energy period.`,
            );
        }
    }

    const displayInsights =
        insights.length > 0
            ? insights
            : critical
              ? criticalInsights
              : [...contextInsights, ...defaultInsights].slice(0, 3);

    return (
        <Card
            className={`${critical ? "border-l-4 border-red-500" : ""} w-1/4`}
        >
            <div className="mb-4 flex items-center gap-3 w-full">
                <div
                    className={`w-10 h-10 rounded-lg flex items-center justify-center ${
                        critical ? "bg-red-500/10" : "bg-blue-500/10"
                    }`}
                >
                    <Bot
                        className={`w-5 h-5 ${critical ? "text-red-500" : "text-blue-500"}`}
                    />
                </div>
                <Heading level={3}>AI Insights</Heading>
            </div>

            <div className="space-y-3">
                {displayInsights.map((insight, index) => {
                    const isHighPriority =
                        insight.toLowerCase().includes("stopping") ||
                        insight.toLowerCase().includes("save") ||
                        insight.toLowerCase().includes("high");
                    const isOptimal =
                        insight.toLowerCase().includes("optimal") ||
                        insight.toLowerCase().includes("good time");

                    return (
                        <div
                            key={index}
                            className="flex items-start gap-3 p-3 rounded-lg bg-slate-800/50"
                        >
                            {critical ? (
                                <AlertTriangle className="w-4 h-4 text-red-500 mt-0.5 shrink-0" />
                            ) : isHighPriority ? (
                                <Info className="w-4 h-4 text-amber-500 mt-0.5 shrink-0" />
                            ) : isOptimal ? (
                                <CheckCircle className="w-4 h-4 text-emerald-500 mt-0.5 shrink-0" />
                            ) : (
                                <CheckCircle className="w-4 h-4 text-blue-500 mt-0.5 shrink-0" />
                            )}
                            <Body className="text-xs flex-1">{insight}</Body>
                        </div>
                    );
                })}
            </div>

            <div className="mt-4 pt-4 border-t border-slate-800">
                <Body muted className="text-xs text-center">
                    AI Analysis • Updated in real-time
                </Body>
            </div>
        </Card>
    );
}
