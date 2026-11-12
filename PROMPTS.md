# Project Prompts & Development History

This document collates all user prompts used in the development of the **ParkSG** (CargoWhere) application.

---

### Prompt 1: Initial Application Build
**Date / Phase**: Turn 1

```text
build a singapore based carpark application that tracks real time carpark lots availability. build just the frontend for now, I will integrate the backend later
```

**Scope Delivered**:
- Real-time lot availability engine for Cars (C), Motorcycles (Y), and Heavy Vehicles (H) across Singapore (HDB, URA, LTA, and major commercial shopping malls).
- Interactive Leaflet map with colored vacancy pins and region navigation.
- GPS and Singapore landmark origin selector with Haversine distance calculator.
- Advanced filtering (Agency, Vehicle Type, Gantry Clearance, EV charging, Sunday free parking, Night parking).
- Carpark detail drawer with 24-hour rush hour occupancy trends.
- Singapore parking fee calculator.
- Bookmarking and saved carparks with `localStorage` persistence.
- Decoupled API architecture and developer specifications.

---

### Prompt 2: GitHub Repository Setup & Push
**Date / Phase**: Turn 2

```text
Git push https://<GITHUB_PAT>@github.com/pk0303/cargowhere.git
```

**Scope Delivered**:
- Initialized Git repository, configured safe directory permissions.
- Committed full initial codebase with 22 source files.
- Added remote origin and pushed to `main` branch on `https://github.com/pk0303/cargowhere.git`.

---

### Prompt 3: Serverless LTA DataMall Integration
**Date / Phase**: Turn 3

```text
1. add a serverless connection that pulls live data from LTA's datamall using the following endpoint: 

# Live carpark lots (HDB, LTA and URA):
https://datamall2.mytransport.sg/ltaodataservice/CarParkAvailabilityv2

# Every request needs the header:  AccountKey: <LTA_ACCOUNT_KEY>

2. store this in /api folder at project root level (not the src file)

3. include /health.ts and /carparkavailability.ts within the same sub folder 
4. do not hardcode any key, I will input them later
```

**Scope Delivered**:
- Created `/api/carparkavailability.ts` at root level proxying LTA's `CarParkAvailabilityv2` API.
- Created `/api/health.ts` for monitoring serverless endpoint health and checking `LTA_ACCOUNT_KEY` status.
- Zero hardcoded keys: pulls dynamically from `process.env.LTA_ACCOUNT_KEY` or request headers (`AccountKey` / `x-account-key`), returning a helpful `401 Unauthorized` if missing.
- Updated `server.ts` and `package.json` to mount `/api` routes in local development and production.
- Added an interactive Live Serverless Tester in the app UI.
- Pushed updates to GitHub repository.

---

### Prompt 4: Prompt Collation
**Date / Phase**: Turn 4

```text
collate all of the prompts and store them as a PROMPTS.md file
```

**Scope Delivered**:
- Created `PROMPTS.md` documenting all project requirements, chronologically indexed with prompt text and implementation summaries.
