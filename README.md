# Kanban Task Manager — Frontend

This repository contains the React + TypeScript frontend for the Kanban Task Manager application.
It is built with Vite, Apollo Client for GraphQL, Tailwind CSS for styling, and React Router for navigation.

## Features

- User authentication with login and registration
- Protected routes and authenticated session restoration
- Kanban board with tasks organized by status
- Task create, edit, delete, and move operations
- Responsive layout with mobile-friendly navigation
- Profile page and account details
- Theme-aware styling using custom CSS variables and Tailwind tokens

## Tech Stack

- React 19
- TypeScript
- Vite
- Tailwind CSS
- Apollo Client
- GraphQL
- React Router
- Lucide icons
- dnd-kit for drag-and-drop task cards

## Getting Started

### Prerequisites

- Node.js 18+ or compatible version
- Backend GraphQL server running and accessible

### Install dependencies

```bash
cd frontend
npm install
```

### Environment

Create a `.env` file in the `frontend` folder with the GraphQL endpoint:

```env
VITE_GRAPHQL_URL=http://localhost:4000/graphql
```

### Development

```bash
npm run dev
```

Open the app at the displayed local address.

### Build for production

```bash
npm run build
```

### Preview production build

```bash
npm run preview
```

### Codegen

Generate GraphQL types and documents:

```bash
npm run codegen
```

### Lint

```bash
npm run lint
```

## Project Structure

- `src/main.tsx` — app entrypoint with Apollo and auth providers
- `src/App.tsx` — top-level app container
- `src/routes/AppRoutes.tsx` — route definitions and protected routing
- `src/context/AuthProvider.tsx` — authentication state and session restore
- `src/hooks/useAuth.ts` — auth hook wrapper
- `src/gql/graphql.ts` — generated GraphQL types and documents
- `src/apollo/client.ts` — Apollo client setup
- `src/components/layout` — layouts and navbar
- `src/components/task` — task cards and forms
- `src/components/common` — shared UI components like buttons
- `src/pages/auth` — login, register, profile pages
- `src/pages/boards` — kanban board page
- `src/pages/dashboard` — dashboard overview page
- `src/pages/manager` — manager-specific page
- `src/theme.css` — custom theme tokens and colors

## Authentication and Dashboard Notes

- The frontend stores auth tokens in `localStorage`.
- `AuthProvider` loads current user data using the `Me` query.
- The dashboard page requires authentication and will skip its data query until auth status is resolved.
- If dashboard data does not load, confirm the backend is running and `VITE_GRAPHQL_URL` is set correctly.

## Styling

- Uses Tailwind CSS with extended theme colors in `tailwind.config.js`
- Uses CSS custom properties from `src/theme.css`
- Components are built with rounded cards, soft shadows, and a light neutral palette

## Notes

- The frontend is designed to connect to a GraphQL backend.
- Make sure the backend accepts authenticated requests and returns `boards` and `tasks` fields.
- The app currently uses a `TaskConnection` shape for tasks and expects paginated data on the board.

## Backend and Evaluation Notes

- Dashboard data requires authentication before the frontend query runs.
- Confirm `AuthProvider` restores the session and token before protected page queries execute.
- Verify the backend schema for:
  - `boards { id name tasks { id status } }`
  - `tasks { data { id title status } total page limit totalPages }`
  - `me { id name email role }`
- Ensure the backend supports the authenticated mutations used by the app:
  - `createTask`
  - `updateTask`
  - `updateTaskStatus`
  - `deleteTask`
- Use shared components for repeated UI patterns like buttons and nav items.
- Keep light-mode styling consistent and avoid overly dark surfaces on auth pages.
- Team lead review checklist:
  - authenticated route protection
  - dashboard data loading
  - kanban board task CRUD and movement
  - responsive layout and consistent theme

