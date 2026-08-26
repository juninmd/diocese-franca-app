```markdown
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

## 8.  Code Style & Formatting

*   Use a consistent code formatter (e.g., Prettier, Black).
*   Follow a specific code style guide (e.g., Google Style).
*   Use indentation consistently.
*   Avoid unnecessary whitespace.

## 9.  Maintainability & Readability

*   Write clean, well-structured code that is easy to understand.
*   Use meaningful variable and function names.
*   Follow established coding conventions.
*   Include documentation for critical code sections.

## 10.  Dependencies

*   Clearly document all dependencies used in each module.
*   Keep dependencies up-to-date to minimize security risks.
*   Manage dependencies effectively to ensure stability and repeatability.

## 11. Playwright E2E Testing

*   All mobile web deployments must have coverage with Playwright.
*   Tests reside in `mobile/e2e/`.
*   Always test against the exported web bundle `npx expo export -p web` running on a local server (e.g., using `npx serve dist -p 3001`).
*   Use `page.screenshot` to keep the visual documentation up to date in `screenshots/`. Make sure to configure exact matches for text locators (`getByText(..., { exact: true })`) to avoid strict mode violations.

## 12. App Features & Services

*   **Scraper**: A scraper uses `axios` and `cheerio` to extract the latest Diocese data (`backend/scraper.js`). Updates here must be parsed carefully according to the live DOM. Note: When scraping the website, it uses the class selector `.section_post_left` to accurately fetch news cards and prevent missing content elements reliably from the markup. It extracts title, link, image, description (`.post_text p`), and date (`.event_date`), checking against duplicate links before inserting. We rely on robust explicit fallbacks (e.g., extracting from image paths, enforcing absolute URLs with `URL()` constructor, trimming spacing inside elements) and increased request timeouts (e.g. 15000ms) to maintain stability. Scraper script now runs dynamically when required using `require.main === module` for clean inline execution instead of infinite interval loop.
*   **Web Metro Bundler (Netlify)**: For proper deployment on the web via Metro Bundler (e.g., Netlify), we require `react-native-web`, `react-dom`, and `@expo/metro-runtime` to be installed in the mobile directory. Build configurations reside in the root `netlify.toml` calling `npx expo export -p web`.
*   **Notifications**: We utilize `expo-notifications` for scheduled local notifications in `App.js`, `HomeScreen.js`, `MassesScreen.js`, `PriestsScreen.js`, `ChurchesScreen.js`, `ChurchDetailScreen.js`, and `PriestDetailScreen.js`. We offer individual tap-to-remind icon buttons (e.g., Agendar Visita, Lembrete Confissão) and feedback upon favoriting entities. The daily reminder is globally scheduled in `App.js` for 8:00 AM. `HomeScreen.js` provides a testing "Lembrete Teste 5s" shortcut. The triggers should provide fast feedback (e.g., 2 seconds, or 5 seconds for test).
*   **UI/UX States**: Keep empty states helpful and empathetic to guide the user (e.g., "Puxa, não conseguimos carregar as igrejas agora. Tente novamente!" instead of "Erro ao carregar"). Changed network errors to use empathetic texts, standardizing the "Puxa, não conseguimos carregar..." prefix across all screens. Ensure widths fit well on various screen scales.
*   **Nearby Churches / Next Mass**: `backend/utils/geo.js` (Haversine) and `backend/utils/nextMass.js` power `GET /api/churches/nearby` and the `nextMass` field on `GET /api/churches/:id`. On mobile, `src/services/LocationService.js` wraps `expo-location` with a hard 15s timeout on both the permission request and the position read — without it, a browser/webview that never resolves the geolocation prompt hangs the UI forever, since the underlying Geolocation API has no built-in timeout guarantee. Use `expo-location@~19.0.8` (the version pinned in `expo`'s `bundledNativeModules.json` for the installed Expo SDK) rather than its independently-versioned `57.x` line — that line imports `createPermissionHook`/`PermissionStatus` from APIs this SDK's `expo`/`expo-modules-core` don't export, which crashes the web bundle at import time. `src/utils/massTime.js` formats `nextMass`/`distanceKm` into user-facing text and is shared across `ChurchesScreen.js`, `HomeScreen.js`, and `ChurchDetailScreen.js`. The four seed churches in `backend/data/churches.json` carry approximate `latitude`/`longitude` (`coordinatesVerified: false`) since this data was never geocoded against a real service — re-geocode before relying on them for real navigation.

These guidelines are intended to provide a framework for the development of AGENTS.md. Continuous review and adaptation are encouraged to ensure the project remains effective and aligned with evolving needs.
```