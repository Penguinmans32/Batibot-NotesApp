/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_BLOCKFROST_PROJECT_ID: string;
  // add more env variables here as needed
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}

// Cardano wallet types
declare global {
  interface Window {
    cardano?: {
      [key: string]: {
        enable(): Promise<any>;
        isEnabled(): Promise<boolean>;
        apiVersion: string;
        name: string;
        icon: string;
      };
    };
  }
}

export {};