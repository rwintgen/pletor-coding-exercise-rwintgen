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
async def test_search_images_by_title(client):
    token = await register_and_login(client)
    await client.post(
        "/images/upload",
        data={"title": "sunset beach"},
        files=[fake_image()],
        headers=auth_header(token),
    )
    await client.post(
        "/images/upload",
        data={"title": "mountain hike"},
        files=[fake_image()],
        headers=auth_header(token),
    )

    res = await client.get("/images/", params={"search": "sunset"})
    assert res.status_code == 200
    data = res.json()
    assert len(data) == 1
    assert data[0]["title"] == "sunset beach"


@pytest.mark.asyncio
async def test_search_case_insensitive(client):
    token = await register_and_login(client)
    await client.post(
        "/images/upload",
        data={"title": "Alpine Lake"},
        files=[fake_image()],
        headers=auth_header(token),
    )

    res = await client.get("/images/", params={"search": "alpine"})
    assert res.status_code == 200
    assert len(res.json()) == 1


@pytest.mark.asyncio
async def test_filter_by_user(client):
    token1 = await register_and_login(client, "alice", "pw")
    token2 = await register_and_login(client, "bob", "pw")
    await client.post(
        "/images/upload",
        data={"title": "alice-pic"},
        files=[fake_image()],
        headers=auth_header(token1),
    )
    await client.post(
        "/images/upload",
        data={"title": "bob-pic"},
        files=[fake_image()],
        headers=auth_header(token2),
    )

    res = await client.get("/images/", params={"user": "alice"})
    assert res.status_code == 200
    data = res.json()
    assert len(data) == 1
    assert data[0]["username"] == "alice"


@pytest.mark.asyncio
async def test_sort_oldest(client):
    token = await register_and_login(client)
    await client.post(
        "/images/upload",
        data={"title": "first"},
        files=[fake_image()],
        headers=auth_header(token),
    )
    await client.post(
        "/images/upload",
        data={"title": "second"},
        files=[fake_image()],
        headers=auth_header(token),
    )

    res = await client.get("/images/", params={"sort": "oldest"})
    data = res.json()
    assert data[0]["title"] == "first"
    assert data[1]["title"] == "second"


@pytest.mark.asyncio
async def test_sort_by_title(client):
    token = await register_and_login(client)
    await client.post(
        "/images/upload",
        data={"title": "Zebra"},
        files=[fake_image()],
        headers=auth_header(token),
    )
    await client.post(
        "/images/upload",
        data={"title": "Apple"},
        files=[fake_image()],
        headers=auth_header(token),
    )

    res = await client.get("/images/", params={"sort": "title"})
    data = res.json()
    assert data[0]["title"] == "Apple"
    assert data[1]["title"] == "Zebra"


@pytest.mark.asyncio
async def test_search_no_results(client):
    token = await register_and_login(client)
    await client.post(
        "/images/upload",
        data={"title": "hello"},
        files=[fake_image()],
        headers=auth_header(token),
    )

    res = await client.get("/images/", params={"search": "xyz_nope"})
    assert res.status_code == 200
    assert len(res.json()) == 0


@pytest.mark.asyncio
async def test_get_user_profile(client):
    await register_and_login(client, "profileuser", "pw")

    res = await client.get("/users/profileuser")
    assert res.status_code == 200
    data = res.json()
    assert data["username"] == "profileuser"
    assert "id" in data
    assert "created_at" in data


@pytest.mark.asyncio
async def test_get_user_profile_not_found(client):
    res = await client.get("/users/nonexistent")
    assert res.status_code == 404


@pytest.mark.asyncio
async def test_get_user_images(client):
    token = await register_and_login(client, "imguser", "pw")
    await client.post(
        "/images/upload",
        data={"title": "my pic"},
        files=[fake_image()],
        headers=auth_header(token),
    )

    res = await client.get("/users/imguser/images")
    assert res.status_code == 200
    data = res.json()
    assert len(data) == 1
    assert data[0]["title"] == "my pic"
    assert data[0]["username"] == "imguser"


@pytest.mark.asyncio
async def test_get_user_images_empty(client):
    await register_and_login(client, "emptyuser", "pw")

    res = await client.get("/users/emptyuser/images")
    assert res.status_code == 200
    assert len(res.json()) == 0


@pytest.mark.asyncio
async def test_get_user_images_not_found(client):
    res = await client.get("/users/ghost/images")
    assert res.status_code == 404
