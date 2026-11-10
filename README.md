# Library Book Manager - Backend

REST API for managing library books and tracking who has borrowed them. Built with NestJS, TypeScript, Prisma ORM and PostgreSQL hosted on Neon.

## Features

- Create, list, view, update and delete books.
- Search by book title or author.
- Filter by title, author or category.
- Paginate and sort the book list.
- Borrow a book using the borrower's name and mark it returned.
- Validate book details and return structured JSON errors.
- Explore and test endpoints through Swagger UI.
- Seed the database with 10 sample books.

## Technology

| Component | Technology |
| --- | --- |
| API framework | NestJS 11 |
| Language | TypeScript |
| ORM | Prisma 7 with the PostgreSQL adapter |
| Database | PostgreSQL / Neon |
| Validation | class-validator and class-transformer |
| API documentation | Swagger / OpenAPI |
| Testing | Jest and Supertest |

The API uses UUID book IDs, camelCase JSON fields and a versioned `/api/v1/book` base path. Book endpoints do not require authentication.

## Prerequisites

- Node.js 22.12+ or Node.js 24 and npm.
- A PostgreSQL database, such as a Neon database, and its connection string.
- Git to clone the submitted repository.

Run all commands below from the `backend` directory.

## Local setup

### 1. Install dependencies

```bash
npm install
```

### 2. Configure environment variables

Copy `.env.example` to `.env`.

PowerShell:

```powershell
Copy-Item .env.example .env
```

macOS / Linux:

```bash
cp .env.example .env
```

Set the values in `.env`:

```dotenv
DATABASE_URL="postgresql://USER:PASSWORD@HOST/DATABASE?sslmode=require"
PORT=3001
FRONTEND_URL=http://localhost:3000
NODE_ENV=development
```

| Variable | Purpose |
| --- | --- |
| `DATABASE_URL` | PostgreSQL connection string; use your Neon connection details |
| `PORT` | Backend port; the application defaults to `3001` |
| `FRONTEND_URL` | Allowed frontend origin for CORS; defaults to `http://localhost:3000` |
| `NODE_ENV` | Environment name; development responses may include error stacks |

Keep actual database credentials in `.env`, outside version control. No JWT, email, payment or image-storage credentials are required for the book endpoints.

### 3. Generate Prisma Client

```bash
npm run generate
```

### 4. Apply the existing database migrations

```bash
npx prisma migrate deploy
```

When making future schema changes during development, create a migration with:

```bash
npx prisma migrate dev --name describe_your_change
npm run generate
```

### 5. Seed sample books

```bash
npm run seed
```

This command builds the backend and runs `prisma/seed.ts` from its compiled output. On an empty database it inserts 10 sample books. Running it again skips books with the same title and author; it does not remove existing records.

### 6. Start the development server

```bash
npm run start:dev
```

With `PORT=3001`:

- API base: [http://localhost:3001/api/v1/book](http://localhost:3001/api/v1/book)
- Swagger UI: [http://localhost:3001/api/docs](http://localhost:3001/api/docs)

The configured `PORT` determines the actual listening port.

## API endpoints

All paths below are relative to `/api/v1/book`.

| Method | Path | Purpose | Success | Common errors |
| --- | --- | --- | --- | --- |
| POST | `/` | Create a book | `201` | `400`, `409` |
| GET | `/` | List, search and filter books | `200` | `400` |
| GET | `/:id` | Get one book | `200` | `404` |
| PUT | `/:id` | Update book details | `200` | `400`, `404`, `409` |
| DELETE | `/:id` | Delete an available book | `204` | `404`, `409` |
| POST | `/:id/borrow` | Borrow an available book | `200` | `400`, `404`, `409` |
| POST | `/:id/return` | Return a borrowed book | `200` | `404`, `409` |

A successful DELETE returns `204 No Content` without a JSON body. Other successful book operations return JSON.

### Create a book

`POST /api/v1/book`

```json
{
  "title": "The Alchemist",
  "author": "Paulo Coelho",
  "category": "Fiction",
  "publishedYear": 1988
}
```

Example response:

```json
{
  "statusCode": 201,
  "success": true,
  "message": "Book created successfully",
  "data": {
    "id": "3206672e-1b67-4f9b-8acc-d59ebcf939a5",
    "title": "The Alchemist",
    "author": "Paulo Coelho",
    "category": "Fiction",
    "publishedYear": 1988,
    "isBorrowed": false,
    "borrowerName": null,
    "createdAt": "2026-11-10T18:32:44.192Z",
    "updatedAt": "2026-11-10T18:32:44.192Z"
  }
}
```

### Update a book

`PUT /api/v1/book/:id`

Send all four editable fields: `title`, `author`, `category` and `publishedYear`. Use the same request structure as Create. Borrow status is changed through the Borrow and Return endpoints.

### Search, filter and paginate

```http
GET /api/v1/book?searchTerm=alchemist
GET /api/v1/book?category=Fiction
GET /api/v1/book?searchTerm=paulo&category=Fiction&page=1&limit=10
GET /api/v1/book?sortBy=title&sortOrder=asc
```

| Parameter | Behaviour | Default |
| --- | --- | --- |
| `searchTerm` | Case-insensitive partial match against title or author | No search |
| `title` | Exact title filter | No filter |
| `author` | Exact author filter | No filter |
| `category` | Exact category filter | No filter |
| `page` | Page number; use a positive integer | `1` |
| `limit` | Records per page; use a positive integer | `10` |
| `sortBy` | Book field to sort by, such as `title`, `author`, `publishedYear` or `createdAt` | `createdAt` |
| `sortOrder` | `asc` or `desc` | `desc` |

Exact filters are case-sensitive. Search and filters are combined using AND; the search itself matches title OR author.

List responses include pagination metadata:

```json
{
  "statusCode": 200,
  "success": true,
  "message": "Books retrieved successfully",
  "meta": {
    "page": 1,
    "limit": 10,
    "total": 0
  },
  "data": []
}
```

### Borrow a book

`POST /api/v1/book/:id/borrow`

```json
{
  "borrowerName": "Rahim"
}
```

A successful request sets `isBorrowed` to `true` and stores `borrowerName`. Borrowing an already borrowed book returns `409 Conflict`.

### Return a book

`POST /api/v1/book/:id/return`

No request body is required. A successful return sets `isBorrowed` to `false` and clears `borrowerName` to `null`. Returning an available book returns `409 Conflict`.

## Validation and business rules

- Title, author and category are required strings and are trimmed before validation.
- Published year must be an integer between 1900 and the server's current year, inclusive.
- A new book starts as available, with no borrower.
- Creating another book with an existing title is rejected.
- Updating a title to another book's existing title is rejected; keeping the book's own title is allowed.
- A borrowed book cannot be edited, borrowed again or deleted until it is returned.
- A missing book returns `404 Not Found`.
- Unknown fields in validated request bodies are rejected.

Errors are JSON and include `success`, `statusCode`, `message`, `errorSources` and an `error` string. The `stack` field is available in development and is `null` outside development.

## Build and run

```bash
npm run build
npm run start:prod
```

For an existing deployment, apply committed migrations using `npx prisma migrate deploy` before starting the application.

## Tests

Run the test suite:

```bash
npm test -- --runInBand
```

Run the book service tests:

```bash
npm test -- --runInBand book.service.spec.ts
```

Generate a coverage report:

```bash
npm run test:cov
```

Tests use Jest and Supertest. Service tests use mocked Prisma operations; they do not connect to Neon. Coverage includes book creation, duplicate titles, published-year rules, borrowing twice, returning books, and restrictions on editing or deleting borrowed books. Controller tests exercise HTTP requests and validation expectations. These commands run the current tests; this README does not assert that every test currently passes.

For a manual API check, use Swagger to create a book, borrow it, attempt a second borrow, return it, and delete it. Also try an invalid published year and a missing title.

## Project structure

```text
backend/
  prisma/
    schema/
      schema.prisma
      book.prisma
    migrations/
    seed.ts
  src/
    app/module/book/
      dto/
      book.controller.ts
      book.service.ts
      book.module.ts
    app/helper/
    app/errors/
    app/utils/
    prisma/
    app.module.ts
    main.ts
  test/
  .env.example
  prisma.config.ts
  package.json
```

Controllers receive requests and format responses. The book service applies business rules and uses Prisma for database operations. Shared helpers provide filtering, pagination, response formatting and error handling.

## Improvements with more time

- Add integration tests against an isolated PostgreSQL database.
- Strengthen validation for pagination, sorting and filter queries.
- Make borrowing and other state changes safe under simultaneous requests.
- Add borrowing history if required.

## AI assistance

AI tools assisted with backend implementation, validation, Swagger documentation, the seed script, automated tests and this README. The implementation was iterated to follow the project's existing service and controller style.
