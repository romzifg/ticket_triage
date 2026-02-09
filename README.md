# AI Support Triage & Recovery Hub

This project is a **Full Stack MVP** that ingests customer complaints and asynchronously processes them using a **Generative AI Triage Engine**.
The system prioritizes tickets, analyzes sentiment & urgency, and generates a draft response — all **without blocking the HTTP request**.

This project was built as part of a **Full Stack Engineering Assessment**, with a strong focus on:
- Asynchronous processing
- Clean API design
- AI output validation
- Production-ready architecture

---

## 🚀 Tech Stack

### Backend
- FastAPI (Async API)
- SQLAlchemy (Async)
- Alembic (Database migrations)
- PostgreSQL
- Ollama (Local LLM)

### Frontend (optional / planned)
- Next.js (React)

---

## 🧠 Architecture Overview

POST /tickets  
→ Save ticket (status = pending)  
→ Return response immediately  
→ Background task runs AI triage  
→ Update ticket (processed / error)

Key points:
- Non-blocking AI processing
- Strict AI output validation
- Graceful fallback when AI fails

---

## 📁 Project Structure

api/
├── alembic/  
├── controllers/  
├── core/  
├── models/  
├── schemas/  
├── services/  
├── workers/  
├── main.py  
└── requirements.txt  

---

## ⚙️ Prerequisites

- Python 3.10+
- PostgreSQL
- Ollama (Local LLM)

Install Ollama:
https://ollama.com/download

Pull model:
ollama pull mistral

---

## 🔧 Environment Setup

Create `.env` inside `api/`:

DATABASE_URL=postgresql+asyncpg://postgres:password@localhost:5432/kiros_db

---

## 🐍 Virtual Environment

python -m venv venv  
source venv/bin/activate  

---

## 📦 Install Dependencies

pip install --upgrade pip  
pip install -r requirements.txt  

---

## 🗄️ Database Migration

alembic revision --autogenerate -m "create tickets table"  
alembic upgrade head  

---

## ▶️ Run API

uvicorn main:app --reload  

Open:
http://localhost:8000/docs

---

## 📌 API Endpoints

POST /tickets  
GET /tickets  
GET /tickets/{ticket_id}  

---

## 🤖 AI Triage Engine

- Runs asynchronously in background
- Uses local LLM via Ollama
- Generates:
  - Category
  - Sentiment score
  - Urgency
  - Draft reply

If AI fails:
- Ticket marked as error
- Safe fallback response stored

---

## 🎥 Demo Flow

1. POST /tickets (immediate response)
2. Wait 1–2 seconds
3. GET /tickets/{id}
4. Show AI-generated data

---

## 🧠 Engineering Highlights

- Async FastAPI + SQLAlchemy
- Background processing
- Provider-independent AI design
- Production-safe error handling

---

## 📄 License

For technical evaluation purposes.
