import pytest


@pytest.mark.asyncio
async def test_register_success(client):
    res = await client.post(
        "/auth/register", json={"username": "alice", "password": "secret123"}
    )
    assert res.status_code == 201
    data = res.json()
    assert data["username"] == "alice"
    assert "id" in data
    assert "created_at" in data


@pytest.mark.asyncio
async def test_register_duplicate_username(client):
    await client.post(
        "/auth/register", json={"username": "alice", "password": "secret123"}
    )
    res = await client.post(
        "/auth/register", json={"username": "alice", "password": "other"}
    )
    assert res.status_code == 409
    assert "already taken" in res.json()["detail"]


@pytest.mark.asyncio
async def test_login_success(client):
    await client.post("/auth/register", json={"username": "bob", "password": "pass123"})
    res = await client.post(
        "/auth/login", json={"username": "bob", "password": "pass123"}
    )
    assert res.status_code == 200
    data = res.json()
    assert "access_token" in data
    assert data["token_type"] == "bearer"


@pytest.mark.asyncio
async def test_login_wrong_password(client):
    await client.post("/auth/register", json={"username": "bob", "password": "pass123"})
    res = await client.post(
        "/auth/login", json={"username": "bob", "password": "wrong"}
    )
    assert res.status_code == 401


@pytest.mark.asyncio
async def test_login_nonexistent_user(client):
    res = await client.post("/auth/login", json={"username": "nobody", "password": "x"})
    assert res.status_code == 401


@pytest.mark.asyncio
async def test_me_authenticated(client):
    await client.post("/auth/register", json={"username": "carol", "password": "pw"})
    login = await client.post(
        "/auth/login", json={"username": "carol", "password": "pw"}
    )
    token = login.json()["access_token"]
    res = await client.get("/auth/me", headers={"Authorization": f"Bearer {token}"})
    assert res.status_code == 200
    assert res.json()["username"] == "carol"


@pytest.mark.asyncio
async def test_me_no_token(client):
    res = await client.get("/auth/me")
    assert res.status_code == 401


@pytest.mark.asyncio
async def test_me_invalid_token(client):
    res = await client.get("/auth/me", headers={"Authorization": "Bearer garbage"})
    assert res.status_code == 401


@pytest.mark.asyncio
async def test_register_empty_username(client):
    res = await client.post("/auth/register", json={"username": "", "password": "pass"})
    assert res.status_code in (400, 422)


@pytest.mark.asyncio
async def test_register_empty_password(client):
    res = await client.post(
        "/auth/register", json={"username": "user1", "password": ""}
    )
    assert res.status_code in (400, 422)


@pytest.mark.asyncio
async def test_expired_token_rejected(client):
    """Tokens past their expiry must be rejected with 401, even though the
    signature itself is valid."""
    from datetime import datetime, timedelta, timezone

    from jose import jwt

    from app.config import JWT_ALGORITHM, JWT_SECRET

    await client.post(
        "/auth/register", json={"username": "expired_user", "password": "pw"}
    )
    res = await client.post(
        "/auth/login", json={"username": "expired_user", "password": "pw"}
    )
    user_id = 1  # first user in this isolated test DB
    expired = jwt.encode(
        {
            "sub": str(user_id),
            "exp": datetime.now(timezone.utc) - timedelta(minutes=5),
        },
        JWT_SECRET,
        algorithm=JWT_ALGORITHM,
    )
    me = await client.get("/auth/me", headers={"Authorization": f"Bearer {expired}"})
    assert me.status_code == 401
    assert res.status_code == 200  # original login worked fine
