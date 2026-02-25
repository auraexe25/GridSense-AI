"""
Pathway Stream Processor for GridSense

Main Pathway pipeline for real-time stream processing, anomaly detection,
and optimization recommendations.
"""

import pathway as pw
import os
from .config import PathwayConfig
from .utils import (
    internal_stream_generator,
    external_stream_generator,
    get_anomaly_alert,
    get_recommendation,
    generate_llm_recommendation
)


class DeviceConnector(pw.io.python.ConnectorSubject):
    """Connector for device telemetry stream"""
    
    def __init__(self):
        super().__init__()
        self.generator = internal_stream_generator()
    
    def run(self):
        for data in self.generator:
            self.next(**data)


class GridConnector(pw.io.python.ConnectorSubject):
    """Connector for grid context stream"""
    
    def __init__(self):
        super().__init__()
        self.generator = external_stream_generator()
    
    def run(self):
        for data in self.generator:
            self.next(**data)


class PathwayProcessor:
    """
    Main Pathway processor for GridSense analytics
    
    Processes two data streams:
    1. Internal Stream (10Hz): Device telemetry
    2. External Stream (15min): Grid context
    
    Provides:
    - Real-time anomaly detection
    - Optimization recommendations
    - Device statistics
    - Power consumption aggregations
    """
    
    def __init__(self):
        self.config = PathwayConfig()
        self._ensure_output_directory()
    
    def _ensure_output_directory(self):
        os.makedirs(self.config.OUTPUT_DIR, exist_ok=True)
    
    def _create_streams(self):
        """
        Create input data streams
        
        Returns:
            Tuple of (device_stream, grid_stream)
        """
        class DeviceSchema(pw.Schema):
            device_id: str
            device_type: str
            status: str
            voltage: float
            current: float
            power: float
            timestamp: float
        
        class GridSchema(pw.Schema):
            carbon_intensity: float
            carbon_level: str
            electricity_price: float
            pricing_tier: str
            renewable_pct: float
            timestamp: float
        
        device_stream = pw.io.python.read(
            DeviceConnector(),
            schema=DeviceSchema,
            autocommit_duration_ms=self.config.INTERNAL_AUTOCOMMIT_MS
        )
        
        grid_stream = pw.io.python.read(
            GridConnector(),
            schema=GridSchema,
            autocommit_duration_ms=self.config.EXTERNAL_AUTOCOMMIT_MS
        )
        
        return device_stream, grid_stream
    
    def _detect_anomalies(self, device_stream):
        """
        Detect anomalies in device stream
        
        Args:
            device_stream: Input device telemetry stream
            
        Returns:
            Stream of detected anomalies
        """
        anomalies = device_stream.filter(
            pw.this.current > self.config.HIGH_CURRENT_THRESHOLD
        ).select(
            device_id=pw.this.device_id,
            device_type=pw.this.device_type,
            current=pw.this.current,
            power=pw.this.power,
            status=pw.this.status,
            alert=pw.apply(
                get_anomaly_alert,
                pw.this.current,
                pw.this.status
            ),
            timestamp=pw.this.timestamp
        )
        
        return anomalies
    
    def _compute_statistics(self, device_stream):
        """
        Compute aggregated device statistics
        
        Args:
            device_stream: Input device telemetry stream
            
        Returns:
            Stream of device statistics grouped by type
        """
        device_stats = device_stream.groupby(pw.this.device_type).reduce(
            device_type=pw.this.device_type,
            avg_current=pw.reducers.avg(pw.this.current),
            max_current=pw.reducers.max(pw.this.current),
            avg_power=pw.reducers.avg(pw.this.power),
            total_samples=pw.reducers.count()
        )
        
        return device_stats
    
    def _generate_recommendations(self, device_stream, grid_stream):
        """
        Generate optimization recommendations by joining streams
        
        Args:
            device_stream: Input device telemetry stream
            grid_stream: Input grid context stream
            
        Returns:
            Stream of optimization recommendations
        """
        # Join streams using asof_join (temporal join)
        joined = device_stream.asof_join(
            grid_stream,
            device_stream.timestamp,
            grid_stream.timestamp,
            how=pw.JoinMode.LEFT,
            direction=pw.temporal.Direction.BACKWARD
        )
        
        combined = joined.select(
            device_id=device_stream.device_id,
            device_type=device_stream.device_type,
            current=device_stream.current,
            power=device_stream.power,
            carbon_intensity=pw.coalesce(pw.right.carbon_intensity, 500.0),
            carbon_level=pw.coalesce(pw.right.carbon_level, 'MEDIUM'),
            pricing_tier=pw.coalesce(pw.right.pricing_tier, 'MEDIUM'),
            renewable_pct=pw.coalesce(pw.right.renewable_pct, 35.0),
            electricity_price=pw.coalesce(pw.right.electricity_price, 0.15),
            cost_per_hour=pw.apply(
                lambda p, price: round(p / 1000 * price, 4),
                device_stream.power,
                pw.coalesce(pw.right.electricity_price, 0.15)
            ),
            recommendation=pw.apply(
                generate_llm_recommendation,
                device_stream.device_id,
                device_stream.device_type,
                device_stream.power,
                device_stream.current,
                pw.coalesce(pw.right.carbon_intensity, 500.0),
                pw.coalesce(pw.right.carbon_level, 'MEDIUM'),
                pw.coalesce(pw.right.electricity_price, 0.15),
                pw.coalesce(pw.right.pricing_tier, 'MEDIUM'),
                pw.coalesce(pw.right.renewable_pct, 35.0),
                pw.apply(
                    lambda p, price: round(p / 1000 * price, 4),
                    device_stream.power,
                    pw.coalesce(pw.right.electricity_price, 0.15)
                )
            ),
            timestamp=device_stream.timestamp
        )
        
        return combined
    
    def run(self):
        """
        Run the complete Pathway pipeline
        
        Creates streams, performs analysis, and writes outputs to files.
        This is a blocking call that runs until interrupted.
        """
        
        print("Data streams connected!\n")
        device_stream, grid_stream = self._create_streams()
        
        print("Anomaly Detection Pipeline Active")
        anomalies = self._detect_anomalies(device_stream)
        
        print("Statistics Pipeline Active")
        device_stats = self._compute_statistics(device_stream)
        
        print("Optimization Pipeline Active")
        recommendations = self._generate_recommendations(device_stream, grid_stream)
        
        print("Writing outputs to files\n")
        pw.io.jsonlines.write(anomalies, self.config.ANOMALIES_FILE)
        pw.io.jsonlines.write(device_stats, self.config.DEVICE_STATS_FILE)
        pw.io.jsonlines.write(recommendations, self.config.RECOMMENDATIONS_FILE)
        
        print("=" * 70)
        print("Pipeline is running! Press Ctrl+C to stop.")
        print("=" * 70 + "\n")
        
        pw.run()


def main():
    """
    Main entry point for Pathway processing
    
    Usage:
        python -m services.pathway.processor
    
    Ensure the FastAPI server is running on http://localhost:8000
    """
    from .utils import check_api_server
    
    print("Checking if GridSense API is running...")
    
    if check_api_server():
        print("API server is ready!\n")
        processor = PathwayProcessor()
        processor.run()
    else:
        print("Cannot connect to GridSense API at http://localhost:8000")
        print("Start the server with: uvicorn main:app --reload")


if __name__ == "__main__":
    try:
        main()
    except KeyboardInterrupt:
        print("\n\nPipeline stopped by user")
    except Exception as e:
        print(f"\nError: {e}")
        import traceback
        traceback.print_exc()
