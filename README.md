# Accounting Dashboard

A modern, real-time accounting dashboard built with Next.js. Features a minimalist dark theme with teal accents.

## Features

- 📊 **Real-time updates**: Automatically refreshes when `accounting.csv` changes
- 📈 **Interactive charts**: Monthly trends, merchant breakdown, and status distribution
- 📋 **Sortable data table**: Search, sort, and filter invoices
- 🎨 **Modern dark theme**: Sleek teal-accented design with smooth animations
- 📱 **Responsive**: Works on desktop and mobile devices

## Getting Started

### 1. Install dependencies

```bash
npm install
```

### 2. Start the development server

```bash
npm run dev
```

### 3. Open in browser

Navigate to [http://localhost:3000](http://localhost:3000)

## CSV File Format

The dashboard reads from `accounting.csv` in the project root. The CSV should have the following columns:

| Column   | Description                    | Example                         |
|----------|--------------------------------|---------------------------------|
| Merchant | Company/vendor name            | NextGen Systems                 |
| Type     | Document type                  | Invoice                         |
| Number   | Invoice/document number        | INV-1245                        |
| Status   | Payment status (Paid/Unpaid)   | Paid                            |
| Date     | Document date (YYYY-MM-DD)     | 2025-09-07                      |
| Amount   | Amount value                   | 6398                            |
| Link     | URL to document                | https://drive.google.com/...    |

## Architecture

- **Next.js 16** with App Router
- **Tailwind CSS** for styling
- **Recharts** for data visualization
- **Chokidar** for file watching
- **Server-Sent Events (SSE)** for real-time updates

## API Endpoints

- `GET /api/data` - Fetches parsed CSV data and calculated statistics
- `GET /api/watch` - SSE endpoint for file change notifications

## Project Structure

```
accounting-workflow/
├── accounting.csv           # Your accounting data
├── src/
│   ├── app/
│   │   ├── globals.css      # Dark teal theme styling
│   │   ├── layout.tsx       # Root layout
│   │   ├── page.tsx         # Main dashboard page
│   │   └── api/
│   │       ├── data/        # CSV data API
│   │       └── watch/       # Real-time updates SSE
│   ├── components/
│   │   ├── StatsGrid.tsx    # Summary stat cards
│   │   ├── Charts.tsx       # Recharts visualizations
│   │   └── DataTable.tsx    # Sortable invoice table
│   ├── hooks/
│   │   └── useAccountingData.ts
│   ├── lib/
│   │   └── data.ts          # CSV parsing utilities
│   └── types/
│       └── index.ts         # TypeScript interfaces
├── package.json
├── tsconfig.json
└── next.config.ts
```
