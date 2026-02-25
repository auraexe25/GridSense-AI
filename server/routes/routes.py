from fastapi import APIRouter
from routes.health import router as health_router
from routes.grid_context import router as grid_router
from routes.combined import router as combined_router
from routes.devices import router as devices_router
from routes.live_data import router as live_data_router
from routes.control_panel import router as control_panel_router
from routes.pathway_routes import router as pathway_router

router = APIRouter()

@router.get("/")
def read_root():
    return {"message": "Grid Sense API is live!"}


router.include_router(health_router, prefix="/health", tags=["Health"])
router.include_router(live_data_router, prefix="/api/live", tags=["Live Data"])
router.include_router(devices_router, prefix="/api/devices", tags=["Devices"])
router.include_router(grid_router, prefix="/api/grid", tags=["Grid Context"])
router.include_router(combined_router, prefix="/api/stream", tags=["Data Streams"])
router.include_router(pathway_router, prefix="/api/pathway", tags=["Pathway Analytics"])
router.include_router(control_panel_router, tags=["Testing"])

