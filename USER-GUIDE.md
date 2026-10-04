# Freelancer Payment Tracker: User Guide

Thank you for your purchase! This guide shows you how to use your payment tracker. No technical knowledge is needed.

---

## Before you start: where is my data saved?

Your payments are saved **inside your web browser** on your computer, using a browser feature called **localStorage**. Think of it as a small private notebook that your browser keeps for this app.

What this means for you:

- ✅ **Private.** Your data is never uploaded or sent to anyone, not even to us.
- ✅ **Automatic.** Every change is saved straight away. There is no "Save" button to remember.
- ✅ **No account.** No sign-up, password or internet connection needed.
- ⚠️ **One browser, one device.** Data saved in Chrome on your laptop won't appear in Safari, on your phone or on another computer.
- ⚠️ **Clearing browser data erases it.** If you clear your browser's history, cookies or "site data", or use a private/incognito window, your payments can be lost.

**Our advice:** use **Export Data** (see step 7) regularly, for example once a month, to save a backup file somewhere safe.

---

## 1. Open the application

You can use the tracker in **two ways**. Pick one and stick with it.

### Option A: Use it online (easiest)

1. Open this link in your browser: **https://piyushbohra.github.io/Freelancer-Payment-Tracker/**
2. **Bookmark it**, or on a phone use **"Add to Home Screen"**, so it's always one tap away.

This works on your computer, tablet and phone. It needs an internet connection to open.

### Option B: Use the downloaded file (works offline)

1. Find the file **`Freelancer-Payment-Tracker.html`** in your download.
2. **Double-click** it. It opens in your web browser.
3. Keep the file somewhere easy to find, such as your Desktop. Always open the **same file, from the same place**.

Keep this file safe even if you use the online version. It's your own copy and works without the internet.

> **Important:** the online version and the downloaded file keep **separate** data, even in the same browser. Payments you add online won't appear in the file, and the other way round. To move your data from one to the other, use **Export Data** in one and **Import Data** in the other (see steps 7 and 8).

Whichever you choose, use the **same browser** each time, and your payments will be there.

The first time you open it, you'll see a welcome message and some **sample payments** so you can explore. Click **Get Started** to keep them for now, or **Remove sample data** to start with an empty tracker.

The app has four sections. On a computer they're in the sidebar on the left. On a phone or tablet they're along the top:

- **Dashboard**: your totals at a glance, plus a chart of your earnings by month
- **Payments**: your full list of payments
- **Projects**: all your projects and the clients connected to each one
- **Settings**: currency, appearance and your data

---

### The earnings chart

The **Earnings by month** chart on the Dashboard shows the last 6 months. Each column is one month:

- **Green** is money you've been **paid** that month, by payment date.
- **Orange** is money still **pending**, by due date.

Move your mouse over a column, or press **Tab** to reach it with the keyboard, to see the exact amounts. Click **Table** above the chart to see the same numbers as a simple table.

---

## 2. Add a payment

1. Click **+ Add Payment**. It's on the Dashboard and on the Payments page.
2. Fill in the form:
   - **Client name** *(required)*, for example "Sarah Johnson"
   - **Project name** *(required)*, for example "Logo Design"
   - **Amount** *(required)*. Type numbers only, for example `1500` or `1500.50`. It uses the currency chosen in Settings.
   - **Status** *(required)*: **Pending** if you're still waiting for the money, **Paid** if you've received it
   - **Due date**: when the client should pay (optional)
   - **Payment date**: when you were actually paid (optional)
   - **Notes**: anything useful, like an invoice number (optional)
3. Click **Add payment**.

If something is missing or incorrect, a red message under that field explains what to fix.

---

## 3. Edit a payment

1. Go to **Payments**.
2. Find the payment and click the **pencil icon** ✏️ on its row.
3. Change anything you like, then click **Save changes**.

---

## 4. Mark a payment as paid

When a client pays you, there are two ways to record it:

- **Quick way:** on the **Payments** page, click the **tick-in-a-circle icon** ✓ on a pending payment. It changes to **Paid**, and today's date is used as the payment date if none was set.
- **Detailed way:** click the **pencil icon**, choose **Paid**, adjust the payment date if needed, and click **Save changes**.

Pending payments that are past their due date show **"Overdue"** in red, so you know who to follow up with.

---

## 5. Search payments

On the **Payments** page, type in the **search box** at the top. The list updates as you type and matches **client names** and **project names**.

Click the small **×** in the search box to clear it.

---

## 6. Filter and sort payments

On the **Payments** page:

- **Filter by status:** click **All**, **Paid** or **Pending**.
- **Sort:** use the **Sort by** menu to order by:
  - Date (newest or oldest first)
  - Amount (highest or lowest first)
  - Client (A to Z)

---

## View your projects

Open **Projects** to see every project you've worked on. Each project card shows:

- the **client or clients** connected to it
- its **total**, how much is **paid** and how much is still **pending**, with a progress bar
- a status: **Fully paid**, **Awaiting payment**, or **Overdue** (a payment is past its due date)
- how many payments it has

Projects are created **automatically** from your payments. There's nothing extra to set up. Payments with the same project name (for example "Website Maintenance" for two different clients) are shown together on one card.

Use the search box to find a project by **project or client name**, and **Sort by** to order them by most recent, name, highest total or most pending. Click **View payments** on a card to see that project's payments on the Payments page.

---

## 7. Export data (make a backup)

1. Go to **Settings**.
2. Under **Data**, click **Export Data**.
3. A file called **`freelancer-payment-data.json`** is downloaded, usually to your **Downloads** folder.

Keep this file somewhere safe, such as a USB stick, cloud storage or email to yourself. It contains all your payments.

---

## 8. Import data (restore a backup)

Use this to restore a backup, or to move your payments to another computer or browser.

1. Go to **Settings**.
2. Under **Data**, click **Import Data**.
3. Choose a backup file you previously exported.
4. The app checks the file first. If it's valid, you'll be asked to confirm. Click **Replace and import**.

**Important:** importing **replaces** the payments currently in the app. If you're unsure, export a backup first.

If the file is empty, damaged or not a backup from this app, you'll see a friendly message and **nothing is changed**.

---

## 9. Change currency

1. Go to **Settings**.
2. Under **Currency**, choose **USD, EUR, GBP, CAD, AUD** or **INR**.

The whole app uses this one currency: every payment, every total and the printed report.

Changing the currency **only changes the symbol**. For example, $1,500 becomes ₹1,500. The app does **not** convert between currencies, so pick the currency you're paid in and keep it.

---

## 10. Change theme (light or dark)

- Go to **Settings → Appearance** and choose **Light mode** or **Dark mode**, **or**
- Click the **moon/sun icon**: at the bottom of the sidebar on a computer, or at the top-right on a phone or tablet.

Your choice is remembered next time.

---

## 11. Clear data

To delete **all** payments, including the sample data:

1. Go to **Settings**.
2. Under **Data**, click **Clear All Data**.
3. Confirm by clicking **Yes, clear everything**.

⚠️ This **cannot be undone**. Export a backup first if you might need your payments later. Your currency and theme settings are kept.

To delete just **one** payment, go to **Payments** and click the **bin icon** 🗑️ on its row, then confirm.

---

## Printing a report

Click **Print Report** on the Dashboard or Payments page. Your browser's print window opens with a clean summary: total earnings, total paid, total pending, and a table of all payments.

**Tip:** choose **"Save as PDF"** as the printer to create a PDF file you can keep or share.

---

## Frequently asked questions

**My payments disappeared!**
Check that you're using the **same browser** and the **same version** (online link or downloaded file) as before. If you use the file, open it from the **same location** as before. If you moved the file, or cleared your browser data, the saved data may not be found. Restore your latest backup with **Import Data**.

**Can I use it on my phone and computer at the same time?**
Each device keeps its own data. You can move data between them with **Export Data** and **Import Data**, but they don't sync automatically.

**Does it need the internet?**
The downloaded file works fully offline. The online version needs an internet connection to open.

**Is my data safe?**
Your data never leaves your device. Anyone with access to your computer and browser could open the app, so protect your computer with a password as usual.

**I see a message saying changes can't be saved.**
Your browser may be in private/incognito mode, or its storage may be full or disabled. Open the app in a normal browser window, and use **Export Data** to keep a copy of your work.
