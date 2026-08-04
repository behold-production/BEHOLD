# Enterprise React + Node.js + MongoDB Architecture Guide
### Production-Ready Full Stack Project Standards

> Version: 1.0
> Stack: React + Vite + Node.js + Express + MongoDB
> Architecture: Enterprise Clean Architecture
> Goal: Highly Scalable • Maintainable • Secure • Performance Optimized

---

# Table of Contents

1. Project Philosophy
2. Tech Stack
3. Project Structure
4. Frontend Architecture
5. Backend Architecture
6. Database Structure
7. API Standards
8. Authentication
9. Authorization
10. Validation
11. Error Handling
12. Logging
13. Security
14. Coding Standards
15. Naming Conventions
16. Folder Responsibilities
17. Component Guidelines
18. Hooks Guidelines
19. State Management
20. API Layer
21. Environment Variables
22. Performance Optimization
23. Deployment
24. Testing
25. Git Workflow

---

# 1. Project Philosophy

Every project must follow these principles.

- SOLID Principles
- Clean Architecture
- DRY (Don't Repeat Yourself)
- KISS
- Feature Driven Development
- Reusable Components
- Scalable Folder Structure
- Strict Type Safety (if TypeScript)
- Production Ready
- Easy Maintenance

---

# 2. Tech Stack

Frontend

- React
- Vite
- React Router
- React Query
- Axios
- Zustand
- React Hook Form
- Zod
- TailwindCSS
- Framer Motion
- Lucide Icons

Backend

- Node.js
- Express.js
- MongoDB
- Mongoose
- JWT
- bcrypt
- Helmet
- Cors
- Morgan
- Winston
- Multer
- Cloudinary
- Nodemailer
- Joi/Zod

Dev Tools

- ESLint
- Prettier
- Husky
- Lint Staged
- Commitlint
- Docker
- Docker Compose
- GitHub Actions

---

# 3. Complete Project Structure

```

project/
│
├── client/
│
├── server/
│
├── docs/
│
├── scripts/
│
├── docker/
│
├── .github/
│
├── README.md
│
├── package.json
│
└── docker-compose.yml

```

---

# Client Structure

```

client
│
├── public
│
├── src
│
│
├── app
│ ├── App.jsx
│ ├── Router.jsx
│ ├── Store.js
│ └── Providers.jsx
│
├── assets
│ ├── images
│ ├── fonts
│ ├── videos
│ ├── icons
│ └── animations
│
├── components
│ ├── common
│ ├── forms
│ ├── ui
│ ├── layout
│ ├── modals
│ ├── cards
│ ├── tables
│ ├── loaders
│ ├── buttons
│ └── inputs
│
├── features
│ │
│ ├── auth
│ ├── profile
│ ├── dashboard
│ ├── booking
│ ├── chat
│ ├── notification
│ └── settings
│
├── hooks
│
├── context
│
├── services
│
├── api
│
├── store
│
├── utils
│
├── constants
│
├── config
│
├── styles
│
├── routes
│
├── types
│
└── pages

```

---

# Feature Structure

Every feature follows exactly the same architecture.

```

auth/

├── api
├── components
├── hooks
├── services
├── pages
├── validation
├── constants
├── types
└── index.js

```

Never place business logic inside components.

---

# Backend Structure

```

server
│
├── src
│
├── config
│
├── database
│
├── models
│
├── controllers
│
├── services
│
├── repositories
│
├── routes
│
├── middleware
│
├── validators
│
├── schemas
│
├── helpers
│
├── utils
│
├── constants
│
├── events
│
├── sockets
│
├── jobs
│
├── queue
│
├── uploads
│
├── logs
│
├── docs
│
├── app.js
│
└── server.js

```

---

# MVC + Service + Repository Architecture

```

Route

↓

Middleware

↓

Validation

↓

Controller

↓

Service

↓

Repository

↓

MongoDB

```

Never access MongoDB directly inside controllers.

---

# Controller Responsibilities

Controllers only:

- Receive Request
- Validate Request
- Call Service
- Return Response

Never:

- Write Business Logic
- Write Database Logic
- Write Calculations

Bad

```javascript
const users = await User.find();
```

Good

```javascript
const users = await userService.getUsers();
```

---

# Service Responsibilities

Service contains

Business Logic

Example

```javascript
if (!user.isVerified) {
throw new Error("User not verified");
}
```

---

# Repository Responsibilities

Only Database

Example

```javascript
return User.findById(id);
```

Nothing else.

---

# MongoDB Structure

Collections

```

users

profiles

roles

permissions

sessions

notifications

bookings

payments

messages

settings

audit_logs

refresh_tokens

files

```

---

# Model Rules

Every model must have

```

createdAt

updatedAt

deletedAt

isDeleted

status

```

Soft delete only.

Never permanently delete important data.

---

# Authentication

JWT Access Token

15 minutes

Refresh Token

30 Days

Store

Refresh token

httpOnly Cookie

Access Token

Memory

Never localStorage.

---

# Authorization

Role Based

Permission Based

Examples

Admin

Manager

Employee

Customer

Vendor

Psychologist

Mentor

---

# Validation

Always validate

Request Body

Request Params

Request Query

Headers

Files

Never trust frontend.

---

# Error Structure

```

{
"success": false,
"message": "User not found",
"errorCode": "USER_NOT_FOUND",
"statusCode": 404,
"timestamp": "",
"path": ""
}

```

---

# Success Response

```

{
"success": true,
"message": "Success",
"data": {},
"pagination": {}
}

```

---

# Logging

Use Winston

Levels

Error

Warn

Info

Debug

Never

console.log()

Production

---

# Security

Always use

Helmet

Rate Limit

Cors

XSS Protection

Mongo Sanitization

CSRF

HTTPS

Input Validation

Password Hashing

Environment Variables

Secure Cookies

---

# React Component Rules

Maximum

200 lines

If larger

Split

Example

Bad

```

Dashboard.jsx

900 lines

```

Good

```

Dashboard

├── Header
├── Sidebar
├── Cards
├── Charts
├── Table
└── Footer

```

---

# Custom Hooks

Business logic belongs here.

```

hooks/

useAuth

useUsers

usePagination

useDebounce

useModal

usePermission

```

---

# API Layer

Never call axios inside component.

Bad

```javascript
axios.get()
```

Good

```javascript
userApi.getUsers()
```

---

# Service Layer (Frontend)

```

api/

auth.api.js

user.api.js

booking.api.js

payment.api.js

```

---

# State Management

Global

Zustand

Server State

React Query

Form State

React Hook Form

Local

useState

---

# Environment Variables

Frontend

```

VITE_API_URL

VITE_SOCKET_URL

VITE_GOOGLE_KEY

VITE_STRIPE_KEY

```

Backend

```

PORT

JWT_SECRET

JWT_REFRESH_SECRET

MONGO_URI

REDIS_URL

EMAIL_HOST

EMAIL_PORT

EMAIL_USER

EMAIL_PASS

CLOUDINARY_NAME

CLOUDINARY_KEY

CLOUDINARY_SECRET

```

Never hardcode values.

---

# API Naming

Good

```

GET /users

GET /users/:id

POST /users

PATCH /users/:id

DELETE /users/:id

```

Bad

```

getUsers

fetchUsers

createNewUser

```

---

# File Naming

Components

```

UserCard.jsx

```

Hooks

```

useAuth.js

```

Services

```

user.service.js

```

Controllers

```

user.controller.js

```

Routes

```

user.routes.js

```

Models

```

User.js

```

---

# Folder Responsibilities

components

Reusable UI

pages

Screen Components

services

Business Logic

api

API Calls

hooks

Reusable Logic

utils

Pure Functions

config

Configuration

constants

Constant Values

types

Interfaces

validators

Validation

middleware

Authentication

repositories

Database Access

controllers

HTTP Handling

---

# Performance Rules

Use

React.memo

useMemo

useCallback

Lazy Loading

Dynamic Imports

Image Compression

Pagination

Infinite Scroll

Virtualization

Caching

Debouncing

Throttling

Skeleton Loading

Code Splitting

Tree Shaking

Compression

---

# Backend Performance

Indexes

Aggregation

Lean Queries

Pagination

Projection

Caching

Redis

Queue Jobs

Background Workers

Cluster Mode

Compression

Connection Pooling

---

# Git Branch Strategy

```

main

development

staging

feature/auth

feature/dashboard

feature/chat

feature/profile

bugfix/login

hotfix/payment

release/v1.0

```

---

# Commit Convention

```

feat:

fix:

style:

docs:

refactor:

test:

build:

chore:

perf:

ci:

```

Example

```

feat(auth): add refresh token authentication

```

---

# Deployment

Frontend

- Vercel

Backend

- Railway
- Render
- AWS
- DigitalOcean

Database

MongoDB Atlas

Storage

Cloudinary

Monitoring

Sentry

Analytics

Google Analytics

Logging

Logtail

---

# Testing

Frontend

Unit

Integration

E2E

Backend

Unit

Integration

API Testing

Coverage

Minimum 80%

---

# Coding Rules

Never

Nested ternary

Magic numbers

Hardcoded URLs

Business logic in components

Database logic in controllers

console.log()

Duplicate code

Huge Components

Huge Functions

---

# Function Rules

Maximum

40 lines

If larger

Split

---

# Component Rules

Maximum

200 lines

---

# Service Rules

One responsibility only.

---

# Controller Rules

Maximum

50 lines.

---

# Clean Code Checklist

✅ Small Functions

✅ Small Components

✅ Reusable Code

✅ Validation

✅ Logging

✅ Error Handling

✅ Security

✅ Clean Architecture

✅ Feature Driven Structure

✅ Responsive UI

✅ Lazy Loading

✅ Type Safe

✅ Performance Optimized

✅ SEO Friendly

✅ Accessibility

✅ Production Ready

---

# Final Architecture Flow

```

Browser

↓

React UI

↓

React Query

↓

API Layer

↓

Axios

↓

Express Route

↓

Middleware

↓

Validation

↓

Controller

↓

Service

↓

Repository

↓

MongoDB

↓

Repository

↓

Service

↓

Controller

↓

Response

↓

React Query Cache

↓

UI

```

---

# Golden Rules

1. Never write business logic inside React components.

2. Never write MongoDB queries inside controllers.

3. Never repeat code.

4. Every API must have validation.

5. Every API must have authentication.

6. Every error must have a standard response.

7. Every success must have a standard response.

8. Every feature must be isolated.

9. Every reusable code must have its own folder.

10. Always think scalability before writing code.

11. Write code for the next developer, not just yourself.

12. Keep functions, files, and components focused on a single responsibility.

13. Prefer composition over inheritance.

14. Optimize for readability first, then performance.

15. Every pull request should improve the codebase, not just add features.

---

# Example Request Lifecycle

```text
Client (React UI)
        │
        ▼
React Query Hook
        │
        ▼
API Service (Axios)
        │
        ▼
Express Route
        │
        ▼
Authentication Middleware
        │
        ▼
Authorization Middleware
        │
        ▼
Request Validation
        │
        ▼
Controller
        │
        ▼
Business Service
        │
        ▼
Repository
        │
        ▼
MongoDB
        │
        ▲
Repository
        │
        ▲
Service
        │
        ▲
Controller
        │
        ▲
HTTP Response
        │
        ▲
React Query Cache
        │
        ▲
React Component
```

---

# Enterprise Project Quality Standard

A project following this architecture should be:

- Modular
- Feature-based
- Testable
- Maintainable
- Secure
- Performant
- Scalable
- Observable
- Cloud-ready
- Docker-ready
- CI/CD-ready
- Microservice-friendly
- Production-grade

This document should serve as the coding standard and architectural blueprint for all React + Node.js + MongoDB applications, ensuring consistency across teams and long-term maintainability.