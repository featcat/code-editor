import React, { useState } from 'react';
import { CodeEditor } from '@huaanhuang/code-editor';
import '@huaanhuang/code-editor/dist/style.css';
import { Space, Switch, Typography, Tag } from 'antd';

const { Title } = Typography;

const App: React.FC = () => {
  const [theme, setTheme] = useState<'vs' | 'vs-dark'>('vs-dark');
  const [ready, setReady] = useState<{ theme: boolean; syntax: boolean }>({ theme: false, syntax: false });
  const [language, setLanguage] = useState<string>('go');
  const [value, setValue] = useState<string>('');

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
      runnerUrl: 'http://10.4.4.122:9080/execute',
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

  React.useEffect(() => {
    const init = config[language]?.initValue ?? '';
    setValue(init);
  }, [language]);

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
          language={language}
          value={value}
          theme={theme}
          availableLanguages={Object.keys(config)}
          onChange={(val: string | undefined) => {
            setValue(val ?? '');
            console.log('Code changed:', val);
          }}
          onLanguageChange={(lang: string) => {
            setLanguage(lang);
            console.log('Language changed:', lang);
          }}
          lsp={{
            serverUrl: config[language]?.lspUrl
          }}
          runner={{
            endpoint: config[language]?.runnerUrl
          }}
        />
      </div>
    </div>
  );
};

export default App;
