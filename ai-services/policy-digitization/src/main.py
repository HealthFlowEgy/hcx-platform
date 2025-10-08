"""
AI Policy Digitization Service - Main Application
Sprint 1 - Foundation for AI-powered policy processing
"""

from fastapi import FastAPI, HTTPException, UploadFile, File
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from typing import Optional, List
import os
from datetime import datetime
import logging

# Configure logging
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s'
)
logger = logging.getLogger(__name__)

# Initialize FastAPI app
app = FastAPI(
    title="HCX AI Policy Digitization Service",
    description="AI-powered policy document processing and digitization",
    version="1.0.0-sprint1",
    docs_url="/docs",
    redoc_url="/redoc"
)

# CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # Configure appropriately for production
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Environment configuration
OPENAI_API_KEY = os.getenv("OPENAI_API_KEY", "")
POSTGRES_HOST = os.getenv("POSTGRES_HOST", "localhost")
POSTGRES_DB = os.getenv("POSTGRES_DB", "hcx_ai_services")
POSTGRES_USER = os.getenv("POSTGRES_USER", "hcx_user")
POSTGRES_PASSWORD = os.getenv("POSTGRES_PASSWORD", "")
REDIS_HOST = os.getenv("REDIS_HOST", "localhost")
REDIS_PASSWORD = os.getenv("REDIS_PASSWORD", "")

# Pydantic models
class HealthResponse(BaseModel):
    status: str
    timestamp: str
    service: str
    version: str

class PolicyRequest(BaseModel):
    policy_id: Optional[str] = None
    policy_type: str
    document_url: Optional[str] = None

class PolicyResponse(BaseModel):
    policy_id: str
    status: str
    message: str
    extracted_data: Optional[dict] = None

# Routes
@app.get("/")
async def root():
    """Root endpoint"""
    return {
        "service": "HCX AI Policy Digitization Service",
        "version": "1.0.0-sprint1",
        "status": "operational",
        "endpoints": {
            "health": "/health",
            "docs": "/docs",
            "policy_upload": "/api/v1/policy/upload",
            "policy_process": "/api/v1/policy/process"
        }
    }

@app.get("/health", response_model=HealthResponse)
async def health_check():
    """Health check endpoint"""
    return HealthResponse(
        status="healthy",
        timestamp=datetime.utcnow().isoformat(),
        service="ai-policy-digitization",
        version="1.0.0-sprint1"
    )

@app.get("/metrics")
async def metrics():
    """Prometheus metrics endpoint"""
    # TODO: Implement Prometheus metrics
    return {
        "requests_total": 0,
        "requests_success": 0,
        "requests_failed": 0,
        "processing_time_avg": 0.0
    }

@app.post("/api/v1/policy/upload")
async def upload_policy(file: UploadFile = File(...)):
    """
    Upload policy document for processing
    
    Args:
        file: Policy document (PDF, image, etc.)
    
    Returns:
        Policy upload confirmation with tracking ID
    """
    try:
        # Validate file type
        allowed_types = ["application/pdf", "image/jpeg", "image/png"]
        if file.content_type not in allowed_types:
            raise HTTPException(
                status_code=400,
                detail=f"Invalid file type. Allowed: {allowed_types}"
            )
        
        # Generate policy ID
        policy_id = f"POL-{datetime.utcnow().strftime('%Y%m%d%H%M%S')}"
        
        # TODO: Save file and queue for processing
        logger.info(f"Policy uploaded: {policy_id}, filename: {file.filename}")
        
        return {
            "policy_id": policy_id,
            "filename": file.filename,
            "status": "uploaded",
            "message": "Policy document uploaded successfully. Processing will begin shortly."
        }
    
    except Exception as e:
        logger.error(f"Error uploading policy: {str(e)}")
        raise HTTPException(status_code=500, detail=str(e))

@app.post("/api/v1/policy/process", response_model=PolicyResponse)
async def process_policy(request: PolicyRequest):
    """
    Process policy document and extract information
    
    Args:
        request: Policy processing request
    
    Returns:
        Extracted policy information
    """
    try:
        logger.info(f"Processing policy: {request.policy_type}")
        
        # TODO: Implement actual policy processing with OpenAI/LangChain
        # This is a placeholder for Sprint 1
        
        extracted_data = {
            "policy_number": "SAMPLE-123456",
            "policy_holder": "Sample Insurance Company",
            "coverage_type": request.policy_type,
            "effective_date": "2025-01-01",
            "expiry_date": "2026-01-01",
            "coverage_amount": 1000000,
            "deductible": 5000,
            "status": "active"
        }
        
        return PolicyResponse(
            policy_id=request.policy_id or f"POL-{datetime.utcnow().strftime('%Y%m%d%H%M%S')}",
            status="processed",
            message="Policy processed successfully (Sprint 1 - Mock data)",
            extracted_data=extracted_data
        )
    
    except Exception as e:
        logger.error(f"Error processing policy: {str(e)}")
        raise HTTPException(status_code=500, detail=str(e))

@app.get("/api/v1/policy/{policy_id}")
async def get_policy(policy_id: str):
    """
    Retrieve policy information by ID
    
    Args:
        policy_id: Policy identifier
    
    Returns:
        Policy information
    """
    try:
        # TODO: Retrieve from database
        logger.info(f"Retrieving policy: {policy_id}")
        
        return {
            "policy_id": policy_id,
            "status": "processed",
            "created_at": datetime.utcnow().isoformat(),
            "message": "Policy retrieval endpoint (Sprint 1 - Foundation)"
        }
    
    except Exception as e:
        logger.error(f"Error retrieving policy: {str(e)}")
        raise HTTPException(status_code=500, detail=str(e))

# Startup event
@app.on_event("startup")
async def startup_event():
    """Initialize service on startup"""
    logger.info("AI Policy Digitization Service starting up...")
    logger.info(f"PostgreSQL: {POSTGRES_HOST}:{POSTGRES_DB}")
    logger.info(f"Redis: {REDIS_HOST}")
    logger.info("Service ready to accept requests")

# Shutdown event
@app.on_event("shutdown")
async def shutdown_event():
    """Cleanup on shutdown"""
    logger.info("AI Policy Digitization Service shutting down...")

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)
