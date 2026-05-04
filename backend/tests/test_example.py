"""
Example test showing the fixture wiring. Models the pattern; tests nothing real.
Replace this with a test for the piece you'd most want to defend in code review.
"""

import pytest


@pytest.mark.asyncio
async def test_list_images_empty(client):
    res = await client.get("/images/")
    assert res.status_code == 200
    assert res.json() == []
