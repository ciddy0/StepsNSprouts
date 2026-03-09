# StepsNSprouts

A gamified mobile wellness app where your real-world steps grow a virtual garden. Walk more, earn **Pomes** (in-app currency), level up your tree, unlock achievements, and decorate your garden with items from the mystery shop.

Built with [Expo](https://expo.dev) and [React Native](https://reactnative.dev) for iOS.

---

## How It Works

1. **Walk** — The app syncs your daily steps via Apple HealthKit (or a fallback for development).
2. **Grow** — Every 10,000 steps contributes one growth level to your tree (6 stages total, from seed to full canopy).
3. **Earn** — Steps convert into **Pomes**, the in-app currency you can spend in the shop.
4. **Decorate** — Buy mystery boxes to win garden decorations, which are auto-placed or manually arranged in your garden's 5 decoration slots.
5. **Achieve** — Hit daily step milestones, accumulate lifetime totals, and maintain streaks to unlock achievements and bonus Pomes.

## Features

**Step Tracking & Syncing** — Integrates with Apple HealthKit for real step data. Automatically syncs every 15 minutes and supports pull-to-refresh. Includes a development/Expo Go fallback with dummy data for testing.

**Virtual Garden** — A pixel-art garden scene with background music, an interactive tree that visually grows through 6 stages, and 5 decoration slots where you place items from your inventory.

**Economy & Shop** — Earn Pomes by walking. Spend them on mystery boxes that award random decorations.

**Achievements** — Tiered achievement system based on daily steps, total steps, and streak length. Each unlock awards bonus Pomes.

**Streaks** — The app tracks consecutive days where you meet your step goal (default 10,000). 

**User Profiles** — Username registration (unique, lowercase), customizable step goals, profile pictures, and optional fields for age/weight/height.

## Tech Stack

| Layer | Technology |
|---|---|
| **Framework** | React Native (Expo) |
| **Language** | TypeScript |
| **Routing** | Expo Router (file-based) |
| **Styling** | NativeWind (Tailwind CSS for React Native) |
| **Backend / DB** | Firebase Firestore |
| **Auth** | Firebase Authentication |
| **Health Data** | Apple HealthKit (via native module) |
| **Audio** | Expo AV |
| **Build Tooling** | Metro Bundler, Babel |

## Project Structure

```
StepsNSprouts/
├── app/                # Screens & routes (Expo Router file-based routing)
├── assets/             # Images, fonts, music, pixel art (tree stages, UI elements)
├── components/         # Reusable UI components (e.g. HamburgerMenu)
├── constants/          # Static data — achievements, shop items, inventory item map
├── context/            # React Context providers (AuthContext, UserDataContext)
├── hooks/              # Custom React hooks
├── scripts/            # Utility and build scripts
├── services/
│   ├── api/            # Firestore service layer
│   │   ├── dailyStepsService.ts   # Step CRUD, syncing, streaks, history
│   │   ├── userService.ts         # User profiles, garden, inventory, achievements
│   │   ├── achievementService.ts  # Achievement resolution & live subscriptions
│   │   └── shopService.ts         # Mystery box purchasing & loot rolls
│   ├── game/           # Game logic (currency conversion, etc.)
│   ├── steps/          # HealthKit integration + dummy fallback
│   └── firebase/       # Firestore config & collection type definitions
├── types/              # Shared TypeScript interfaces
├── utils/              # Helpers (e.g. slot placement logic)
└── package.json
```

## License

This project is open source. See the repository for license details.

## Acknowledgements

- [Expo](https://expo.dev) — Cross-platform React Native framework
- [Firebase](https://firebase.google.com/) — Backend and authentication
- [NativeWind](https://www.nativewind.dev/) — Tailwind CSS for React Native
- [Expo AV](https://docs.expo.dev/versions/latest/sdk/av/) — Audio playback
