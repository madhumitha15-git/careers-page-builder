# Careers Page Builder

A full-stack ATS Careers Page Builder built for the Whitecarrot assignment.

The application allows recruiters to create and manage a company's careers page, customize the page content and branding, add job openings, preview the page, and publish a public careers page that candidates can view without logging in.

## Live Demo

Frontend: https://career-page-builder-mu.vercel.app/

Backend API: https://careers-page-builder-28xc.onrender.com/

## What I Built

The application has two main experiences:

### Recruiter

A recruiter can:

* Create a recruiter account
* Create a company profile
* Login securely
* View a recruiter dashboard
* Customize the careers page
* Change company branding
* Add and manage careers page sections
* Add, edit and delete jobs
* Preview the careers page before publishing
* Publish the careers page
* Sign out

### Candidate

Candidates can access the public careers page without an account.

They can:

* View the company story
* View available jobs
* Search jobs by title
* Filter jobs by location
* Filter jobs by job type
* View job details
* Access the page on mobile devices

There is intentionally no candidate login or application flow because the assignment does not require applications.

## Main Features

### Careers Page Customization

Recruiters can customize:

* Company name
* Company logo
* Careers page headline
* Company description
* Banner image
* Culture video
* Primary color
* Secondary color
* Page sections

Sections can be created and displayed in a selected order.

### Job Management

Recruiters can manage open positions from the dashboard.

Each job contains:

* Job title
* Description
* Location
* Job type
* Department
* Open/closed status

### Preview and Publishing

The recruiter can preview the careers page before publishing it.

A public careers page is available only after the recruiter publishes the page.

The public URL follows the company slug, for example:

"/careers/company-name"

### Public Job Search

The public page provides:

* Job title search
* Location filtering
* Job type filtering
* Job count
* Empty state when no jobs match the selected filters

## Tech Stack

### Frontend

* React
* Vite
* JavaScript
* React Router
* Axios
* Lucide React
* CSS

### Backend

* Python
* FastAPI
* SQLAlchemy
* PostgreSQL
* JWT authentication
* bcrypt
* Alembic

### Deployment

* Vercel for frontend
* Render for backend
* PostgreSQL for database

## Project Structure

careers-page-builder/
│
├── frontend/
│   ├── src/
│   │   ├── pages/
│   │   │   ├── Dashboard.jsx
│   │   │   ├── CareerBuilder.jsx
│   │   │   ├── Login.jsx
│   │   │   ├── Signup.jsx
│   │   │   ├── PublicCareerPage.jsx
│   │   │   └── Settings.jsx
│   │   ├── api.js
│   │   ├── App.jsx
│   │   └── index.css
│   ├── package.json
│   └── vite.config.js
│
└── backend/
    ├── app/
    │   ├── api/
    │   │   ├── auth.py
    │   │   ├── companies.py
    │   │   ├── careers.py
    │   │   ├── sections.py
    │   │   ├── jobs.py
    │   │   └── public.py
    │   ├── security/
    │   │   ├── auth.py
    │   │   └── permissions.py
    │   ├── database.py
    │   ├── models.py
    │   ├── schemas.py
    │   └── main.py
    ├── alembic/
    ├── alembic.ini
    └── requirements.txt

## Database

The main database entities are:

* Company
* User
* CareerPage
* Section
* Job

Relationships:

Company
 ├── Users
 ├── CareerPage
 └── Jobs

CareerPage
 └── Sections


Each company has one careers page and can have multiple users and jobs.

## Authentication

Recruiters authenticate using email and password.

Passwords are stored as bcrypt hashes.

After login, the backend returns a JWT access token. The frontend stores the token and sends it in the Authorization header for protected API requests.

Recruiter-specific endpoints verify the authenticated user before allowing changes to company, career page, sections or jobs.

## Local Setup

### 1. Clone the repository


git clone https://github.com/madhumitha15-git/careers-page-builder.git
cd careers-page-builder


### 2. Backend

cd backend
python -m venv venv


Activate the virtual environment.

Windows:

venv\Scripts\activate

Install dependencies:


pip install -r requirements.txt


Create a .env file with the required database and JWT configuration.

Run migrations:

alembic upgrade head

Start the backend:

uvicorn app.main:app --reload


The API will run locally on:

http://127.0.0.1:8000

Swagger documentation is available at:

http://127.0.0.1:8000/docs

### 3. Frontend

Open another terminal:

cd frontend
npm install

Create the frontend environment variable:

VITE_API_URL=http://127.0.0.1:8000

Start the frontend:

npm run dev

The frontend will run on:

http://localhost:5173

## User Guide

### Recruiter

1. Open the application.
2. Create a recruiter account.
3. Login using the registered account.
4. Open the dashboard.
5. Configure the careers page.
6. Add company information and sections.
7. Add job openings.
8. Use preview to check the public page.
9. Publish the page.
10. Share the public careers URL.

### Candidate

1. Open the public careers URL.
2. Read the company information.
3. Browse available jobs.
4. Search for a job title.
5. Filter jobs by location or job type.

No candidate account is required.

## SEO and Accessibility

The public careers page includes:

* Page title and meta description
* Canonical URL
* Organization structured data
* JobPosting structured data for open jobs
* Semantic HTML elements
* Accessible form labels
* Responsive layouts
* Mobile-friendly controls
* Reduced-motion support

The public page is designed as a normal crawlable page rather than requiring a logged-in user.

## Testing

I tested the main application flow locally and after deployment.

The main flow tested was:

Recruiter Signup
       ↓
Login
       ↓
Dashboard
       ↓
Career Page Configuration
       ↓
Add Sections
       ↓
Add Jobs
       ↓
Preview
       ↓
Publish
       ↓
Public Careers Page
       ↓
Search / Filters

I also tested the deployed frontend communicating with the deployed FastAPI backend.

## Current Limitations

Some things I would improve in a production version:

* Image and video uploads instead of entering URLs
* Rich text editor for career page content
* Drag-and-drop section reordering
* More detailed recruiter roles and permissions
* Company-level analytics
* Better job detail pages
* Automated testing in CI/CD
* Rate limiting and stronger production security controls
* CDN/image optimization
* Custom domains for companies
* Better admin-level multi-company management

## Why I Built It This Way

I kept the application relatively simple and separated the recruiter dashboard from the public careers page.

The backend handles authentication, company data, careers page settings, sections and jobs. The frontend communicates with the backend through REST APIs.

This makes it easier to extend the system later without putting all the application logic in the frontend.

## Author

Madhumitha Tangella

GitHub: https://github.com/madhumitha15-git
