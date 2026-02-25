"use client";

import { Card } from "@/components/ui";
import { Heading, Body, Label } from "@/components/typography";
import {
    Activity,
    AlertTriangle,
    TrendingUp,
    CheckCircle,
    XCircle,
    Zap,
} from "lucide-react";
import { Badge } from "@/components/ui";
import type {
    PathwayAnomaly,
    PathwayRecommendation,
    PathwayDeviceStats,
} from "@/lib/api";

interface PathwayPanelProps {
    anomalies: PathwayAnomaly[];
    recommendations: PathwayRecommendation[];
    statistics: { [device_type: string]: PathwayDeviceStats };
    isActive: boolean;
}

export function PathwayPanel({
    anomalies = [],
    recommendations = [],
    statistics = {},
    isActive = false,
}: PathwayPanelProps) {
    const recentAnomalies = anomalies.slice(-3).reverse();
    const recentRecommendations = recommendations.slice(-3).reverse();

    const getRecommendationColor = (recommendation: string) => {
        const lower = recommendation.toLowerCase();
        if (
            lower.includes("stopping") ||
            lower.includes("high") ||
            lower.includes("save")
        )
            return "text-amber-400";
        if (lower.includes("deferring") || lower.includes("reducing"))
            return "text-yellow-400";
        if (lower.includes("optimal") || lower.includes("good time"))
            return "text-emerald-400";
        return "text-blue-400";
    };

    const getRecommendationIcon = (recommendation: string) => {
        const lower = recommendation.toLowerCase();
        if (
            lower.includes("stopping") ||
            lower.includes("high") ||
            lower.includes("save")
        )
            return <AlertTriangle className="w-4 h-4 text-amber-400" />;
        if (lower.includes("deferring") || lower.includes("reducing"))
            return <TrendingUp className="w-4 h-4 text-yellow-400" />;
        if (lower.includes("optimal") || lower.includes("good time"))
            return <CheckCircle className="w-4 h-4 text-emerald-400" />;
        return <Activity className="w-4 h-4 text-blue-400" />;
    };

    return (
        <Card className="w-full">
            {/* Header Section */}
            <div className="mb-6 flex items-center justify-between">
                <div className="flex items-center gap-3">
                    <div
                        className={`w-10 h-10 rounded-lg flex items-center justify-center ${isActive ? "bg-purple-500/10" : "bg-gray-500/10"}`}
                    >
                        <Activity
                            className={`w-5 h-5 ${isActive ? "text-purple-500" : "text-gray-500"}`}
                        />
                    </div>
                    <div>
                        <Heading level={3}>Pathway Analytics</Heading>
                        <Body muted className="text-xs">
                            Real-time stream processing
                        </Body>
                    </div>
                </div>
                <Badge variant={isActive ? "success" : "default"}>
                    {isActive ? "Active" : "Inactive"}
                </Badge>
            </div>

            {!isActive ? (
                <div className="p-8 rounded-lg bg-slate-800/50 border border-dashed border-slate-700">
                    <Body className="text-sm text-slate-400 text-center">
                        Pathway pipeline not running. Start the engine to see
                        real-time insights.
                    </Body>
                </div>
            ) : (
                <div className="space-y-6">
                    {/* Row 1: Anomalies & Recommendations */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {/* Anomalies Column */}
                        <div className="space-y-3">
                            <div className="flex items-center gap-2">
                                <AlertTriangle className="w-4 h-4 text-orange-400" />
                                <Label className="text-xs font-semibold uppercase tracking-wider text-slate-400">
                                    Recent Anomalies
                                </Label>
                                {anomalies.length > 0 && (
                                    <Badge
                                        variant="warning"
                                        className="ml-auto"
                                    >
                                        {anomalies.length}
                                    </Badge>
                                )}
                            </div>

                            {recentAnomalies.length === 0 ? (
                                <div className="h-full min-h-[100px] flex items-center justify-center rounded-lg bg-emerald-500/5 border border-emerald-500/10">
                                    <div className="flex items-center gap-2">
                                        <CheckCircle className="w-4 h-4 text-emerald-500/50" />
                                        <Body className="text-xs text-emerald-500/70">
                                            System stable
                                        </Body>
                                    </div>
                                </div>
                            ) : (
                                <div className="space-y-2">
                                    {recentAnomalies.map((anomaly, index) => (
                                        <div
                                            key={index}
                                            className="p-3 rounded-lg bg-red-500/5 border border-red-500/10 hover:bg-red-500/10 transition-colors"
                                        >
                                            <div className="flex items-start justify-between mb-1">
                                                <div className="flex items-center gap-2">
                                                    <XCircle className="w-3 h-3 text-red-400 shrink-0" />
                                                    <Body className="text-xs font-bold text-red-400">
                                                        {anomaly.device_id}
                                                    </Body>
                                                </div>
                                                <Body className="text-xs font-mono text-red-400">
                                                    {anomaly.current.toFixed(1)}
                                                    A
                                                </Body>
                                            </div>
                                            <Body className="text-[11px] text-slate-400 leading-tight">
                                                {anomaly.alert}
                                            </Body>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>

                        {/* Recommendations Column */}
                        <div className="space-y-3">
                            <div className="flex items-center gap-2">
                                <Zap className="w-4 h-4 text-blue-400" />
                                <Label className="text-xs font-semibold uppercase tracking-wider text-slate-400">
                                    Optimization Tips
                                </Label>
                            </div>

                            {recentRecommendations.length === 0 ? (
                                <div className="h-full min-h-[100px] flex items-center justify-center rounded-lg bg-slate-800/30 border border-slate-700/50">
                                    <Body className="text-xs text-slate-500">
                                        Calculating optimizations...
                                    </Body>
                                </div>
                            ) : (
                                <div className="space-y-2">
                                    {recentRecommendations.map((rec, index) => (
                                        <div
                                            key={index}
                                            className="p-3 rounded-lg bg-slate-800/40 border border-slate-700 hover:border-slate-600 transition-colors"
                                        >
                                            <div className="flex items-start gap-2 mb-2">
                                                {getRecommendationIcon(
                                                    rec.recommendation,
                                                )}
                                                <Body
                                                    className={`text-xs flex-1 font-medium leading-relaxed ${getRecommendationColor(rec.recommendation)}`}
                                                >
                                                    {rec.recommendation}
                                                </Body>
                                            </div>
                                            <div className="flex items-center justify-between text-[10px] ml-6">
                                                <Body
                                                    muted
                                                    className="uppercase tracking-wide"
                                                >
                                                    {rec.power.toFixed(0)}W •{" "}
                                                    {rec.current.toFixed(1)}A
                                                </Body>
                                                <div className="flex items-center gap-2">
                                                    <Body muted>
                                                        $
                                                        {rec.cost_per_hour.toFixed(
                                                            3,
                                                        )}
                                                        /hr
                                                    </Body>
                                                    {rec.pricing_tier && (
                                                        <Badge
                                                            className="text-[9px] h-4"
                                                            variant={
                                                                rec.pricing_tier ===
                                                                "HIGH"
                                                                    ? "critical"
                                                                    : rec.pricing_tier ===
                                                                        "LOW"
                                                                      ? "success"
                                                                      : "default"
                                                            }
                                                        >
                                                            {rec.pricing_tier}
                                                        </Badge>
                                                    )}
                                                </div>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Row 2: Statistics (Horizontal Grid) */}
                    {Object.keys(statistics).length > 0 && (
                        <div className="pt-4 border-t border-slate-800">
                            <div className="flex items-center gap-2 mb-3">
                                <TrendingUp className="w-4 h-4 text-emerald-400" />
                                <Label className="text-xs font-semibold uppercase tracking-wider text-slate-400">
                                    Device Performance
                                </Label>
                            </div>
                            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                                {Object.entries(statistics).map(
                                    ([deviceType, stats]) => (
                                        <div
                                            key={deviceType}
                                            className="p-3 rounded-lg bg-slate-900/50 border border-slate-800"
                                        >
                                            <div className="flex justify-between items-center mb-3">
                                                <Body className="text-xs font-bold capitalize text-slate-200">
                                                    {deviceType}
                                                </Body>
                                                <Body className="text-[10px] bg-slate-800 px-1.5 py-0.5 rounded text-slate-400">
                                                    {stats.total_samples}{" "}
                                                    samples
                                                </Body>
                                            </div>
                                            <div className="grid grid-cols-3 border-t border-slate-800/50 pt-2">
                                                <div className="text-center">
                                                    <Body
                                                        muted
                                                        className="text-[10px]"
                                                    >
                                                        AVG
                                                    </Body>
                                                    <Body className="text-xs font-mono">
                                                        {stats.avg_current.toFixed(
                                                            1,
                                                        )}
                                                        A
                                                    </Body>
                                                </div>
                                                <div className="text-center border-x border-slate-800/50">
                                                    <Body
                                                        muted
                                                        className="text-[10px]"
                                                    >
                                                        MAX
                                                    </Body>
                                                    <Body className="text-xs font-mono">
                                                        {stats.max_current.toFixed(
                                                            1,
                                                        )}
                                                        A
                                                    </Body>
                                                </div>
                                                <div className="text-center">
                                                    <Body
                                                        muted
                                                        className="text-[10px]"
                                                    >
                                                        POWER
                                                    </Body>
                                                    <Body className="text-xs font-mono">
                                                        {(
                                                            stats.avg_power /
                                                            1000
                                                        ).toFixed(1)}
                                                        kW
                                                    </Body>
                                                </div>
                                            </div>
                                        </div>
                                    ),
                                )}
                            </div>
                        </div>
                    )}
                </div>
            )}

            {/* Footer */}
            <div className="mt-6 pt-4 border-t border-slate-800 flex justify-center">
                <Body muted className="text-[10px] flex items-center gap-2">
                    <span
                        className={`w-1.5 h-1.5 rounded-full ${isActive ? "bg-emerald-500 animate-pulse" : "bg-slate-600"}`}
                    />
                    {isActive
                        ? `Pathway Engine Active • Monitoring ${anomalies.length} events`
                        : "Engine Standby"}
                </Body>
            </div>
        </Card>
    );
}
