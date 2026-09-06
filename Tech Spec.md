# Tech Spec

## 1. Overview

I built this project as a Careers Page Builder for recruiters

The main idea is to allow a recruiter to create a careers page for their company and publish it for candidates

The project has two main parts

* Recruiter side
* Public candidate side

Recruiters can create and manage the careers page and jobs

Candidates can view the public careers page and search for jobs without logging in

I did not add candidate login or application flow because it was not required in the assignment

## 2. Assumptions

These are the main assumptions I made while building the project

* One recruiter account belongs to one company
* One company can have multiple jobs
* One company has one careers page
* A careers page can have multiple sections
* Recruiters can edit the page before publishing
* Candidates do not need an account
* Only open jobs are shown on the public page
* The careers page becomes public only after publishing
* Company slug is used for the public URL
* Job application is not included
* Image and video URLs are used instead of building a complete upload system
* PostgreSQL is used for the database

## 3. Architecture

I used a separate frontend and backend

Recruiter
   |
   v
React Frontend
   |
   | REST API
   v
FastAPI Backend
   |
   v
SQLAlchemy
   |
   v
PostgreSQL


Candidate
   |
   v
Public Careers Page
   |
   v
React Frontend
   |
   v
Public API

The frontend is responsible for the UI and user interactions

The backend handles authentication and all the main application logic

PostgreSQL stores the company users careers page sections and jobs

## 4. Technology Used

### Frontend

* React
* Vite
* JavaScript
* React Router
* Axios
* Lucide React
* CSS

I used React because the application has multiple pages and many interactive forms

Vite is used for the frontend development and production build

### Backend

* Python
* FastAPI
* SQLAlchemy
* PostgreSQL
* JWT
* bcrypt
* Alembic

I used FastAPI for creating the REST APIs

SQLAlchemy is used to connect the backend with PostgreSQL

Alembic is used for database migrations

### Deployment

* Vercel for frontend
* Render for backend
* PostgreSQL for production database

I kept frontend and backend separately deployed so they can be managed independently

## 5. Database Design

The main tables are

* Company
* User
* CareerPage
* Section
* Job

### Company

Company

id
name
slug
logo_url
created_at

A company can have multiple users and jobs

A company has one careers page

The slug is unique and is used in the public careers URL

### User

User

id
email
password_hash
role
company_id
created_at

The user belongs to a company

The password is stored as a bcrypt hash

The role is used to identify the recruiter

### CareerPage

CareerPage

id
company_id
headline
description
banner_url
culture_video_url
primary_color
secondary_color
is_published

Each company has one careers page

The recruiter can change the content and branding of the page

"is_published" is used to control whether the page is public

### Section


Section

id
career_page_id
section_type
title
content
display_order
is_visible


Sections belong to a careers page

"display_order" is used to control the order of sections

"is_visible" is used to show or hide a section

### Job

Job

id
company_id
title
description
location
job_type
department
is_open
created_at


Jobs belong to a company

Only open jobs are shown on the public careers page

## 6. API Structure

I separated the APIs based on their purpose

/auth
/companies
/careers
/sections
/jobs
/jobs/public


### Authentication

POST /auth/register
POST /auth/login

Register creates the recruiter and company

Login checks the email and password and returns a JWT token

### Company

The company API is used for viewing and updating company information

### Careers

The careers API is used for creating and updating the careers page

### Sections

The sections API is used to add update and remove careers page sections

### Jobs

The jobs API is used to create update delete and list jobs

### Public

The public API returns the company details careers page sections and open jobs using the company slug

The public API does not require recruiter login

## 7. Authentication

The authentication flow is

Login
  |
  v
Check email and password
  |
  v
Create JWT token
  |
  v
Store token in frontend
  |
  v
Send token with API requests
  |
  v
Backend verifies token
  |
  v
Allow protected operation

Passwords are not stored directly

I used bcrypt for password hashing

JWT is used for authentication of protected recruiter APIs

The backend also checks the current user before allowing changes to company data careers page sections and jobs

## 8. Careers Page Flow

The recruiter first creates the careers page

Then the recruiter can update the page content and branding

The page can be previewed before publishing

The flow is

Create page
   |
   v
Edit page
   |
   v
Add sections
   |
   v
Add jobs
   |
   v
Preview
   |
   v
Publish
   |
   v
Public careers page

The page uses "is_published" to decide whether it should be available publicly

## 9. Public Careers Page

The public page contains

* Company branding
* Careers headline
* Company story
* Additional sections
* Culture video if provided
* Open jobs
* Search
* Location filter
* Job type filter

The public page does not require login

I also made the page responsive so it works on smaller screens

## 10. SEO

I added basic SEO support to the public careers page

It includes

* Page title
* Meta description
* Canonical URL
* Organization structured data
* JobPosting structured data

The goal is to make the public page easier for search engines to understand

## 11. Accessibility

I tried to keep the main UI accessible

Some things I added are

* Labels for form fields
* Semantic HTML
* Buttons for actions
* Visible hover and active states
* Responsive layouts
* Error messages using alert roles
* Reduced motion support

There is still room to improve accessibility with automated accessibility testing

## 12. CORS

The frontend and backend are deployed on different domains

Because of this I configured CORS in FastAPI

I explicitly allowed the production Vercel frontend origin instead of allowing every origin

This was also something I had to debug during deployment

The browser was sending a preflight request and the backend was rejecting the Vercel origin

I tested the preflight request directly and then added the correct frontend origin to the backend CORS configuration

FastAPI uses "CORSMiddleware" for handling these cross origin requests

## 13. Database Migration

I used Alembic for database migrations

The main database tables were created through migrations

For future database changes I can create a new migration and apply it to the production database

Example

alembic revision --autogenerate -m "add new field"
alembic upgrade head


This is better than manually changing the production database every time

## 14. Test Plan

I tested the main features locally and after deployment

### Authentication

* Recruiter signup
* Recruiter login
* Invalid login
* Protected API requests
* Logout

### Company

* View company information
* Update company information
* Check saved changes

### Careers Page

* Edit careers page
* Change branding
* Add sections
* Hide sections
* Remove sections
* Preview page
* Publish page
* Check unpublished page

### Jobs

* Add job
* Edit job
* Delete job
* Open and close jobs
* Check public jobs

### Public Page

* Open public careers page
* Search jobs
* Filter by location
* Filter by job type
* Check empty results
* Check mobile layout
* Open page without recruiter login

### Deployment

* Frontend production build
* Backend production API
* Frontend and backend connection
* Production CORS
* Production database

## 15. Scalability

If I continue this project I would add more features

### Media

I would add proper image and video upload instead of only using URLs

### Authentication

I would add

* Password reset
* Email verification
* Refresh tokens
* More recruiter roles

### Page Builder

I would add drag and drop section ordering

I would also add a richer text editor

### Performance

I would add caching for public careers pages

I would also optimize images and use a CDN

### Testing

I would add

* Unit tests
* API tests
* Frontend tests
* End to end tests
* Accessibility tests

### Monitoring

I would add better logging and error monitoring for production

## 16. Security

Production secrets are stored in environment variables

I did not keep database passwords or JWT secrets inside the source code

Passwords are hashed using bcrypt

Protected APIs require a valid JWT token

The backend also checks the authenticated user before allowing recruiter operations

For a larger production system I would also add rate limiting stronger password rules refresh token handling security headers and better monitoring
