# AGENTS.md - AI Coding Agent Guidelines

These guidelines are designed to ensure the consistent, efficient, and high-quality development of AGENTS.md. Adherence to these principles is crucial for maintainability, scalability, and overall success of the project.

## 1. DRY (Don't Repeat Yourself)

*   All code within a single file should represent a single, self-contained function or class.
*   Modules should encapsulate reusable logic.
*   Avoid duplicating functionality across multiple files.
*   When a feature requires multiple implementations, consider creating a separate module and extending it.

## 2. KISS (Keep It Simple, Stupid)

*   Strive for simplicity in design and implementation.
*   Minimize complexity in any single component.
*   Prioritize readability and clarity over unnecessary features.
*   Keep code concise and easily understandable.

## 3. SOLID Principles

*   **Single Responsibility Principle:** Each class/module should have one, and only one, reason to change.
*   **Open/Closed Principle:** The system should be extensible without modifying the existing code.
*   **Liskov Substitution Principle:**  Subclasses should be substitutable for their base classes without altering the correctness of the program.
*   **Interface Segregation Principle:**  Clients should not be forced to depend on methods they do not use.
*   **Dependency Inversion Principle:**  High-level modules should not depend on low-level modules; they should depend on abstractions.

## 4. YAGNI (You Aren't Gonna Need It)

*   Avoid adding functionality that is not currently required.
*   Only implement features when they are explicitly identified and validated.
*   Refactor code to eliminate unnecessary complexity and assumptions.

## 5. Code Structure & File Organization

*   **File Size Limit:** Each file should be less than 180 lines of code.
*   **Modularization:** Divide the codebase into logical modules (e.g., Data, Logic, Utility).
*   **Naming Conventions:**  Use descriptive and consistent naming conventions (e.g., camelCase for functions, PascalCase for classes).
*   **Comments:**  Provide clear and concise comments where necessary to explain logic, assumptions, or edge cases.  Comments should enhance, not replace, code.
*   **Documentation:**  Include a brief README file explaining the purpose of each module and its key functions.

## 6. Testing & Assurance

*   All development must be productive.  Do not use mocks or fake implementations.
*   **Unit Tests:** Focus on writing unit tests that cover the core functionality of each module and class. Aim for 80% test coverage.
*   **Integration Tests:**  Test the interaction between different modules.
*   **End-to-End Tests:**  Simulate real user scenarios to verify the system's behavior.

## 7. Specific Guidelines for AGENTS.md

*   **Data Management:**  Define clear data structures and models for all relevant data.
*   **Agent Management:**  Implement robust agent management mechanisms for storage, retrieval, and security.
*   **Communication Protocols:**  Specify the communication protocols and data formats used by agents.
*   **Security:**  Implement security measures to protect the system from unauthorized access.
*   **Error Handling:**  Define a consistent error handling strategy.
*   **Logging:**  Implement comprehensive logging to aid in debugging and monitoring.

## 8. Code Style & Formatting

*   Use a consistent code formatter (e.g., Prettier, Black).
*   Follow a specific code style guide (e.g., Google Style).
*   Use indentation consistently.
*   Avoid unnecessary whitespace.

## 9. Maintainability & Readability

*   Write clean, well-structured code that is easy to understand.
*   Use meaningful variable and function names.
*   Follow established coding conventions.
*   Include documentation for critical code sections.

## 10. Dependencies

*   Clearly document all dependencies used in each module.
*   Keep dependencies up-to-date to minimize security risks.
*   Manage dependencies effectively to ensure stability and repeatability.

## 11. Playwright E2E Testing

*   All mobile web deployments must have coverage with Playwright.
*   Tests reside in `mobile/e2e/`. Run them using the `npx playwright test` command within the `mobile/` directory.
*   Always test against the exported web bundle `npx expo export -p web` running on a local server (e.g., using `npx serve dist -p 3001`).
*   Use `page.screenshot` to keep the visual documentation up to date in `screenshots/`. Make sure to use robust regex locators (e.g. `getByText(/Diocese de Franca/i)`) for texts because React Native Web renders multiline strings in a way that breaks exact text locators.

## 12. App Features & Services

*   **Scraper**: An enhanced autonomous scraper (`backend/scraper.js`) uses `axios`, `cheerio`, and `html-entities` to extract news highlights, parishes, priests (including the diocesan bishop), and mass schedules directly from `https://diocesefranca.org.br/`.
    - Functionality is exported as `scrapeNews`, `scrapeCatalog`, and `scrapeAll`. Executing `node backend/scraper.js` runs a full scrape of news, 40 parishes, 93 priests/deacons (with individual splitting for deacons/clergy), and 231 mass schedules.
    - Features exponential retry backoff, random User-Agent headers, HTML entity decoding, name normalization, de-para override merging, and fallback file preserving to guarantee stability.
*   **Web Metro Bundler (Netlify)**: For proper deployment on the web via Metro Bundler (e.g., Netlify), we require `react-native-web`, `react-dom`, and `@expo/metro-runtime` to be installed in the mobile directory. Build configurations reside in the root `netlify.toml` calling `npx expo export -p web`.
*   **Notifications**: We utilize `expo-notifications` for scheduled local notifications like the daily reminder scheduled globally in `App.js` for 8:00 AM, the Angelus reminders scheduled for 12:00 PM and 6:00 PM, contextual prompts like "Agendar Visita" in the paróquias screen (`ChurchDetailScreen.js`), testing shortcuts in `HomeScreen.js`, "Lembrete de Leitura" in news cards, "Lembrete Confissão" in `PriestDetailScreen.js`, and mass reminders in `MassesScreen.js`. **Always ensure you check `await Notifications.requestPermissionsAsync()` first before scheduling an event via `Notifications.scheduleNotificationAsync()`** across all components to prevent runtime crashes.
*   **UI/UX States**: Keep empty states helpful and empathetic to guide the user (e.g., "Puxa, não conseguimos carregar as igrejas agora. Tente novamente!" instead of "Erro ao carregar"). Touchables in list components and detail screens should have `activeOpacity={0.8}`.
*   **Design System (UI v2)**: Tokens in `mobile/src/theme/index.js` (parchment `#F5F0E6`, wine `#7A1E2C`, soft gold, serif headings, 4px grid, touch targets >= 44px).
*   **Nearby Churches / Next Mass**: `backend/utils/geo.js` (Haversine) and `backend/utils/nextMass.js` power `GET /api/churches/nearby` and the `nextMass` field on `GET /api/churches/:id`.
