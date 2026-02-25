"use client";

import { Card, Badge, Button } from "@/components/ui";
import { Heading } from "@/components/typography";
import type { DeviceTelemetry } from "@/lib/api";
import { Power, PowerOff } from "lucide-react";

interface DeviceTableProps {
    devices: DeviceTelemetry[];
    onDeviceControl?: (deviceId: string, action: "on" | "off") => void;
}

export function DeviceTable({ devices, onDeviceControl }: DeviceTableProps) {
    const getStatusVariant = (status: string) => {
        switch (status) {
            case "running":
                return "success";
            case "fault":
                return "critical";
            case "starting":
                return "warning";
            default:
                return "default";
        }
    };

    const formatDeviceType = (type: string) => {
        return type.charAt(0).toUpperCase() + type.slice(1);
    };

    return (
        <Card className="w-full">
            <div className="mb-4">
                <Heading level={3}>Device Status</Heading>
                <p className="text-sm text-slate-400 mt-1">
                    {devices.length} devices connected
                </p>
            </div>

            <div className="overflow-x-auto">
                <table className="w-full">
                    <thead>
                        <tr className="border-b border-slate-800">
                            <th className="text-left text-xs font-medium text-slate-400 uppercase tracking-wider pb-3">
                                Device
                            </th>
                            <th className="text-left text-xs font-medium text-slate-400 uppercase tracking-wider pb-3">
                                Status
                            </th>
                            <th className="text-right text-xs font-medium text-slate-400 uppercase tracking-wider pb-3">
                                Current
                            </th>
                            <th className="text-right text-xs font-medium text-slate-400 uppercase tracking-wider pb-3">
                                Power
                            </th>
                            <th className="text-right text-xs font-medium text-slate-400 uppercase tracking-wider pb-3">
                                Actions
                            </th>
                        </tr>
                    </thead>
                    <tbody>
                        {devices.map((device) => (
                            <tr
                                key={device.device_id}
                                className="border-b border-slate-800/50 last:border-0"
                            >
                                <td className="py-4">
                                    <div>
                                        <div className="text-sm font-medium text-slate-100">
                                            {formatDeviceType(
                                                device.device_type,
                                            )}
                                        </div>
                                        <div className="text-xs text-slate-500 font-mono">
                                            {device.device_id}
                                        </div>
                                    </div>
                                </td>
                                <td className="py-4">
                                    <Badge
                                        variant={getStatusVariant(
                                            device.status,
                                        )}
                                    >
                                        {device.status}
                                    </Badge>
                                </td>
                                <td className="py-4 text-right">
                                    <span className="text-sm font-mono text-slate-100">
                                        {device.current.toFixed(2)} A
                                    </span>
                                </td>
                                <td className="py-4 text-right">
                                    <span className="text-sm font-mono text-slate-100">
                                        {device.power.toFixed(0)} W
                                    </span>
                                </td>
                                <td className="py-4 text-right">
                                    <div className="flex justify-end gap-2">
                                        <Button
                                            size="sm"
                                            variant="secondary"
                                            onClick={() =>
                                                onDeviceControl?.(
                                                    device.device_id,
                                                    "on",
                                                )
                                            }
                                            disabled={
                                                device.status === "running"
                                            }
                                        >
                                            <Power className="w-3 h-3" />
                                        </Button>
                                        <Button
                                            size="sm"
                                            variant="secondary"
                                            onClick={() =>
                                                onDeviceControl?.(
                                                    device.device_id,
                                                    "off",
                                                )
                                            }
                                            disabled={device.status === "off"}
                                        >
                                            <PowerOff className="w-3 h-3" />
                                        </Button>
                                    </div>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </Card>
    );
}
