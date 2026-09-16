# Janki Traders

A complete B2B/B2C trading and inquiry management platform with an admin dashboard, product catalog, customer access approvals, and quotation/enquiry workflows.

## Project Structure

```
Janki Traders/
├── Client/       # React + Vite frontend application
├── Server/       # Node.js + Express + MongoDB backend API
└── README.md
```

---

## Getting Started

### Prerequisites
- [Node.js](https://nodejs.org/) (v18+)
- [MongoDB](https://www.mongodb.com/) running locally or a MongoDB Atlas URI

---

### Backend Setup (Server)

1. Navigate to the `Server` directory:
   ```bash
   cd Server
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Configure environment variables:
   Copy `.env.example` to `.env` and fill in your values:
   ```bash
   cp .env.example .env
   ```

4. Start the backend server:
   ```bash
   npm run dev
   # or
   npm start
   ```
   The backend API will run on `http://localhost:5000`.

---

### Frontend Setup (Client)

1. Navigate to the `Client` directory:
   ```bash
   cd Client
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Start the Vite development server:
   ```bash
   npm run dev
   ```
   The client application will run on `http://localhost:5173`.
