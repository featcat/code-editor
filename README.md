# Code Editor

[![npm version](https://img.shields.io/npm/v/@huaanhuang/code-editor.svg)](https://www.npmjs.com/package/@huaanhuang/code-editor)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.2-blue.svg)](https://www.typescriptlang.org/)

A powerful React component wrapping Monaco Editor with Language Server Protocol (LSP) support and code execution capabilities. Built on top of VSCode's Monaco Editor with full TypeScript support and a modern, premium UI.

## ✨ Features

- 🎨 **Monaco Editor Integration** - Full-featured code editor with VSCode UI
- 🔌 **LSP Support** - Language Server Protocol integration via WebSocket with authorization support
- 🚀 **Code Execution** - Built-in code runner with streaming output support and custom authorization
- 🌍 **Multi-language** - JavaScript, TypeScript, Python, Go, Rust, JSON, and more
- 🎯 **TypeScript** - Full type definitions included
- 🎭 **Modern UI** - Dark and light themes with custom-built controls
- 🔐 **Secure** - Built-in authorization support for LSP and runner endpoints
- 📦 **Simple API** - Clean, straightforward props interface
- ♿ **Accessible** - Built with accessibility in mind
- 📱 **Responsive** - Adapts to container size automatically
- 🎛️ **Language Switcher** - Built-in language selector with smooth transitions

## 📦 Installation

```bash
npm install @huaanhuang/code-editor
```

### Peer Dependencies

This package requires React 18.2.0 or higher:

```bash
npm install react react-dom
```

> [!IMPORTANT]
> **Zero Dependencies**: This package has **no UI framework dependencies** (除了 React). We removed Ant Design in v1.0.3 to reduce bundle size and eliminate peer dependency conflicts.

## ⚠️ Breaking Changes from v1.0.2

If you're upgrading from v1.0.2 or earlier, please note the following breaking changes:

### API Refactoring

The component API has been completely refactored from a config-based approach to a controlled component pattern:

**v1.0.2 (Old API):**
```tsx
<CodeEditor
  config={{
    python: {
      initValue: 'print("Hello")',
      lspUrl: 'ws://localhost:30001/python',
      runnerUrl: 'http://localhost:8080/run'
    }
  }}
  defaultLanguage="python"
  onChange={(value, language) => {}}
/>
```

**v1.0.3+ (New API):**
```tsx
const [code, setCode] = useState('print("Hello")');

<CodeEditor
  language="python"
  value={code}
  onChange={(value) => setCode(value || '')}
  lsp={{
    serverUrl: 'ws://localhost:30001/python'
  }}
  runner={{
    endpoint: 'http://localhost:8080/run'
  }}
/>
```

### Key Changes

| v1.0.2 | v1.0.3+ | Notes |
|--------|---------|-------|
| `config` prop | `language` + `value` props | Now uses controlled component pattern |
| `onChange(value, language)` | `onChange(value)` | Language no longer passed to onChange |
| `config.lspUrl` | `lsp.serverUrl` | Separate LSP configuration object |
| `config.runnerUrl` | `runner.endpoint` | Separate runner configuration object |
| `defaultLanguage` | `language` (controlled) | Parent manages language state |
| - | `runner.authorization` | New: Authorization support for runner |
| - | `lsp.authorization` | New: Authorization support for LSP |

### Dependency Changes

| Change | Impact |
|--------|--------|
| ❌ Removed `antd` | No longer a peer dependency - lighter bundle |
| ❌ Removed `@ant-design/icons` | Custom UI implementation |
| ✅ Zero UI dependencies | Better compatibility, smaller bundle |

## � Migration Guide

### Step 1: Update Parent Component State

**Before (v1.0.2):**
```tsx
function App() {
  return (
    <CodeEditor
      config={{
        go: { initValue: 'package main...' }
      }}
      defaultLanguage="go"
    />
  );
}
```

**After (v1.0.3+):**
```tsx
function App() {
  const [code, setCode] = useState('package main...');
  const [language, setLanguage] = useState('go');
  
  return (
    <CodeEditor
      language={language}
      value={code}
      onChange={(value) => setCode(value || '')}
    />
  );
}
```

### Step 2: Update LSP Configuration

**Before:**
```tsx
config={{
  python: {
    lspUrl: 'ws://localhost:30001/python'
  }
}}
```

**After:**
```tsx
lsp={{
  serverUrl: 'ws://localhost:30001/python',
  authorization: 'your-token' // Optional: new feature
}}
```

### Step 3: Update Runner Configuration

**Before:**
```tsx
config={{
  javascript: {
    runnerUrl: 'http://localhost:8080/run'
  }
}}
```

**After:**
```tsx
runner={{
  endpoint: 'http://localhost:8080/run',
  authorization: 'your-token' // Optional: new feature
}}
```

### Step 4: Handle Multi-language Support

**Before (v1.0.2):**
```tsx
<CodeEditor
  config={{
    go: { initValue: '...' },
    python: { initValue: '...' }
  }}
  defaultLanguage="go"
  onLanguageChange={(lang) => console.log(lang)}
/>
```

**After (v1.0.3+):**
```tsx
const [language, setLanguage] = useState('go');
const configs = {
  go: { initValue: '...', lspUrl: '...' },
  python: { initValue: '...', lspUrl: '...' }
};
const [code, setCode] = useState(configs[language].initValue);

const handleLanguageChange = (newLang) => {
  setLanguage(newLang);
  setCode(configs[newLang].initValue);
};

<CodeEditor
  language={language}
  value={code}
  onChange={(value) => setCode(value || '')}
  availableLanguages={Object.keys(configs)}
  onLanguageChange={handleLanguageChange}
  lsp={{ serverUrl: configs[language].lspUrl }}
/>
```



### Basic Usage

```tsx
import { CodeEditor } from '@huaanhuang/code-editor';
import { useState } from 'react';

function App() {
  const [code, setCode] = useState('console.log("Hello, World!");');

  return (
    <div style={{ height: '600px' }}>
      <CodeEditor
        language="javascript"
        value={code}
        onChange={(value) => setCode(value || '')}
        theme="vs-dark"
      />
    </div>
  );
}
```

### With LSP Support

```tsx
import { CodeEditor } from '@huaanhuang/code-editor';
import { useState } from 'react';

function App() {
  const [code, setCode] = useState('package main\n\nimport "fmt"\n\nfunc main() {\n\tfmt.Println("Hello, World!")\n}');

  return (
    <div style={{ height: '600px' }}>
      <CodeEditor
        language="go"
        value={code}
        onChange={(value) => setCode(value || '')}
        theme="vs-dark"
        lsp={{
          serverUrl: 'ws://localhost:30005/golang',
          authorization: 'your-auth-token'
        }}
      />
    </div>
  );
}
```

### With Code Execution

```tsx
import { CodeEditor } from '@huaanhuang/code-editor';
import { useState } from 'react';

function App() {
  const [code, setCode] = useState('print("Hello from Python")');

  return (
    <div style={{ height: '600px' }}>
      <CodeEditor
        language="python"
        value={code}
        onChange={(value) => setCode(value || '')}
        theme="vs-dark"
        lsp={{
          serverUrl: 'ws://localhost:30001/python'
        }}
        runner={{
          endpoint: 'http://localhost:8080/run',
          authorization: 'your-auth-token'
        }}
      />
    </div>
  );
}
```

### Multi-language Editor with Language Switcher

```tsx
import { CodeEditor } from '@huaanhuang/code-editor';
import { useState } from 'react';

function App() {
  const [language, setLanguage] = useState('go');
  
  const languageConfig: Record<string, { initValue: string; lspUrl: string; runnerUrl: string }> = {
    go: {
      initValue: 'package main\n\nimport "fmt"\n\nfunc main() {\n\tfmt.Println("Hello, World!")\n}',
      lspUrl: 'ws://localhost:30005/golang',
      runnerUrl: 'http://localhost:30005/run',
    },
    python: {
      initValue: 'print("Hello, World!")',
      lspUrl: 'ws://localhost:30001/python',
      runnerUrl: 'http://localhost:8080/run',
    },
    typescript: {
      initValue: 'console.log("Hello, World!");',
      lspUrl: 'ws://localhost:30002/typescript',
      runnerUrl: 'http://localhost:8080/run',
    },
  };

  const [code, setCode] = useState(languageConfig['go'].initValue);

  const handleLanguageChange = (newLang: string) => {
    setLanguage(newLang);
    setCode(languageConfig[newLang].initValue);
  };

  return (
    <div style={{ height: '600px' }}>
      <CodeEditor
        language={language}
        value={code}
        onChange={(value) => setCode(value || '')}
        theme="vs-dark"
        availableLanguages={Object.keys(languageConfig)}
        onLanguageChange={handleLanguageChange}
        lsp={{
          serverUrl: languageConfig[language].lspUrl
        }}
        runner={{
          endpoint: languageConfig[language].runnerUrl,
          authorization: 'your-auth-token'
        }}
      />
    </div>
  );
}
```

## 📖 API Reference

### CodeEditor Props

| Prop | Type | Required | Description |
|------|------|----------|-------------|
| `language` | `string` | Yes | Current language ID (e.g., 'go', 'python', 'typescript') |
| `value` | `string` | Yes | Current code value |
| `onChange` | `(value: string \| undefined) => void` | No | Callback when content changes |
| `theme` | `'vs-dark' \| 'vs'` | No | Editor theme (default: `'vs-dark'`) |
| `lsp` | `{ serverUrl: string; authorization?: string }` | No | LSP server configuration |
| `runner` | `{ endpoint: string; authorization?: string }` | No | Code runner configuration |
| `availableLanguages` | `string[]` | No | List of languages for the language switcher |
| `onLanguageChange` | `(language: string) => void` | No | Callback when language changes via switcher |
| `className` | `string` | No | CSS class for container |
| `style` | `React.CSSProperties` | No | Inline styles for container |

### LSP Configuration

The `lsp` prop accepts an object with the following properties:

| Property | Type | Required | Description |
|----------|------|----------|-------------|
| `serverUrl` | `string` | Yes | WebSocket URL for the LSP server |
| `authorization` | `string` | No | Authorization token to append to the WebSocket URL |

**Note:** The authorization token is automatically appended to the URL as a query parameter: `ws://localhost:30005/golang?authorization=your-token`

### Runner Configuration

The `runner` prop accepts an object with the following properties:

| Property | Type | Required | Description |
|----------|------|----------|-------------|
| `endpoint` | `string` | Yes | HTTP URL for the code execution service |
| `authorization` | `string` | No | Authorization token for runner requests |

The runner service should accept POST requests with:
```json
{
  "language": "javascript",
  "code": "console.log('Hello');",
  "params": "{}"
}
```

### Supported Languages

- `javascript` / `typescript`
- `python`
- `go`
- `rust`
- `json`
- `java`
- And any other language supported by Monaco Editor

## 🔧 Advanced Features

### Built-in Controls

The editor includes built-in controls for:
- **Language Switcher** - When `availableLanguages` is provided
- **Run Button** - When `runner` is configured
- **Settings Drawer** - For configuring runtime parameters
- **Output Drawer** - For displaying execution results with streaming support

### Custom Themes

The editor uses Monaco's built-in themes:
- `vs-dark` - Dark theme (default) - Professional dark mode with syntax highlighting
- `vs` - Light theme - Clean light mode with syntax highlighting

### LSP Integration

Connect to a Language Server Protocol server for advanced features:
- **IntelliSense** - Context-aware code completion
- **Diagnostics** - Real-time error and warning detection
- **Go to Definition** - Navigate to symbol definitions
- **Find References** - Find all references to a symbol
- **Hover Information** - Documentation on hover
- **Code Actions** - Quick fixes and refactorings

#### LSP Server Setup

You can use the companion LSP server project: [language-servers](https://github.com/featcat/language-servers.git)

This project provides ready-to-use LSP servers for multiple languages including Go, Python, TypeScript, and more.

### Code Execution

The built-in runner provides:
- **Streaming Output** - Real-time execution results
- **Custom Parameters** - Configure runtime parameters via Settings drawer
- **Error Handling** - Clear error messages and stack traces
- **Stop Execution** - Cancel long-running processes

## 🌐 Browser Compatibility

- Chrome/Edge (latest)
- Firefox (latest)
- Safari (latest)

## 🛠️ Development

### Setup

```bash
git clone https://github.com/featcat/code-editor.git
cd code-editor
npm install
```

### Development Server

```bash
npm run dev
```

This starts a development server with a demo application showcasing all features.

### Build

```bash
npm run build
```

Builds the library for production to the `dist` folder.

### Preview Build

```bash
npm run preview
```

Preview the production build locally.

## 🏗️ Architecture

The CodeEditor component is built with a modern architecture:

- **Monaco Editor Core** - VSCode's powerful editor engine
- **monaco-vscode-api** - VSCode extension API compatibility
- **monaco-languageclient** - LSP client implementation
- **Virtual File System** - In-memory file system for editor models
- **React Hooks** - Modern React patterns for state management
- **Custom UI Components** - Lightweight, custom-built controls and drawers

## 📝 Examples

See the [examples documentation](./docs/EXAMPLES.md) for more detailed usage examples.

## 📚 Documentation

- [API Documentation](./docs/API.md)
- [Examples](./docs/EXAMPLES.md)
- [Changelog](./CHANGELOG.md)

## 🔗 Related Projects

- [language-servers](https://github.com/featcat/language-servers.git) - LSP servers for multiple programming languages

## 🤝 Contributing

Contributions are welcome! Please read our [Contributing Guidelines](./CONTRIBUTING.md) before submitting a PR.

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](./LICENSE) file for details.

## 🙏 Acknowledgments

Built with:
- [Monaco Editor](https://microsoft.github.io/monaco-editor/) - The code editor that powers VS Code
- [monaco-languageclient](https://github.com/TypeFox/monaco-languageclient) - LSP integration
- [monaco-vscode-api](https://github.com/CodinGame/monaco-vscode-api) - VSCode API compatibility
- [Vite](https://vitejs.dev/) - Build tool

## 📧 Support

- Issues: [GitHub Issues](https://github.com/featcat/code-editor/issues)
- Discussions: [GitHub Discussions](https://github.com/featcat/code-editor/discussions)

---

Made with ❤️ by huaanhuang
