"""
Pathway Integration Routes for GridSense

Provides endpoints to access Pathway processing results:
- Anomalies detected in real-time
- Device statistics and aggregations
- Optimization recommendations
"""

from fastapi import APIRouter
from typing import List, Dict, Any
import json
import os
from pathlib import Path

router = APIRouter()

PATHWAY_OUTPUT_DIR = Path("pathway_output")


def read_latest_jsonl(filepath: Path, max_lines: int = 100) -> List[Dict[str, Any]]:
    """
    Read the latest entries from a JSONL file
    
    Args:
        filepath: Path to the JSONL file
        max_lines: Maximum number of lines to return (from end of file)
    
    Returns:
        List of dictionaries containing the parsed JSON data
    """
    if not filepath.exists():
        return []
    
    try:
        with open(filepath, 'r') as f:
            lines = f.readlines()
            
        # Get the last N lines
        recent_lines = lines[-max_lines:] if len(lines) > max_lines else lines
        
        # Parse JSON and filter out deleted entries (Pathway marks deletes with diff=-1)
        results = []
        for line in recent_lines:
            try:
                data = json.loads(line)
                # Pathway output format includes metadata
                # Skip deleted entries
                if data.get('diff', 1) > 0:
                    results.append(data)
            except json.JSONDecodeError:
                continue
        
        return results
    except Exception as e:
        print(f"Error reading {filepath}: {e}")
        return []


@router.get("/anomalies")
def get_anomalies(limit: int = 50):
    """
    Get recent anomalies detected by Pathway
    
    Returns anomalous device readings including:
    - High current spikes (>100A)
    - Motor inrush events
    - Fault conditions
    - Voltage anomalies
    
    Query Parameters:
    - limit: Maximum number of anomalies to return (default: 50)
    """
    filepath = PATHWAY_OUTPUT_DIR / "anomalies.jsonl"
    anomalies = read_latest_jsonl(filepath, max_lines=limit)
    
    return {
        "count": len(anomalies),
        "anomalies": anomalies
    }


@router.get("/statistics")
def get_device_statistics():
    """
    Get real-time device statistics computed by Pathway
    
    Returns aggregated statistics per device type:
    - Average current and power
    - Maximum current observed
    - Sample count
    
    Updated continuously as new data arrives.
    """
    filepath = PATHWAY_OUTPUT_DIR / "device_stats.jsonl"
    stats = read_latest_jsonl(filepath, max_lines=100)
    
    # Group by device type (get latest for each)
    latest_stats = {}
    for entry in stats:
        device_type = entry.get('device_type')
        if device_type:
            latest_stats[device_type] = entry
    
    return {
        "device_types": list(latest_stats.keys()),
        "statistics": latest_stats
    }


@router.get("/recommendations")
def get_recommendations(limit: int = 50):
    """
    Get optimization recommendations from Pathway
    
    Returns recommendations based on:
    - Current electricity pricing
    - Carbon intensity levels
    - Device power consumption
    
    Recommendations include:
    - Load reduction suggestions during peak pricing
    - Carbon-aware load shifting
    - Cost per hour calculations
    
    Query Parameters:
    - limit: Maximum number of recommendations to return (default: 50)
    """
    filepath = PATHWAY_OUTPUT_DIR / "recommendations.jsonl"
    recommendations = read_latest_jsonl(filepath, max_lines=limit)
    
    return {
        "count": len(recommendations),
        "recommendations": recommendations
    }


@router.get("/total-power")
def get_total_power(limit: int = 100):
    """
    Get total power consumption over time
    
    Returns windowed aggregations of total power consumption
    across all devices (computed in 1-second tumbling windows).
    
    Query Parameters:
    - limit: Maximum number of data points to return (default: 100)
    """
    filepath = PATHWAY_OUTPUT_DIR / "total_power.jsonl"
    power_data = read_latest_jsonl(filepath, max_lines=limit)
    
    return {
        "count": len(power_data),
        "data": power_data
    }


@router.get("/status")
def get_pathway_status():
    """
    Check if Pathway processing is active
    
    Returns status information about the Pathway pipeline:
    - Whether output files exist
    - Last update timestamps
    - File sizes
    """
    files_info = {}
    
    for filename in ['anomalies.jsonl', 'device_stats.jsonl', 'recommendations.jsonl', 'total_power.jsonl']:
        filepath = PATHWAY_OUTPUT_DIR / filename
        
        if filepath.exists():
            stat = filepath.stat()
            files_info[filename] = {
                'exists': True,
                'size_bytes': stat.st_size,
                'last_modified': stat.st_mtime,
                'line_count': sum(1 for _ in open(filepath))
            }
        else:
            files_info[filename] = {
                'exists': False
            }
    
    # Check if any files exist
    is_active = any(info['exists'] for info in files_info.values())
    
    return {
        "pathway_active": is_active,
        "output_directory": str(PATHWAY_OUTPUT_DIR),
        "files": files_info,
        "message": "Pathway pipeline is running" if is_active else "No Pathway output detected. Start pathway_simple.py"
    }


@router.get("/summary")
def get_summary():
    """
    Get a summary of all Pathway processing results
    
    Returns:
    - Total anomalies detected
    - Latest device statistics
    - Recent recommendations
    - Current power consumption
    """
    return {
        "anomalies": {
            "recent_count": len(read_latest_jsonl(PATHWAY_OUTPUT_DIR / "anomalies.jsonl", 20)),
            "latest": read_latest_jsonl(PATHWAY_OUTPUT_DIR / "anomalies.jsonl", 5)
        },
        "statistics": get_device_statistics()['statistics'],
        "recommendations": {
            "latest": read_latest_jsonl(PATHWAY_OUTPUT_DIR / "recommendations.jsonl", 5)
        },
        "status": get_pathway_status()
    }
