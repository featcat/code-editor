import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import path from 'path'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  optimizeDeps: {
    exclude: ['@huaanhuang/code-editor', 'vscode'],
    include: ['vscode-semver', 'vscode-textmate', 'vscode-oniguruma']
  },
  resolve: {
    alias: [
      { find: /^vscode$/, replacement: path.resolve(__dirname, 'public/vscode-shim.js') },
      { find: /^vscode-semver(\/.*)?$/, replacement: 'vscode-semver' }
    ]
  },
  server: {
    fs: {
      // Allow serving files from component package's node_modules
      allow: [
        '..',
        '../..',
        '../../node_modules'
      ]
    },
    hmr: {
      overlay: false  // Disable error overlay
    }
  }
})
