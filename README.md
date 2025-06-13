# 🎯 Track Hub

Track Hub is a modular, full-stack web application combining two powerful systems in a single platform:

- 📺 **TV Universe Tracker** – Organize and track TV shows, episodes, and interconnected fictional universes.  
- 💰 **Finance Hub** – Manage personal and organizational finances including transactions, wallets, budgeting, and loan tracking.

🌐 [Live Demo](https://trackerhub.netlify.app)

---

## ✨ Features

### 🔐 Authentication
- Email/password login and registration
- Google OAuth (coming soon)
- Secure, isolated user data using Supabase RLS

---

### 📺 TV Universe Tracker
- Track your favorite shows, seasons, and episodes
- Create and manage fictional universes
- Add shows to universes and view an episode timeline
- Public and private universe support
- Browse, search, and filter shows
- Watch/unwatch tracker for progress

---

### 💰 Finance Hub
#### 💼 Wallets & Transactions
- Add multiple wallets (cash, bank, crypto, etc.)
- Categorize income and expenses
- Add and manage financial transactions

#### 📊 Reports & Insights
- View daily, weekly, and monthly summaries
- Category-wise spending breakdown
- Visual dashboards and charts

#### 📅 Budgeting & Planning *(New!)*
- Set and monitor budgets by category
- Budget vs actual spending comparison

#### 🔄 Loans *(New!)*
- Track loans lent or borrowed
- Record repayments and outstanding balances

#### 🏢 Organization Tracking *(New!)*
- Separate personal vs team/business finance profiles
- Assign roles to collaborators (viewer/editor)
- Track shared expenses and budgets

#### 📤 Exporting
- Export transactions and reports as CSV

---

## 🧰 Tech Stack

### 🖥️ Frontend
- [React 18](https://reactjs.org/)
- [Vite](https://vitejs.dev/) for lightning-fast builds
- [TypeScript](https://www.typescriptlang.org/)
- [TailwindCSS](https://tailwindcss.com/)
- [shadcn/ui](https://ui.shadcn.com)
- [Lucide Icons](https://lucide.dev)
- React Router, React Query, React Hook Form

### 🗄️ Backend
- [Supabase](https://supabase.com) (PostgreSQL + Auth + RLS + Realtime)
- Row-Level Security for secure multi-user support
- Role-based access control

### 🧪 Dev Tools
- ESLint + Prettier for clean code
- Hot Module Reloading (HMR)
- Environment-based configuration via `.env`

---

## 📂 Project Structure

