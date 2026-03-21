import { defineConfig } from 'vitest/config'
import react from '@vitejs/plugin-react'
import { geminiAutofillPlugin } from './server/geminiProxy'

export default defineConfig({
  plugins: [react(), geminiAutofillPlugin()],
  test: {
    environment: 'jsdom',
    setupFiles: './src/test/setup.ts',
    css: true,
  },
})
