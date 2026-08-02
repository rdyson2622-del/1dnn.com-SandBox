import react from '@vitejs/plugin-react'
import { defineConfig } from 'vite'
import { fileURLToPath, URL } from 'node:url'
import { existsSync, rmSync } from 'node:fs'

const cloudflareMediaPlugin = {
  name: 'exclude-cloudflare-hosted-media',
  closeBundle() {
    const cloudHostedMasters = [
      './dist/assets/dnn-broadcast-4k.mp4',
      './dist/assets/move-story.mp4',
    ];
    for (const asset of cloudHostedMasters) {
      const duplicatedVideo = fileURLToPath(new URL(asset, import.meta.url));
      if (existsSync(duplicatedVideo)) rmSync(duplicatedVideo);
    }
  },
};

// https://vite.dev/config/
export default defineConfig({
  logLevel: 'error', // Suppress warnings, only show errors
  server: {
    // Allow Cloudflare's rotating review URLs used for remote mobile testing.
    allowedHosts: ['.trycloudflare.com'],
  },
  resolve: {
    alias: {
      '@': fileURLToPath(new URL('./src', import.meta.url)),
    },
  },
  plugins: [
    react(),
    cloudflareMediaPlugin,
  ]
});
