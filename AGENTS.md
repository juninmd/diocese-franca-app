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
*   Always test against the exported web bundle `npx expo export -p web` running on a local server.
*   Use `page.screenshot` to keep the visual documentation up to date.

## 12. App Features & Services

*   **Scraper**: A scraper uses `axios` and `cheerio` to extract the latest Diocese data (`backend/scraper.js`). Updates here must be parsed carefully according to the live DOM. Note: When scraping the website, it uses selectors like `.post_text` and `.scale_image_container` to fetch news cards reliably from the markup. It now extracts title, link, image, and the description (first paragraph), and checks against duplicate links before inserting.
*   **Web Metro Bundler**: For proper deployment on the web via Metro Bundler (e.g., Netlify), we require `react-native-web`, `react-dom`, and `@expo/metro-runtime` to be installed in the mobile directory.
*   **Notifications**: We utilize `expo-notifications` for scheduled local notifications (e.g. Mass reminders, daily readings) in `HomeScreen` and `MassesScreen`. Note: We automatically request permission and schedule a repeating daily Liturgy reminder on app mount (`HomeScreen.js`).

These guidelines are intended to provide a framework for the development of AGENTS.md. Continuous review and adaptation are encouraged to ensure the project remains effective and aligned with evolving needs.
```