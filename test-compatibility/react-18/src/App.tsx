import React, { useState } from 'react';
import { CodeEditor } from '@huaanhuang/code-editor';
import '@huaanhuang/code-editor/dist/style.css';
import { Space, Switch, Typography, Tag } from 'antd';

const { Title } = Typography;

const App: React.FC = () => {
  const [theme, setTheme] = useState<'vs' | 'vs-dark'>('vs-dark');
  const [ready, setReady] = useState<{ theme: boolean; syntax: boolean }>({ theme: false, syntax: false });

  React.useEffect(() => {
    (window as any).__CODE_EDITOR_DISABLE_SYNTAX = false;
    const fn = () => {
      const r = (window as any).__codeEditorReady || {};
      setReady({ theme: !!r.theme, syntax: !!r.syntax });
    };
    fn();
    window.addEventListener('code-editor-ready', fn);
    return () => window.removeEventListener('code-editor-ready', fn);
  }, []);

  const config: any = {
    go: {
      initValue: 'package main\n\nimport "fmt"\n\nfunc main() {\n\tfmt.Println("Hello, World!")\n}\n',
      lspUrl: 'ws://10.4.4.122:30005/golang?authorization=UserAuth',
      runnerUrl: 'http://localhost:9080/execute',
    },
    python: {
      initValue: 'print("Hello, World!")\n',
      lspUrl: 'ws://localhost:30001/python?authorization=UserAuth',
      runnerUrl: 'http://localhost:8080/run',
    },
    typescript: {
      initValue: 'console.log("Hello, World!");\n',
      lspUrl: 'ws://localhost:30002/typescript?authorization=UserAuth',
      runnerUrl: 'http://localhost:8080/run',
    },
    json: {
      initValue: '{\n  "message": "Hello, World!"\n}\n',
      lspUrl: 'ws://localhost:30000/json?authorization=UserAuth',
      runnerUrl: 'http://localhost:8080/run',
    },
    rust: {
      initValue: 'fn main() {\n    println!("Hello, World!");\n}\n',
      lspUrl: 'ws://localhost:30006/rust?authorization=UserAuth',
      runnerUrl: 'http://localhost:8080/run',
    }
  };

  const handleThemeChange = (checked: boolean) => {
    setTheme(checked ? 'vs-dark' : 'vs');
  };

  return (
    <div style={{ height: 'calc(100vh - 20px)', display: 'flex', flexDirection: 'column', padding: "10px 10px" }}>
      <div style={{ marginBottom: '20px' }}>
        <Space size="large" align="center">
          <Title level={3} style={{ margin: 0 }}>Code Editor Demo - React 18</Title>
          <Switch
            checkedChildren="Dark"
            unCheckedChildren="Light"
            defaultChecked
            onChange={handleThemeChange}
            style={{
              backgroundColor: theme === 'vs-dark' ? '#1f1f1f' : undefined
            }}
          />
          <Tag color={ready.theme ? 'green' : 'red'}>{ready.theme ? 'Theme OK' : 'Theme OFF'}</Tag>
          <Tag color={ready.syntax ? 'green' : 'red'}>{ready.syntax ? 'Syntax OK' : 'Syntax OFF'}</Tag>
        </Space>
      </div>

      <div style={{ flex: 1, border: '1px solid #ccc'}}>
        <CodeEditor
          config={config}
          theme={theme}
          defaultLanguage="go"
          onChange={(val: string | undefined) => console.log(`Code changed:`, val)}
          onLanguageChange={(lang: string) => console.log('Language changed:', lang)}
        />
      </div>
    </div>
  );
};

export default App;
