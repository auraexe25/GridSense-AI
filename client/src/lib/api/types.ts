export interface DeviceTelemetry {
    device_id: string;
    device_type: "motor" | "hvac" | "compressor" | "lighting";
    status: "off" | "starting" | "running" | "fault";
    voltage: number;
    current: number;
    power: number;
    timestamp: number;
}

export interface GridContext {
    carbon_intensity: number;
    carbon_level: string;
    electricity_price: number;
    pricing_tier: string;
    grid_renewable_percentage: number;
    renewable_percentage: number;
    timestamp: number;
    last_updated: number;
}

export interface DeviceListItem {
    device_id: string;
    device_type: string;
    status: string;
}

export interface DeviceListResponse {
    device_count: number;
    devices: DeviceListItem[];
}

export interface ControlResponse {
    status: string;
    message: string;
    device_status?: string;
}

// Pathway Analytics Types
export interface PathwayAnomaly {
    device_id: string;
    device_type: string;
    current: number;
    power: number;
    status: string;
    alert: string;
    timestamp: number;
    diff?: number;
}

export interface PathwayRecommendation {
    device_id: string;
    device_type: string;
    current: number;
    power: number;
    carbon_level: string;
    pricing_tier: string;
    renewable_pct: number;
    recommendation: string;
    cost_per_hour: number;
    carbon_per_hour?: number;
    timestamp: number;
    diff?: number;
}

export interface PathwayDeviceStats {
    device_type: string;
    avg_current: number;
    max_current: number;
    avg_power: number;
    total_samples: number;
    diff?: number;
}

export interface PathwayStatus {
    pathway_active: boolean;
    output_directory: string;
    files: {
        [filename: string]: {
            exists: boolean;
            size_bytes?: number;
            last_modified?: number;
            line_count?: number;
        };
    };
    message: string;
}

export interface PathwayAnomaliesResponse {
    count: number;
    anomalies: PathwayAnomaly[];
}

export interface PathwayRecommendationsResponse {
    count: number;
    recommendations: PathwayRecommendation[];
}

export interface PathwayStatisticsResponse {
    device_types: string[];
    statistics: {
        [device_type: string]: PathwayDeviceStats;
    };
}

export interface PathwaySummary {
    anomalies: {
        recent_count: number;
        latest: PathwayAnomaly[];
    };
    statistics: {
        [device_type: string]: PathwayDeviceStats;
    };
    recommendations: {
        latest: PathwayRecommendation[];
    };
    status: PathwayStatus;
}
