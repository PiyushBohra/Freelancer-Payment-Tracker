# Freelancer Payment Tracker

A simple, private web app for freelancers to keep track of client payments: what you've earned, what's been paid, and what you're still owed.

It's built for designers, developers, photographers, writers, consultants and anyone else who works independently. There are no accounts, subscriptions or servers. Everything runs in your web browser and your data stays on your device.

> **Not a developer?** You don't need anything in this file. Open the ready-to-use app file included in your download and read **USER-GUIDE.md**.

---

## Features

- **Dashboard**: total earnings, paid, pending, an **earnings-by-month chart** (paid vs pending, with hover details and a table view), number of clients, projects and payments, and a "collected" progress bar
- **Add, edit and delete payments**: client, project, amount, due date, payment date, status and notes
- **Projects page**: every project with its connected clients, totals, paid/pending progress and a shortcut to its payments
- **One-click "Mark as paid"** for pending payments
- **Form validation** with clear, friendly messages
- **Payment table** with Paid and Pending status badges and overdue highlighting. On phones it switches to cards.
- **Instant search** by client or project name
- **Filter** by All, Paid or Pending
- **Sort** by date, amount or client
- **Automatic saving** to your browser's localStorage
- **Export Data** to a JSON backup file (`freelancer-payment-data.json`)
- **Import Data** from a backup, checked before anything is replaced
- **Print Report**: a clean, printer-friendly payment summary
- **6 currencies**: USD, EUR, GBP, CAD, AUD, INR (one currency for the whole app)
- **Light and dark mode**
- **Sample data** on first launch, removable with one click
- **Responsive**: desktop, laptop, tablet and mobile
- **Accessible**: keyboard navigation, visible focus states, labelled controls, screen-reader friendly dialogs

## Technology

| Tool | Purpose |
| --- | --- |
| [React](https://react.dev) | User interface |
| [TypeScript](https://www.typescriptlang.org) | Type-safe code |
| [Vite](https://vite.dev) | Development server and build tool |
| [Tailwind CSS](https://tailwindcss.com) | Styling |
| [Lucide](https://lucide.dev) | Icons |
| Browser localStorage | Data storage (no backend) |

There is no backend, database, login, API or third-party service.

---

## Installation

You need [Node.js](https://nodejs.org) version 20 or newer, which includes `npm`.

```bash
# 1. Open a terminal in this folder, then install dependencies:
npm install
```

## Run it (development)

```bash
npm run dev
```

Then open the address shown in the terminal (usually http://localhost:5173). The page reloads automatically when you edit the code.

## Build it (production)

```bash
npm run build
```

This type-checks the code and creates **one self-contained file**: `dist/index.html`.

You can:

- **Double-click `dist/index.html`** to open the app in any modern browser. No server is needed.
- **Host it** on any static web host (Netlify, Vercel, GitHub Pages, your own site) by uploading that file.
- **Preview it** locally with `npm run preview`.

> **Note:** browsers store data separately for each address. Data saved while using `npm run dev` (localhost) won't appear when you open the built file directly, and the reverse is also true. Use Export / Import to move data between them.

## Deploying online (GitHub Pages)

The repository includes a GitHub Actions workflow (`.github/workflows/deploy.yml`) that builds the app and publishes it to GitHub Pages on every push to `main`.

1. Push the project to GitHub.
2. In the repository, go to **Settings → Pages** and set **Source** to **GitHub Actions**.
3. Push to `main` (or run the workflow manually from the **Actions** tab).

The app is then live at `https://<username>.github.io/<repository>/`.

The build is a single static file, so it can also be hosted on Netlify, Cloudflare Pages or Vercel with build command `npm run build` and output folder `dist`.

> **Keep the address stable.** Browser data belongs to one exact address. If you move the app to a different URL, users' saved payments won't show there. Tell them to Export, then Import at the new address.

## Other scripts

| Command | What it does |
| --- | --- |
| `npm run typecheck` | Checks TypeScript types without building |
| `npm run preview` | Serves the production build locally |

---

## Project structure

```
src/
  components/
    Dashboard/      Stat cards, welcome banner, recent payments
    Layout/         Sidebar, mobile header, logo, navigation
    Payments/       Payment form, table/cards, search & filter toolbar
    UI/             Reusable pieces: Button, Card, Modal, ConfirmDialog, badges…
    PrintReport.tsx Printer-only report
  context/
    AppDataContext.tsx  App state + automatic saving
    ToastContext.tsx    Friendly notifications
  data/demoData.ts      Fictional sample payments
  pages/                Dashboard, Payments, Projects, Settings
  types/index.ts        TypeScript interfaces (Payment, Settings, …)
  utils/
    storage.ts      The only file that reads/writes localStorage
    validation.ts   Form validation + import/storage data checks
    payments.ts     Search, filter, sort and totals
    currency.ts     Currency list and money formatting
    date.ts         Date helpers
  App.tsx
  main.tsx
  index.css         Tailwind setup and brand colours
```

### Data model

```ts
interface Payment {
  id: string;
  clientName: string;
  projectName: string;
  amount: number;
  currency: 'USD' | 'EUR' | 'GBP' | 'CAD' | 'AUD' | 'INR';
  dueDate: string;      // "YYYY-MM-DD" or ""
  paymentDate: string;  // "YYYY-MM-DD" or ""
  status: 'paid' | 'pending';
  notes: string;
  createdAt: string;    // ISO timestamp
  updatedAt: string;    // ISO timestamp
}
```

All data is saved under a single localStorage key, `freelancer-payment-tracker:v1`, as `{ version, payments, settings, hasSeenWelcome }`.

### Customising

- **Brand colour**: edit the `--color-brand-*` values in `src/index.css`.
- **Sample data**: edit `src/data/demoData.ts`.
- **Currencies**: add a code to `CURRENCIES` in `src/types/index.ts` and its name and symbol in `src/utils/currency.ts`.

### A note on currencies

The app uses **one currency for everything**, chosen in Settings. Changing it switches the symbol on every amount and total. Amounts are **not converted**, because the app does not use exchange rates. Each payment's `currency` field always matches the Settings currency, which keeps backups self-describing.

### Projects

Projects aren't stored separately. They're grouped automatically from payments by project name (ignoring capitalisation), so there's nothing extra to keep in sync. See `groupProjects()` in `src/utils/payments.ts`.

---

## Browser support

Current versions of Chrome, Edge, Firefox and Safari (desktop and mobile).

## License

See [LICENSE.txt](LICENSE.txt). Open-source components and their licenses are listed in [THIRD-PARTY-NOTICES.txt](THIRD-PARTY-NOTICES.txt).

All app code, text, the logo and the sample data are original to this product. No external fonts, images or stock graphics are used: the app uses the device's built-in system fonts, and the logo is a hand-drawn SVG.
