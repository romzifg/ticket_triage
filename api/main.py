from fastapi import FastAPI
from controllers.ticket import router as ticket_router

app = FastAPI(title="AI Support Triage API")

app.include_router(ticket_router)
