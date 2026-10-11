# 🍽️ Zaiqa Lounge / Dawat-e-Khas - Hackathon Restaurant Platform (Part A)

A full-stack, authentic Pakistani restaurant web application crafted with **Next.js 14**, **TypeScript**, **Tailwind CSS**, **Supabase**, and **Nodemailer (Gmail SMTP)**.

---

## 🔒 Password-Protected Admin Console (`/admin.html` & `/admin`)

As requested, all incoming customer orders are kept private and accessible **only** via the Admin Dashboard:

- **URL**: [http://localhost:3000/admin.html](http://localhost:3000/admin.html) (or `/admin`)
- **Password Protection**: Access is protected by an admin password lock.
- **Default Password**: `admin123` (configured in `.env.local` as `ADMIN_PASSWORD=admin123`).
- **Dashboard Features (Matches Your Design)**:
  - **Metrics Cards**: `TOTAL ORDERS`, `PENDING ORDERS`, `PREPARING`, `DELIVERED`.
  - **Filters**: Filter by `All`, `Pending`, `Preparing`, `Delivered`.
  - **Live Search**: Instant search by customer name, phone, or order ID.
  - **Interactive Table**:
    - Order ID & Timestamp with a direct **🔍 Track** link.
    - Customer Details: Name, 📞 Phone number, 📍 Delivery address, and spice notes.
    - Dishes & Quantities breakdown in Pakistani Rupee.
    - Grand Total in `Rs.`.
    - **Status (Click to Change)**: Interactive dropdown to update order status (`Pending`, `Cooking / Preparing`, `Ready for Pickup`, `Out for Delivery`, `Delivered`) syncing directly to Supabase and the Daraz-style tracker!
  - **Sidebar**: Quick navigation with live order badge counter and **Logout** button.

---

## 📧 Gmail Notification to `rizariaz61@gmail.com`

Whenever an order is placed:
- An easy-to-read summary email is dispatched directly to **`rizariaz61@gmail.com`**.
- The email includes:
  - **Daraz Tracking Number** (e.g. `DW-497012`)
  - **Customer Name**: e.g. Muhammad Ali
  - **Phone Number**: e.g. 0307820877
  - **Delivery Address**: e.g. phelwan goth
  - **Selected Dishes & Quantities**: e.g. Royal Dum Biryani × 1, Shinwari Mutton Karahi × 1
  - **Total Price**: in Pakistani Rupee (e.g. `Rs. 2,500`)
  - **Direct Tracking Link**: `http://localhost:3000/track?id=DW-497012`

---

## 🗺️ Page Routes Overview

- **[`/`](http://localhost:3000/)** — Home page with Hero section, dish highlights, and checkout.
- **[`/menu`](http://localhost:3000/menu)** — Full Menu page with real-time dish search & category filters.
- **[`/order`](http://localhost:3000/order)** — Customer checkout form with validation and instant total in PKR.
- **[`/track`](http://localhost:3000/track)** — Daraz-style live order progress tracker (`Pending` ➔ `Cooking` ➔ `Ready` ➔ `Out for Delivery` ➔ `Delivered`).
- **[`/admin.html`](http://localhost:3000/admin.html)** — **Password-protected Admin Console** (`admin123`).
- **[`/about`](http://localhost:3000/about)** — Heritage and culinary story.
- **[`/contact`](http://localhost:3000/contact)** — Locations, hotlines, and table reservations.

---

## ⚙️ Environment Variables (`.env.local`)

```env
# Supabase Database
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key

# Gmail SMTP Sender credentials (16-character Google App Password)
GMAIL_USER=your-email@gmail.com
GMAIL_APP_PASSWORD=abcdxyzwwxyzabcd

# Order notification receiver:
NOTIFICATION_RECEIVER_EMAIL=rizariaz61@gmail.com

# Admin Console Password:
ADMIN_PASSWORD=admin123
```
