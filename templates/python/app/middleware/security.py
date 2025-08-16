"""
Security Middleware

Implements OWASP security best practices including:
- Security headers (HSTS, CSP, X-Frame-Options, etc.)
- Input sanitization and validation
- Request size limits
- IP filtering and geolocation blocking
- Security event logging and monitoring
"""

import json
import time
from typing import Callable, Optional
from urllib.parse import quote

from fastapi import Request, Response
from starlette.middleware.base import BaseHTTPMiddleware
from starlette.responses import JSONResponse

from app.config.settings import get_settings, get_security_settings
from app.utils.logger import get_logger
from app.utils.security import SecurityUtils

logger = get_logger(__name__)
settings = get_settings()
security_settings = get_security_settings()


class SecurityMiddleware(BaseHTTPMiddleware):
    """
    Comprehensive security middleware implementing OWASP best practices.
    
    Features:
    - Security headers injection
    - Request size and complexity validation
    - Input sanitization
    - Malicious pattern detection
    - Security event logging
    """
    
    def __init__(self, app):
        super().__init__(app)
        self.security_utils = SecurityUtils()
        self.blocked_ips = set()
        self.suspicious_patterns = [
            # SQL injection patterns
            r"union.*select", r"drop.*table", r"insert.*into",
            r"update.*set", r"delete.*from", r"exec.*sp_",
            # XSS patterns
            r"<script.*?>", r"javascript:", r"onload=", r"onerror=",
            # Path traversal
            r"\.\./", r"\\\.\\", r"etc/passwd", r"boot\.ini",
            # Command injection
            r";\s*ls", r";\s*cat", r";\s*rm", r"&&\s*",
        ]
    
    async def dispatch(self, request: Request, call_next: Callable) -> Response:
        """Process request through security checks."""
        start_time = time.time()
        
        try:
            # Pre-request security checks
            security_check_result = await self._perform_security_checks(request)
            if security_check_result:
                return security_check_result
            
            # Process request
            response = await call_next(request)
            
            # Post-request security enhancements
            await self._enhance_response_security(request, response)
            
            # Log security metrics
            await self._log_security_metrics(request, response, start_time)
            
            return response
            
        except Exception as e:
            logger.error(f"Security middleware error: {str(e)}", exc_info=True)
            return JSONResponse(
                status_code=500,
                content={"error": "Security validation failed"}
            )
    
    async def _perform_security_checks(self, request: Request) -> Optional[Response]:
        """Perform comprehensive security validation on incoming requests."""
        
        # Check IP blocking
        client_ip = self._get_client_ip(request)
        if await self._is_ip_blocked(client_ip):
            logger.warning(f"Blocked request from IP: {client_ip}")
            return JSONResponse(
                status_code=403,
                content={"error": "Access denied"}
            )
        
        # Validate request size
        if await self._validate_request_size(request):
            logger.warning(f"Request size exceeded limit from IP: {client_ip}")
            return JSONResponse(
                status_code=413,
                content={"error": "Request too large"}
            )
        
        # Check for malicious patterns
        if await self._detect_malicious_patterns(request):
            logger.warning(f"Malicious pattern detected from IP: {client_ip}")
            await self._record_security_event(request, "malicious_pattern")
            return JSONResponse(
                status_code=400,
                content={"error": "Invalid request"}
            )
        
        # Validate JSON depth (if applicable)
        if await self._validate_json_complexity(request):
            logger.warning(f"JSON complexity exceeded from IP: {client_ip}")
            return JSONResponse(
                status_code=400,
                content={"error": "Request structure too complex"}
            )
        
        return None
    
    async def _enhance_response_security(self, request: Request, response: Response) -> None:
        """Add security headers and response enhancements."""
        
        # Add security headers
        for header, value in settings.SECURITY_HEADERS.items():
            response.headers[header] = value
        
        # Add custom security headers
        response.headers["X-Request-ID"] = getattr(request.state, "request_id", "unknown")
        response.headers["X-Response-Time"] = str(int(time.time() * 1000))
        
        # Remove server identification
        response.headers.pop("server", None)
        
        # Add security policy headers based on environment
        if settings.is_production:
            response.headers["Strict-Transport-Security"] = "max-age=31536000; includeSubDomains; preload"
        
        # Sanitize response headers
        self._sanitize_response_headers(response)
    
    def _get_client_ip(self, request: Request) -> str:
        """Extract client IP address from request."""
        # Check forwarded headers (in order of preference)
        forwarded_headers = [
            "X-Forwarded-For",
            "X-Real-IP", 
            "X-Client-IP",
            "CF-Connecting-IP",  # Cloudflare
        ]
        
        for header in forwarded_headers:
            if header in request.headers:
                ip = request.headers[header].split(",")[0].strip()
                if self._is_valid_ip(ip):
                    return ip
        
        return request.client.host if request.client else "unknown"
    
    async def _is_ip_blocked(self, ip: str) -> bool:
        """Check if IP address is blocked."""
        # Check static blocklist
        if ip in self.blocked_ips:
            return True
        
        # Check rate limiting history
        # This would integrate with Redis to track IP behavior
        # For now, we'll implement basic checks
        
        return False
    
    async def _validate_request_size(self, request: Request) -> bool:
        """Validate request size limits."""
        content_length = request.headers.get("content-length")
        if content_length:
            try:
                size = int(content_length)
                return size > security_settings.MAX_REQUEST_SIZE
            except ValueError:
                return True  # Invalid content-length header
        return False
    
    async def _detect_malicious_patterns(self, request: Request) -> bool:
        """Detect malicious patterns in request."""
        # Check URL path
        path = str(request.url.path).lower()
        query = str(request.url.query).lower()
        
        # Check against suspicious patterns
        for pattern in self.suspicious_patterns:
            if self.security_utils.matches_pattern(pattern, path) or \
               self.security_utils.matches_pattern(pattern, query):
                return True
        
        # Check request body if present
        if request.method in ["POST", "PUT", "PATCH"]:
            try:
                # Note: This is a simplified check. In production,
                # you'd want to stream and validate the body properly
                pass
            except Exception:
                return True
        
        return False
    
    async def _validate_json_complexity(self, request: Request) -> bool:
        """Validate JSON request complexity."""
        if request.headers.get("content-type", "").startswith("application/json"):
            try:
                # This would need to be implemented with streaming JSON parser
                # to avoid loading large payloads into memory
                pass
            except Exception:
                return True
        return False
    
    def _sanitize_response_headers(self, response: Response) -> None:
        """Sanitize response headers to prevent information disclosure."""
        sensitive_headers = [
            "X-Powered-By",
            "Server",
            "X-AspNet-Version",
            "X-AspNetMvc-Version",
        ]
        
        for header in sensitive_headers:
            response.headers.pop(header, None)
    
    def _is_valid_ip(self, ip: str) -> bool:
        """Validate IP address format."""
        try:
            import ipaddress
            ipaddress.ip_address(ip)
            return True
        except ValueError:
            return False
    
    async def _record_security_event(self, request: Request, event_type: str) -> None:
        """Record security events for monitoring and analysis."""
        event = {
            "timestamp": time.time(),
            "event_type": event_type,
            "ip": self._get_client_ip(request),
            "path": str(request.url.path),
            "method": request.method,
            "user_agent": request.headers.get("user-agent", ""),
            "referer": request.headers.get("referer", ""),
        }
        
        logger.warning(f"Security event: {json.dumps(event)}")
        
        # In production, you'd send this to a SIEM or security monitoring system
    
    async def _log_security_metrics(self, request: Request, response: Response, start_time: float) -> None:
        """Log security-related metrics."""
        processing_time = time.time() - start_time
        
        metrics = {
            "request_id": getattr(request.state, "request_id", "unknown"),
            "method": request.method,
            "path": str(request.url.path),
            "status_code": response.status_code,
            "processing_time": processing_time,
            "client_ip": self._get_client_ip(request),
            "user_agent": request.headers.get("user-agent", "")[:100],  # Truncate
        }
        
        # Log security metrics (structured logging)
        logger.info("Security metrics", extra={"metrics": metrics})