// This file provides TypeScript declarations for the 'firebase/auth/react-native' module.
// Needed as Firebase SDK does not include these types by default.

declare module 'firebase/auth/react-native' {
  import type { Persistence } from 'firebase/auth';

  // This is provided by the Firebase SDK at runtime. We declare it for TS.
  export function getReactNativePersistence(storage: {
    getItem: (key: string) => Promise<string | null>;
    setItem: (key: string, value: string) => Promise<void>;
    removeItem: (key: string) => Promise<void>;
  }): Persistence;

  export * from 'firebase/auth';
}
