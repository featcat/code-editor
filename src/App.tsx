import React, { useState } from 'react';
import { CodeEditor } from './index';


const App: React.FC = () => {
    const [isDark, setIsDark] = useState(true);
    const [language, setLanguage] = useState('go');

    const languageConfig: Record<string, { initValue: string; lspUrl: string; runnerUrl: string }> = {
        go: {
            initValue: 'package main\n\nimport "fmt"\n\nfunc main() {\n\tfmt.Println("Hello, World!")\n}\n',
            lspUrl: 'ws://localhost:30005/golang?authorization=UserAuth',
            runnerUrl: 'http://localhost:30005/run?authorization=UserAuth',
        },
        python: {
            initValue: 'print("Hello, World!")\n',
            lspUrl: 'ws://localhost:30001/python?authorization=UserAuth',
            runnerUrl: 'http://localhost:8080/run?authorization=UserAuth',
        },
        typescript: {
            initValue: 'console.log("Hello, World!");\n',
            lspUrl: 'ws://localhost:30002/typescript?authorization=UserAuth',
            runnerUrl: 'http://localhost:8080/run?authorization=UserAuth',
        },
        json: {
            initValue: '{\n  "message": "Hello, World!"\n}\n',
            lspUrl: 'ws://localhost:30000/json?authorization=UserAuth',
            runnerUrl: 'http://localhost:8080/run?authorization=UserAuth',
        },
        rust: {
            initValue: 'fn main() {\n    println!("Hello, World!");\n}\n',
            lspUrl: 'ws://localhost:30006/rust?authorization=UserAuth',
            runnerUrl: 'http://localhost:8080/run?authorization=UserAuth',
        }
    };

    const [code, setCode] = useState(languageConfig['go'].initValue);

    const handleLanguageChange = (newLang: string) => {
        setLanguage(newLang);
        setCode(languageConfig[newLang].initValue);
    };

    return (
        <div style={{ padding: '24px', height: 'calc(100vh - 20px)', display: 'flex', flexDirection: 'column', boxSizing: 'border-box', background: isDark ? '#1e1e1e' : '#ffffff', color: isDark ? '#ffffff' : '#000000' }}>
            <div style={{ marginBottom: '16px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <h2 style={{ margin: 0 }}>Code Editor Demo</h2>
                <div style={{ display: 'flex', gap: '16px', alignItems: 'center' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <span>Dark Mode</span>
                        <input
                            type="checkbox"
                            checked={isDark}
                            onChange={(e) => setIsDark(e.target.checked)}
                            style={{ cursor: 'pointer' }}
                        />
                    </div>
                </div>
            </div>

            <div style={{ flex: 1, border: `1px solid ${isDark ? '#3e3e42' : '#d9d9d9'}`, borderRadius: '4px', overflow: 'hidden' }}>
                <CodeEditor
                    theme={isDark ? 'vs-dark' : 'vs'}
                    language={language}
                    value={code}
                    onChange={(val) => setCode(val || '')}
                    availableLanguages={Object.keys(languageConfig)}
                    onLanguageChange={handleLanguageChange}
                    lsp={{
                        serverUrl: languageConfig[language].lspUrl
                    }}
                    runner={{
                        endpoint: languageConfig[language].runnerUrl
                    }}
                />
            </div>
        </div>
    );
};

export default App;
