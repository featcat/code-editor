# API Documentation

Complete API reference for the Code Editor component.

## Table of Contents

- [CodeEditor Component](#codeeditor-component)
- [Types](#types)
  - [Language](#language)
  - [LanguageConfig](#languageconfig)
  - [CodeEditorProps](#codeeditorprops)
- [Usage Patterns](#usage-patterns)

---

## CodeEditor Component

The main component exported by this package.

### Import

```tsx
import { CodeEditor } from '@huaanhuang/code-editor';
// or
import CodeEditor from '@huaanhuang/code-editor';
```

### Props

See [CodeEditorProps](#codeeditorprops) below.

---

## Types

### Language

```typescript
type Language = 'javascript' | 'typescript' | 'python' | 'java' | 'go' | 'rust' | 'json' | string;
```

Represents supported programming languages. While common languages are typed explicitly, any string is accepted to support additional Monaco Editor languages.

**Common Values:**
- `'javascript'` - JavaScript
- `'typescript'` - TypeScript  
- `'python'` - Python
- `'go'` - Go/Golang
- `'rust'` - Rust
- `'json'` - JSON

**Example:**
```tsx
const lang: Language = 'python';
```

---

### LanguageConfig

Configuration object for a specific language.

```typescript
interface LanguageConfig {
  /** Initial code value */
  initValue?: string;
  
  /** LSP WebSocket URL */
  lspUrl?: string;
  
  /** Runner service URL */
  runnerUrl?: string;
}
```

#### Properties

**`initValue`** (optional)
- Type: `string`
- Description: The initial code content to display in the editor for this language
- Default: `''`

**Example:**
```tsx
const config: LanguageConfig = {
  initValue: 'console.log("Hello, World!");'
};
```

**`lspUrl`** (optional)
- Type: `string`
- Description: WebSocket URL for the Language Server Protocol server. When provided, enables IntelliSense, diagnostics, and other language features.
- Format: `ws://host:port/path` or `wss://host:port/path`

**Example:**
```tsx
const config: LanguageConfig = {
  lspUrl: 'ws://localhost:30001/python'
};
```

**`runnerUrl`** (optional)
- Type: `string`  
- Description: HTTP URL for the code execution service. When provided, enables the "Run" button in the editor.
- Format: `http://host:port/path` or `https://host:port/path`

**Example:**
```tsx
const config: LanguageConfig = {
  runnerUrl: 'http://localhost:8080/run'
};
```

---

### CodeEditorProps

Props for the CodeEditor component.

```typescript
interface CodeEditorProps {
  /**
   * Configuration object.
   * Can be a map of "language_id" -> LanguageConfig for multi-language support,
   * or a single LanguageConfig object for single-language mode.
   */
  config: Record<string, LanguageConfig> | LanguageConfig;

  /**
   * Base theme for Monaco Editor.
   * 'vs-dark' for Dark Mode, 'vs' for Light Mode.
   * Default is 'vs-dark'.
   */
  theme?: 'vs-dark' | 'vs';

  /** Default language to select initially */
  defaultLanguage?: string;

  /** Callback when content changes */
  onChange?: (value: string | undefined, language: string) => void;

  /** Callback when language changes */
  onLanguageChange?: (language: string) => void;

  /** Class name for the container */
  className?: string;
  
  /** Style for the container */
  style?: React.CSSProperties;
}
```

#### Properties

**`config`** (required)
- Type: `Record<string, LanguageConfig> | LanguageConfig`
- Description: Configuration for the editor. Can be a single config object or a map of language IDs to configs.

**Single Language Mode:**
```tsx
<CodeEditor
  config={{
    initValue: 'print("Hello")',
    lspUrl: 'ws://localhost:30001/python'
  }}
/>
```

**Multi-Language Mode:**
```tsx
<CodeEditor
  config={{
    javascript: {
      initValue: 'console.log("Hello");',
    },
    python: {
      initValue: 'print("Hello")',
      lspUrl: 'ws://localhost:30001/python'
    }
  }}
  defaultLanguage="javascript"
/>
```

**`theme`** (optional)
- Type: `'vs-dark' | 'vs'`
- Default: `'vs-dark'`
- Description: The Monaco Editor theme. Use `'vs-dark'` for dark mode or `'vs'` for light mode.

**Example:**
```tsx
<CodeEditor
  config={{ initValue: 'const x = 1;' }}
  theme="vs" // Light theme
/>
```

**`defaultLanguage`** (optional)
- Type: `string`
- Description: The language to display initially. Only relevant in multi-language mode. Should match a key in the `config` object.

**Example:**
```tsx
<CodeEditor
  config={{
    javascript: { initValue: 'console.log(1);' },
    python: { initValue: 'print(1)' }
  }}
  defaultLanguage="python" // Start with Python
/>
```

**`onChange`** (optional)
- Type: `(value: string | undefined, language: string) => void`
- Description: Callback function invoked when the code content changes. Receives the new code value and the current language.

**Example:**
```tsx
<CodeEditor
  config={{ initValue: '' }}
  onChange={(value, language) => {
    console.log(`Code in ${language}:`, value);
    // Save to backend, update state, etc.
  }}
/>
```

**`onLanguageChange`** (optional)
- Type: `(language: string) => void`
- Description: Callback function invoked when the user switches languages (multi-language mode only).

**Example:**
```tsx
<CodeEditor
  config={{
    javascript: { initValue: 'console.log(1);' },
    python: { initValue: 'print(1)' }
  }}
  onLanguageChange={(language) => {
    console.log(`Switched to ${language}`);
    // Update UI, fetch new config, etc.
  }}
/>
```

**`className`** (optional)
- Type: `string`
- Description: CSS class name to apply to the editor container.

**Example:**
```tsx
<CodeEditor
  config={{ initValue: '' }}
  className="my-custom-editor"
/>
```

**`style`** (optional)
- Type: `React.CSSProperties`
- Description: Inline styles to apply to the editor container.

**Example:**
```tsx
<CodeEditor
  config={{ initValue: '' }}
  style={{ 
    border: '2px solid #ccc',
    borderRadius: '8px'
  }}
/>
```

---

## Usage Patterns

### Pattern 1: Single Language, No Services

Simplest usage - just a code editor.

```tsx
<CodeEditor
  config={{
    initValue: 'const greeting = "Hello, World!";'
  }}
  theme="vs-dark"
/>
```

### Pattern 2: Multi-Language Selector

Let users switch between languages.

```tsx
<CodeEditor
  config={{
    javascript: {
      initValue: 'console.log("Hello from JS");'
    },
    python: {
      initValue: 'print("Hello from Python")'
    },
    go: {
      initValue: 'package main\n\nfunc main() {\n\tfmt.Println("Hello from Go")\n}'
    }
  }}
  defaultLanguage="javascript"
  onLanguageChange={(lang) => console.log('Switched to:', lang)}
/>
```

### Pattern 3: With LSP for IntelliSense

Enable code completion and diagnostics.

```tsx
<CodeEditor
  config={{
    typescript: {
      initValue: 'const x: number = 42;',
      lspUrl: 'ws://localhost:30000/typescript'
    }
  }}
/>
```

### Pattern 4: With Code Runner

Enable code execution.

```tsx
<CodeEditor
  config={{
    python: {
      initValue: 'for i in range(5):\n    print(i)',
      runnerUrl: 'http://localhost:8080/run'
    }
  }}
/>
```

### Pattern 5: Full Featured

LSP + Runner + Multi-language.

```tsx
<CodeEditor
  config={{
    javascript: {
      initValue: 'console.log("Hello");',
      runnerUrl: 'http://localhost:8080/run'
    },
    python: {
      initValue: 'print("Hello")',
      lspUrl: 'ws://localhost:30001/python',
      runnerUrl: 'http://localhost:8080/run'
    },
    go: {
      initValue: 'package main\n\nfunc main() {}',
      lspUrl: 'ws://localhost:30005/golang',
      runnerUrl: 'http://localhost:8080/run'
    }
  }}
  defaultLanguage="python"
  theme="vs-dark"
  onChange={(value, lang) => {
    localStorage.setItem(`code-${lang}`, value || '');
  }}
  onLanguageChange={(lang) => {
    console.log(`Active language: ${lang}`);
  }}
/>
```

### Pattern 6: Controlled Component

Manage code state externally.

```tsx
function MyEditor() {
  const [code, setCode] = useState('const x = 1;');
  const [language, setLanguage] = useState('javascript');

  return (
    <>
      <CodeEditor
        config={{
          javascript: { initValue: code },
          python: { initValue: code }
        }}
        defaultLanguage={language}
        onChange={(value) => setCode(value || '')}
        onLanguageChange={setLanguage}
      />
      <div>
        Current code length: {code.length}
        <button onClick={() => setCode('')}>Clear</button>
      </div>
    </>
  );
}
```

### Pattern 7: Responsive Container

Editor fills available space.

```tsx
<div style={{ height: '100vh', display: 'flex', flexDirection: 'column' }}>
  <header style={{ height: '60px' }}>My App Header</header>
  <div style={{ flex: 1, minHeight: 0 }}>
    <CodeEditor
      config={{ initValue: 'console.log("I fill the space!");' }}
    />
  </div>
</div>
```

---

## TypeScript Usage

The package includes full TypeScript definitions. Import types as needed:

```tsx
import { CodeEditor, CodeEditorProps, Language, LanguageConfig } from '@huaanhuang/code-editor';

const editorConfig: LanguageConfig = {
  initValue: 'const x = 1;',
  lspUrl: 'ws://localhost:30000/typescript'
};

const props: CodeEditorProps = {
  config: {
    typescript: editorConfig
  },
  theme: 'vs-dark'
};

function MyComponent() {
  return <CodeEditor {...props} />;
}
```

---

For more practical examples, see [EXAMPLES.md](./EXAMPLES.md).
