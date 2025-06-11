# Invoice Management System

A modern invoice management system built with React, TailwindCSS, and Supabase.

## Features

- 🔐 Authentication & User Management
- 📊 Dashboard with Analytics
- 👥 Customer (Brand) Management
- 📝 Item Management (YouTube videos, etc.)
- 📄 Invoice Generation
- 📑 PDF Generation and Storage
- 📧 Email Notifications (optional)

## Tech Stack

- React 19
- TailwindCSS 4
- Supabase (Auth & Database)
- Vite
- React Router

## Prerequisites

- Node.js 18+
- npm or yarn
- Supabase account

## Setup

1. Clone the repository:

```bash
git clone <repository-url>
cd invoice
```

2. Install dependencies:

```bash
npm install
```

3. Create a `.env` file in the root directory with your Supabase credentials:

```env
VITE_SUPABASE_URL=your_supabase_project_url
VITE_SUPABASE_ANON_KEY=your_supabase_anon_key
```

4. Set up your Supabase database with the following tables:

### Users Table

```sql
create table users (
  user_id uuid primary key references auth.users,
  name varchar not null,
  phone_number varchar,
  email varchar unique not null,
  pan_number varchar,
  gst_number varchar,
  address text,
  bank_name varchar,
  account_number varchar,
  ifsc_code varchar,
  created_at timestamp with time zone default timezone('utc'::text, now())
);
```

### Brands Table

```sql
create table brands (
  brand_id uuid primary key default uuid_generate_v4(),
  user_id uuid references users(user_id),
  brand_name varchar not null,
  contact_person varchar,
  brand_email varchar,
  address text,
  gst_number varchar,
  pan_number varchar,
  created_at timestamp with time zone default timezone('utc'::text, now())
);
```

### Items Table

```sql
create table items (
  item_id uuid primary key default uuid_generate_v4(),
  user_id uuid references users(user_id),
  title varchar not null,
  description text,
  price decimal not null,
  created_at timestamp with time zone default timezone('utc'::text, now())
);
```

### Invoices Table

```sql
create table invoices (
  invoice_id uuid primary key default uuid_generate_v4(),
  user_id uuid references users(user_id),
  brand_id uuid references brands(brand_id),
  invoice_number varchar unique not null,
  invoice_date date not null,
  total_amount decimal not null,
  gst_amount decimal,
  net_amount decimal not null,
  notes text,
  pdf_url varchar,
  status varchar default 'draft',
  created_at timestamp with time zone default timezone('utc'::text, now())
);
```

### Invoice Items Table

```sql
create table invoice_items (
  id uuid primary key default uuid_generate_v4(),
  invoice_id uuid references invoices(invoice_id),
  item_id uuid references items(item_id),
  quantity integer not null default 1,
  unit_price decimal not null,
  line_total decimal not null,
  created_at timestamp with time zone default timezone('utc'::text, now())
);
```

5. Start the development server:

```bash
npm run dev
```

## Development

The project uses a dark theme by default with a modern gradient background. The UI is built with TailwindCSS and follows a consistent design system.

### Project Structure

```
src/
  ├── components/
  │   ├── Auth/
  │   │   ├── Login.jsx
  │   │   └── SignUp.jsx
  │   └── Layout/
  │       └── MainLayout.jsx
  ├── pages/
  │   ├── Dashboard.jsx
  │   ├── Customers.jsx
  │   ├── Items.jsx
  │   └── Invoices.jsx
  ├── config/
  │   └── supabase.js
  ├── styles/
  │   └── theme.css
  └── App.jsx
```

## Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## License

This project is licensed under the MIT License - see the LICENSE file for details.
