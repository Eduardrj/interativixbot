# AI Development Rules for Interativix-bot

This document outlines the technical stack and development guidelines for the Interativix-bot application. Adhering to these rules ensures consistency, maintainability, and simplicity in the codebase.

## Tech Stack Overview

The application is built with a modern, lightweight tech stack:

-   **Framework:** React 19 with TypeScript.
-   **Build Tool:** Vite for fast development and optimized builds.
-   **Styling:** Tailwind CSS for all styling, configured via a CDN script in `index.html`.
-   **UI Components:** A mix of custom components with a strong mandate to use `shadcn/ui` for all new elements.
-   **Icons:** `lucide-react` is the designated icon library.
-   **Charts & Data Visualization:** `recharts` is used for creating charts in the dashboard and reports.
-   **AI Integration:** The `@google/genai` SDK is used for communicating with the Gemini API via a serverless function.
-   **Routing:** A simple, custom state-based routing mechanism is implemented in `App.tsx`.
-   **State Management:** State is managed locally with React Hooks (`useState`, `useEffect`).

## Library and Pattern Usage Rules

### 1. UI Components: Use `shadcn/ui`

-   **Rule:** For any new UI element (Buttons, Modals, Forms, Tables, Cards, etc.), you **MUST** use components from the `shadcn/ui` library.
-   **Reasoning:** This maintains visual consistency, ensures accessibility, and speeds up development. The components are already available in the project.
-   **Example:** Instead of creating a custom button, import and use `<Button>` from the UI library.

### 2. Styling: Tailwind CSS Only

-   **Rule:** All styling **MUST** be done using Tailwind CSS utility classes. Do not write custom CSS files or use inline `style` objects.
-   **Reasoning:** Keeps styling consistent and co-located with the component markup, following the project's established pattern.

### 3. Icons: `lucide-react` Only

-   **Rule:** All icons **MUST** come from the `lucide-react` package. Do not add new raw SVGs to `constants.tsx` or any other file.
-   **Reasoning:** `lucide-react` provides a comprehensive and consistent set of high-quality, tree-shakable icons.

### 4. State Management: Keep it Simple

-   **Rule:** Use standard React Hooks (`useState`, `useEffect`, `useContext`) for state management. Do not introduce external state management libraries like Redux, Zustand, or MobX.
-   **Reasoning:** The application's complexity does not yet warrant a heavy state management solution. React's built-in tools are sufficient.

### 5. Routing: Use the Existing System

-   **Rule:** The app uses a state-based router in `App.tsx`. All page navigation **MUST** follow this existing pattern. Do not install or use `react-router-dom` or any other routing library.
-   **Reasoning:** To maintain the simplicity of the current architecture.

### 6. Charts: Use `recharts`

-   **Rule:** All data visualizations and charts **MUST** be created using the `recharts` library.
-   **Reasoning:** It is the established charting library for this project, as seen in the Dashboard and Reports components.

### 7. API Calls: Use `fetch`

-   **Rule:** Use the browser's native `fetch` API for all HTTP requests. Do not add libraries like `axios`.
-   **Reasoning:** `fetch` is powerful enough for the current needs and avoids adding an unnecessary dependency.