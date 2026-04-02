# EcoRoute AI

EcoRoute AI is a clean, light-theme civic platform for waste reporting, AI triage, route optimization, worker coordination, and public transparency.

## What is included

- A fresh homepage built from the product design report
- Routed module pages under `/platform/[slug]`
- A working pilot request form backed by `/api/demo`
- A health check endpoint at `/api/health`

## Run locally

```bash
npm install
npm run dev
```

Open `http://localhost:3000`.

## Notes

- Pilot submissions are stored in `data/demo-requests.ndjson` while the app is running locally.
- The site uses a light, premium visual style with a map-first hero and civic operations sections.
