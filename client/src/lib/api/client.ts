import type { DeviceTelemetry, GridContext, DeviceListResponse, ControlResponse, PathwayStatus, PathwayAnomaliesResponse, PathwayRecommendationsResponse, PathwayStatisticsResponse, PathwaySummary } from "./types";

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";

class ApiClient {
    private baseUrl: string;

    constructor(baseUrl: string) {
        this.baseUrl = baseUrl;
    }

    private async fetch<T>(endpoint: string, options?: RequestInit): Promise<T> {
        const response = await fetch(`${this.baseUrl}${endpoint}`, {
            ...options,
            headers: {
                "Content-Type": "application/json",
                ...options?.headers,
            },
        });

        if (!response.ok) {
            throw new Error(`API Error: ${response.statusText}`);
        }

        return response.json();
    }

    // Live Data Endpoints
    async getLiveData(): Promise<Record<string, DeviceTelemetry>> {
        return this.fetch<Record<string, DeviceTelemetry>>("/api/live");
    }

    // Device Endpoints
    async listDevices(): Promise<DeviceListResponse> {
        return this.fetch<DeviceListResponse>("/api/devices");
    }

    async getDeviceTelemetry(deviceId: string): Promise<DeviceTelemetry> {
        return this.fetch<DeviceTelemetry>(`/api/devices/${deviceId}`);
    }

    async turnDeviceOn(deviceId: string): Promise<ControlResponse> {
        return this.fetch<ControlResponse>(`/api/devices/${deviceId}/control/on`, {
            method: "POST",
        });
    }

    async turnDeviceOff(deviceId: string): Promise<ControlResponse> {
        return this.fetch<ControlResponse>(`/api/devices/${deviceId}/control/off`, {
            method: "POST",
        });
    }

    async setLightingBrightness(deviceId: string, level: number): Promise<ControlResponse> {
        return this.fetch<ControlResponse>(`/api/devices/${deviceId}/control/brightness?level=${level}`, {
            method: "POST",
        });
    }

    async startMotor(deviceId: string): Promise<ControlResponse> {
        return this.fetch<ControlResponse>(`/api/devices/${deviceId}/control/start`, {
            method: "POST",
        });
    }

    async injectMotorFault(deviceId: string): Promise<ControlResponse> {
        return this.fetch<ControlResponse>(`/api/devices/${deviceId}/control/inject-fault`, {
            method: "POST",
        });
    }

    // Grid Context Endpoints
    async getGridContext(): Promise<GridContext> {
        return this.fetch<GridContext>("/api/grid");
    }

    // Pathway Analytics Endpoints
    async getPathwayStatus(): Promise<PathwayStatus> {
        return this.fetch<PathwayStatus>("/api/pathway/status");
    }

    async getPathwayAnomalies(limit: number = 50): Promise<PathwayAnomaliesResponse> {
        return this.fetch<PathwayAnomaliesResponse>(`/api/pathway/anomalies?limit=${limit}`);
    }

    async getPathwayRecommendations(limit: number = 50): Promise<PathwayRecommendationsResponse> {
        return this.fetch<PathwayRecommendationsResponse>(`/api/pathway/recommendations?limit=${limit}`);
    }

    async getPathwayStatistics(): Promise<PathwayStatisticsResponse> {
        return this.fetch<PathwayStatisticsResponse>("/api/pathway/statistics");
    }

    async getPathwaySummary(): Promise<PathwaySummary> {
        return this.fetch<PathwaySummary>("/api/pathway/summary");
    }
}

export const apiClient = new ApiClient(API_BASE_URL);
