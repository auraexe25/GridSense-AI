"""
Pathway Real-Time Stream Processing Service

This module provides real-time analytics for GridSense using Pathway.

Main components:
- processor: Main Pathway pipeline for anomaly detection and optimization
- config: Configuration and constants
- utils: Helper functions for stream processing
"""

from .processor import PathwayProcessor
from .config import PathwayConfig

__all__ = ["PathwayProcessor", "PathwayConfig"]
