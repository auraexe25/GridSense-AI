"use client";

import { useEffect, useState, useCallback } from "react";
import { Sidebar, Header } from "@/components/dashboard";
import { MetricsGrid } from "@/components/dashboard/MetricsGrid";
import { LiveChart } from "@/components/dashboard/LiveChart";
import { DeviceTable } from "@/components/dashboard/DeviceTable";
import { PathwayPanel } from "@/components/dashboard/PathwayPanel";
import {
    apiClient,
    type DeviceTelemetry,
    type GridContext,
    type PathwayAnomaly,
    type PathwayRecommendation,
    type PathwayDeviceStats,
} from "@/lib/api";

interface ChartDataPoint {
    timestamp: number;
    current: number;
}

export default function DashboardPage() {
    const [devices, setDevices] = useState<DeviceTelemetry[]>([]);
    const [gridContext, setGridContext] = useState<GridContext | null>(null);
    const [chartData, setChartData] = useState<ChartDataPoint[]>([]);
    const [systemStatus, setSystemStatus] = useState<
        "normal" | "warning" | "critical"
    >("normal");

    // Pathway state
    const [pathwayActive, setPathwayActive] = useState(false);
    const [pathwayAnomalies, setPathwayAnomalies] = useState<PathwayAnomaly[]>(
        [],
    );
    const [pathwayRecommendations, setPathwayRecommendations] = useState<
        PathwayRecommendation[]
    >([]);
    const [pathwayStatistics, setPathwayStatistics] = useState<{
        [device_type: string]: PathwayDeviceStats;
    }>({});

    // Calculate aggregate metrics
    const totalCurrent = devices.reduce(
        (sum, device) => sum + device.current,
        0,
    );
    const totalPower = devices.reduce((sum, device) => sum + device.power, 0);
    const avgVoltage =
        devices.length > 0
            ? devices.reduce((sum, device) => sum + device.voltage, 0) /
              devices.length
            : 0;
    const estimatedCost = gridContext
        ? (totalPower / 1000) * gridContext.electricity_price
        : 0;

    // Check for critical conditions
    const criticalCurrent = totalCurrent > 100; // Threshold for critical current
    const hasFault = devices.some((device) => device.status === "fault");
    const hasPathwayAnomalies = pathwayAnomalies.length > 0;

    useEffect(() => {
        if (criticalCurrent || hasFault || hasPathwayAnomalies) {
            setSystemStatus("critical");
        } else if (totalCurrent > 80) {
            setSystemStatus("warning");
        } else {
            setSystemStatus("normal");
        }
    }, [criticalCurrent, hasFault, hasPathwayAnomalies, totalCurrent]);

    // Fetch live data from devices
    const fetchLiveData = useCallback(async () => {
        try {
            const data = await apiClient.getLiveData();
            const deviceArray = Object.values(data);
            setDevices(deviceArray);

            // Update chart data (keep last 30 points)
            const now = Date.now();
            const current = deviceArray.reduce(
                (sum, device) => sum + device.current,
                0,
            );

            setChartData((prev) => {
                const newData = [...prev, { timestamp: now, current }];
                return newData.slice(-30); // Keep last 30 data points
            });
        } catch (error) {
            console.error("Failed to fetch live data:", error);
        }
    }, []);

    // Fetch grid context
    const fetchGridContext = useCallback(async () => {
        try {
            const context = await apiClient.getGridContext();
            setGridContext(context);
        } catch (error) {
            console.error("Failed to fetch grid context:", error);
        }
    }, []);

    // Fetch Pathway analytics
    const fetchPathwayData = useCallback(async () => {
        try {
            // Check if Pathway is active
            const status = await apiClient.getPathwayStatus();
            setPathwayActive(status.pathway_active);

            if (status.pathway_active) {
                // Fetch all Pathway data in parallel
                const [anomaliesRes, recommendationsRes, statisticsRes] =
                    await Promise.all([
                        apiClient.getPathwayAnomalies(20),
                        apiClient.getPathwayRecommendations(20),
                        apiClient.getPathwayStatistics(),
                    ]);

                setPathwayAnomalies(anomaliesRes.anomalies);
                setPathwayRecommendations(recommendationsRes.recommendations);
                setPathwayStatistics(statisticsRes.statistics);
            }
        } catch (error) {
            console.error("Failed to fetch Pathway data:", error);
            setPathwayActive(false);
        }
    }, []);

    // Handle device control
    const handleDeviceControl = async (
        deviceId: string,
        action: "on" | "off",
    ) => {
        try {
            if (action === "on") {
                await apiClient.turnDeviceOn(deviceId);
            } else {
                await apiClient.turnDeviceOff(deviceId);
            }
            // Refresh data after control action
            await fetchLiveData();
        } catch (error) {
            console.error(`Failed to ${action} device:`, error);
        }
    };

    // Setup polling for live data (every 1 second)
    useEffect(() => {
        fetchLiveData();
        const interval = setInterval(fetchLiveData, 1000);
        return () => clearInterval(interval);
    }, [fetchLiveData]);

    // Setup polling for grid context (every 15 minutes)
    useEffect(() => {
        fetchGridContext();
        const interval = setInterval(fetchGridContext, 15 * 60 * 1000);
        return () => clearInterval(interval);
    }, [fetchGridContext]);

    // Setup polling for Pathway data (every 5 seconds)
    useEffect(() => {
        fetchPathwayData();
        const interval = setInterval(fetchPathwayData, 5000);
        return () => clearInterval(interval);
    }, [fetchPathwayData]);

    return (
        <div className="min-h-screen">
            {/* <Sidebar /> */}

            <div className="">
                <Header systemStatus={systemStatus} />

                <main className="p-6 space-y-6">
                    {/* KPI Metrics */}
                    <MetricsGrid
                        totalCurrent={totalCurrent}
                        totalPower={totalPower}
                        avgVoltage={avgVoltage}
                        estimatedCost={estimatedCost}
                        criticalCurrent={criticalCurrent}
                        gridContext={gridContext}
                    />

                    <div className="flex flex-row gap-6">
                        {/* Live Chart */}
                        <LiveChart
                            data={chartData}
                            critical={criticalCurrent || hasFault}
                        />
                    </div>
                    <PathwayPanel
                        anomalies={pathwayAnomalies}
                        recommendations={pathwayRecommendations}
                        statistics={pathwayStatistics}
                        isActive={pathwayActive}
                    />
                    <div className="w-full flex flex-row gap-6">
                        <DeviceTable
                            devices={devices}
                            onDeviceControl={handleDeviceControl}
                        />
                    </div>
                </main>
            </div>
        </div>
    );
}
