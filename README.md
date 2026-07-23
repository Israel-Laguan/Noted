# Noted

A full-stack note-taking application built for the Turbo AI engineering challenge. The implementation follows the supplied prototype while keeping the visual tokens intentionally easy to adjust.

## What is included

- Email/password registration and sign-in with short-lived JWT access tokens and refresh-token rotation
- Three starter categories created atomically for every new account
- User-isolated category and note APIs with ownership validation
- Note create, read, update, delete, category filtering, and full-text-style search
- Responsive Next.js App Router UI styled with Tailwind CSS utilities
- Immediate blank-note creation when “New Note” is clicked, followed by debounced autosave
- Relative `today` and `yesterday` card dates, with month and day for older notes
- Loading, empty, error, deletion-confirmation, and expired-session states
- Backend API tests and frontend component tests
- SQLite for zero-config local development and PostgreSQL via Docker Compose

## Local development

### Backend

Python 3.12 or 3.13 is recommended.

```bash
cd backend
python -m venv .venv
# Windows: .venv\Scripts\activate
# macOS/Linux: source .venv/bin/activate
pip install -r requirements.txt
python manage.py migrate
python manage.py runserver
```

The development command defaults to port `8080`, so the API is available at `http://localhost:8080/api`. It uses SQLite unless `DATABASE_URL` is set. You can still pass another address or port explicitly when needed.

### Frontend

```bash
cd frontend
cp .env.example .env.local
npm install
npm run dev
```

Open `http://localhost:3000`.

## Demo account

A demo account is automatically created when running the development server locally (`python manage.py runserver`). This does not apply to Docker production deployments.

| Email | Password |
|-------|----------|
| `demo@noted.app` | `demo1234` |

## Tests and checks

```bash
cd backend
pytest
python manage.py check

cd ../frontend
npm test
npm run lint
npm run build
```

## Docker

To run the complete stack with PostgreSQL:

```bash
docker compose up --build
```

## API overview

| Method | Endpoint | Purpose |
|---|---|---|
| `POST` | `/api/auth/register/` | Create account and return tokens |
| `POST` | `/api/auth/token/` | Sign in with email and password |
| `POST` | `/api/auth/token/refresh/` | Rotate an access token |
| `GET` | `/api/auth/me/` | Return the current user |
| `GET/POST` | `/api/categories/` | List or create owned categories |
| `GET/PATCH/DELETE` | `/api/categories/{id}/` | Manage one owned category |
| `GET/POST` | `/api/notes/` | List or create owned notes |
| `GET/PATCH/DELETE` | `/api/notes/{id}/` | Manage one owned note |

`GET /api/notes/?category=1&search=vacation` combines category filtering and case-insensitive title/content search. All resource endpoints require `Authorization: Bearer <access-token>`.

## Architecture notes

The backend keeps transport, validation, authorization, and persistence concerns separate. Querysets are scoped before object lookup, preventing resource enumeration across accounts, and serializers independently reject foreign category IDs. The initial category creation occurs in the same transaction as registration.

The frontend centralizes API calls and token refresh in one typed client. Authentication state lives in a small context, while each screen owns only its page-level loading and mutation state. Design tokens live in `frontend/tailwind.config.ts`, and components use Tailwind utilities directly so the final Figma pass does not require a separate class stylesheet.

For a production deployment, provide strong secrets, HTTPS, explicit host/origin allowlists, managed PostgreSQL, and server-side observability. A cookie-based refresh token would be a suitable next hardening step if frontend and API share a parent domain.

## Development process and AI tools

I used ChatGPT Codex as an engineering assistant throughout the project. Codex helped scaffold the initial Django and Next.js application, review the backend structure, refine responsive behavior, and run the automated checks. I manually translated the supplied Figma designs into React and Tailwind CSS components, made the final implementation decisions, and reviewed the completed application.
