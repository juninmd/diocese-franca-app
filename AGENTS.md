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
*   Tests reside in `mobile/e2e/`. Run them using the `npx playwright test` command within the `mobile/` directory.
*   Always test against the exported web bundle `npx expo export -p web` running on a local server (e.g., using `npx serve dist -p 3001`).
*   Use `page.screenshot` to keep the visual documentation up to date in `screenshots/`. Make sure to use robust regex locators (e.g. `getByText(/Diocese de Franca/i)`) for texts because React Native Web renders multiline strings in a way that breaks exact text locators.

## 12. App Features & Services

*   **Scraper**: A scraper uses `axios` and `cheerio` to extract the latest Diocese data (`backend/scraper.js`). Updates here must be parsed carefully according to the live DOM. Note: When scraping the website, it uses the class selector `.section_post_left` to accurately fetch news cards and prevent missing content elements reliably from the markup (with a fallback to `.noticia_item` if empty). It extracts title, link, image (with `data-src` fallback, and a placeholder fallback url if no image is present), description (`.post_text p`, cleaning up formatting and extra whitespace, enforcing word-boundary limits for truncations around 150 characters to prevent cut words), and date (from `.event_date`, `.date`, `.post_date`, or extracting date regexes from the h2 text itself as a direct fallback before checking image URLs and descriptions). We rely on robust explicit fallbacks (e.g., extracting from h2 titles, image paths, falling back to `.title`, `h1.title`, or `h2.post_title` directly if the `a` tag is missing, enforcing absolute URLs with `URL()` constructor, trimming spacing inside elements) logging detailed information for debug before triggering fallbacks. HTML entities are correctly decoded using the `html-entities` library to fix quotes, typographer quotes, and ampersands. The scraper uses increased request timeouts (e.g. 25000ms) to maintain stability. A retry loop is built into the initial request to handle intermittent connection failures up to 3 times before returning an empty JSON array fallback. The scraper uses an array of random `User-Agent` strings, as well as `Accept`, `Accept-Language`, and `Referer` headers to look more like a browser request and prevent blocking. It logs response statuses on errors within the retry loop for better debugging. The date extraction fallback logic is now robustly wrapped in `try...catch` blocks to prevent silent parsing failures. Scraper script now runs dynamically when required using `require.main === module` for clean inline execution instead of infinite interval loop.
*   **Web Metro Bundler (Netlify)**: For proper deployment on the web via Metro Bundler (e.g., Netlify), we require `react-native-web`, `react-dom`, and `@expo/metro-runtime` to be installed in the mobile directory. Build configurations reside in the root `netlify.toml` calling `npx expo export -p web`.
*   **Notifications**: We utilize `expo-notifications` for scheduled local notifications like the daily reminder scheduled globally in `App.js` for 8:00 AM, the Angelus reminders scheduled for 12:00 PM and 6:00 PM, contextual prompts like "Agendar Visita" in the paróquias screen (`ChurchDetailScreen.js`), the testing "Lembrete Teste 5s", "Lembrete Bíblia", and "Lembrete Ângelus" shortcuts in `HomeScreen.js`, the "Lembrete de Leitura" within the news cards, "Lembrete Confissão" in `PriestDetailScreen.js`, and mass reminders in `MassesScreen.js`. **Always ensure you check `await Notifications.requestPermissionsAsync()` first before scheduling an event via `Notifications.scheduleNotificationAsync()`** across all components to prevent runtime crashes. For immediate UI interaction feedback (like favoriting a priest/church, reading news, or clearing filters), we exclusively use `useToast()` or handle UI state directly to avoid UX anti-patterns associated with system-level push notifications. However, explicit local notification scheduling is supported and implemented for features like "Lembrete Confissão" and Missa reminders.
*   **UI/UX States**: Keep empty states helpful and empathetic to guide the user (e.g., "Puxa, não conseguimos carregar as igrejas agora. Tente novamente!" instead of "Erro ao carregar"). Changed network errors and empty search states to use empathetic texts, standardizing the "Puxa, ..." prefix across all screens and detailed screens, including the empty state for the news section in HomeScreen.js which is matched exactly by our Playwright E2E tests. Touchables in list components and detail screens should have `activeOpacity={0.8}`. Ensure widths fit well on various screen scales.
*   **Design System (UI v2)**: Tokens em `mobile/src/theme/index.js` (pergaminho `#F5F0E6`, vinho `#7A1E2C`, ouro suave, serifa nos títulos, grade de 4px, alvos de toque >= 44px). Componentes base em `mobile/src/components/ui/` (`Text` com variantes, `Chip`/`Pill`, `Button`/`IconButton`, `EmptyState`, `ArchArt` feito só com `View`, sem SVG) e `FloatingTabBar` (tab bar flutuante com rótulos "Início/Igrejas/Padres/Missas" — os testes E2E dependem desses textos). Nenhuma tela usa header nativo (`headerShown: false`): cada tela desenha o próprio título/botão voltar e usa `useSafeAreaInsets` + ~110px de padding inferior por causa da tab bar. Lembretes passam sempre por `src/services/ReminderService.js` (`scheduleReminder`), que checa a permissão primeiro e, na web, usa timer + `Notification` do navegador (o `expo-notifications` não agenda na web). Use `expo-notifications@~0.32.16` (versão do SDK 54); a linha `57.x` quebra na web. `src/services/api.js` desembrulha o envelope `{ success, data }` do backend para listas e itens por id.
*   **Tipografia**: Newsreader (títulos, `fonts.serif`) + Figtree (interface), via `@expo-google-fonts/*` e `expo-font`, carregadas em `App.js` (a UI só renderiza depois do `useFonts`). Fontes customizadas não têm peso variável: todo texto deve passar por `Text`/`RawText` de `src/components/ui/Text.js` (que usa `withFont` em `src/theme/typography.js` para escolher o arquivo pelo `fontWeight`); nunca importe `Text` direto de `react-native`. `TextInput` deve declarar `fontFamily: fonts.sans`.
*   **Catálogo oficial (sync + de-para)**: `churches.json`, `priests.json` e `masses.json` são **gerados** por `node backend/scripts/syncDiocese.js` (precisa de rede) a partir das páginas oficiais das paróquias em diocesefranca.org.br (`noticia_detalhe` ids 2030–2400 com "Local e Contato"); não edite esses três arquivos à mão. `id` da igreja = id da página no site. O parsing vive em `backend/utils/parishParser.js` (endereço, contatos, clero, secretaria, imagem) e `backend/utils/massParser.js` (converte "Terça a quinta: 7h e 19h" em horários semanais; o que não é semanal — "1ª sexta do mês", capelas, adoração — vai para `massNotes`). Coordenadas são por cidade (`coordinatesPrecision: 'city'`, cache em `data/cityCoords.json`, `coordinatesVerified: false`). Ajustes manuais ficam em `backend/data/depara.json` (por id; campos do de-para vencem, nunca são sobrescritos pelo sync) e `backend/utils/applyDepara.js` também descarta imagens `placeholder.com` (`image: null`). `backend/utils/catalog.js` expõe o catálogo mesclado e é o único ponto que as rotas devem usar. `GET /api/churches/:id` devolve `priest` (pároco) e `clergy` (equipe, sem o bispo). No mobile, `ChurchPhoto` mostra `church.image` (cai no `ArchArt` sem foto/erro) e `ChurchNotes` mostra `massNotes`/`officeHours`.
*   **Nearby Churches / Next Mass**: `backend/utils/geo.js` (Haversine) and `backend/utils/nextMass.js` power `GET /api/churches/nearby` and the `nextMass` field on `GET /api/churches/:id`. On mobile, `src/services/LocationService.js` wraps `expo-location` with a hard 15s timeout on both the permission request and the position read — without it, a browser/webview that never resolves the geolocation prompt hangs the UI forever, since the underlying Geolocation API has no built-in timeout guarantee. Use `expo-location@~19.0.8` (the version pinned in `expo`'s `bundledNativeModules.json` for the installed Expo SDK) rather than its independently-versioned `57.x` line — that line imports `createPermissionHook`/`PermissionStatus` from APIs this SDK's `expo`/`expo-modules-core` don't export, which crashes the web bundle at import time. `src/utils/massTime.js` formats `nextMass`/`distanceKm` into user-facing text and is shared across `ChurchesScreen.js`, `HomeScreen.js`, and `ChurchDetailScreen.js`. Churches carry only city-level `latitude`/`longitude` (`coordinatesVerified: false`) — geocode each address before relying on them for real navigation.

These guidelines are intended to provide a framework for the development of AGENTS.md. Continuous review and adaptation are encouraged to ensure the project remains effective and aligned with evolving needs.
```