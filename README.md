# React + TypeScript + Vite

This template provides a minimal setup to get React working in Vite with HMR and some ESLint rules.

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

# Development Environment

To run this project locally, you will need to install dependencies.

```
npm install
npm run dev
```

Then navigate to `http://localhost:5173/` in your browser.

# Notes

- **Why `VITE_` prefix for env vars?** Vite only exposes env vars prefixed with `VITE_` to client code via `import.meta.env`. This prevents accidentally leaking server-side secrets.
- **Weather stack api limitations:** The default api key will not work, you will need to obtain a free api key from https://weatherstack.com and replace the key in the `.env.development` file.
