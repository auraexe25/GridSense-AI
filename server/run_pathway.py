"""
Pathway Pipeline Entry Point for GridSense

Simple entry point to run the Pathway processing pipeline.

Usage:
    python run_pathway.py
    
Make sure the FastAPI server is running first
"""

from services.pathway.processor import main

if __name__ == "__main__":
    main()
