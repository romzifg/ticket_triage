from fastapi import FastAPI
from controllers.ticket import router as ticket_router
from fastapi.middleware.cors import CORSMiddleware

app = FastAPI(title="AI Support Triage API")
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3001"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(ticket_router)
