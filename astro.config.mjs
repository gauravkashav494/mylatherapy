import { defineConfig } from 'astro/config';
import react from '@astrojs/react';
import vercel from '@astrojs/vercel/serverless';

// https://astro.build/config
// Hybrid: every page is prerendered/static by default (unchanged from before);
// only the quiz API routes opt into SSR via `export const prerender = false`.
export default defineConfig({
  output: 'hybrid',
  adapter: vercel(),
  integrations: [react()],
  devToolbar: { enabled: false },
});
