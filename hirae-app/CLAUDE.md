# Hirae — Project Context

## What this app is

Hirae is a mobile app that turns real-world walking into a fog-of-war exploration game. The map renders desaturated (grayscale) by default; walking through an area reveals it in full color, permanently. Over time the user builds a personal, colored-in map of everywhere they've physically been.

Core loop: **walk → reveal → capture landmarks → look back on it in the journal.**

Full feature spec lives in `docs/DESIGN.md` — read it before implementing any feature. It covers the reveal mechanic, scope selector, session detection pipeline, journal, landmarks, field notes, and profile, plus open questions and deferred scope.

## Current state

The project is scaffolded and building successfully on Android. Completed so far:

- Expo project created (`hirae-app`), SDK 57, expo-router with typed routes
- `@rnmapbox/maps` installed and configured via `app.config.js` plugin
- `expo-location` installed (native rebuild still needed for it to link)
- Native folders generated via `npx expo prebuild`
- Android build working on emulator (`npx expo run:android`)
- Environment: Windows, JDK 17 (Temurin), Android Studio SDK, `JAVA_HOME` and `ANDROID_HOME` set

**Nothing app-specific has been written yet.** The app currently shows the default Expo template screens. No map code, no location code, no Supabase.

## Environment and secrets

- `.env.local` holds `EXPO_PUBLIC_MAPBOX_TOKEN` (public, `pk.`) and `RNMAPBOX_MAPS_DOWNLOAD_TOKEN` (secret, `sk.`, build-time only)
- `.env.local` and `.npmrc` are gitignored — never commit tokens, never hardcode them in source
- Access the public token in code as `process.env.EXPO_PUBLIC_MAPBOX_TOKEN`
- Supabase is planned but not yet set up

## Platform constraints

- Developing on **Windows** — iOS cannot be built locally (no Xcode). Android emulator is the dev target.
- iOS builds will happen later via EAS cloud build. Keep all code cross-platform; do not write Android-only solutions without flagging it.
- Native module changes require a full `npx expo run:android` rebuild (slow, ~10 min). JS-only changes hot reload.

## Tech stack

- **Framework**: Expo (SDK 57) / React Native 0.86, TypeScript
- **Routing**: expo-router (file-based, typed routes enabled). Routes live under `src/app/`
- **Map**: `@rnmapbox/maps`, plus Mapbox Geocoding API for reverse geocoding
- **Geometry**: turf.js (not yet installed) — for buffering GPS points and unioning visited-area polygons
- **Location**: `expo-location`, including background location (planned)
- **Camera**: `expo-camera` (not yet installed) — for landmark capture
- **Notifications**: `expo-notifications` (not yet installed) — for field-note proximity alerts
- **Backend**: Supabase (not yet set up), anonymous device-ID-based users, no full auth
- **Build**: EAS Build for installable builds

## Immediate task

Get a live Mapbox map rendering, centered on the user's current location:

1. Rebuild so `expo-location` links natively
2. Create a map screen under `src/app/`
3. Initialize Mapbox with the public access token from env
4. Request **foreground** location permission (background permission is a separate, later task — it needs its own "Always Allow" flow on iOS and deserves explicit handling)
5. Get current position and center the map camera on it

Success = app opens to a live Mapbox map centered on the emulator's simulated location, with permission granted.

## Design conventions

Visual direction is locked and designed in Figma. Key tokens and rules:

- **Palette**: warm cream background (`#F7F4EA` / `#F4F3EC`), sage green primary (`#5F7052` / `#64735A`), muted terracotta accent (`#C97B6D` / `#C9603A`), soft borders (`#E9E3D6` / `#DDD6C4`), muted text (`#A79E8E` / `#8B9080`), dark text (`#3A3F33`)
- **Borders over shadows** — use hairline borders for card edges, not drop shadows
- **Rounded corners** throughout, generous whitespace
- **Custom line icons**, not default system icon sets
- Session indicator on the map reads **"Wandering · 12 min"** with a small pulsing dot, not "Session active"
- Adventures that include a discovered landmark are marked with a small circular seal motif
- The map's own style should eventually be custom, not the stock Mapbox street style

## Working style

- Explain what you're doing and why as you go — I'm learning this stack, not just shipping it.
- Ask before installing new native dependencies, since each one costs a ~10 minute rebuild.
- Prefer small, verifiable steps over large multi-file changes.
- If something in `docs/DESIGN.md` is ambiguous or conflicts with what I've asked for, flag it rather than guessing.
- Don't implement deferred/future-scope features (photo import, Strava import, friends system, points system) unless I explicitly ask.
