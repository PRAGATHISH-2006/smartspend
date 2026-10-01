# SmartSpend 💰📱

> **Intelligent Mobile & Web Financial Engine** with Safe-to-Spend calculations, recurring expense management, automated daily reminders, PDF statement archiving, and Google Drive integration.

---

## ✨ Features

- **🛡️ Strict Safe-to-Spend Calculation**:
  - `Safe-to-Spend = Current Balance - Upcoming Fixed Expenses`
  - Daily spending guide: `Safe Daily Spending = Safe-to-Spend / Days Remaining`
- **🔄 Recurring & Fixed Expense Tracker**:
  - Pay, Edit partial amount (e.g. ₹15 instead of ₹40 for morning travel), or Skip daily expenses.
  - Automated morning (8:00 AM) and evening (6:00 PM) email reminders via Resend.
- **📅 Visual Interactive Calendar & Cycle Extension**:
  - Extend budget cycles (+3, +5, +7, +10, +15 days or pick a specific date on the interactive calendar).
  - Custom start & end date configurations.
- **📁 Month-End Review & Surplus Rollover**:
  - Close cycle and carry forward unspent funds directly into the new month's wallet (no double counting).
  - Generates `[Month]_[Year]_Transactions.pdf` with executive summary and itemized ledger.
  - Automatic background upload to Google Drive via Google Apps Script Webhook.
  - Direct statement email dispatch to user inbox with PDF attachment.
- **📊 Reports & Exports**:
  - Custom date range reports and CSV transaction ledger exports.

---

## 🛠️ Technology Stack

- **Framework**: Expo / React Native (Universal Web & Mobile)
- **Database & Auth**: Supabase (PostgreSQL + Row-Level Security)
- **Emails**: Resend API
- **PDF Generation**: jsPDF + jspdf-autotable
- **Icons & UI**: Lucide Icons + Custom Modern Design System

---

## 🚀 Getting Started

### 1. Clone the repository
```bash
git clone https://github.com/PRAGATHISH-2006/smartspend.git
cd smartspend
```

### 2. Install dependencies
```bash
npm install
```

### 3. Setup Environment Variables
Copy `.env.example` to `.env` and fill in your keys:
```bash
cp .env.example .env
```

### 4. Run Development Servers
```bash
# Start Web App
npm run web

# Start Node Email Proxy & Reminder Scheduler
npm run proxy
```

---

## 📄 License
MIT License
