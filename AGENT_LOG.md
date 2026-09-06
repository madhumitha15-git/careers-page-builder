# Agent Log

## 1. About this log

I used AI tools during different stages of this project

I mainly used AI to understand problems debug errors improve the UI and get ideas for the project structure

I made the final decisions and tested the changes myself

## 2. Project Planning

I used AI to understand the assignment requirements and break the project into smaller parts

I first planned the recruiter side and candidate side

I decided to use React for frontend FastAPI for backend and PostgreSQL for database

I also planned the project so that recruiter APIs are protected and the public careers page can be viewed without login

## 3. UI Design

I used AI to get ideas for the dashboard and careers page design

I wanted the UI to look clean and professional instead of making it too complicated

I used simple layouts cards spacing typography and icons

I also used AI suggestions to improve the public careers page and make it more responsive

After getting suggestions I changed the design based on what looked better in my project

## 4. Backend Development

I used AI while building the FastAPI backend

I used it to understand how to structure the APIs and connect FastAPI with PostgreSQL using SQLAlchemy

I also used AI while working with JWT authentication and password hashing

The main APIs I built are for authentication companies careers pages sections jobs and public careers pages

## 5. Database

I used AI to understand how the database relationships should work

I created tables for companies users careers pages sections and jobs

I used foreign keys to connect the tables

I also used Alembic for database migrations

## 6. Authentication

I used AI to understand the JWT authentication flow

The recruiter logs in and receives a token

The frontend stores the token and sends it with protected API requests

The backend checks the token before allowing recruiter operations

I also used bcrypt for password hashing

## 7. Debugging

AI helped me debug several problems during development

One of the main problems was the backend database connection

I also had problems with the frontend connecting to the deployed backend

Another issue was CORS between Vercel and Render

I tested the preflight request and found that the production Vercel domain was not added to the backend CORS settings

After adding the correct origin I redeployed and tested the connection again

## 8. Frontend Deployment

I used Vercel for deploying the frontend

During deployment I got a CSS build error

I checked the error and found that an unwanted CSS code block marker had been added inside the CSS file

I removed it and deployed again

After that the frontend build worked correctly

## 9. Backend Deployment

I used Render for deploying the FastAPI backend

I configured the backend start command and environment variables

I also connected the backend to the production PostgreSQL database

I tested the API after deployment using the API endpoints

## 10. Public Careers Page

I used AI to improve the public careers page layout

I added

* Company branding
* Careers headline
* Company story
* Custom sections
* Culture video
* Job search
* Location filter
* Job type filter

I also added preview and publishing logic

The public page only shows the careers page after it is published

## 11. SEO and Accessibility

I used AI to understand the basic SEO requirements from the assignment

I added page titles meta descriptions canonical URLs and structured data

I also added Organization and JobPosting structured data

For accessibility I added labels semantic elements error messages and reduced motion support

## 12. Testing

I tested the main features after development

I tested recruiter signup and login

I tested company and careers page updates

I tested sections and jobs

I tested preview and publishing

I tested the public careers page and job filters

I also tested the deployed frontend and backend together

## 13. AI Prompts I Used

Some of the prompts I used were

Explain how I can structure this careers page builder using React FastAPI and PostgreSQL

Help me debug this FastAPI error

Why is my frontend not connecting to my Render backend

Help me understand this CORS error

Help me improve this dashboard UI without making it too complicated

How can I add SEO support to the public careers page

How should I structure the database for companies users jobs and careers pages

Help me make this page responsive

## 14. What I Learned

I learned more about building a full stack application with separate frontend and backend

I learned how frontend and backend deployments communicate with each other

I learned more about PostgreSQL and database migrations

I also learned how CORS works and how to debug deployment problems

I understood better how authentication works using JWT

I also learned that AI suggestions are useful for debugging and getting ideas but I still need to test the changes and understand what the code is doing

## 15. Final Note

AI was used as a development assistant during this project

I did not use it as a replacement for testing

I checked the changes locally and after deployment before considering the features complete
