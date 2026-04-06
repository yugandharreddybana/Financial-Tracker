# 💰 FinanceTracker — Full-Stack Personal Finance App

A production-quality personal finance tracker built with **React.js + TypeScript**, **Java Spring Boot**, and **Node.js** — perfect for your CV in Ireland.

## 🏗️ Architecture

```
finance-tracker/
├── frontend/     → React 18 + TypeScript + Vite + Tailwind CSS (port 3000)
├── middleware/   → Node.js + Express + OpenAI GPT-4o Mini (port 4000)
└── backend/      → Java 17 + Spring Boot 3 + JWT + H2/PostgreSQL (port 8080)
```

## ✨ Features

| Feature | Description |
|---------|-------------|
| 🔐 Auth | JWT-based register/login with auto category seeding |
| 💳 Transactions | Full CRUD with category, bank account, notes, CSV export |
| 🏦 Bank Accounts | Multi-currency support (29 currencies) |
| 📊 Budgets | Monthly budget per category with progress tracking |
| 🎯 Savings Goals | Goal creation with contribution tracking |
| 🔄 Recurring | Auto-schedule weekly/monthly/yearly transactions |
| 🤖 AI Insights | GPT-4o Mini spending analysis & savings tips |
| 🌿 Carbon Footprint | CO₂ tracking per transaction category |
| 💚 Health Score | A-F grade + badges + component breakdown |
| 📈 Net Worth | 12-month history + 30-day cash flow forecast |

## 🚀 Quick Start

### Prerequisites
- Java 17+
- Maven 3.8+
- Node.js 18+

### 1. Backend
```bash
cd backend
mvn spring-boot:run
# Runs on http://localhost:8080
# H2 Console: http://localhost:8080/h2-console
```

### 2. Middleware
```bash
cd middleware
cp .env.example .env
# Optionally add your OPENAI_API_KEY (app works without it using mock responses)
npm install
npm run dev
# Runs on http://localhost:4000
```

### 3. Frontend
```bash
cd frontend
npm install
npm run dev
# Opens http://localhost:3000
```

## 🔑 API Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/auth/register` | Register new user |
| POST | `/api/auth/login` | Login |
| GET/POST/PUT/DELETE | `/api/transactions` | Transaction CRUD |
| GET | `/api/transactions/export` | CSV export |
| GET/POST/DELETE | `/api/categories` | Categories |
| GET/POST/DELETE | `/api/bank-accounts` | Bank accounts |
| GET/POST/DELETE | `/api/budgets` | Budgets |
| GET/POST/DELETE | `/api/goals` | Savings goals |
| POST | `/api/goals/:id/contribute` | Add money to goal |
| GET/POST/DELETE | `/api/recurring` | Recurring transactions |
| POST | `/api/recurring/process-due` | Process due recurring |
| GET | `/api/dashboard/stats` | Dashboard statistics |
| GET | `/api/dashboard/health-score` | Financial health score |
| GET | `/api/dashboard/net-worth` | Net worth + history |
| GET | `/api/dashboard/cash-flow-forecast` | 30-day forecast |
| GET | `/api/dashboard/carbon-footprint` | CO₂ data |
| POST | `/api/ai/insights` | AI spending insights |
| POST | `/api/ai/savings-tips` | AI savings tips |
| POST | `/api/receipt/scan` | Receipt OCR |

## 🛠️ Tech Stack

**Frontend:** React 18, TypeScript, Vite, Tailwind CSS, Redux Toolkit, Recharts, Axios, Lucide React, React Hot Toast

**Backend:** Java 17, Spring Boot 3.2, Spring Security, JWT (JJWT 0.12), JPA/Hibernate, H2 (dev) / PostgreSQL (prod), Lombok, Apache Commons CSV

**Middleware:** Node.js 18, Express 4, OpenAI SDK v4, CORS, express-rate-limit

## 🌐 Deployment

- **Frontend:** Vercel (`npm run build` → deploy `dist/`)
- **Backend:** Render.com (free tier, change H2 → PostgreSQL)
- **Middleware:** Railway or Render (add OPENAI_API_KEY env var)

## 🔒 Production Config

Switch H2 → PostgreSQL in `application.properties`:
```properties
spring.datasource.url=jdbc:postgresql://host:5432/financedb
spring.datasource.username=postgres
spring.datasource.password=yourpassword
spring.jpa.hibernate.ddl-auto=update
```

## 👨‍💻 CV Talking Points

> "Built a full-stack Personal Finance Tracker with a React/TypeScript SPA, Java Spring Boot REST API secured with JWT, and a Node.js microservice for AI and third-party integrations. The app supports 29 currencies, automated CO₂ footprint tracking, GPT-4o Mini-powered insights, and a gamified financial health score. Deployed on Vercel + Render."

---
MIT License
