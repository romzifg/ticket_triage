import httpx
import json
from schemas.ticket import AITriageResult

OLLAMA_URL = "http://localhost:11434/api/generate"

SYSTEM_PROMPT = """
You are a customer support triage system.

Return ONLY valid JSON:
{
  "category": "Billing | Technical | Feature Request",
  "sentiment_score": number (1-10),
  "urgency": "High | Medium | Low",
  "draft_reply": string
}
"""

async def run_ai_triage(message: str) -> AITriageResult:
    payload = {
        "model": "mistral",
        "prompt": f"{SYSTEM_PROMPT}\n\nCustomer complaint:\n{message}",
        "stream": False,
    }

    async with httpx.AsyncClient(timeout=120) as client:
        response = await client.post(OLLAMA_URL, json=payload)

    response.raise_for_status()

    raw_text = response.json()["response"]

    start = raw_text.find("{")
    end = raw_text.rfind("}") + 1
    parsed = json.loads(raw_text[start:end])

    return AITriageResult(**parsed)
