def test_register_recruiter(client):
    response = client.post(
        "/auth/register",
        json={
            "email": "recruiter@test.com",
            "password": "StrongPassword123"
        }
    )

    assert response.status_code == 400
    assert response.json()["detail"] == (
        "Create a company before registering a recruiter"
    )


def test_register_recruiter_after_company_creation(client):
    company_response = client.post(
        "/companies/",
        json={
            "name": "Test Company",
            "slug": "test-company",
            "logo_url": None
        }
    )

    assert company_response.status_code == 200

    response = client.post(
        "/auth/register",
        json={
            "email": "recruiter@test.com",
            "password": "StrongPassword123"
        }
    )

    assert response.status_code == 200

    data = response.json()

    assert data["email"] == "recruiter@test.com"
    assert data["role"] == "recruiter"
    assert data["company_id"] == company_response.json()["id"]


def test_duplicate_email_is_rejected(client):
    client.post(
        "/companies/",
        json={
            "name": "Test Company",
            "slug": "test-company",
            "logo_url": None
        }
    )

    first_response = client.post(
        "/auth/register",
        json={
            "email": "recruiter@test.com",
            "password": "StrongPassword123"
        }
    )

    assert first_response.status_code == 200

    second_response = client.post(
        "/auth/register",
        json={
            "email": "recruiter@test.com",
            "password": "AnotherPassword123"
        }
    )

    assert second_response.status_code == 400
    assert second_response.json()["detail"] == (
        "Email already registered"
    )


def test_login_with_valid_credentials(client):
    client.post(
        "/companies/",
        json={
            "name": "Test Company",
            "slug": "test-company",
            "logo_url": None
        }
    )

    client.post(
        "/auth/register",
        json={
            "email": "recruiter@test.com",
            "password": "StrongPassword123"
        }
    )

    response = client.post(
        "/auth/login",
        data={
            "username": "recruiter@test.com",
            "password": "StrongPassword123"
        }
    )

    assert response.status_code == 200

    data = response.json()

    assert "access_token" in data
    assert data["token_type"] == "bearer"


def test_login_with_invalid_password_is_rejected(client):
    client.post(
        "/companies/",
        json={
            "name": "Test Company",
            "slug": "test-company",
            "logo_url": None
        }
    )

    client.post(
        "/auth/register",
        json={
            "email": "recruiter@test.com",
            "password": "StrongPassword123"
        }
    )

    response = client.post(
        "/auth/login",
        data={
            "username": "recruiter@test.com",
            "password": "WrongPassword123"
        }
    )

    assert response.status_code == 401
    assert response.json()["detail"] == (
        "Invalid email or password"
    )