from pydantic import BaseModel, Field
from typing import Literal
from pydantic import conint

class AITriageResult(BaseModel):
    category: Literal["Billing", "Technical", "Feature Request"]
    sentiment_score: conint(ge=1, le=10)
    urgency: Literal["High", "Medium", "Low"]
    draft_reply: str
