# tests/test_services.py

from app.utils.id_generator import generate_room_id


def test_room_id_generation():
    room_id = generate_room_id("Physics")
    assert room_id.startswith("phys-")
    assert len(room_id) > 5

    room_id2 = generate_room_id("Artificial Intelligence")
    assert room_id2.startswith("ai-")
