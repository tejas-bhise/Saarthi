"""
AI Router Service
Routes questions to appropriate AI service with fallback chain
"""

from app.services.gemini_service import call_gemini
from app.services.memory_service import get_recent_chat

MAX_CONTEXT_MESSAGES = 5  # Only last 5 messages


def route_question(
    question: str,
    subject: str = "General",
    room_id: str | None = None,  # ✅ REQUIRED for Redis
    retry_count: int = 0,
    conversation_history: list | None = None,
    tutor_prompt_template: str | None = None,
    user_id: str | None = None,
):
    """
    Routing Flow:
    1. Try Gemini
    2. If fails → Grok
    3. Else → Fallback
    """

    # -----------------------------
    # IMPROVED SYSTEM PROMPT ✅
    # -----------------------------

    system_prompt = (
        tutor_prompt_template
        if tutor_prompt_template
        else f"""
You are an expert teacher and guide with deep subject mastery.

Your knowledge level is that of:
- A senior engineer / professor / domain expert
- You understand concepts rigorously and accurately

However, your responsibility is not to show expertise —
it is to transfer understanding.

Core Teaching Principles:
- Always think like an expert first
- Then explain like a calm, patient teacher
- Accuracy is non-negotiable
- Clarity is more important than completeness
- Never confuse the student to sound intelligent

How to explain (VERY IMPORTANT):
1. First, explain the concept clearly and correctly
   - What is actually happening?
   - Why it works that way
2. If the concept is complex, break it into steps
3. Use ONE meaningful real-world analogy or example
4. At the END, ALWAYS add a short “Easy version”:
   - 1–2 very simple lines
   - As if explaining to a beginner or revising quickly

Tone & Style Rules:
- Calm, confident, and reassuring
- Sound like a knowledgeable Saarthi, not a chatbot
- No emojis
- No markdown symbols
- No greetings
- No exam-style rigidity
- Avoid long paragraphs; keep a natural flow

Important Safeguards:
- If the question is advanced or serious, do NOT oversimplify the main explanation
- Simplification must come ONLY at the end as a recap
- Never sacrifice correctness for simplicity

End every answer by gently inviting clarity, for example:
“Does this explanation feel clear, or should I simplify any part further?”

Subject context: {subject}

"""
    )

    # -----------------------------
    # SHORT CONTEXT FROM REDIS ✅
    # -----------------------------

    history_text = ""

    if room_id:
        history = get_recent_chat(room_id, limit=MAX_CONTEXT_MESSAGES)

        for msg in history:
            history_text += f"{msg['role']}: {msg['content']}\n"

    # -----------------------------
    # FULL PROMPT
    # -----------------------------

    full_prompt = f"""
{system_prompt}

Conversation so far:
{history_text}

User question:
{question}

Answer as a calm, clear guide:
""".strip()

    # -----------------------------
    # Try Gemini
    # -----------------------------

    try:
        print("🤖 Trying Gemini...")

        answer = call_gemini(prompt=full_prompt)

        if answer:
            return answer, "gemini"

    except Exception as e:
        print(f"⚠️ Gemini failed: {e}")

    # -----------------------------
    # Try Grok (silent fallback)
    # -----------------------------

    try:
        from app.services.grok_service import call_grok_api

        answer = call_grok_api(
            prompt=question,
            system_prompt=system_prompt,
            max_tokens=500
        )

        if answer:
            return answer, "grok"

    except Exception as e:
        print(f"⚠️ Grok failed: {e}")

    # -----------------------------
    # Fallback
    # -----------------------------

    return "Sorry, I ran into a technical issue. Please try again.", "fallback"
