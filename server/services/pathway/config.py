"""
Pathway Configuration

Centralized configuration for Pathway processing pipeline.
"""

import os
from typing import Final


class PathwayConfig:
    """Configuration for Pathway stream processing"""
    
    API_BASE_URL: Final[str] = os.getenv("API_BASE_URL", "http://localhost:8000")
    INTERNAL_STREAM_PATH: Final[str] = "/api/stream/internal"
    EXTERNAL_STREAM_PATH: Final[str] = "/api/stream/external"
    
    GEMINI_API_KEY: Final[str] = os.getenv("GEMINI_API_KEY", "")
    GEMINI_MODEL: Final[str] = "gemini-3-flash-preview"
    
    INTERNAL_POLL_INTERVAL: Final[float] = 0.1  # 10Hz = 100ms
    EXTERNAL_POLL_INTERVAL: Final[float] = 15.0  # 15 seconds (demo mode)
    # EXTERNAL_POLL_INTERVAL: Final[float] = 900.0  # 15 minutes (production)
    
    INTERNAL_AUTOCOMMIT_MS: Final[int] = 100
    EXTERNAL_AUTOCOMMIT_MS: Final[int] = 15000
    
    # Anomaly Detection Thresholds
    HIGH_CURRENT_THRESHOLD: Final[float] = 100.0  # Amperes
    VOLTAGE_MIN_THRESHOLD: Final[float] = 200.0   # Volts
    VOLTAGE_MAX_THRESHOLD: Final[float] = 260.0   # Volts
    
    # Optimization Thresholds
    HIGH_POWER_THRESHOLD: Final[float] = 1000.0  # Watts
    
    # Output Configuration
    OUTPUT_DIR: Final[str] = "pathway_output"
    ANOMALIES_FILE: Final[str] = f"{OUTPUT_DIR}/anomalies.jsonl"
    RECOMMENDATIONS_FILE: Final[str] = f"{OUTPUT_DIR}/recommendations.jsonl"
    DEVICE_STATS_FILE: Final[str] = f"{OUTPUT_DIR}/device_stats.jsonl"
    TOTAL_POWER_FILE: Final[str] = f"{OUTPUT_DIR}/total_power.jsonl"
    
    # HTTP Request Configuration
    REQUEST_TIMEOUT: Final[int] = 2  # seconds
    
    @classmethod
    def get_internal_url(cls) -> str:
        """Get full URL for internal stream endpoint"""
        return f"{cls.API_BASE_URL}{cls.INTERNAL_STREAM_PATH}"
    
    @classmethod
    def get_external_url(cls) -> str:
        """Get full URL for external stream endpoint"""
        return f"{cls.API_BASE_URL}{cls.EXTERNAL_STREAM_PATH}"
