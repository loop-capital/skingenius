"""
SKINgenius Treatment Simulation API — Pydantic Schemas
=======================================================
Request / response models aligned with the architecture spec.
"""
from __future__ import annotations

from typing import Literal

from pydantic import BaseModel, Field


# ---------------------------------------------------------------------------
# Shared primitives
# ---------------------------------------------------------------------------

class FaceParams(BaseModel):
    """Canonical FLAME parameter bundle."""

    beta: list[float] = Field(default_factory=list, description="Identity / shape (300)")
    theta: list[float] = Field(default_factory=list, description="Expression (100)")
    psi: list[float] = Field(default_factory=list, description="Pose (6)")


class PriceRange(BaseModel):
    min: float
    max: float


# ---------------------------------------------------------------------------
# /reconstruct
# ---------------------------------------------------------------------------

class ReconstructResponse(BaseModel):
    mesh_id: str = Field(..., description="UUID for the stored mesh")
    landmarks_count: int = Field(..., ge=0)
    face_params: FaceParams


# ---------------------------------------------------------------------------
# /preview
# ---------------------------------------------------------------------------

TreatmentType = Literal["botox", "filler"]
TreatmentZone = Literal["forehead", "lips", "cheeks", "jawline", "crow_feet"]


class PreviewRequest(BaseModel):
    mesh_id: str
    treatment_type: TreatmentType
    zone: TreatmentZone
    params: dict = Field(default_factory=dict, description="Zone-specific params (units, volume_ml, etc.)")


class PreviewResponse(BaseModel):
    before_image: str = Field(..., description="Base64-encoded PNG (before)")
    after_image: str = Field(..., description="Base64-encoded PNG (after)")
    deformation_mm: float = Field(..., ge=0.0, description="Max vertex displacement in mm")


# ---------------------------------------------------------------------------
# /treatments
# ---------------------------------------------------------------------------

class TreatmentInfo(BaseModel):
    name: str
    type: TreatmentType
    zones: list[str]
    description: str
    price_range: PriceRange


class TreatmentsResponse(BaseModel):
    treatments: list[TreatmentInfo]


# ---------------------------------------------------------------------------
# Generic envelope
# ---------------------------------------------------------------------------

class HealthResponse(BaseModel):
    status: str = "ok"
    version: str = "0.1.0"
    service: str = "skingenius-treatment-simulation"


# ---------------------------------------------------------------------------
# /feedback
# ---------------------------------------------------------------------------

class FeedbackRequest(BaseModel):
    simulation_id: str
    rating: int = Field(..., ge=1, le=5, description="1-5 quality rating")
    notes: str = Field(default="", description="Optional user notes")


class FeedbackResponse(BaseModel):
    status: str = "recorded"


# ---------------------------------------------------------------------------
# /renderers
# ---------------------------------------------------------------------------

class RendererInfo(BaseModel):
    name: str
    available: bool
    type: str
    latency_ms: int


class RenderersResponse(BaseModel):
    primary: RendererInfo
    fallback: RendererInfo
