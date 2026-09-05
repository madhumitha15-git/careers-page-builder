def create_company(client, name, slug):
    response = client.post(
        "/companies/",
        json={
            "name": name,
            "slug": slug,
            "logo_url": None
        }
    )

    assert response.status_code == 200
    return response.json()


def register_recruiter(client, email):
    response = client.post(
        "/auth/register",
        json={
            "email": email,
            "password": "StrongPassword123"
        }
    )

    assert response.status_code == 200
    return response.json()


def login(client, email):
    response = client.post(
        "/auth/login",
        data={
            "username": email,
            "password": "StrongPassword123"
        }
    )

    assert response.status_code == 200

    token = response.json()["access_token"]

    return {
        "Authorization": f"Bearer {token}"
    }


def create_job(client, headers, title):
    response = client.post(
        "/jobs/",
        json={
            "title": title,
            "description": "Test job",
            "location": "Hyderabad",
            "job_type": "Full-time",
            "department": "Engineering",
            "is_open": True
        },
        headers=headers
    )

    assert response.status_code == 200
    return response.json()


def create_career_page(client, headers, headline):
    response = client.post(
        "/careers/",
        json={
            "headline": headline,
            "description": "Test careers page",
            "banner_url": None,
            "culture_video_url": None,
            "primary_color": "#111111",
            "secondary_color": "#222222"
        },
        headers=headers
    )

    assert response.status_code == 200
    return response.json()


def test_recruiter_cannot_access_another_company_job(client):
    create_company(
        client,
        "Company A",
        "company-a"
    )

    recruiter_a = register_recruiter(
        client,
        "recruiter-a@test.com"
    )

    headers_a = login(
        client,
        "recruiter-a@test.com"
    )

    # Create Company B after Company A recruiter exists.
    create_company(
        client,
        "Company B",
        "company-b"
    )

    # Current registration logic assigns new recruiters
    # to the latest company.
    register_recruiter(
        client,
        "recruiter-b@test.com"
    )

    headers_b = login(
        client,
        "recruiter-b@test.com"
    )

    job_b = create_job(
        client,
        headers_b,
        "Company B Engineer"
    )

    response = client.get(
        f"/jobs/{job_b['id']}",
        headers=headers_a
    )

    assert response.status_code == 404
    assert response.json()["detail"] == "Job not found"


def test_recruiter_cannot_update_another_company_job(client):
    create_company(
        client,
        "Company A",
        "company-a"
    )

    register_recruiter(
        client,
        "recruiter-a@test.com"
    )

    headers_a = login(
        client,
        "recruiter-a@test.com"
    )

    create_company(
        client,
        "Company B",
        "company-b"
    )

    register_recruiter(
        client,
        "recruiter-b@test.com"
    )

    headers_b = login(
        client,
        "recruiter-b@test.com"
    )

    job_b = create_job(
        client,
        headers_b,
        "Company B Engineer"
    )

    response = client.put(
        f"/jobs/{job_b['id']}",
        json={
            "title": "Hacked Job",
            "description": "Unauthorized update",
            "location": "Remote",
            "job_type": "Full-time",
            "department": "Engineering",
            "is_open": True
        },
        headers=headers_a
    )

    assert response.status_code == 404
    assert response.json()["detail"] == "Job not found"


def test_recruiter_cannot_delete_another_company_job(client):
    create_company(
        client,
        "Company A",
        "company-a"
    )

    register_recruiter(
        client,
        "recruiter-a@test.com"
    )

    headers_a = login(
        client,
        "recruiter-a@test.com"
    )

    create_company(
        client,
        "Company B",
        "company-b"
    )

    register_recruiter(
        client,
        "recruiter-b@test.com"
    )

    headers_b = login(
        client,
        "recruiter-b@test.com"
    )

    job_b = create_job(
        client,
        headers_b,
        "Company B Engineer"
    )

    response = client.delete(
        f"/jobs/{job_b['id']}",
        headers=headers_a
    )

    assert response.status_code == 404

    check_response = client.get(
        f"/jobs/{job_b['id']}",
        headers=headers_b
    )

    assert check_response.status_code == 200


def test_recruiter_cannot_access_another_company_career_page(
    client
):
    create_company(
        client,
        "Company A",
        "company-a"
    )

    register_recruiter(
        client,
        "recruiter-a@test.com"
    )

    headers_a = login(
        client,
        "recruiter-a@test.com"
    )

    create_career_page(
        client,
        headers_a,
        "Company A Careers"
    )

    create_company(
        client,
        "Company B",
        "company-b"
    )

    register_recruiter(
        client,
        "recruiter-b@test.com"
    )

    headers_b = login(
        client,
        "recruiter-b@test.com"
    )

    create_career_page(
        client,
        headers_b,
        "Company B Careers"
    )

    response = client.get(
        "/careers/my-page",
        headers=headers_a
    )

    assert response.status_code == 200
    assert response.json()["company_id"] != 2


def test_public_career_pages_are_company_scoped(client):
    create_company(
        client,
        "Company A",
        "company-a"
    )

    register_recruiter(
        client,
        "recruiter-a@test.com"
    )

    headers_a = login(
        client,
        "recruiter-a@test.com"
    )

    create_career_page(
        client,
        headers_a,
        "Company A Careers"
    )

    response = client.post(
        "/careers/my-page/publish",
        headers=headers_a
    )

    assert response.status_code == 200

    create_company(
        client,
        "Company B",
        "company-b"
    )

    register_recruiter(
        client,
        "recruiter-b@test.com"
    )

    headers_b = login(
        client,
        "recruiter-b@test.com"
    )

    create_career_page(
        client,
        headers_b,
        "Company B Careers"
    )

    response = client.post(
        "/careers/my-page/publish",
        headers=headers_b
    )

    assert response.status_code == 200

    response_a = client.get(
        "/public/company-a"
    )

    response_b = client.get(
        "/public/company-b"
    )

    assert response_a.status_code == 200
    assert response_b.status_code == 200

    assert (
        response_a.json()["company"]["slug"]
        == "company-a"
    )

    assert (
        response_b.json()["company"]["slug"]
        == "company-b"
    )