import io

import pytest


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


def fake_image(filename="test.png", content_type="image/png"):
    return (
        "file",
        (filename, io.BytesIO(b"\x89PNG\r\n\x1a\n" + b"\x00" * 100), content_type),
    )


@pytest.mark.asyncio
async def test_upload_requires_auth(client):
    res = await client.post(
        "/images/upload", data={"title": "pic"}, files=[fake_image()]
    )
    assert res.status_code == 401


@pytest.mark.asyncio
async def test_upload_success(client):
    token = await register_and_login(client)
    res = await client.post(
        "/images/upload",
        data={"title": "My Photo"},
        files=[fake_image()],
        headers=auth_header(token),
    )
    assert res.status_code == 200
    data = res.json()
    assert data["title"] == "My Photo"
    assert data["username"] == "user1"
    assert data["url"].startswith("/uploads/")
    assert data["content_type"] == "image/png"


@pytest.mark.asyncio
async def test_upload_invalid_file_type(client):
    token = await register_and_login(client)
    bad_file = ("file", ("doc.pdf", io.BytesIO(b"not an image"), "application/pdf"))
    res = await client.post(
        "/images/upload",
        data={"title": "bad"},
        files=[bad_file],
        headers=auth_header(token),
    )
    assert res.status_code == 400
    assert "not allowed" in res.json()["detail"]


@pytest.mark.asyncio
async def test_list_images(client):
    token = await register_and_login(client)
    await client.post(
        "/images/upload",
        data={"title": "pic1"},
        files=[fake_image()],
        headers=auth_header(token),
    )
    await client.post(
        "/images/upload",
        data={"title": "pic2"},
        files=[fake_image()],
        headers=auth_header(token),
    )
    res = await client.get("/images/")
    assert res.status_code == 200
    images = res.json()
    assert len(images) == 2
    titles = {img["title"] for img in images}
    assert titles == {"pic1", "pic2"}


@pytest.mark.asyncio
async def test_get_single_image(client):
    token = await register_and_login(client)
    upload = await client.post(
        "/images/upload",
        data={"title": "solo"},
        files=[fake_image()],
        headers=auth_header(token),
    )
    image_id = upload.json()["id"]
    res = await client.get(f"/images/{image_id}")
    assert res.status_code == 200
    assert res.json()["title"] == "solo"


@pytest.mark.asyncio
async def test_get_nonexistent_image(client):
    res = await client.get("/images/9999")
    assert res.status_code == 404


@pytest.mark.asyncio
async def test_delete_own_image(client):
    token = await register_and_login(client)
    upload = await client.post(
        "/images/upload",
        data={"title": "mine"},
        files=[fake_image()],
        headers=auth_header(token),
    )
    image_id = upload.json()["id"]
    res = await client.delete(f"/images/{image_id}", headers=auth_header(token))
    assert res.status_code == 204

    res = await client.get(f"/images/{image_id}")
    assert res.status_code == 404


@pytest.mark.asyncio
async def test_delete_requires_auth(client):
    token = await register_and_login(client)
    upload = await client.post(
        "/images/upload",
        data={"title": "pic"},
        files=[fake_image()],
        headers=auth_header(token),
    )
    image_id = upload.json()["id"]
    res = await client.delete(f"/images/{image_id}")
    assert res.status_code == 401


@pytest.mark.asyncio
async def test_delete_other_users_image(client):
    token1 = await register_and_login(client, "owner", "pw")
    token2 = await register_and_login(client, "intruder", "pw")
    upload = await client.post(
        "/images/upload",
        data={"title": "private"},
        files=[fake_image()],
        headers=auth_header(token1),
    )
    image_id = upload.json()["id"]
    res = await client.delete(f"/images/{image_id}", headers=auth_header(token2))
    assert res.status_code == 403
    assert "only delete your own" in res.json()["detail"]


@pytest.mark.asyncio
async def test_delete_nonexistent_image(client):
    token = await register_and_login(client)
    res = await client.delete("/images/9999", headers=auth_header(token))
    assert res.status_code == 404


@pytest.mark.asyncio
async def test_upload_missing_title(client):
    token = await register_and_login(client)
    res = await client.post(
        "/images/upload",
        files=[fake_image()],
        headers=auth_header(token),
    )
    assert res.status_code == 422


@pytest.mark.asyncio
async def test_upload_oversized_file_rejected(client, monkeypatch):
    """Files exceeding ``MAX_UPLOAD_BYTES`` must return 413 without writing to disk."""
    from app.config import MAX_UPLOAD_BYTES  # noqa: F401
    from app.routers import images as images_router

    monkeypatch.setattr("app.routers.images.MAX_UPLOAD_BYTES", 50, raising=True)
    monkeypatch.setattr(images_router, "MAX_UPLOAD_BYTES", 50, raising=True)

    token = await register_and_login(client)
    big = (
        "file",
        ("big.png", io.BytesIO(b"\x89PNG\r\n\x1a\n" + b"\x00" * 5000), "image/png"),
    )
    res = await client.post(
        "/images/upload",
        data={"title": "big"},
        files=[big],
        headers=auth_header(token),
    )
    assert res.status_code == 413
    assert "too large" in res.json()["detail"].lower()


@pytest.mark.asyncio
async def test_delete_image_is_idempotent(client):
    """Deleting the same image twice yields 204 then 404 — safe to retry."""
    token = await register_and_login(client)
    upload = await client.post(
        "/images/upload",
        data={"title": "once"},
        files=[fake_image()],
        headers=auth_header(token),
    )
    image_id = upload.json()["id"]

    first = await client.delete(f"/images/{image_id}", headers=auth_header(token))
    assert first.status_code == 204

    second = await client.delete(f"/images/{image_id}", headers=auth_header(token))
    assert second.status_code == 404


@pytest.mark.asyncio
async def test_search_param_does_not_leak_sql(client):
    """Inputs that look like SQL must be parameterized — no rows leak through."""
    token = await register_and_login(client)
    await client.post(
        "/images/upload",
        data={"title": "innocent"},
        files=[fake_image()],
        headers=auth_header(token),
    )
    res = await client.get("/images/", params={"search": "' OR '1'='1"})
    assert res.status_code == 200
    assert res.json() == []


@pytest.mark.asyncio
async def test_rename_own_image(client):
    """Owner can rename their image via PATCH."""
    token = await register_and_login(client)
    upload = await client.post(
        "/images/upload",
        data={"title": "original"},
        files=[fake_image()],
        headers=auth_header(token),
    )
    image_id = upload.json()["id"]
    res = await client.patch(
        f"/images/{image_id}",
        json={"title": "renamed"},
        headers=auth_header(token),
    )
    assert res.status_code == 200
    assert res.json()["title"] == "renamed"

    # Verify persisted
    res = await client.get(f"/images/{image_id}")
    assert res.json()["title"] == "renamed"


@pytest.mark.asyncio
async def test_rename_other_users_image_forbidden(client):
    """Non-owner cannot rename someone else's image."""
    token1 = await register_and_login(client, "owner2", "pw")
    token2 = await register_and_login(client, "stranger", "pw")
    upload = await client.post(
        "/images/upload",
        data={"title": "mine"},
        files=[fake_image()],
        headers=auth_header(token1),
    )
    image_id = upload.json()["id"]
    res = await client.patch(
        f"/images/{image_id}",
        json={"title": "hacked"},
        headers=auth_header(token2),
    )
    assert res.status_code == 403


@pytest.mark.asyncio
async def test_rename_requires_auth(client):
    token = await register_and_login(client)
    upload = await client.post(
        "/images/upload",
        data={"title": "pic"},
        files=[fake_image()],
        headers=auth_header(token),
    )
    image_id = upload.json()["id"]
    res = await client.patch(f"/images/{image_id}", json={"title": "new"})
    assert res.status_code == 401


@pytest.mark.asyncio
async def test_rename_empty_title_rejected(client):
    token = await register_and_login(client)
    upload = await client.post(
        "/images/upload",
        data={"title": "pic"},
        files=[fake_image()],
        headers=auth_header(token),
    )
    image_id = upload.json()["id"]
    res = await client.patch(
        f"/images/{image_id}",
        json={"title": ""},
        headers=auth_header(token),
    )
    assert res.status_code == 422
