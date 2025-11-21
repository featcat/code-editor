# Code Editor

[![npm version](https://img.shields.io/npm/v/@huaanhuang/code-editor.svg)](https://www.npmjs.com/package/@huaanhuang/code-editor)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.2-blue.svg)](https://www.typescriptlang.org/)

A powerful React component wrapping Monaco Editor with Language Server Protocol (LSP) support and code execution capabilities. Built on top of VSCode's Monaco Editor with full TypeScript support.

## ✨ Features

- 🎨 **Monaco Editor Integration** - Full-featured code editor with VSCode UI
- 🔌 **LSP Support** - Language Server Protocol integration via WebSocket
- 🚀 **Code Execution** - Built-in code runner with streaming output support
- 🌍 **Multi-language** - JavaScript, TypeScript, Python, Go, Rust, JSON, and more
- 🎯 **TypeScript** - Full type definitions included
- 🎭 **Themeable** - Dark and light themes with customization support
- 📦 **Zero Config** - Works out of the box with sensible defaults
- ♿ **Accessible** - Built with accessibility in mind
- 📱 **Responsive** - Adapts to container size automatically

## 📦 Installation

```bash
npm install @huaanhuang/code-editor
```

### Peer Dependencies

This package requires React 18.2.0 or higher:

```bash
npm install react react-dom
```

## 🚀 Quick Start

### Basic Usage

```tsx
import { CodeEditor } from '@huaanhuang/code-editor';

function App() {
  return (
    <div style={{ height: '600px' }}>
      <CodeEditor
        config={{
          initValue: 'console.log("Hello, World!");',
        }}
        defaultLanguage="javascript"
        theme="vs-dark"
      />
    </div>
  );
}
```

### Multi-language Editor

```tsx
import { CodeEditor } from '@huaanhuang/code-editor';

function App() {
  return (
    <div style={{ height: '600px' }}>
      <CodeEditor
        config={{
          javascript: {
            initValue: 'console.log("Hello from JavaScript");',
            runnerUrl: 'http://localhost:8080/run',
          },
          python: {
            initValue: 'print("Hello from Python")',
            lspUrl: 'ws://localhost:30001/python',
            runnerUrl: 'http://localhost:8080/run',
          },
          go: {
            initValue: 'package main\n\nfunc main() {\n\tprintln("Hello from Go")\n}',
            lspUrl: 'ws://localhost:30005/golang',
          },
        }}
        defaultLanguage="javascript"
        theme="vs-dark"
        onChange={(value, language) => {
          console.log(`Code changed in ${language}:`, value);
        }}
      />
    </div>
  );
}
```

### With LSP Support

```tsx
import { CodeEditor } from '@huaanhuang/code-editor';

function App() {
  return (
    <div style={{ height: '600px' }}>
      <CodeEditor
        config={{
          typescript: {
            initValue: 'const greeting: string = "Hello, TypeScript!";',
            lspUrl: 'ws://localhost:30000/typescript',
          },
        }}
        defaultLanguage="typescript"
        theme="vs-dark"
      />
    </div>
  );
}
```

## 📖 API Reference

### CodeEditor Props

| Prop | Type | Required | Description |
|------|------|----------|-------------|
| `config` | `Record<string, LanguageConfig> \| LanguageConfig` | Yes | Configuration for single or multiple languages |
| `theme` | `'vs-dark' \| 'vs'` | No | Editor theme (default: `'vs-dark'`) |
| `defaultLanguage` | `string` | No | Initial language to display |
| `onChange` | `(value: string \| undefined, language: string) => void` | No | Callback when code changes |
| `onLanguageChange` | `(language: string) => void` | No | Callback when language changes |
| `className` | `string` | No | CSS class for container |
| `style` | `React.CSSProperties` | No | Inline styles for container |

### LanguageConfig

| Property | Type | Required | Description |
|----------|------|----------|-------------|
| `initValue` | `string` | No | Initial code content |
| `lspUrl` | `string` | No | WebSocket URL for LSP server |
| `runnerUrl` | `string` | No | HTTP URL for code execution service |

### Supported Languages

- `javascript` / `typescript`
- `python`
- `go`
- `rust`
- `json`
- And any other language supported by Monaco Editor

## 🔧 Advanced Configuration

### Custom Themes

The editor uses Monaco's built-in themes. You can switch between:
- `vs-dark` - Dark theme (default)
- `vs` - Light theme

### LSP Integration

To enable IntelliSense, diagnostics, and other language features, connect to a Language Server Protocol server:

```tsx
<CodeEditor
  config={{
    python: {
      lspUrl: 'ws://localhost:30001/python',
      initValue: 'import sys\n\nprint(sys.version)',
    },
  }}
/>
```

### Code Execution

Enable code running by providing a runner URL:

```tsx
<CodeEditor
  config={{
    javascript: {
      runnerUrl: 'http://localhost:8080/run',
      initValue: 'console.log("Execute me!");',
    },
  }}
/>
```

The runner service should accept POST requests with:
```json
{
  "language": "javascript",
  "code": "console.log('Hello');",
  "params": "{}"
}
```

## 🌐 Browser Compatibility

- Chrome/Edge (latest)
- Firefox (latest)
- Safari (latest)

## 🛠️ Development

### Setup

```bash
git clone <repository-url>
cd code-editor
npm install
```

### Development Server

```bash
npm run dev
```

### Build

```bash
npm run build
```

### Preview Build

```bash
npm run preview
```

## 📝 Examples

See the [examples documentation](./docs/EXAMPLES.md) for more detailed usage examples.

## 📚 Documentation

- [API Documentation](./docs/API.md)
- [Examples](./docs/EXAMPLES.md)
- [Changelog](./CHANGELOG.md)

## 🤝 Contributing

Contributions are welcome! Please read our [Contributing Guidelines](./CONTRIBUTING.md) before submitting a PR.

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](./LICENSE) file for details.

## 🙏 Acknowledgments

Built with:
- [Monaco Editor](https://microsoft.github.io/monaco-editor/) - The code editor that powers VS Code
- [monaco-languageclient](https://github.com/TypeFox/monaco-languageclient) - LSP integration
- [Ant Design](https://ant.design/) - UI components
- [Vite](https://vitejs.dev/) - Build tool

## 📧 Support

- Issues: [GitHub Issues](https://github.com/huaanhuang/monaco-languageclient/issues)
- Discussions: [GitHub Discussions](https://github.com/huaanhuang/monaco-languageclient/discussions)

---

Made with ❤️ by huaanhuang
