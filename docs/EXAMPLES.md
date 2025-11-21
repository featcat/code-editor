# Usage Examples

Practical examples for common use cases of the Code Editor component.

## Table of Contents

- [Example 1: Simple JavaScript Editor](#example-1-simple-javascript-editor)
- [Example 2: Multi-Language Playground](#example-2-multi-language-playground)
- [Example 3: Python with LSP](#example-3-python-with-lsp)
- [Example 4: Code Runner Integration](#example-4-code-runner-integration)
- [Example 5: Read-Only Viewer](#example-5-read-only-viewer)
- [Example 6: Custom Styling](#example-6-custom-styling)
- [Example 7: State Management](#example-7-state-management)
- [Example 8: Light Theme](#example-8-light-theme)

---

## Example 1: Simple JavaScript Editor

Basic editor for JavaScript with no external services.

```tsx
import React from 'react';
import { CodeEditor } from '@huaanhuang/code-editor';

function SimpleEditor() {
  return (
    <div style={{ height: '500px', padding: '20px' }}>
      <h2>JavaScript Editor</h2>
      <CodeEditor
        config={{
          initValue: `// Welcome to the code editor!\nfunction greet(name) {\n  return \`Hello, \${name}!\`;\n}\n\nconsole.log(greet("World"));`
        }}
        theme="vs-dark"
      />
    </div>
  );
}

export default SimpleEditor;
```

---

## Example 2: Multi-Language Playground

Allow users to switch between languages with language-specific initial code.

```tsx
import React from 'react';
import { CodeEditor } from '@huaanhuang/code-editor';

function MultiLanguagePlayground() {
  return (
    <div style={{ height: '600px' }}>
      <CodeEditor
        config={{
          javascript: {
            initValue: `// JavaScript Example
function fibonacci(n) {
  if (n <= 1) return n;
  return fibonacci(n - 1) + fibonacci(n - 2);
}

console.log(fibonacci(10));`
          },
          python: {
            initValue: `# Python Example
def fibonacci(n):
    if n <= 1:
        return n
    return fibonacci(n - 1) + fibonacci(n - 2)

print(fibonacci(10))`
          },
          go: {
            initValue: `// Go Example
package main

import "fmt"

func fibonacci(n int) int {
    if n <= 1 {
        return n
    }
    return fibonacci(n-1) + fibonacci(n-2)
}

func main() {
    fmt.Println(fibonacci(10))
}`
          },
          rust: {
            initValue: `// Rust Example
fn fibonacci(n: u32) -> u32 {
    match n {
        0 => 0,
        1 => 1,
        _ => fibonacci(n - 1) + fibonacci(n - 2),
    }
}

fn main() {
    println!("{}", fibonacci(10));
}`
          }
        }}
        defaultLanguage="javascript"
        theme="vs-dark"
        onLanguageChange={(language) => {
          console.log(`Switched to: ${language}`);
        }}
      />
    </div>
  );
}

export default MultiLanguagePlayground;
```

---

## Example 3: Python with LSP

Enable IntelliSense and diagnostics with a Language Server.

```tsx
import React from 'react';
import { CodeEditor } from '@huaanhuang/code-editor';

function PythonWithLSP() {
  return (
    <div style={{ height: '600px', padding: '20px' }}>
      <h2>Python Editor with IntelliSense</h2>
      <p>Language Server: Pyright running on ws://localhost:30001/python</p>
      <CodeEditor
        config={{
          python: {
            initValue: `import sys
import os

def get_system_info():
    """Get basic system information."""
    return {
        'python_version': sys.version,
        'platform': sys.platform,
        'current_dir': os.getcwd()
    }

# Try typing 'sys.' to see autocomplete
info = get_system_info()
print(info)`,
            lspUrl: 'ws://localhost:30001/python'
          }
        }}
        defaultLanguage="python"
        theme="vs-dark"
      />
    </div>
  );
}

export default PythonWithLSP;
```

---

## Example 4: Code Runner Integration

Execute code and display results.

```tsx
import React, { useState } from 'react';
import { CodeEditor } from '@huaanhuang/code-editor';

function CodeRunnerExample() {
  const [output, setOutput] = useState('');

  return (
    <div style={{ height: '700px', display: 'flex', flexDirection: 'column', padding: '20px' }}>
      <h2>Code Runner</h2>
      
      <div style={{ flex: 1, marginBottom: '20px' }}>
        <CodeEditor
          config={{
            javascript: {
              initValue: `// Click 'Run' to execute
console.log("Hello, World!");
console.log("The answer is:", 42);

for (let i = 1; i <= 5; i++) {
  console.log(\`Count: \${i}\`);
}`,
              runnerUrl: 'http://localhost:8080/run'
            },
            python: {
              initValue: `# Click 'Run' to execute
print("Hello, World!")
print("The answer is:", 42)

for i in range(1, 6):
    print(f"Count: {i}")`,
              runnerUrl: 'http://localhost:8080/run',
              lspUrl: 'ws://localhost:30001/python'
            }
          }}
          defaultLanguage="javascript"
          theme="vs-dark"
        />
      </div>
    </div>
  );
}

export default CodeRunnerExample;
```

---

## Example 5: Read-Only Viewer

Display code without allowing edits (Note: requires Monaco editor configuration).

```tsx
import React from 'react';
import { CodeEditor } from '@huaanhuang/code-editor';

function ReadOnlyCodeViewer() {
  const sampleCode = `// This code is read-only
class Example {
  constructor(name) {
    this.name = name;
  }
  
  greet() {
    return \`Hello from \${this.name}!\`;
  }
}

const example = new Example("CodeEditor");
console.log(example.greet());`;

  return (
    <div style={{ height: '500px', padding: '20px' }}>
      <h2>Code Viewer (Read-Only)</h2>
      <CodeEditor
        config={{
          initValue: sampleCode
        }}
        theme="vs-dark"
      />
    </div>
  );
}

export default ReadOnlyCodeViewer;
```

---

## Example 6: Custom Styling

Apply custom styles and CSS classes.

```tsx
import React from 'react';
import { CodeEditor } from '@huaanhuang/code-editor';
import './CustomEditor.css'; // Your custom styles

function CustomStyledEditor() {
  return (
    <div style={{ padding: '40px', background: '#1a1a1a' }}>
      <h2 style={{ color: '#fff', marginBottom: '20px' }}>Custom Styled Editor</h2>
      <CodeEditor
        config={{
          initValue: `// Custom styled editor
const greeting = "Hello, Style!";
console.log(greeting);`
        }}
        theme="vs-dark"
        className="custom-editor"
        style={{
          border: '2px solid #00ff00',
          borderRadius: '12px',
          boxShadow: '0 4px 20px rgba(0, 255, 0, 0.2)',
          height: '400px'
        }}
      />
    </div>
  );
}

export default CustomStyledEditor;
```

---

## Example 7: State Management

Track and manage editor state externally.

```tsx
import React, { useState, useCallback } from 'react';
import { CodeEditor } from '@huaanhuang/code-editor';

function StatefulEditor() {
  const [code, setCode] = useState('console.log("Hello");');
  const [language, setLanguage] = useState('javascript');
  const [savedCode, setSavedCode] = useState('');

  const handleChange = useCallback((value: string | undefined, lang: string) => {
    setCode(value || '');
    console.log(`Code changed in ${lang}`);
  }, []);

  const handleSave = () => {
    setSavedCode(code);
    alert('Code saved!');
  };

  const handleClear = () => {
    setCode('');
  };

  return (
    <div style={{ height: '700px', display: 'flex', flexDirection: 'column', padding: '20px' }}>
      <div style={{ marginBottom: '10px', display: 'flex', gap: '10px', alignItems: 'center' }}>
        <button onClick={handleSave} style={{ padding: '8px 16px' }}>
          Save Code
        </button>
        <button onClick={handleClear} style={{ padding: '8px 16px' }}>
          Clear
        </button>
        <span>Characters: {code.length}</span>
        <span>Language: {language}</span>
      </div>

      <div style={{ flex: 1 }}>
        <CodeEditor
          config={{
            javascript: { initValue: code },
            python: { initValue: code },
            typescript: { initValue: code }
          }}
          defaultLanguage={language}
          theme="vs-dark"
          onChange={handleChange}
          onLanguageChange={setLanguage}
        />
      </div>

      {savedCode && (
        <div style={{ marginTop: '10px', padding: '10px', background: '#f0f0f0', borderRadius: '4px' }}>
          <strong>Last Saved Code:</strong>
          <pre style={{ margin: '5px 0', fontSize: '12px' }}>{savedCode}</pre>
        </div>
      )}
    </div>
  );
}

export default StatefulEditor;
```

---

## Example 8: Light Theme

Use the light theme for better visibility in bright environments.

```tsx
import React from 'react';
import { CodeEditor } from '@huaanhuang/code-editor';

function LightThemeEditor() {
  return (
    <div style={{ height: '600px', padding: '20px', background: '#f5f5f5' }}>
      <h2>Light Theme Editor</h2>
      <CodeEditor
        config={{
          typescript: {
            initValue: `// TypeScript with Light Theme
interface User {
  id: number;
  name: string;
  email: string;
}

const user: User = {
  id: 1,
  name: "John Doe",
  email: "john@example.com"
};

console.log(user);`
          },
          json: {
            initValue: `{
  "name": "my-app",
  "version": "0.0.1",
  "description": "A powerful React component",
  "keywords": ["monaco", "editor", "react"]
}`
          }
        }}
        defaultLanguage="typescript"
        theme="vs"  // Light theme
      />
    </div>
  );
}

export default LightThemeEditor;
```

---

## Complete App Example

Full application with multiple editors and tabs.

```tsx
import React, { useState } from 'react';
import { CodeEditor } from '@huaanhuang/code-editor';

type EditorTab = {
  id: string;
  label: string;
  language: string;
  code: string;
};

function CompleteApp() {
  const [tabs] = useState<EditorTab[]>([
    {
      id: '1',
      label: 'main.js',
      language: 'javascript',
      code: 'console.log("Tab 1");'
    },
    {
      id: '2',
      label: 'script.py',
      language: 'python',
      code: 'print("Tab 2")'
    }
  ]);
  
  const [activeTab, setActiveTab] = useState('1');
  const currentTab = tabs.find(t => t.id === activeTab)!;

  return (
    <div style={{ height: '100vh', display: 'flex', flexDirection: 'column' }}>
      {/* Tab Bar */}
      <div style={{ background: '#2d2d2d', display: 'flex', padding: '0' }}>
        {tabs.map(tab => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            style={{
              background: activeTab === tab.id ? '#1e1e1e' : 'transparent',
              color: '#fff',
              border: 'none',
              padding: '10px 20px',
              cursor: 'pointer'
            }}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Editor */}
      <div style={{ flex: 1 }}>
        <CodeEditor
          key={activeTab}
          config={{
            [currentTab.language]: {
              initValue: currentTab.code,
              runnerUrl: 'http://localhost:8080/run'
            }
          }}
          defaultLanguage={currentTab.language}
          theme="vs-dark"
        />
      </div>
    </div>
  );
}

export default CompleteApp;
```

---

For detailed API documentation, see [API.md](./API.md).
