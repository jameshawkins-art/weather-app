# Weather App

[https://weather-app-jh-2026.web.app/](https://weather-app-jh-2026.web.app/)

# Node Requirements

I only run node locally in my projects, to maintain stricter security measures.  If you dont have node installed you may run the bash script `bash ./setup_node.sh` and this will download a portable Node.js environment with robust security verification. 

> **Note**: This script has only been tested on linux systems

> **Note**: Make sure to `export PATH="$PWD/bin:$PATH"` before executing any node commands in your workspaces shell.

#### Required tools for script integrity and security
"curl" "sha256sum" - `sudo apt install curl sha256sum`
#### Optional tools for cryptographic verification (can be installed separately)
"gpgv" - `sudo apt install gpgv`

#### Node version

You are advised to change these vairables in the script, depending on your needs:
```
VERSION="v22.12.0"
DISTRO="linux-x64"
```
---
<br><br>

# Development Environment

To run this project locally, you will need to install dependencies.

```
npm install
npm run dev
```

Then navigate to `http://localhost:5173/` in your browser.

---
### CI/CD Pipeline

#### 1. `firebase-hosting-pull-request.yml`
* **Trigger:** `on: pull_request` (when you create or update a Pull Request targeting `main`).
* **Code State:** The code **has not** been merged yet.
* **Deploy Target:** Deploys to a **Preview Channel** (a temporary, auto-expiring URL unique to that PR, e.g., `project--pr-1-abcde.web.app`).
* **Purpose:** It lets you see and test your changes live on a secure URL *before* you merge them into production. The action will automatically post a comment on your PR with the link.

#### 2. `firebase-hosting-merge.yml`
* **Trigger:** `on: push` to `main` (when you push directly to `main`, or click the "Merge" button on an approved Pull Request).
* **Code State:** The code is now officially merged into `main`.
* **Deploy Target:** Deploys to the **Live Channel** (your production URLs: `project.web.app` and `project.firebaseapp.com`).
* **Purpose:** It publishes the finalized, approved changes to your live site for users.
---

### Notes

- **Why `VITE_` prefix for env vars?** Vite only exposes env vars prefixed with `VITE_` to client code via `import.meta.env`. This prevents accidentally leaking server-side secrets.
- **Weather stack api limitations:** The default api key will not work, you will need to obtain a free api key from https://weatherstack.com and replace the key in the `.env.development` file.
---
<br><br>

# Project Structure

The structure of the project follows a scalable, feature-based architecture. For example we may want to add google authentication then we would create a new directory `google-auth` inside the `features` directory and add the google authentication components, hooks, and types to that directory.  And also update the `src/features/index.ts` file to export the google authentication components, hooks, and types. 

Another feature which would be quite nice is a calendar. Using google calendar api, to show if any meetings are on a rainy day. This would require more api keys and secrets, which will be obfuscated in our CI/CD pipeline. However we could add a simple note taking feature on the rainy days using local storage. If I have time I will try implement the note taking feature to try an achieve the bonus point for `Innovative use of browser storage or service workers for caching.`

```
Base structure:

src/
├── components/          # Shared/reusable UI components
│   └── ui/              # Atomic UI primitives (Button, Card, Input, Spinner)
├── features/            # Feature modules (each self-contained)
│   └── weather/         # Weather feature
│       ├── components/  # Weather-specific components
│       ├── hooks/       # Weather-specific hooks
│       ├── types/       # Weather-specific TypeScript types
│       └── index.ts     # Public API barrel export
├── hooks/               # Shared custom hooks
├── services/            # API service layer
│   └── api.ts           # Base fetch wrapper
├── types/               # Shared TypeScript types/interfaces
│   └── index.ts
├── utils/               # Utility functions
│   └── index.ts
├── config/              # App configuration
│   └── index.ts         # Environment variables, constants
├── App.tsx
├── main.tsx
└── index.css
```

#### Concepts

Here are the key concepts and patterns used in this project:

* **Barrel Exports** - Using barrel exports to provide a clean and organized way to import components, hooks, types, and services from a feature module. This allows you to import from a feature module without reaching into internal sub-directories. For example we import from `weather` directory instead of `weather/components`, `weather/hooks`, `weather/types`, etc.
* **Feature-Based Architecture** - Organizing the codebase by feature modules rather than by type (e.g. putting all components in one folder, all hooks in another, etc.). This makes it easier to understand, maintain, and scale the codebase as it grows.
* **Single Responsibility Principle** - Each component, hook, and type should have a single responsibility. This makes the codebase easier to understand, maintain, and scale.
* **Config Object pattern** - Using a config object to store all environment variables and constants. This makes it easier to manage and update the configuration. In this specific case we have frozen the config object to prevent it from being modified at runtime. You can review in `src/config/index.ts`. 
---
<br><br>

# Weather Feature

```
src/feature/weather/types/index.ts:
   interface WeatherLocation {
     name: string;
     country: string;
     region: string;
     lat: string;
     lon: string;
     localtime: string;
   }
   interface WeatherCurrent {
     temperature: number;
     weather_descriptions: string[];
     weather_icons: string[];
     wind_speed: number;
     wind_dir: string;
     humidity: number;
     feelslike: number;
     uv_index: number;
     visibility: number;
     pressure: number;
     cloudcover: number;
     precip: number;
   }
   interface WeatherStackResponse {
     request: { type: string; query: string; language: string; unit: string };
     location: WeatherLocation;
     current: WeatherCurrent;
   }
   interface WeatherStackError {
     success: false;
     error: { code: number; type: string; info: string };
   }
   
   type WeatherStackAPIResponse = WeatherStackResponse | WeatherStackError;
```

#### Concepts

* **Type guard** - `isWeatherStackError` is a type guard function that narrows the union type `WeatherStackAPIResponse` to `WeatherStackError` when `success` is `false`. This allows TypeScript to infer the correct type in conditional branches.
* **Discriminated unions** - `WeatherStackAPIResponse` is a discriminated union of `WeatherStackResponse` and `WeatherStackError`.
* **Seperation of concerns** - The service layer knows how to call the API, but components only know what data they need. `src/services/weatherService.ts` is an example of a service having seperation of concerns as you can easly see we can created testable service and allows for us to switch to OpenWeatherMap if we wanted to.
