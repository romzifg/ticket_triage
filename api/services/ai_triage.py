import httpx
import json
import logging
from schemas.ticket import AITriageResult, TicketCategory, TicketUrgency

logger = logging.getLogger(__name__)

OLLAMA_URL = "http://localhost:11434/api/generate"

SYSTEM_PROMPT = """
You are a customer support triage system.

IMPORTANT:
- Detect the language used by the customer.
- Write the draft_reply in THE SAME LANGUAGE as the customer message.
- Do not mention language detection in the output.

Return ONLY valid JSON with this schema:
{
  "category": "billing | technical | feature | general",
  "sentiment_score": number (1-10),
  "urgency": "high | medium | low",
  "draft_reply": string
}

Rules:
- All enum values MUST be lowercase
- No markdown
- No explanation
- JSON only
"""


# =========================
# Helpers
# =========================
def normalize_enum(value: str) -> str:
    """
    Normalize AI enum output to match schema enums.
    """
    if not value:
        return ""
    return value.strip().lower().replace(" ", "_")


def extract_json(raw_text: str) -> dict:
    """
    Safely extract JSON object from AI response text.
    """
    start = raw_text.find("{")
    end = raw_text.rfind("}") + 1

    if start == -1 or end == -1:
        raise ValueError("No valid JSON found in AI response")

    return json.loads(raw_text[start:end])


# =========================
# Main AI Triage Function
# =========================
async def run_ai_triage(message: str) -> AITriageResult:
    payload = {
        "model": "mistral",
        "prompt": f"{SYSTEM_PROMPT}\n\nCustomer complaint:\n{message}",
        "stream": False,
    }

    async with httpx.AsyncClient(timeout=120) as client:
        response = await client.post(OLLAMA_URL, json=payload)

    response.raise_for_status()

    raw_text = response.json().get("response", "")
    parsed = extract_json(raw_text)

    # =========================
    # Normalize AI output
    # =========================
    parsed["category"] = normalize_enum(parsed.get("category", "general"))
    parsed["urgency"] = normalize_enum(parsed.get("urgency", "medium"))

    # =========================
    # Fallback safety
    # =========================
    if parsed["category"] not in TicketCategory.__members__:
        logger.warning("Unknown AI category: %s", parsed["category"])
        parsed["category"] = TicketCategory.general

    if parsed["urgency"] not in TicketUrgency.__members__:
        logger.warning("Unknown AI urgency: %s", parsed["urgency"])
        parsed["urgency"] = TicketUrgency.medium

    return AITriageResult(**parsed)
