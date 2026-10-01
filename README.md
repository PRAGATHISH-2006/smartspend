# SmartSpend 💰📱

> **Intelligent Financial Engine & Progressive Web App** with Safe-to-Spend calculations, recurring expense tracking, visual date management, automated email reminders, PDF statement archiving, and Google Drive integration.

[![React Native](https://img.shields.io/badge/React_Native-0.74.5-61DAFB?logo=react&logoColor=black)](https://reactnative.dev/)
[![Expo](https://img.shields.io/badge/Expo-51.0.38-000020?logo=expo&logoColor=white)](https://expo.dev/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.3-3178C6?logo=typescript&logoColor=white)](https://www.typescriptlang.org/)
[![Supabase](https://img.shields.io/badge/Supabase-Database%20%26%20Auth-3ECF8E?logo=supabase&logoColor=white)](https://supabase.com/)
[![PWA Ready](https://img.shields.io/badge/PWA-Ready-5A0FC8?logo=pwa&logoColor=white)](https://web.dev/progressive-web-apps/)
[![Vercel Deployed](https://img.shields.io/badge/Vercel-Deploy_Ready-000000?logo=vercel&logoColor=white)](https://vercel.com/)
[![License: MIT](https://img.shields.io/badge/License-MIT-emerald.svg)](LICENSE)

---

## ✨ Key Features

### 🛡️ 1. Safe-to-Spend & Daily Spending Limits
- **Real-Time Financial Health**: Calculates disposable income by subtracting upcoming committed/fixed expenses from current balance:
  $$\text{Safe-to-Spend} = \text{Current Balance} - \text{Upcoming Fixed Expenses}$$
- **Daily Spending Advisor**: Automatically divides your safe funds across remaining cycle days:
  $$\text{Safe Daily Spending} = \frac{\text{Safe-to-Spend}}{\text{Days Remaining}}$$
- **Budget Health Badges**: Dynamic visual indicators (**Safe** `🟢`, **Caution** `🟡`, **Warning** `🔴`) to prevent overspending.

---

### 📱 2. Progressive Web App (PWA) & Mobile Installation
- **Installable Native App Experience**: Install directly on mobile home screens (Android & iOS) with standalone full-screen mode and no browser address bar.
- **Offline Service Worker (`sw.js`)**: Fast asset pre-caching and offline page caching.
- **In-App Install Banner**:
  - **Android (Chrome)**: One-tap **"Install App"** prompt.
  - **iOS (Safari)**: Built-in step-by-step guidance (*Share `⎋` ➔ Add to Home Screen `⊞`*).
- **Custom Branding**: High-resolution 192x192, 512x512, and Apple touch icons with custom brand identity.

---

### 🔄 3. Recurring & Fixed Expense Tracker
- **Granular Daily Actions**: Mark recurring expenses as **Paid**, **Edit Partial Amount** (e.g. paying ₹15 instead of ₹40 for travel), or **Skip** for the day.
- **Automatic Reset**: Statuses update cleanly across cycle days without double-billing.
- **Category Organization**: Categorize commitments (Rent, Utilities, Subscriptions, Commute, Groceries, etc.).

---

### 📅 4. Visual Date-Picker Calendar & Cycle Extension
- **Interactive Calendar Modal**: Visually select custom cycle start and end dates with highlighted active ranges.
- **Quick Extend Shortcuts**: Extend cycles seamlessly by `+3`, `+5`, `+7`, `+10`, or `+15` days when budget timelines shift.
- **Custom Timeline Sync**: Safe-to-Spend math dynamically recalculates when cycle dates change.

---

### 📁 5. Month-End Review, Surplus Rollover & Drive Archiving
- **Automated Surplus Rollover**: Carry forward leftover unspent balances into the new month's wallet cleanly.
- **Executive PDF Statement**: Generates a professional monthly statement (`[Month]_[Year]_Transactions.pdf`) with:
  - Metric breakdown (Initial Budget, Total Spent, Net Savings, Rollover Surplus).
  - Itemized transaction ledger with dates, categories, and payment methods.
- **Google Drive Auto-Upload**: Automatically uploads the generated PDF statement to your designated Google Drive folder via Google Apps Script Webhook.
- **Inbox Dispatch**: Sends the complete statement with PDF attachment directly to your email.

---

### 📧 6. Automated Reminders & Node Scheduler
- **Daily Spending Reminders**: Scheduled notifications delivered to your inbox at 8:00 AM (Morning Outlook) and 6:00 PM (Evening Log Reminder).
- **Powered by Resend**: High-deliverability transactional emails with customizable templates.

---

## 🛠️ Technology Stack

| Layer | Technology |
|---|---|
| **Frontend Framework** | [Expo (v51)](https://expo.dev/) & [React Native (v0.74.5)](https://reactnative.dev/) |
| **Language** | [TypeScript (v5.3)](https://www.typescriptlang.org/) |
| **Database & Authentication** | [Supabase](https://supabase.com/) (PostgreSQL + RLS + Realtime) |
| **PWA & Offline** | Web App Manifest + Service Worker (`sw.js`) |
| **Document Generation** | [jsPDF](https://github.com/parallax/jsPDF) & [jspdf-autotable](https://github.com/simonbengtsson/jsPDF-AutoTable) |
| **Email Service** | [Resend](https://resend.com/) |
| **Storage & Webhook** | Google Apps Script Webhook ➔ Google Drive API |
| **Icons & Design** | [Lucide Icons](https://lucide.dev/) + Custom Dark Theme Glassmorphism UI |
| **Hosting & Deployment** | [Vercel](https://vercel.com/) |

---

## 📂 Project Structure

```text
smartspend/
├── public/                     # PWA assets & service worker
│   ├── manifest.json           # Web App Manifest (PWA metadata)
│   ├── sw.js                   # Service Worker (offline cache)
│   ├── favicon.png             # Site favicon
│   ├── icon-192.png            # 192x192 PWA app icon
│   ├── icon-512.png            # 512x512 PWA splash icon
│   └── apple-touch-icon.png    # iOS Safari bookmark icon
├── src/
│   ├── components/
│   │   ├── common/             # PWAInstallBanner, Calendar, Modals, Cards
│   │   ├── dashboard/          # SafeToSpend Card, Daily Spending Limit, Charts
│   │   ├── expenses/           # Recurring Expenses, Quick Actions
│   │   └── reports/            # PDF Export & Month-End Review Modals
│   ├── navigation/             # App Navigation & Bottom Tab Bar
│   ├── screens/
│   │   ├── auth/               # Login & Registration Screens
│   │   └── main/               # Home, Expenses, Analytics, Settings Screens
│   ├── services/               # Supabase API, Google Drive Webhook, Email Dispatch
│   ├── types/                  # TypeScript interfaces & database schemas
│   └── utils/                  # pwaHelper, formatters, date calculations
├── proxy-server.js             # Node backend for email dispatch & daily cron scheduler
├── vercel.json                 # Vercel Single Page App (SPA) routing configuration
├── app.json                    # Expo project configuration
└── package.json                # Dependencies and build scripts
```

---

## 🚀 Getting Started

### 1. Clone the Repository
```bash
git clone https://github.com/PRAGATHISH-2006/smartspend.git
cd smartspend
```

### 2. Install Dependencies
```bash
npm install
```

### 3. Setup Environment Variables
Create a `.env` file in the root directory:
```env
EXPO_PUBLIC_SUPABASE_URL=https://your-supabase-project.supabase.co
EXPO_PUBLIC_SUPABASE_ANON_KEY=your-supabase-anon-key
EXPO_PUBLIC_RESEND_API_KEY=re_your_resend_key
RESEND_API_KEY=re_your_resend_key
EXPO_PUBLIC_RESEND_FROM=SmartSpend <onboarding@resend.dev>
GOOGLE_DRIVE_WEBHOOK_URL=https://script.google.com/macros/s/your_gas_exec_id/exec
EXPO_PUBLIC_GOOGLE_DRIVE_WEBHOOK_URL=https://script.google.com/macros/s/your_gas_exec_id/exec
```

### 4. Run Locally

#### Start the Web Application:
```bash
npm run web
```

#### Start the Email Proxy & Reminder Scheduler:
```bash
npm run proxy
```

---

## 🌐 Deploy to Vercel

1. Push your repository to GitHub (`main` branch).
2. Go to [Vercel Dashboard](https://vercel.com/) and click **"Add New Project"**.
3. Import your `smartspend` GitHub repository.
4. Set the build settings:
   - **Framework Preset**: `Other`
   - **Build Command**: `npm run build`
   - **Output Directory**: `dist`
5. Add your Environment Variables in the Vercel project settings.
6. Click **Deploy**! 🚀

---

## 📲 Installing the Mobile App (PWA)

Once deployed to your URL (e.g. `https://your-smartspend.vercel.app`):

### 🤖 Android (Google Chrome)
1. Open the website in **Chrome**.
2. Tap the **"Install App"** banner at the top (or tap `⋮` ➔ **"Install app"** / **"Add to Home screen"**).
3. Confirm installation. The SmartSpend icon will appear on your app drawer and home screen.

### 🍏 iOS (Safari)
1. Open the website in **Safari**.
2. Tap the **Share** button `⎋` on the bottom toolbar.
3. Scroll down and tap **"Add to Home Screen"** `⊞`.
4. Tap **Add** in the top-right corner.

---

## 📄 License
This project is open source and available under the [MIT License](LICENSE).
