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
