# app/utils/id_generator.py

import random
import string


def generate_room_id(subject: str) -> str:
    """
    Generate a short, readable room ID based on subject.
    Example: "ai-abc123"
    """
    prefix = _subject_prefix(subject)
    suffix = "".join(random.choices(string.ascii_lowercase + string.digits, k=6))
    return f"{prefix}-{suffix}"


def _subject_prefix(subject: str) -> str:
    subject = subject.lower()

    if "artificial intelligence" in subject or subject == "ai":
        return "ai"
    if "machine learning" in subject or subject == "ml":
        return "ml"
    if "data science" in subject:
        return "ds"
    if "cyber" in subject:
        return "cyber"
    if "blockchain" in subject:
        return "bc"
    if "physics" in subject:
        return "phys"
    if "chemistry" in subject:
        return "chem"
    if "mechanics" in subject:
        return "mech"
    if "math" in subject:
        return "math"
    if "database" in subject or "dbms" in subject:
        return "db"

    return "room"
