import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import { resolve } from 'path';
import importMetaUrlPlugin from '@codingame/esbuild-import-meta-url-plugin';

// https://vitejs.dev/config/
export default defineConfig({
    plugins: [react()],
    build: {
        lib: {
            entry: resolve(__dirname, 'src/index.ts'),
            name: 'CodeEditor',
            fileName: (format) => `code-editor.${format === 'es' ? 'js' : 'umd.js'}`,
            formats: ['es', 'umd'],
        },
        rollupOptions: {
            external: ['react', 'react-dom', 'monaco-editor', 'vscode', '@codingame/monaco-vscode-api'],
            output: {
                globals: {
                    react: 'React',
                    'react-dom': 'ReactDOM',
                    'monaco-editor': 'monaco',
                    'vscode': 'vscode'
                },
            },
        },
    },
    optimizeDeps: {
        esbuildOptions: {
            plugins: [
                importMetaUrlPlugin
            ]
        },
        include: [
            'vscode-semver',
            'vscode-textmate',
            'vscode-oniguruma'
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
    },
    css: {
        preprocessorOptions: {
            less: {
                javascriptEnabled: true,
            },
        },
    },
});
