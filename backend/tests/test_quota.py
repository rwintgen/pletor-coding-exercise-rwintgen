import io
from datetime import datetime, timedelta, timezone
from unittest.mock import patch

import pytest

from app.services.quota import GLOBAL_DAILY_LIMIT, USER_DAILY_LIMIT


async def register_and_login(client, username="user1", password="pass"):
    await client.post(
        "/auth/register", json={"username": username, "password": password}
    )
    res = await client.post(
        "/auth/login", json={"username": username, "password": password}
    )
    return res.json()["access_token"]


def auth_header(token):
    return {"Authorization": f"Bearer {token}"}


def fake_image():
    return (
        "file",
        ("test.png", io.BytesIO(b"\x89PNG\r\n\x1a\n" + b"\x00" * 100), "image/png"),
    )


@pytest.mark.asyncio
async def test_quota_status_unauthenticated(client):
    res = await client.get("/images/quota")
    assert res.status_code == 401


@pytest.mark.asyncio
async def test_quota_status_fresh_user(client):
    token = await register_and_login(client)
    res = await client.get("/images/quota", headers=auth_header(token))
    assert res.status_code == 200
    data = res.json()
    assert data["user_uploads_today"] == 0
    assert data["user_limit"] == USER_DAILY_LIMIT
    assert data["user_remaining"] == USER_DAILY_LIMIT
    assert data["global_uploads_today"] == 0
    assert data["global_limit"] == GLOBAL_DAILY_LIMIT
    assert data["global_remaining"] == GLOBAL_DAILY_LIMIT
    assert data["can_upload"] is True


@pytest.mark.asyncio
async def test_quota_decrements_after_upload(client):
    token = await register_and_login(client)
    await client.post(
        "/images/upload",
        data={"title": "pic"},
        files=[fake_image()],
        headers=auth_header(token),
    )
    res = await client.get("/images/quota", headers=auth_header(token))
    data = res.json()
    assert data["user_uploads_today"] == 1
    assert data["user_remaining"] == USER_DAILY_LIMIT - 1
    assert data["global_uploads_today"] == 1
    assert data["can_upload"] is True


@pytest.mark.asyncio
async def test_user_quota_exceeded(client):
    token = await register_and_login(client)
    for i in range(USER_DAILY_LIMIT):
        res = await client.post(
            "/images/upload",
            data={"title": f"pic{i}"},
            files=[fake_image()],
            headers=auth_header(token),
        )
        assert res.status_code == 200

    res = await client.post(
        "/images/upload",
        data={"title": "one_too_many"},
        files=[fake_image()],
        headers=auth_header(token),
    )
    assert res.status_code == 429
    assert "Daily upload limit" in res.json()["detail"]


@pytest.mark.asyncio
async def test_user_quota_exceeded_shows_in_status(client):
    token = await register_and_login(client)
    for i in range(USER_DAILY_LIMIT):
        await client.post(
            "/images/upload",
            data={"title": f"pic{i}"},
            files=[fake_image()],
            headers=auth_header(token),
        )

    res = await client.get("/images/quota", headers=auth_header(token))
    data = res.json()
    assert data["user_remaining"] == 0
    assert data["can_upload"] is False


@pytest.mark.asyncio
async def test_global_quota_exceeded(client):
    tokens = []
    for i in range(11):
        t = await register_and_login(client, f"user{i}", "pw")
        tokens.append(t)

    with patch("app.services.quota.GLOBAL_DAILY_LIMIT", 5):
        for i in range(5):
            res = await client.post(
                "/images/upload",
                data={"title": f"pic{i}"},
                files=[fake_image()],
                headers=auth_header(tokens[i]),
            )
            assert res.status_code == 200

        res = await client.post(
            "/images/upload",
            data={"title": "over_global"},
            files=[fake_image()],
            headers=auth_header(tokens[5]),
        )
        assert res.status_code == 429
        assert "Global upload limit" in res.json()["detail"]


@pytest.mark.asyncio
async def test_user_quota_independent_per_user(client):
    token1 = await register_and_login(client, "heavy_uploader", "pw")
    token2 = await register_and_login(client, "light_uploader", "pw")

    for i in range(USER_DAILY_LIMIT):
        await client.post(
            "/images/upload",
            data={"title": f"pic{i}"},
            files=[fake_image()],
            headers=auth_header(token1),
        )

    res = await client.post(
        "/images/upload",
        data={"title": "still_ok"},
        files=[fake_image()],
        headers=auth_header(token2),
    )
    assert res.status_code == 200


@pytest.mark.asyncio
async def test_quota_resets_after_midnight(client):
    token = await register_and_login(client)

    for i in range(USER_DAILY_LIMIT):
        await client.post(
            "/images/upload",
            data={"title": f"pic{i}"},
            files=[fake_image()],
            headers=auth_header(token),
        )

    tomorrow = datetime.now(timezone.utc) + timedelta(days=1)
    tomorrow_start = tomorrow.replace(hour=0, minute=0, second=0, microsecond=0)

    with patch("app.services.quota._today_start", return_value=tomorrow_start):
        res = await client.get("/images/quota", headers=auth_header(token))
        data = res.json()
        assert data["user_uploads_today"] == 0
        assert data["user_remaining"] == USER_DAILY_LIMIT
        assert data["can_upload"] is True
