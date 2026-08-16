"""
Health check endpoint.
"""

from fastapi import APIRouter

router = APIRouter(tags=["Health"])


@router.get("/health")
def health_check():
    """Returns the current health status of the API."""
    return {
        "status": "healthy",
        "service": "AssistIQ API",
        "version": "1.0.0",
    }
