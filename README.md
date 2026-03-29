# Academic Management Dashboard

## Tech Stack

- **Next.js 14** (App Router) & **TypeScript**
- **React Query** (Data fetching & state)
- **Ant Design** & **Tailwind CSS** (UI)
- **Zod** (Validation)
- **json-server** (Mock backend)

## Running it locally

1. **Install dependencies:**
   ```bash
   npm install
   ```
2. **Start the mock database:**
   ```bash
   npm run server
   ```
   _(Keep this terminal open)_
3. **Start the Next.js app in a new terminal:**
   ```bash
   npm run dev
   ```
   Then navigate to `http://localhost:3000` 🚀

## Folder Structure

```text
src/
 ├── app/         # Next.js pages and routes
 ├── components/  # Shared reusable components
 ├── lib/         # Third-party config (Axios, React Query, etc.)
 ├── modules/     # Main features organized by domain (students, courses, etc.)
 ├── services/    # API requests
 ├── types/       # TypeScript types
 └── utils/       # Helper functions
```
