"""
SKINgenius Treatment Simulation API — Entry Point
=================================================
FastAPI application wiring together the simulation router.

Run locally:
    source venv/bin/activate
    uvicorn api.main:app --reload --port 8000
"""
from __future__ import annotations

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from api.routers.simulation import router as simulation_router

app = FastAPI(
    title="SKINgenius Treatment Simulation API",
    description="Medical-grade AI treatment simulation powered by FLAME 3-D deformation.",
    version="0.1.0",
    docs_url="/docs",
    redoc_url="/redoc",
)

# CORS — tighten origins before production
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Register routes
app.include_router(simulation_router)
