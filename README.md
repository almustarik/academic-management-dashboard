# Academic Management Dashboard

A modern, comprehensive dashboard for managing academic institutions, built with **Next.js**, **Ant Design**, and **Tailwind CSS**. This project demonstrates a scalable architecture for complex administrative interfaces.

## 🚀 Key Features

- **Dashboard**: High-level overview of academic stats using interactive ApexCharts.
- **Student Management**: Full CRUD operations for student records.
- **Course & Faculty Management**: Organized modules for overseeing academic curriculum and staff.
- **Reporting**: Data-driven insights and analytics.
- **Responsive Design**: Seamless experience across desktop, tablet, and mobile.

## 🛠️ Tech Stack

- **Framework**: [Next.js 16](https://nextjs.org/) (App Router)
- **Language**: [TypeScript](https://www.typescriptlang.org/)
- **UI Components**: [Ant Design (v5)](https://ant.design/)
- **Styling**: [Tailwind CSS](https://tailwindcss.com/)
- **Data Fetching**: [TanStack Query (React Query) v5](https://tanstack.com/query/latest)
- **Forms & Validation**: [React Hook Form](https://react-hook-form.com/) & [Zod](https://zod.dev/)
- **Charts**: [ApexCharts](https://apexcharts.js.org/)
- **Mock Backend**: [json-server](https://github.com/typicode/json-server)

## 🏁 Getting Started

### Prerequisites

- **Node.js**: v18.x or higher
- **npm**: v9.x or higher

### Installation

1.  **Clone the repository**:
    ```bash
    git clone <repository-url>
    cd academic-management-dashboard
    ```
2.  **Install dependencies**:
    ```bash
    npm install
    ```

### Running Locally

This project uses a mock backend with `json-server`. You'll need to run both the server and the frontend.

1.  **Start the Mock API**:
    ```bash
    npm run server
    ```
    This runs the API at `http://localhost:3001`.

2.  **Start the Development App**:
    In a new terminal:
    ```bash
    npm run dev
    ```
    The application will be available at `http://localhost:3000`.

---

## 🏗️ Architecture & Decisions

### 1. Modular Directory Structure
The project follows a **domain-driven modular structure** in `src/modules`. Each feature (e.g., `students`, `courses`) contains its own components and logic. This ensures:
- **Scalability**: New features can be added without bloating existing folders.
- **Maintainability**: Clear separation of concerns between different business domains.

### 2. Hybrid Styling Strategy (Ant Design + Tailwind)
We chose a hybrid approach to UI development:
- **Ant Design**: Used for complex, high-level components (Tables, Modals, Forms, Selects) to ensure a polished, professional look with minimal effort.
- **Tailwind CSS**: Used for layout, spacing, and fine-grained utility adjustments. This provides maximum flexibility without fighting the component library's defaults.
- **Decisions**: Tailwind's `preflight` is managed to avoid conflicts with Ant Design's base styles.

### 3. Server State Management
[TanStack Query](https://tanstack.com/query/latest) is used to manage server state (fetching, caching, synchronization). 
- **Decisions**: Moving data handling away from `useEffect` ensures better performance, automatic re-fetching, and a more declarative data layer.

### 4. Schema-First Validation
Forms are powered by **React Hook Form** and validated using **Zod** schemas. 
- **Decisions**: Centering validation logic in Zod schemas ensures type safety from the UI layer down to the API request.

---

## 📂 Folder Structure

```text
src/
 ├── app/         # Next.js App Router (pages, layouts, global styles)
 ├── components/  # Shared UI components (Layout, Wrappers, etc.)
 ├── hooks/       # Custom React hooks
 ├── lib/         # Third-party configurations (Axios, React Query, AntD Registry)
 ├── modules/     # Feature-specific modules (Logic, Components, Types for each domain)
 ├── services/    # API abstraction layer (Axios instances and request handlers)
 ├── types/       # Global TypeScript definitions
 └── utils/       # Shared utility functions
```
