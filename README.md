# Academic Management Dashboard

## Overview
A production-ready Academic Management Dashboard built as a senior frontend engineer task. This application manages Students, Courses, Faculty, and generates Reports, offering a clean, scalable architectural foundation.

## Tech Stack
- **Framework**: Next.js (App Router)
- **Language**: TypeScript
- **Styling**: Tailwind CSS
- **Data Fetching**: Axios
- **Form Handling & Validation**: React Hook Form, Zod
- **Charts**: ApexCharts, react-apexcharts
- **API mock**: json-server

## Project Setup

1. **Install dependencies**:
   ```bash
   npm install
   ```

2. **Run json-server**:
   ```bash
   npm run server
   ```
   This will start the mock backend on `http://localhost:3001`.

3. **Run the Next.js development server**:
   ```bash
   npm run dev
   ```
   The application will run on `http://localhost:3000`.

## Architecture & Folder Structure

The application follows a modular, feature-based architecture to promote scalability and maintainability.

```text
src/
 ├── app/         # Next.js App Router root (pages, layouts)
 ├── components/  # Global reusable UI components (Buttons, Tables, Form inputs)
 ├── modules/     # Feature-based sections (dashboard, students, courses, faculty, reports)
 ├── services/    # API interaction layer using Axios instances
 ├── hooks/       # Custom React hooks (e.g., useFetch, useDebounce)
 ├── lib/         # Third-party library configuration (axios instance, etc.)
 ├── types/       # Global TypeScript definitions
 └── utils/       # Small utility functions (e.g., CSV export, formatters)
```

**Why this structure?**
- **Feature Modules**: Grouping logic, components, and hooks by feature (under `modules/`) makes it easier to work on specific domains without getting distracted by unrelated code. It scales well as the application grows.
- **Separation of Concerns**: `components` handles dumb UI, `services` handles API logic, and `modules` assemble them. This keeps the Next.js `app` folder strictly for routing.
- **Strong Typing**: Keeping `types` at the top level ensures domain models (like `Student`, `Course`) are accessible universally and strictly enforced.

## Scripts
- `npm run dev` - Start Next.js server
- `npm run server` - Start json-server for mock API
- `npm run build` - Build production application
