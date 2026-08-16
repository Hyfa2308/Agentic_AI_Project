"""
Request logging middleware for tracking requests and response times.
"""

import time
import uuid
import logging
from starlette.middleware.base import BaseHTTPMiddleware
from starlette.requests import Request

logger = logging.getLogger("assistiq")


class RequestLoggingMiddleware(BaseHTTPMiddleware):
    """Logs request ID, method, path, status code, and response time."""

    async def dispatch(self, request: Request, call_next):
        request_id = str(uuid.uuid4())[:8]
        request.state.request_id = request_id

        start_time = time.time()
        logger.info(
            "[%s] %s %s - started",
            request_id,
            request.method,
            request.url.path,
        )

        try:
            response = await call_next(request)
        except Exception as exc:
            elapsed = (time.time() - start_time) * 1000
            logger.error(
                "[%s] %s %s - error after %.1fms: %s",
                request_id,
                request.method,
                request.url.path,
                elapsed,
                str(exc),
            )
            raise

        elapsed = (time.time() - start_time) * 1000
        logger.info(
            "[%s] %s %s - %d (%.1fms)",
            request_id,
            request.method,
            request.url.path,
            response.status_code,
            elapsed,
        )

        response.headers["X-Request-ID"] = request_id
        return response
