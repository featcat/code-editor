import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  optimizeDeps: {
    include: [
      'vscode-semver',
      'vscode-textmate',
      'vscode-oniguruma',
      'monaco-languageclient',
      'vscode-languageclient',
      'vscode-ws-jsonrpc'
    ],
    exclude: [
      'vscode',
      '@codingame/monaco-vscode-api',
      '@codingame/monaco-vscode-editor-api',
      '@codingame/monaco-vscode-configuration-service-override',
      '@codingame/monaco-vscode-editor-service-override',
      '@codingame/monaco-vscode-files-service-override',
      '@codingame/monaco-vscode-groovy-default-extension',
      '@codingame/monaco-vscode-json-default-extension',
      '@codingame/monaco-vscode-keybindings-service-override',
      '@codingame/monaco-vscode-python-default-extension',
      '@codingame/monaco-vscode-textmate-service-override',
      '@codingame/monaco-vscode-theme-defaults-default-extension',
      '@codingame/monaco-vscode-theme-service-override',
      '@codingame/monaco-vscode-language-pack-de',
      '@codingame/monaco-vscode-language-pack-es',
      '@codingame/monaco-vscode-language-pack-fr'
    ]
  }
})
