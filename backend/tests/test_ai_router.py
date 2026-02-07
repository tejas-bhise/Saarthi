# tests/test_ai_router.py

from app.services.ai_router import _looks_like_calculation, _looks_like_code_request


def test_calculation_detection():
    assert _looks_like_calculation("solve x^2 = 4") is True
    assert _looks_like_calculation("calculate 2+2") is True
    assert _looks_like_calculation("What is Newton's law?") is False


def test_code_detection():
    assert _looks_like_code_request("write a function to sort array") is True
    assert _looks_like_code_request("implement binary search") is True
    assert _looks_like_code_request("explain recursion") is False
