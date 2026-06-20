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
* **Custom hook** - `useWeather` is a custom hook that encapsulates the logic for fetching and managing weather data. It uses `useState`, `useEffect`, and `useCallback` to manage the state of the weather data, loading state, and error state.
---
<br><br>

# Core UI Components (Atomic Design)

#### Concepts

* **Atomic Design** - "Atomic Design" is a methodology for creating design systems and component libraries, popularized by Brad Frost. Here are our Weather Apps core components:  
    * **Card**: A presentational container styled with a glassmorphic look (rounded corners, subtle border, semi-transparent background) that wraps content like a card. It's a presentational component that accepts `children` and `className` props, with a default glassmorphic style that can be customized via the `className` prop.
    * **Input**: A controlled text input component that accepts a value prop and onChange handler, with built-in support for submission via the Enter key. It also includes client-side debouncing to limit the rate of submission events. We extend `React.InputHTMLAttributes<HTMLInputElement>` so that we can expose HTML properties like placeholder, disabled, aria-label, etc.
    * **Spinner**: A presentational component that displays a loading spinner (a spinning circle) using CSS animations, with support for a `size` prop to control its dimensions. 
    * **ErrorMessage**: A presentational component that displays an error message with an optional retry button, using a simple card layout with error-themed styling (red/orange tint, warning icon).
* **Classname merger utility** - Using a classname merger utility allows for us to combine classnames in a type-safe manner. This only works for **Conditional Classes**, later we may add tailwind-merge to resolve any **Tailwind Class Conflicts**.
```
import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

export function cn(...inputs: ClassValue[]): string {
  return twMerge(clsx(inputs));
}
```
* **No icon library** - Im a big fan of SVG icons, In previous projects which use a Go webserver to render HTML I have built my own utility around SVG to handle customising stroke/fill colours, stroke-width, etc. I do understand the trad-offs between using libraries like react-icons and which shifts your dependancy to the library which means faster developer velocity, easier to maintain and readable.  However I am still a fan of SVG and just think they are lovely piece of tech to work with.


    