# IdeaSwipe - Enterprise Documentation

## 1. Project Overview

**IdeaSwipe** is a Progressive Web Application (PWA) designed to facilitate the discovery and validation of startup ideas through a "swipe-based" interface. It leverages a client-side architecture with simulated persistence and AI-based content moderation.

### Key Features
*   **Swipe Interface**: Tinder-like UI for approving/disapproving ideas.
*   **AI Moderation**: Integration with OpenRouter/OpenAI to filter PII and non-compliant content.
*   **Role-Based Access Control (RBAC)**: Distinct flows for Users and Administrators.
*   **PWA Support**: Installable on mobile devices with offline capabilities.
*   **Analytics Dashboard**: Admin view for user engagement metrics.

---

## 2. Technical Architecture

### Tech Stack
*   **Frontend Framework**: React 19 (via ESM imports).
*   **Styling**: Tailwind CSS (Utility-first) + CSS Variables for OKLCH theming.
*   **State Management**: React Hooks (`useState`, `useEffect`) + LocalStorage API.
*   **Persistence Layer**: `StorageService` (Abstraction over `window.localStorage` simulating a RESTful backend).
*   **AI Service**: `AIService` (Proxy to OpenRouter API).

### Data Model
*   **User**: `id`, `name`, `email`, `role` (user/admin).
*   **Idea**: `id`, `content`, `status` (pending/approved/rejected), `likes`, `dislikes`.
*   **Interaction**: `userId`, `ideaId`, `type`, `timestamp`.

---

## 3. Setup & Installation

### Prerequisites
*   Node.js v18+
*   npm or yarn

### Installation
1.  Clone the repository.
2.  Install dependencies:
    ```bash
    npm install
    ```
3.  Start the development server:
    ```bash
    npm start
    ```

### Environment Configuration
The application allows runtime configuration via the Admin Dashboard.
*   **OpenRouter API Key**: Required for live AI moderation. (Defaults to mock if empty).
*   **Max Ideas Limit**: Configurable limit per user.

---

## 4. Administrative Access

The application comes seeded with a Super Admin account.

*   **Email**: `admin@ideaswipe.com`
*   **Password**: `password123`

**Admin Capabilities:**
1.  View system-wide statistics (Users, Ideas, Engagement).
2.  Manage Users (Delete/Ban).
3.  Configure API Keys and System Limits.

---

## 5. Testing Strategy

The project utilizes **Playwright** for End-to-End (E2E) testing. This ensures critical user flows function correctly across different browsers.

### Running Tests
To execute the test suite:

```bash
# Run all tests in headless mode
npm test

# Run tests with UI mode
npx playwright test --ui
```

### Test Coverage
1.  **Authentication**: Signup, Login, Logout, Session Persistence.
2.  **Idea Lifecycle**: Creation, Validation (Client-side), AI Review simulation, Deletion.
3.  **Feed Interaction**: Swiping, Voting, Statistic updates.
4.  **Admin Controls**: Dashboard access, User management.

---

## 6. Deployment

The application is built to be hosted on any static site provider (Vercel, Netlify, S3).

**Build Command:**
```bash
npm run build
```

**Output Directory:**
`dist/`

### Docker Deployment
The application can be containerized using the provided `Dockerfile`.

**Build Image:**
```bash
docker build -t ideaswipe .
```

**Run Container:**
```bash
docker run -d -p 8080:80 --name ideaswipe-app ideaswipe
```
Access at `http://localhost:8080`.


---

## 7. Security Considerations

*   **Data Persistence**: Currently uses `localStorage`. For true production use, swap `services/storageService.ts` with a secure API client.
*   **API Keys**: Keys entered in the Admin Dashboard are stored locally in the browser. Clear browser cache to reset.
